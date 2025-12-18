"""
Staff Affairs API Views for managing doctors and staff
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db import transaction
from django.contrib.auth import get_user_model
import pandas as pd
import io

from .models import (
    AuditLog, TeachingAssignment, Subject, Level, AcademicYear,
    Term, GradingTemplate, CourseOffering
)
from users.permissions import IsStaffAffairsRole

User = get_user_model()


class UploadDoctorsView(APIView):
    """
    Upload doctors via Excel/CSV file.
    Expected columns: national_id, full_name, email (optional)
    """
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsStaffAffairsRole]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response(
                {'error': 'No file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            if file.name.endswith('.csv'):
                df = pd.read_csv(io.BytesIO(file.read()))
            elif file.name.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(io.BytesIO(file.read()))
            else:
                return Response(
                    {'error': 'Unsupported file format. Use CSV or Excel.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            required_columns = ['national_id', 'full_name']
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                return Response(
                    {'error': f'Missing required columns: {missing_columns}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            results = self._process_doctors(df, request.user)
            return Response(results, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _process_doctors(self, df, performed_by):
        created_count = 0
        skipped_count = 0
        errors = []

        for index, row in df.iterrows():
            try:
                with transaction.atomic():
                    national_id = str(row['national_id']).strip()
                    full_name = str(row['full_name']).strip()
                    email = str(row.get('email', '')).strip() if pd.notna(row.get('email')) else ''

                    # Check for duplicates
                    if User.objects.filter(national_id=national_id).exists():
                        skipped_count += 1
                        continue

                    # Create doctor user account
                    User.objects.create_user(
                        username=national_id,
                        password=national_id,
                        first_name=full_name.split()[0] if full_name else '',
                        last_name=' '.join(full_name.split()[1:]) if len(full_name.split()) > 1 else '',
                        national_id=national_id,
                        email=email,
                        role='DOCTOR',
                        first_login_required=True
                    )
                    created_count += 1

            except Exception as e:
                errors.append(f"Row {index + 2}: {str(e)}")

        # Create audit log
        try:
            AuditLog.objects.create(
                action=AuditLog.ActionType.DOCTOR_BATCH_UPLOAD,
                performed_by=performed_by,
                entity_type='BATCH_UPLOAD',
                details={
                    'created': created_count,
                    'skipped': skipped_count,
                    'errors': len(errors)
                }
            )
        except Exception:
            pass

        return {
            'created': created_count,
            'skipped': skipped_count,
            'errors': errors
        }


class UploadStaffAffairsUsersView(APIView):
    """
    Upload Student Affairs users via Excel/CSV file.
    Expected columns: national_id, full_name, email (optional)
    """
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsStaffAffairsRole]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response(
                {'error': 'No file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            if file.name.endswith('.csv'):
                df = pd.read_csv(io.BytesIO(file.read()))
            elif file.name.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(io.BytesIO(file.read()))
            else:
                return Response(
                    {'error': 'Unsupported file format. Use CSV or Excel.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            required_columns = ['national_id', 'full_name']
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                return Response(
                    {'error': f'Missing required columns: {missing_columns}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            results = self._process_staff(df, request.user)
            return Response(results, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _process_staff(self, df, performed_by):
        created_count = 0
        skipped_count = 0
        errors = []

        for index, row in df.iterrows():
            try:
                with transaction.atomic():
                    national_id = str(row['national_id']).strip()
                    full_name = str(row['full_name']).strip()
                    email = str(row.get('email', '')).strip() if pd.notna(row.get('email')) else ''

                    # Check for duplicates
                    if User.objects.filter(national_id=national_id).exists():
                        skipped_count += 1
                        continue

                    # Create student affairs user account
                    User.objects.create_user(
                        username=national_id,
                        password=national_id,
                        first_name=full_name.split()[0] if full_name else '',
                        last_name=' '.join(full_name.split()[1:]) if len(full_name.split()) > 1 else '',
                        national_id=national_id,
                        email=email,
                        role='STUDENT_AFFAIRS',
                        first_login_required=True
                    )
                    created_count += 1

            except Exception as e:
                errors.append(f"Row {index + 2}: {str(e)}")

        # Create audit log
        try:
            AuditLog.objects.create(
                action=AuditLog.ActionType.STAFF_BATCH_UPLOAD,
                performed_by=performed_by,
                entity_type='BATCH_UPLOAD',
                details={
                    'created': created_count,
                    'skipped': skipped_count,
                    'errors': len(errors)
                }
            )
        except Exception:
            pass

        return {
            'created': created_count,
            'skipped': skipped_count,
            'errors': errors
        }


class DoctorListView(APIView):
    """List all doctors (read-only for Staff Affairs)"""
    permission_classes = [IsStaffAffairsRole]

    def get(self, request):
        doctors = User.objects.filter(role='DOCTOR').values(
            'id', 'username', 'first_name', 'last_name', 'national_id', 'email'
        )
        
        result = []
        for doc in doctors:
            result.append({
                'id': doc['id'],
                'national_id': doc['national_id'],
                'full_name': f"{doc['first_name']} {doc['last_name']}".strip(),
                'email': doc['email'],
            })
        
        return Response(result)


class StudentAffairsUserListView(APIView):
    """List all Student Affairs users (read-only for Staff Affairs)"""
    permission_classes = [IsStaffAffairsRole]

    def get(self, request):
        users = User.objects.filter(role='STUDENT_AFFAIRS').values(
            'id', 'username', 'first_name', 'last_name', 'national_id', 'email'
        )
        
        result = []
        for user in users:
            result.append({
                'id': user['id'],
                'national_id': user['national_id'],
                'full_name': f"{user['first_name']} {user['last_name']}".strip(),
                'email': user['email'],
            })
        
        return Response(result)


class TermListView(APIView):
    """List all terms for an academic year"""
    permission_classes = [IsStaffAffairsRole]

    def get(self, request):
        academic_year_id = request.query_params.get('academic_year')
        terms = Term.objects.all()
        
        if academic_year_id:
            terms = terms.filter(academic_year_id=academic_year_id)
        
        result = []
        for term in terms:
            result.append({
                'id': term.id,
                'name': term.name,
                'name_display': term.get_name_display(),
                'academic_year': term.academic_year.name,
                'academic_year_id': term.academic_year.id,
            })
        
        return Response(result)


class GradingTemplateListView(APIView):
    """List all grading templates"""
    permission_classes = [IsStaffAffairsRole]

    def get(self, request):
        templates = GradingTemplate.objects.all()
        
        result = []
        for t in templates:
            result.append({
                'id': t.id,
                'name': t.name,
                'attendance_weight': t.attendance_weight,
                'quizzes_weight': t.quizzes_weight,
                'coursework_weight': t.coursework_weight,
                'midterm_weight': t.midterm_weight,
                'final_weight': t.final_weight,
                'is_default': t.is_default,
            })
        
        return Response(result)


class AssignDoctorToSubjectView(APIView):
    """Assign a doctor to a course offering (subject + level + term + year)"""
    permission_classes = [IsStaffAffairsRole]

    def post(self, request):
        doctor_id = request.data.get('doctor_id')
        subject_id = request.data.get('subject_id')
        level_id = request.data.get('level_id')
        term_id = request.data.get('term_id')
        grading_template_id = request.data.get('grading_template_id')

        if not all([doctor_id, subject_id, level_id, term_id]):
            return Response(
                {'error': 'يرجى تحديد الدكتور، المادة، الفرقة، والترم'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            doctor = User.objects.get(id=doctor_id, role='DOCTOR')
        except User.DoesNotExist:
            return Response({'error': 'الدكتور غير موجود'}, status=status.HTTP_404_NOT_FOUND)

        try:
            subject = Subject.objects.get(id=subject_id)
        except Subject.DoesNotExist:
            return Response({'error': 'المادة غير موجودة'}, status=status.HTTP_404_NOT_FOUND)

        try:
            level = Level.objects.get(id=level_id)
        except Level.DoesNotExist:
            return Response({'error': 'الفرقة غير موجودة'}, status=status.HTTP_404_NOT_FOUND)

        try:
            term = Term.objects.get(id=term_id)
        except Term.DoesNotExist:
            return Response({'error': 'الترم غير موجود'}, status=status.HTTP_404_NOT_FOUND)

        # Get grading template (use default if not specified)
        grading_template = None
        if grading_template_id:
            try:
                grading_template = GradingTemplate.objects.get(id=grading_template_id)
            except GradingTemplate.DoesNotExist:
                pass
        
        if not grading_template:
            grading_template = GradingTemplate.objects.filter(is_default=True).first()

        # Check if academic year is open
        if term.academic_year.status != 'OPEN':
            return Response(
                {'error': 'العام الدراسي مغلق - لا يمكن إضافة تعيينات جديدة'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create or update course offering
        offering, created = CourseOffering.objects.update_or_create(
            subject=subject,
            level=level,
            term=term,
            academic_year=term.academic_year,
            defaults={
                'doctor': doctor,
                'grading_template': grading_template
            }
        )

        return Response({
            'message': 'تم تعيين الدكتور بنجاح' if created else 'تم تحديث تعيين الدكتور',
            'offering_id': offering.id
        })


class DoctorAssignmentsView(APIView):
    """View all course offerings (doctor assignments)"""
    permission_classes = [IsStaffAffairsRole]

    def get(self, request):
        academic_year_id = request.query_params.get('academic_year')
        term_id = request.query_params.get('term')
        
        offerings = CourseOffering.objects.select_related(
            'doctor', 'subject', 'level', 'level__department', 
            'term', 'academic_year', 'grading_template'
        )

        if academic_year_id:
            offerings = offerings.filter(academic_year_id=academic_year_id)
        if term_id:
            offerings = offerings.filter(term_id=term_id)

        result = []
        for o in offerings:
            result.append({
                'id': o.id,
                'doctor_name': f"{o.doctor.first_name} {o.doctor.last_name}".strip(),
                'doctor_id': o.doctor.id,
                'subject_name': o.subject.name,
                'subject_code': o.subject.code,
                'level_name': o.level.get_name_display(),
                'department': o.level.department.name if o.level.department else 'إعدادي',
                'term': o.term.get_name_display(),
                'term_id': o.term.id,
                'academic_year': o.academic_year.name,
                'academic_year_id': o.academic_year.id,
                'grading_template': o.grading_template.name if o.grading_template else None,
            })

        return Response(result)

