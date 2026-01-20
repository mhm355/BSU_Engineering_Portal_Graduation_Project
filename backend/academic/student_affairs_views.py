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
from users.permissions import IsStudentAffairsRole, IsStudentRole

User = get_user_model()


class UploadStudentsView(APIView):
    """
    Upload students via Excel/CSV file.
    Requires: department_id, academic_year_id, level_id from request
    Excel columns: national_id, full_name, email (optional)
    """
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsStudentAffairsRole]

    def post(self, request):
        file = request.FILES.get('file')
        department_id = request.data.get('department_id')
        academic_year_id = request.data.get('academic_year_id')
        level_id = request.data.get('level_id')

        # Validate required params
        if not file:
            return Response({'error': 'لم يتم تحديد ملف'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not department_id or not academic_year_id or not level_id:
            return Response(
                {'error': 'يجب اختيار القسم والعام الدراسي والفرقة'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate department, year, level exist
        try:
            department = Department.objects.get(id=department_id)
        except Department.DoesNotExist:
            return Response({'error': 'القسم غير موجود'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            academic_year = AcademicYear.objects.get(id=academic_year_id)
        except AcademicYear.DoesNotExist:
            return Response({'error': 'العام الدراسي غير موجود'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            level = Level.objects.get(id=level_id)
        except Level.DoesNotExist:
            return Response({'error': 'الفرقة غير موجودة'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Read file
            if file.name.endswith('.csv'):
                df = pd.read_csv(io.BytesIO(file.read()))
            elif file.name.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(io.BytesIO(file.read()))
            else:
                return Response(
                    {'error': 'صيغة الملف غير مدعومة. استخدم CSV أو Excel.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate required columns
            required_columns = ['national_id', 'full_name']
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                return Response(
                    {'error': f'أعمدة مفقودة: {missing_columns}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Process students
            results = self._process_students(df, department, academic_year, level, request.user)
            return Response(results, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _process_students(self, df, department, academic_year, level, performed_by):
        """Process student data and create accounts"""
        created_count = 0
        updated_count = 0
        errors = []

        for index, row in df.iterrows():
            try:
                with transaction.atomic():
                    national_id = str(row['national_id']).strip()
                    full_name = str(row['full_name']).strip()
                    email = row.get('email', '')
                    if pd.notna(email):
                        email = str(email).strip()
                    else:
                        email = ''

                    # Validate national_id
                    if not national_id or len(national_id) < 10:
                        raise ValueError('الرقم القومي غير صالح')

                    # Check if student exists
                    student_exists = Student.objects.filter(national_id=national_id).exists()
                    user_exists = User.objects.filter(username=national_id).exists()

                    if student_exists:
                        # Update existing student
                        student = Student.objects.get(national_id=national_id)
                        student.full_name = full_name
                        student.level = level
                        student.academic_year = academic_year
                        student.department = department
                        student.save()
                        
                        # Update user email if provided
                        if email and student.user:
                            student.user.email = email
                            student.user.save()
                        
                        updated_count += 1
                    elif user_exists:
                        # User exists but Student record was deleted
                        user = User.objects.get(username=national_id)
                        user.first_name = full_name.split()[0] if full_name else ''
                        user.last_name = ' '.join(full_name.split()[1:]) if len(full_name.split()) > 1 else ''
                        if email:
                            user.email = email
                        user.first_login_required = True
                        user.save()

                        Student.objects.create(
                            national_id=national_id,
                            full_name=full_name,
                            user=user,
                            level=level,
                            academic_year=academic_year,
                            department=department
                        )
                        updated_count += 1
                    else:
                        # Create new user and student
                        user = User.objects.create_user(
                            username=national_id,
                            password=national_id,
                            email=email or None,
                            first_name=full_name.split()[0] if full_name else '',
                            last_name=' '.join(full_name.split()[1:]) if len(full_name.split()) > 1 else '',
                            national_id=national_id,
                            role='STUDENT',
                            first_login_required=True
                        )

                        Student.objects.create(
                            national_id=national_id,
                            full_name=full_name,
                            user=user,
                            level=level,
                            academic_year=academic_year,
                            department=department
                        )
                        created_count += 1

            except Exception as e:
                errors.append(f"صف {index + 2}: {str(e)}")

        # Audit log
        try:
            AuditLog.objects.create(
                action=AuditLog.ActionType.STUDENT_BATCH_UPLOAD,
                performed_by=performed_by,
                entity_type='BATCH_UPLOAD',
                details={
                    'department': department.name,
                    'academic_year': academic_year.name,
                    'level': level.name,
                    'created': created_count,
                    'updated': updated_count,
                    'errors': len(errors)
                }
            )
        except Exception as e:
            errors.append(f"خطأ في سجل العمليات: {str(e)}")

        return {
            'created': created_count,
            'updated': updated_count,
            'errors': errors
        }




class StudentListView(generics.ListAPIView):
    """List students with filtering by department, academic year, and level"""
    permission_classes = [IsStudentAffairsRole]

    def get(self, request):
        queryset = Student.objects.select_related(
            'user', 'level', 'academic_year', 'department'
        ).all()

        # Filter by query params
        department_id = request.query_params.get('department')
        academic_year_id = request.query_params.get('academic_year')
        level_id = request.query_params.get('level')
        level_name = request.query_params.get('level_name')

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
    """Reset a student's password to their national_id"""
    permission_classes = [IsStudentAffairsRole]

    def post(self, request, student_id):
        try:
            student = Student.objects.get(id=student_id)
            if not student.user:
                return Response(
                    {'error': 'الطالب ليس لديه حساب مستخدم'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Reset password to national_id
            student.user.set_password(student.national_id)
            student.user.first_login_required = True
            student.user.save()

            # Create audit log
            try:
                AuditLog.objects.create(
                    action=AuditLog.ActionType.STUDENT_PASSWORD_RESET,
                    performed_by=request.user,
                    entity_type='STUDENT',
                    entity_id=student.id,
                    details={
                        'student_name': student.full_name,
                        'national_id': student.national_id,
                    }
                )
            except Exception:
                pass  # Don't fail if audit log fails

            return Response({'message': 'تم إعادة تعيين كلمة المرور بنجاح'})

        except Student.DoesNotExist:
            return Response(
                {'error': 'الطالب غير موجود'},
                status=status.HTTP_404_NOT_FOUND
            )



class FourthYearStudentsView(APIView):
    """Get all fourth year students for certificate upload"""
    permission_classes = [IsStudentAffairsRole]

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


class StudentAffairsGradesView(APIView):
    """
    Read-only grades view for Student Affairs.
    Shows students with their subjects and grades (Midterm, Coursework, Final).
    """
    permission_classes = [IsStudentAffairsRole]

    def get(self, request):
        department_id = request.query_params.get('department')
        academic_year_id = request.query_params.get('academic_year')
        level_id = request.query_params.get('level')

        if not all([department_id, academic_year_id, level_id]):
            return Response(
                {'error': 'يجب تحديد القسم والعام الدراسي والفرقة'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Import models here to avoid circular imports
        from .models import Subject, StudentGrade, CourseOffering

        try:
            level = Level.objects.get(id=level_id)
        except Level.DoesNotExist:
            return Response({'error': 'الفرقة غير موجودة'}, status=status.HTTP_404_NOT_FOUND)

        # Get students in this level
        students = Student.objects.filter(
            level_id=level_id,
            department_id=department_id,
            academic_year_id=academic_year_id
        ).select_related('user')

        # Get subjects for this level
        subjects = Subject.objects.filter(
            level=level.name,
            department_id=department_id
        )

        # Get grades for each student
        result = []
        for student in students:
            student_data = {
                'id': student.id,
                'national_id': student.national_id,
                'full_name': student.full_name,
                'subjects': []
            }

            for subject in subjects:
                # Find grade for this student and subject
                grade_data = {
                    'subject_id': subject.id,
                    'subject_name': subject.name,
                    'subject_code': subject.code,
                    'midterm': None,
                    'coursework': None,
                    'final': None,
                    'attendance': None,
                    'quizzes': None,
                }

                # Look for StudentGrade through CourseOffering
                course_offerings = CourseOffering.objects.filter(
                    subject=subject,
                    level=level,
                    academic_year_id=academic_year_id
                )

                for co in course_offerings:
                    try:
                        sg = StudentGrade.objects.get(
                            student=student,
                            course_offering=co
                        )
                        grade_data['midterm'] = float(sg.midterm_grade) if sg.midterm_grade else None
                        grade_data['coursework'] = float(sg.coursework_grade) if sg.coursework_grade else None
                        grade_data['final'] = float(sg.final_grade) if sg.final_grade else None
                        grade_data['attendance'] = float(sg.attendance_grade) if sg.attendance_grade else None
                        grade_data['quizzes'] = float(sg.quizzes_grade) if sg.quizzes_grade else None
                        break
                    except StudentGrade.DoesNotExist:
                        continue

                student_data['subjects'].append(grade_data)

            result.append(student_data)

        # Also return subjects list for table headers
        subjects_list = [{'id': s.id, 'name': s.name, 'code': s.code} for s in subjects]

        return Response({
            'students': result,
            'subjects': subjects_list
        })

