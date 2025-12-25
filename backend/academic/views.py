from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import (
    Department, Specialization, AcademicYear, Level, Subject,
    Student, TeachingAssignment, ExamGrade, Certificate,
    Term, GradingTemplate, CourseOffering, Lecture, Attendance, StudentGrade
)
from .serializers import (
    DepartmentSerializer, SpecializationSerializer, AcademicYearSerializer,
    LevelSerializer, SubjectSerializer, StudentSerializer, TeachingAssignmentSerializer,
    ExamGradeSerializer, CertificateSerializer,
    TermSerializer, GradingTemplateSerializer, CourseOfferingSerializer,
    LectureSerializer, AttendanceSerializer, StudentGradeSerializer
)
from users.permissions import (
    IsAdminRole, IsDoctorRole, IsStudentRole,
    IsStudentAffairsRole, IsStaffAffairsRole
)


class DepartmentViewSet(viewsets.ModelViewSet):
    """Departments - Read-only for most users, Admin can edit"""
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminRole()]
        return [permissions.IsAuthenticatedOrReadOnly()]


class SpecializationViewSet(viewsets.ModelViewSet):
    """Specializations within departments - Admin only for modification"""
    queryset = Specialization.objects.all()
    serializer_class = SpecializationSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Specialization.objects.all()
        department = self.request.query_params.get('department')
        if department:
            queryset = queryset.filter(department_id=department)
        return queryset

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminRole()]
        return [permissions.IsAuthenticatedOrReadOnly()]


class AcademicYearViewSet(viewsets.ModelViewSet):
    """Academic Years - Admin can create/manage, others can read"""
    queryset = AcademicYear.objects.all().order_by('-name')
    serializer_class = AcademicYearSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'toggle_status']:
            return [IsAdminRole()]
        return [permissions.IsAuthenticatedOrReadOnly()]

    def create(self, request, *args, **kwargs):
        """Create academic year and auto-create terms + levels for all departments"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        academic_year = serializer.save()

        # Auto-create terms for this year
        Term.objects.get_or_create(name=Term.TermName.FIRST, academic_year=academic_year)
        Term.objects.get_or_create(name=Term.TermName.SECOND, academic_year=academic_year)

        # Auto-create levels for all departments
        from .models import Department
        departments = Department.objects.all()
        
        for dept in departments:
            if dept.is_preparatory:
                # Preparatory only has one level
                Level.objects.get_or_create(
                    name=Level.LevelName.PREPARATORY,
                    department=dept,
                    academic_year=academic_year
                )
            else:
                # Regular departments have 4 levels
                for level_name in [Level.LevelName.FIRST, Level.LevelName.SECOND, 
                                   Level.LevelName.THIRD, Level.LevelName.FOURTH]:
                    Level.objects.get_or_create(
                        name=level_name,
                        department=dept,
                        academic_year=academic_year
                    )

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        """Toggle academic year status between OPEN and CLOSED"""
        year = self.get_object()
        if year.status == AcademicYear.Status.OPEN:
            year.status = AcademicYear.Status.CLOSED
        else:
            year.status = AcademicYear.Status.OPEN
        year.save()
        return Response(AcademicYearSerializer(year).data)

    @action(detail=True, methods=['post'])
    def set_current(self, request, pk=None):
        """Set this academic year as current"""
        year = self.get_object()
        year.is_current = True
        year.save()  # save() method handles unsetting other years
        return Response(AcademicYearSerializer(year).data)


class TermViewSet(viewsets.ReadOnlyModelViewSet):
    """Terms - Read-only (auto-created with Academic Year)"""
    queryset = Term.objects.all()
    serializer_class = TermSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Term.objects.all()
        academic_year = self.request.query_params.get('academic_year')
        if academic_year:
            queryset = queryset.filter(academic_year_id=academic_year)
        return queryset


class GradingTemplateViewSet(viewsets.ModelViewSet):
    """Grading Templates - Admin can create/manage"""
    queryset = GradingTemplate.objects.all()
    serializer_class = GradingTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminRole()]
        return [permissions.IsAuthenticated()]


class LevelViewSet(viewsets.ModelViewSet):
    queryset = Level.objects.all()
    serializer_class = LevelSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Level.objects.all()
        department = self.request.query_params.get('department')
        academic_year = self.request.query_params.get('academic_year')
        
        if department and academic_year:
            # Check if levels exist for this department + year
            existing_levels = Level.objects.filter(
                department_id=department, 
                academic_year_id=academic_year
            )
            
            # Auto-create levels if none exist
            if not existing_levels.exists():
                try:
                    from .models import Department
                    dept = Department.objects.get(id=department)
                    
                    if dept.code == 'PREP':
                        # Preparatory only has one level
                        Level.objects.get_or_create(
                            name=Level.LevelName.PREPARATORY,
                            department_id=department,
                            academic_year_id=academic_year
                        )
                    else:
                        # Regular departments have 4 levels
                        for level_name in [Level.LevelName.FIRST, Level.LevelName.SECOND,
                                           Level.LevelName.THIRD, Level.LevelName.FOURTH]:
                            Level.objects.get_or_create(
                                name=level_name,
                                department_id=department,
                                academic_year_id=academic_year
                            )
                except Department.DoesNotExist:
                    pass
            
            queryset = Level.objects.filter(
                department_id=department,
                academic_year_id=academic_year
            )
        else:
            if department:
                queryset = queryset.filter(department_id=department)
            if academic_year:
                queryset = queryset.filter(academic_year_id=academic_year)
        
        return queryset

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        """Get students in this level"""
        level = self.get_object()
        students = Student.objects.filter(level=level)
        return Response(StudentSerializer(students, many=True).data)

    @action(detail=True, methods=['get'])
    def subjects(self, request, pk=None):
        """Get subjects for this level"""
        level = self.get_object()
        subjects = Subject.objects.filter(
            level=level.name,
            department=level.department
        )
        # Filter by specialization if provided
        spec = request.query_params.get('specialization')
        if spec:
            subjects = subjects.filter(specialization_id=spec)
        return Response(SubjectSerializer(subjects, many=True).data)


class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    """Subjects - READ ONLY (fixed curriculum data)"""
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Subject.objects.all()
        department = self.request.query_params.get('department')
        specialization = self.request.query_params.get('specialization')
        level = self.request.query_params.get('level')
        semester = self.request.query_params.get('semester')

        if department:
            queryset = queryset.filter(department_id=department)
        if specialization:
            queryset = queryset.filter(specialization_id=specialization)
        if level:
            queryset = queryset.filter(level=level)
        if semester:
            queryset = queryset.filter(semester=semester)
        return queryset


class StudentViewSet(viewsets.ModelViewSet):
    """Students - Student Affairs can manage"""
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsStudentAffairsRole]

    def get_queryset(self):
        queryset = Student.objects.all()
        level = self.request.query_params.get('level')
        department = self.request.query_params.get('department')
        academic_year = self.request.query_params.get('academic_year')
        specialization = self.request.query_params.get('specialization')

        if level:
            queryset = queryset.filter(level_id=level)
        if department:
            queryset = queryset.filter(department_id=department)
        if academic_year:
            queryset = queryset.filter(academic_year_id=academic_year)
        if specialization:
            queryset = queryset.filter(specialization_id=specialization)
        return queryset


class CourseOfferingViewSet(viewsets.ModelViewSet):
    """Course Offerings - Staff Affairs assigns doctors to courses"""
    queryset = CourseOffering.objects.all()
    serializer_class = CourseOfferingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsStaffAffairsRole()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = CourseOffering.objects.all()
        academic_year = self.request.query_params.get('academic_year')
        term = self.request.query_params.get('term')
        level = self.request.query_params.get('level')
        doctor = self.request.query_params.get('doctor')

        if academic_year:
            queryset = queryset.filter(academic_year_id=academic_year)
        if term:
            queryset = queryset.filter(term_id=term)
        if level:
            queryset = queryset.filter(level_id=level)
        if doctor:
            queryset = queryset.filter(doctor_id=doctor)
        return queryset

    @action(detail=False, methods=['get'], permission_classes=[IsDoctorRole])
    def my_courses(self, request):
        """Get all courses assigned to the logged-in doctor"""
        user = request.user
        academic_year_id = request.query_params.get('academic_year')
        
        offerings = CourseOffering.objects.filter(doctor=user).select_related(
            'subject', 'level', 'level__department', 'term', 'academic_year', 'grading_template'
        )
        
        if academic_year_id:
            offerings = offerings.filter(academic_year_id=academic_year_id)
        else:
            # Default to current academic year
            current_year = AcademicYear.objects.filter(is_current=True).first()
            if current_year:
                offerings = offerings.filter(academic_year=current_year)
        
        result = []
        for o in offerings:
            # Count students in this level
            # For Electrical dept level 2+, filter by specialization
            students_qs = Student.objects.filter(level=o.level)
            if o.specialization:
                students_qs = students_qs.filter(specialization=o.specialization)
            student_count = students_qs.count()
            
            result.append({
                'id': o.id,
                'subject_name': o.subject.name,
                'subject_code': o.subject.code,
                'level_name': o.level.get_name_display(),
                'level_id': o.level.id,
                'department_name': o.level.department.name if o.level.department else 'الفرقة الإعدادية',
                'department_code': o.level.department.code if o.level.department else 'PREP',
                'term': o.term.get_name_display(),
                'term_name': o.term.name,
                'academic_year': o.academic_year.name,
                'academic_year_id': o.academic_year.id,
                'year_status': o.academic_year.status,
                'grading_template': o.grading_template.name if o.grading_template else None,
                'grading_template_id': o.grading_template.id if o.grading_template else None,
                'specialization_name': o.specialization.name if o.specialization else None,
                'specialization_code': o.specialization.code if o.specialization else None,
                'specialization_id': o.specialization.id if o.specialization else None,
                'student_count': student_count,
            })
        
        return Response(result)


class TeachingAssignmentViewSet(viewsets.ModelViewSet):
    """Doctor-Subject assignments - Staff Affairs manages (DEPRECATED - use CourseOffering)"""
    queryset = TeachingAssignment.objects.all()
    serializer_class = TeachingAssignmentSerializer
    permission_classes = [IsStaffAffairsRole]

    def get_queryset(self):
        queryset = TeachingAssignment.objects.all()
        academic_year = self.request.query_params.get('academic_year')
        level = self.request.query_params.get('level')
        subject = self.request.query_params.get('subject')

        if academic_year:
            queryset = queryset.filter(academic_year_id=academic_year)
        if level:
            queryset = queryset.filter(level_id=level)
        if subject:
            queryset = queryset.filter(subject_id=subject)
        return queryset


class LectureViewSet(viewsets.ModelViewSet):
    """Lectures - Doctor can upload, students can view"""
    queryset = Lecture.objects.all()
    serializer_class = LectureSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsDoctorRole()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = Lecture.objects.all()
        course_offering = self.request.query_params.get('course_offering')

        if course_offering:
            queryset = queryset.filter(course_offering_id=course_offering)

        # Students only see lectures for their enrolled courses
        user = self.request.user
        if user.role == 'STUDENT':
            try:
                student = Student.objects.get(user=user)
                # Get course offerings for student's level
                queryset = queryset.filter(
                    course_offering__level=student.level
                )
            except Student.DoesNotExist:
                queryset = Lecture.objects.none()

        return queryset

    def create(self, request, *args, **kwargs):
        """Doctor creates lecture - check if academic year is OPEN"""
        course_offering = CourseOffering.objects.get(id=request.data.get('course_offering'))
        if course_offering.academic_year.status == AcademicYear.Status.CLOSED:
            return Response(
                {'error': 'لا يمكن إضافة محاضرات - العام الدراسي مغلق'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().create(request, *args, **kwargs)


class CertificateViewSet(viewsets.ModelViewSet):
    queryset = Certificate.objects.all()
    serializer_class = CertificateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'STUDENT':
            return Certificate.objects.filter(student=user)
        return Certificate.objects.all()


# ========== Student Profile API ==========
class StudentProfileView(APIView):
    permission_classes = [IsStudentRole]

    def get(self, request):
        """Get authenticated student's academic profile"""
        try:
            student = Student.objects.get(user=request.user)
            return Response({
                'national_id': student.national_id,
                'full_name': student.full_name,
                'level': student.level.name,
                'level_display': student.level.get_name_display(),
                'department': student.department.name if student.department else None,
                'department_code': student.department.code if student.department else None,
                'academic_year': student.academic_year.name,
                'specialization': student.specialization.name if student.specialization else None,
            })
        except Student.DoesNotExist:
            return Response({
                'level': None,
                'level_display': 'غير محدد',
                'department': None,
                'academic_year': None,
            })


# ========== Bulk Attendance API ==========
class BulkAttendanceView(APIView):
    """Doctor saves attendance for multiple students at once"""
    permission_classes = [IsDoctorRole]

    def post(self, request):
        attendance_list = request.data
        if not isinstance(attendance_list, list):
            return Response({'error': 'Expected list of attendance records'}, status=status.HTTP_400_BAD_REQUEST)

        created = 0
        updated = 0
        for item in attendance_list:
            student_id = item.get('student_id')
            course_offering_id = item.get('course_offering_id')
            date = item.get('date')
            attendance_status = item.get('status', 'PRESENT')

            try:
                student = Student.objects.get(id=student_id)
                course_offering = CourseOffering.objects.get(id=course_offering_id)

                # Verify doctor owns this course
                if course_offering.doctor != request.user:
                    continue

                obj, is_created = Attendance.objects.update_or_create(
                    student=student,
                    course_offering=course_offering,
                    date=date,
                    defaults={'status': attendance_status}
                )
                if is_created:
                    created += 1
                else:
                    updated += 1

            except (Student.DoesNotExist, CourseOffering.DoesNotExist):
                continue

        return Response({'created': created, 'updated': updated})


# ========== Bulk Student Grades API ==========
class BulkStudentGradeView(APIView):
    """Doctor saves grades for multiple students at once"""
    permission_classes = [IsDoctorRole]

    def post(self, request):
        grades_list = request.data
        if not isinstance(grades_list, list):
            return Response({'error': 'Expected list of grade records'}, status=status.HTTP_400_BAD_REQUEST)

        created = 0
        updated = 0
        for item in grades_list:
            student_id = item.get('student_id')
            course_offering_id = item.get('course_offering_id')

            try:
                student = Student.objects.get(id=student_id)
                course_offering = CourseOffering.objects.get(id=course_offering_id)

                # Verify doctor owns this course
                if course_offering.doctor != request.user:
                    continue

                # Check if academic year is open
                if course_offering.academic_year.status == 'CLOSED':
                    continue

                defaults = {}
                if item.get('attendance_grade') is not None:
                    defaults['attendance_grade'] = item['attendance_grade']
                if item.get('quizzes_grade') is not None:
                    defaults['quizzes_grade'] = item['quizzes_grade']
                if item.get('coursework_grade') is not None:
                    defaults['coursework_grade'] = item['coursework_grade']
                if item.get('midterm_grade') is not None:
                    defaults['midterm_grade'] = item['midterm_grade']
                if item.get('final_grade') is not None:
                    defaults['final_grade'] = item['final_grade']

                if defaults:
                    obj, is_created = StudentGrade.objects.update_or_create(
                        student=student,
                        course_offering=course_offering,
                        defaults=defaults
                    )
                    if is_created:
                        created += 1
                    else:
                        updated += 1

            except (Student.DoesNotExist, CourseOffering.DoesNotExist):
                continue

        return Response({'created': created, 'updated': updated})

