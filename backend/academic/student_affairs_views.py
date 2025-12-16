"""
Student Affairs API Views for batch student upload and management
"""
from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db import transaction
from django.contrib.auth import get_user_model
import pandas as pd
import io

from .models import Student, Level, AcademicYear, Department, AuditLog
from users.permissions import IsStaffRole, IsStudentRole

User = get_user_model()


class UploadStudentsView(APIView):
    """
    Upload students via Excel/CSV file.
    Expected columns: national_id, full_name, academic_year, level, department_code
    """
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsStaffRole]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response(
                {'error': 'No file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Read file based on extension
            if file.name.endswith('.csv'):
                df = pd.read_csv(io.BytesIO(file.read()))
            elif file.name.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(io.BytesIO(file.read()))
            else:
                return Response(
                    {'error': 'Unsupported file format. Use CSV or Excel.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate required columns
            required_columns = ['national_id', 'full_name', 'academic_year', 'level']
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                return Response(
                    {'error': f'Missing required columns: {missing_columns}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Process students in a transaction
            results = self._process_students(df, request.user)
            return Response(results, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _process_students(self, df, performed_by):
        """Process student data and create accounts"""
        created_count = 0
        updated_count = 0
        errors = []

        for index, row in df.iterrows():
            # Use a savepoint for each row so errors don't break the whole batch
            try:
                with transaction.atomic():
                    national_id = str(row['national_id']).strip()
                    full_name = str(row['full_name']).strip()
                    academic_year_name = str(row['academic_year']).strip()
                    level_name = str(row['level']).strip().upper()
                    department_code = row.get('department_code', '')
                    
                    if pd.notna(department_code):
                        department_code = str(department_code).strip()
                    else:
                        department_code = None

                    # Validate level
                    valid_levels = ['PREPARATORY', 'FIRST', 'SECOND', 'THIRD', 'FOURTH']
                    if level_name not in valid_levels:
                        raise ValueError(f"Invalid level '{level_name}'")

                    # For non-preparatory levels, department is required
                    if level_name != 'PREPARATORY' and not department_code:
                        raise ValueError(f"Department is required for {level_name} level")

                    # Get or create academic year
                    academic_year, _ = AcademicYear.objects.get_or_create(
                        name=academic_year_name
                    )

                    # Get department if provided
                    department = None
                    if department_code:
                        try:
                            department = Department.objects.get(code=department_code)
                        except Department.DoesNotExist:
                            raise ValueError(f"Department '{department_code}' not found")

                    # Get or create level
                    level, _ = Level.objects.get_or_create(
                        name=level_name,
                        department=department,
                        academic_year=academic_year
                    )

                    # Check if student record exists
                    student_exists = Student.objects.filter(national_id=national_id).exists()
                    # Check if user account exists (might exist if Student was cascade-deleted)
                    user_exists = User.objects.filter(username=national_id).exists()
                    
                    if student_exists:
                        # Update existing student
                        student = Student.objects.get(national_id=national_id)
                        student.full_name = full_name
                        student.level = level
                        student.academic_year = academic_year
                        student.department = department
                        student.save()
                        updated_count += 1
                    elif user_exists:
                        # User exists but Student record was deleted (e.g., Level was deleted)
                        # Recreate the Student record linked to existing user
                        user = User.objects.get(username=national_id)
                        user.first_name = full_name.split()[0] if full_name else ''
                        user.last_name = ' '.join(full_name.split()[1:]) if len(full_name.split()) > 1 else ''
                        user.save()
                        
                        student = Student.objects.create(
                            national_id=national_id,
                            full_name=full_name,
                            user=user,
                            level=level,
                            academic_year=academic_year,
                            department=department
                        )
                        updated_count += 1  # Count as update since user existed
                    else:
                        # Create new student and user account
                        user = User.objects.create_user(
                            username=national_id,
                            password=national_id,
                            first_name=full_name.split()[0] if full_name else '',
                            last_name=' '.join(full_name.split()[1:]) if len(full_name.split()) > 1 else '',
                            national_id=national_id,
                            role='STUDENT',
                            first_login_required=True
                        )

                        student = Student.objects.create(
                            national_id=national_id,
                            full_name=full_name,
                            user=user,
                            level=level,
                            academic_year=academic_year,
                            department=department
                        )
                        created_count += 1

            except Exception as e:
                errors.append(f"Row {index + 2}: {str(e)}")

        # Create audit log outside of any transaction issues
        try:
            AuditLog.objects.create(
                action=AuditLog.ActionType.STUDENT_BATCH_UPLOAD,
                performed_by=performed_by,
                entity_type='BATCH_UPLOAD',
                details={
                    'created': created_count,
                    'updated': updated_count,
                    'errors': len(errors)
                }
            )
        except Exception as e:
            errors.append(f"Audit log error: {str(e)}")

        return {
            'created': created_count,
            'updated': updated_count,
            'errors': errors
        }


class StudentListView(generics.ListAPIView):
    """List students with filtering by department, academic year, and level"""
    permission_classes = [IsStaffRole]

    def get(self, request):
        queryset = Student.objects.select_related(
            'user', 'level', 'academic_year', 'department'
        ).all()

        # Filter by query params
        department_id = request.query_params.get('department')
        academic_year_id = request.query_params.get('academic_year')
        level_id = request.query_params.get('level')
        level_name = request.query_params.get('level_name')  # Filter by level name (e.g., FOURTH)

        if department_id:
            queryset = queryset.filter(department_id=department_id)
        if academic_year_id:
            queryset = queryset.filter(academic_year_id=academic_year_id)
        if level_id:
            queryset = queryset.filter(level_id=level_id)
        if level_name:
            queryset = queryset.filter(level__name=level_name.upper())

        students = []
        for student in queryset:
            students.append({
                'id': student.id,
                'national_id': student.national_id,
                'full_name': student.full_name,
                'username': student.user.username if student.user else None,
                'department': student.department.name if student.department else None,
                'department_code': student.department.code if student.department else None,
                'academic_year': student.academic_year.name,
                'level': student.level.get_name_display(),
                'level_name': student.level.name,
                'first_login_required': student.user.first_login_required if student.user else None,
                'graduation_status': student.user.graduation_status if student.user else None,
            })

        return Response(students)


class ResetStudentPasswordView(APIView):
    """Admin endpoint to reset a student's password to their national_id"""
    permission_classes = [IsStaffRole]

    def post(self, request, student_id):
        try:
            student = Student.objects.get(id=student_id)
            if not student.user:
                return Response(
                    {'error': 'Student has no associated user account'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Reset password to national_id
            student.user.set_password(student.national_id)
            student.user.first_login_required = True
            student.user.save()

            # Create audit log
            AuditLog.objects.create(
                action=AuditLog.ActionType.PASSWORD_RESET,
                performed_by=request.user,
                entity_type='STUDENT',
                entity_id=student.id,
                details={'student_national_id': student.national_id}
            )

            return Response({'message': 'Password reset successfully'})

        except Student.DoesNotExist:
            return Response(
                {'error': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class FourthYearStudentsView(APIView):
    """Get all fourth year students for certificate upload"""
    permission_classes = [IsStaffRole]

    def get(self, request):
        queryset = Student.objects.select_related(
            'user', 'level', 'academic_year', 'department'
        ).filter(level__name='FOURTH')

        students = []
        for student in queryset:
            students.append({
                'id': student.id,
                'user_id': student.user.id if student.user else None,
                'national_id': student.national_id,
                'full_name': student.full_name,
                'username': student.user.username if student.user else None,
                'department': student.department.name if student.department else None,
                'graduation_status': student.user.graduation_status if student.user else 'PENDING',
            })

        return Response(students)


class StudentProfileView(APIView):
    """Get current student's academic profile"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Check if user is a student
        if user.role != 'STUDENT':
            return Response(
                {'error': 'Not a student account'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            student = Student.objects.select_related(
                'level', 'academic_year', 'department'
            ).get(user=user)

            level_display_map = {
                'PREPARATORY': 'السنة التحضيرية',
                'FIRST': 'السنة الأولى',
                'SECOND': 'السنة الثانية',
                'THIRD': 'السنة الثالثة',
                'FOURTH': 'السنة الرابعة',
            }

            return Response({
                'id': student.id,
                'national_id': student.national_id,
                'full_name': student.full_name,
                'level': student.level.name,
                'level_display': level_display_map.get(student.level.name, student.level.name),
                'department': student.department.name if student.department else None,
                'department_code': student.department.code if student.department else None,
                'academic_year': student.academic_year.name,
                'graduation_status': user.graduation_status,
                'first_login_required': user.first_login_required,
            })

        except Student.DoesNotExist:
            # Student profile not yet created - return default
            return Response({
                'id': None,
                'national_id': user.national_id,
                'full_name': f"{user.first_name} {user.last_name}",
                'level': None,
                'level_display': 'غير محدد',
                'department': None,
                'department_code': None,
                'academic_year': None,
                'graduation_status': user.graduation_status,
                'first_login_required': user.first_login_required,
            })

