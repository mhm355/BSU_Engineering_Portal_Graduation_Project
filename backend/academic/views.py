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
    """Students - Student Affairs can manage, Doctors can read"""
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        # Only Student Affairs can create/update/delete students
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsStudentAffairsRole()]
        # Doctors and Student Affairs can list/retrieve students
        return [permissions.IsAuthenticated()]

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
        subject = self.request.query_params.get('subject')

        if course_offering:
            queryset = queryset.filter(course_offering_id=course_offering)
        
        if subject:
            queryset = queryset.filter(course_offering__subject_id=subject)

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
                'level_name': student.level.name,  # For filtering (e.g., "SECOND")
                'level_display': student.level.get_name_display(),
                'department': student.department.name if student.department else None,
                'department_id': student.department.id if student.department else None,
                'department_name': student.department.name if student.department else None,
                'department_code': student.department.code if student.department else None,
                'academic_year': student.academic_year.name,
                'specialization': student.specialization.name if student.specialization else None,
                'specialization_id': student.specialization.id if student.specialization else None,
                'specialization_name': student.specialization.name if student.specialization else None,
            })
        except Student.DoesNotExist:
            return Response({
                'level': None,
                'level_name': None,
                'level_display': 'غير محدد',
                'department': None,
                'department_id': None,
                'department_name': None,
                'academic_year': None,
                'specialization': None,
                'specialization_id': None,
                'specialization_name': None,
            })


# ========== Attendance List API ==========
class AttendanceViewSet(viewsets.ReadOnlyModelViewSet):
    """List attendance records - Doctors can view their course attendances, Students view their own"""
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Attendance.objects.select_related('student', 'course_offering__subject')
        user = self.request.user
        
        # If student, only see own attendance
        if hasattr(user, 'role') and user.role == 'STUDENT':
             queryset = queryset.filter(student__user=user)
        
        # If Doctor, only see attendance for their courses (optional, but good for privacy)
        # elif user.role == 'DOCTOR':
        #      queryset = queryset.filter(course_offering__doctor=user)
        
        course_offering_id = self.request.query_params.get('course_offering')
        student_id = self.request.query_params.get('student')
        
        if course_offering_id:
            queryset = queryset.filter(course_offering_id=course_offering_id)
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        
        return queryset.order_by('-date')



# ========== Bulk Attendance API ==========
class BulkAttendanceView(APIView):
    """Doctor saves attendance for multiple students at once"""
    permission_classes = [IsDoctorRole]

    def post(self, request):
        from .attendance_export import export_attendance_to_excel
        from django.conf import settings
        import os
        
        attendance_list = request.data
        if not isinstance(attendance_list, list):
            return Response({'error': 'Expected list of attendance records'}, status=status.HTTP_400_BAD_REQUEST)

        if not attendance_list:
            return Response({'error': 'No attendance records provided'}, status=status.HTTP_400_BAD_REQUEST)

        created = 0
        updated = 0
        errors = []
        course_offering = None
        attendance_date = None
        saved_attendance_records = []
        
        for idx, item in enumerate(attendance_list):
            try:
                student_id = item.get('student_id')
                course_offering_id = item.get('course_offering_id')
                date = item.get('date')
                attendance_status = item.get('status', 'PRESENT')

                student = Student.objects.get(id=student_id)
                course_offering = CourseOffering.objects.get(id=course_offering_id)
                attendance_date = date

                # Verify doctor owns this course (skip check for admin)
                if request.user.role != 'ADMIN' and course_offering.doctor != request.user:
                    errors.append(f"Row {idx+1}: Permission denied for this course")
                    continue

                # Check if academic year is open
                if course_offering.academic_year.status == 'CLOSED':
                    errors.append(f"Row {idx+1}: Academic year is closed")
                    continue

                obj, is_created = Attendance.objects.update_or_create(
                    student=student,
                    course_offering=course_offering,
                    date=date,
                    defaults={'status': attendance_status}
                )
                
                saved_attendance_records.append(obj)
                
                if is_created:
                    created += 1
                else:
                    updated += 1

            except Student.DoesNotExist:
                errors.append(f"Row {idx+1}: Student not found")
                continue
            except CourseOffering.DoesNotExist:
                errors.append(f"Row {idx+1}: Course offering not found")
                continue
            except Exception as e:
                errors.append(f"Row {idx+1}: {str(e)}")
                continue
            except Exception as e:
                # Catch-all for debugging 500 errors
                import traceback
                print(traceback.format_exc())
                return Response(
                    {'error': f"Failed to save record for Student {item.get('student_id')}: {str(e)}"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Generate Excel file if any attendance was saved
        excel_file_path = None
        excel_url = None
        
        if saved_attendance_records and course_offering and attendance_date:
            try:
                # Parse date string to date object for Excel export
                from datetime import datetime
                if isinstance(attendance_date, str):
                    date_obj = datetime.strptime(attendance_date, '%Y-%m-%d').date()
                else:
                    date_obj = attendance_date
                
                # Export to Excel
                excel_file_path = export_attendance_to_excel(
                    course_offering, 
                    date_obj,  # Use date object, not string
                    saved_attendance_records
                )
                # Generate URL for download
                excel_url = f"{settings.MEDIA_URL}{excel_file_path}"
            except Exception as e:
                errors.append(f"Excel export failed: {str(e)}")

        response_data = {
            'created': created,
            'updated': updated,
            'total_saved': created + updated,
            'message': f'تم حفظ {created + updated} سجل حضور بنجاح'
        }
        
        if excel_url:
            response_data['excel_file'] = excel_url
            response_data['message'] += f' | تم إنشاء ملف Excel'
        
        if errors:
            response_data['errors'] = errors
            response_data['error_count'] = len(errors)
        
        return Response(response_data)



# ========== Bulk Student Grades API ==========
class BulkStudentGradeView(APIView):
    """Doctor saves grades for multiple students at once"""
    permission_classes = [IsDoctorRole | permissions.IsAdminUser]

    def post(self, request):
        grades_list = request.data
        if not isinstance(grades_list, list):
            return Response({'error': 'Expected list of grade records'}, status=status.HTTP_400_BAD_REQUEST)

        created = 0
        updated = 0
        errors = []
        for item in grades_list:
            student_id = item.get('student_id')
            course_offering_id = item.get('course_offering_id')

            try:
                student = Student.objects.get(id=student_id)
                course_offering = CourseOffering.objects.get(id=course_offering_id)

                # Verify doctor owns this course OR user is Admin
                if not request.user.is_superuser and course_offering.doctor != request.user:
                    continue

                # Check if academic year is open
                if course_offering.academic_year.status == 'CLOSED':
                    continue

                defaults = {}
                
                def parse_decimal(val):
                    if val == "" or val is None: return None
                    try:
                        return float(val)
                    except:
                        return None

                if 'coursework_grade' in item: defaults['coursework'] = parse_decimal(item['coursework_grade'])
                if 'midterm_grade' in item: defaults['midterm'] = parse_decimal(item['midterm_grade'])
                if 'final_grade' in item: defaults['final'] = parse_decimal(item['final_grade'])
                if 'attendance_grade' in item: defaults['attendance'] = parse_decimal(item['attendance_grade'])
                if 'quizzes_grade' in item: defaults['quizzes'] = parse_decimal(item['quizzes_grade'])

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
            except Exception as e:
                import traceback
                print(f"Error saving grade for student {student_id}: {e}")
                traceback.print_exc()
                errors.append(f"Student {student_id}: {str(e)}")

        return Response({'created': created, 'updated': updated, 'errors': errors})


class StudentExamsView(APIView):
    """Get exam schedule for logged in student"""
    permission_classes = [IsStudentRole]

    def get(self, request):
        student = Student.objects.get(user=request.user)
        # Get courses student is enrolled in (via Grades or just Level?)
        # For now, using StudentGrade as enrollment proof, or just filter by level if simpler scheme?
        # Better: Students have 'academic_year' and 'level' and 'department'.
        # We should show exams for ALL subjects in their level/term.
        
        # Or checking registered courses?
        # Let's assume courses they have StudentGrade entries for OR matching their Level/Dept.
        # Simplest: Matching Level + Term + Dept.
        
        offerings = CourseOffering.objects.filter(
            academic_year__status='OPEN', # Or current
            level=student.level,
            # department? If specialization exists?
            # kept simple for now:
        ).select_related('subject')
        
        # If student has specialization, filter.
        if student.specialization:
             offerings = offerings.filter(models.Q(specialization=student.specialization) | models.Q(specialization__isnull=True))
        elif student.department:
             # If student has dept, filter offerings that match dept (via level)
             pass 

        data = []
        for course in offerings:
            if course.final_exam_date:
                data.append({
                    'id': course.id,
                    'course_name': course.subject.name,
                    'date': course.final_exam_date, # Date object
                    'time': course.final_exam_time,
                    'location': course.final_exam_location,
                })
        
        return Response(data)


class StudentCoursesView(APIView):
    """Get all courses for logged in student (with or without lectures)"""
    permission_classes = [IsStudentRole]

    def get(self, request):
        try:
            student = Student.objects.get(user=request.user)
        except Student.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            # Get all course offerings for student's level
            offerings = CourseOffering.objects.filter(
                level=student.level
            ).select_related('subject', 'doctor').prefetch_related('lectures')
            
            # If student has specialization, filter by it (or include general subjects)
            if student.specialization:
                offerings = offerings.filter(
                    models.Q(specialization=student.specialization) | 
                    models.Q(specialization__isnull=True)
                )
            
            data = []
            for course in offerings:
                lectures_list = []
                for lecture in course.lectures.all():
                    # Derive file type from extension
                    file_type = 'OTHER'
                    if lecture.file:
                        file_url = lecture.file.url.lower()
                        if file_url.endswith('.pdf'):
                            file_type = 'PDF'
                        elif file_url.endswith('.ppt') or file_url.endswith('.pptx'):
                            file_type = 'SLIDES'
                        elif any(file_url.endswith(ext) for ext in ['.mp4', '.avi', '.mov', '.mkv']):
                            file_type = 'VIDEO'
                    
                    lectures_list.append({
                        'id': lecture.id,
                        'title': lecture.title,
                        'description': lecture.description,
                        'file': lecture.file.url if lecture.file else None,
                        'file_type': file_type,
                        'uploaded_at': lecture.uploaded_at,
                    })
                
                # Handle case where doctor might not be assigned
                doctor_name = ''
                if course.doctor:
                    doctor_name = f"{course.doctor.first_name} {course.doctor.last_name}".strip() or course.doctor.username
                
                data.append({
                    'id': course.id,
                    'subject_name': course.subject.name,
                    'subject_code': course.subject.code,
                    'doctor_name': doctor_name,
                    'lecture_count': len(lectures_list),
                    'lectures': lectures_list,
                })
            
            return Response(data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

