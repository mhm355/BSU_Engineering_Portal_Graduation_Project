from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Department, AcademicYear, Level, Course, Grade, Exam, Attendance, CourseMaterial, Certificate, TeachingAssignment, StudentEnrollment
from .serializers import DepartmentSerializer, AcademicYearSerializer, LevelSerializer, CourseSerializer, GradeSerializer, ExamSerializer, AttendanceSerializer, CourseMaterialSerializer, CertificateSerializer, TeachingAssignmentSerializer
from users.serializers import UserManagementSerializer
from users.permissions import IsAdminRole, IsDoctorRole, IsStudentRole

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminRole()]
        return [permissions.IsAuthenticatedOrReadOnly()]

class AcademicYearViewSet(viewsets.ModelViewSet):
    queryset = AcademicYear.objects.all()
    serializer_class = AcademicYearSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminRole()]
        return [permissions.IsAuthenticatedOrReadOnly()]

class LevelViewSet(viewsets.ModelViewSet):
    queryset = Level.objects.all()
    serializer_class = LevelSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminRole()]
        return [permissions.IsAuthenticatedOrReadOnly()]

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        level = self.get_object()
        current_year = AcademicYear.objects.filter(is_current=True).first()
        if not current_year:
            return Response({'error': 'No current academic year set'}, status=400)
            
        enrollments = StudentEnrollment.objects.filter(
            level=level,
            academic_year=current_year
        )
        
        students = [enrollment.student for enrollment in enrollments]
        data = [{'id': s.id, 'username': s.username, 'first_name': s.first_name, 'last_name': s.last_name, 'national_id': s.national_id} for s in students]
        return Response(data)

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminRole()]
        return [permissions.IsAuthenticatedOrReadOnly()]

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        course = self.get_object()
        # Find current academic year
        current_year = AcademicYear.objects.filter(is_current=True).first()
        if not current_year:
            return Response({'error': 'No current academic year set'}, status=400)
            
        enrollments = StudentEnrollment.objects.filter(
            level=course.level,
            academic_year=current_year
        )
        
        students = [enrollment.student for enrollment in enrollments]
        # We can use a simple serializer for students
        data = [{'id': s.id, 'username': s.username, 'first_name': s.first_name, 'last_name': s.last_name} for s in students]
        return Response(data)

class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'STUDENT':
            return Grade.objects.filter(student=user)
        elif user.role == 'DOCTOR':
            return Grade.objects.filter(course__teachingassignment__doctor=user)
        return Grade.objects.all()

    def perform_create(self, serializer):
        # Ensure doctor can only add grades for their courses
        # This logic should ideally be in a permission class or serializer validation
        serializer.save()

class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'DOCTOR':
            return Exam.objects.filter(course__teachingassignment__doctor=user)
        elif user.role == 'STUDENT':
            # Find student's current enrollment
            current_year = AcademicYear.objects.filter(is_current=True).first()
            if current_year:
                enrollment = StudentEnrollment.objects.filter(student=user, academic_year=current_year).first()
                if enrollment:
                    return Exam.objects.filter(course__level=enrollment.level)
        return Exam.objects.all()

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'STUDENT':
            return Attendance.objects.filter(student=user)
        elif user.role == 'DOCTOR':
            return Attendance.objects.filter(course__teachingassignment__doctor=user)
        return Attendance.objects.all()

class CourseMaterialViewSet(viewsets.ModelViewSet):
    queryset = CourseMaterial.objects.all()
    serializer_class = CourseMaterialSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'STUDENT':
            return CourseMaterial.objects.all() 
        elif user.role == 'DOCTOR':
            return CourseMaterial.objects.filter(course__teachingassignment__doctor=user)
        return CourseMaterial.objects.all()

class CertificateViewSet(viewsets.ModelViewSet):
    queryset = Certificate.objects.all()
    serializer_class = CertificateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'STUDENT':
            return Certificate.objects.filter(student=user)
        return Certificate.objects.all()

class TeachingAssignmentViewSet(viewsets.ModelViewSet):
    queryset = TeachingAssignment.objects.all()
    serializer_class = TeachingAssignmentSerializer
    permission_classes = [IsAdminRole]

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
import pandas as pd

User = get_user_model()

class BulkStudentUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [permissions.IsAdminUser] # Or Staff Affairs role

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES['file']
        try:
            df = pd.read_excel(file_obj) if file_obj.name.endswith('.xlsx') else pd.read_csv(file_obj)
            created_count = 0
            errors = []
            
            for index, row in df.iterrows():
                try:
                    # Expected columns: department, level, semester, national_id, student_name
                    # Fallback to student_id if national_id not present, but prefer national_id
                    national_id = str(row.get('national_id', '')).strip()
                    if not national_id:
                         # Try student_id as fallback but warn? Or just use it?
                         # User specifically asked for national_id "14 number".
                         # Let's try to find it in student_id column if national_id col is missing
                         national_id = str(row.get('student_id', '')).strip()
                    
                    # Validate 14 digits
                    if not national_id or len(national_id) != 14 or not national_id.isdigit():
                        errors.append(f"Row {index}: Invalid National ID '{national_id}'. Must be 14 digits.")
                        continue

                    full_name = str(row.get('student_name', '')).strip()
                    
                    if User.objects.filter(username=national_id).exists():
                        # Already exists, maybe update? For now skip.
                        continue
                    
                    # Split name
                    name_parts = full_name.split()
                    first_name = name_parts[0] if name_parts else ''
                    last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''

                    user = User.objects.create_user(
                        username=national_id,
                        password=national_id, # Password is same as NID
                        first_name=first_name,
                        last_name=last_name,
                        national_id=national_id,
                        role='STUDENT'
                    )
                    
                    # Link to Level/Department if provided
                    # We need to find or create StudentEnrollment
                    # Assuming we have level/department info in the row or context
                    # The view doesn't seem to take level/dept from request, only file.
                    # So we look for 'level' and 'department' columns.
                    
                    level_name = str(row.get('level', '')).strip()
                    dept_name = str(row.get('department', '')).strip()
                    
                    if level_name:
                        level = Level.objects.filter(name__icontains=level_name).first()
                        if level:
                            current_year = AcademicYear.objects.filter(is_current=True).first()
                            if current_year:
                                StudentEnrollment.objects.create(
                                    student=user,
                                    level=level,
                                    academic_year=current_year,
                                    department=Department.objects.filter(name__icontains=dept_name).first() if dept_name else None
                                )

                    created_count += 1
                except Exception as e:
                    errors.append(f"Row {index}: {str(e)}")
            
            return Response({'status': 'success', 'created': created_count, 'errors': errors})
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)}, status=400)


class BulkGradeUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [permissions.IsAuthenticated] # Doctor only

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES['file']
        course_id = request.data.get('course_id')
        
        if not course_id:
            return Response({'error': 'Course ID is required'}, status=400)

        try:
            course = Course.objects.get(id=course_id)
            # Check if user is the doctor for this course
            if request.user.role != 'DOCTOR' or not course.teachingassignment_set.filter(doctor=request.user).exists():
                 return Response({'error': 'Unauthorized'}, status=403)

            df = pd.read_excel(file_obj) if file_obj.name.endswith('.xlsx') else pd.read_csv(file_obj)
            updated_count = 0
            errors = []
            
            for index, row in df.iterrows():
                try:
                    # Columns: department, level, semester, student_id, student_name, course_name, score
                    student_username = str(row.get('student_id', '')).strip() # student_id maps to username
                    score = row.get('score')
                    
                    if not student_username or pd.isna(score):
                        continue
                        
                    student = User.objects.filter(username=student_username, role='STUDENT').first()
                    if not student:
                        errors.append(f"Row {index}: Student {student_username} not found")
                        continue

                    Grade.objects.update_or_create(
                        student=student,
                        course=course,
                        defaults={'score': score}
                    )
                    updated_count += 1
                except Exception as e:
                    errors.append(f"Row {index}: {str(e)}")
            
            return Response({'message': f'Updated {updated_count} grades.', 'errors': errors})
        except Exception as e:
            return Response({'error': str(e)}, status=400)
