"""
Staff Affairs API Views for managing doctors and staff
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db import transaction
from django.db.models import Q
from django.contrib.auth import get_user_model
import pandas as pd
import io

from .models import (
    AuditLog, TeachingAssignment, Subject, Level, AcademicYear,
    Term, GradingTemplate, CourseOffering, Specialization, UploadHistory
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

        # Track upload history
        try:
            UploadHistory.objects.create(
                upload_type='DOCTOR',
                file_name='doctors_upload',
                uploaded_by=performed_by,
                total_rows=len(df),
                created_count=created_count,
                updated_count=0,
                error_count=len(errors),
                errors_json=errors if errors else None,
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

        # Track upload history
        try:
            UploadHistory.objects.create(
                upload_type='STAFF',
                file_name='staff_upload',
                uploaded_by=performed_by,
                total_rows=len(df),
                created_count=created_count,
                updated_count=0,
                error_count=len(errors),
                errors_json=errors if errors else None,
            )
        except Exception:
            pass

        return {
            'created': created_count,
            'skipped': skipped_count,
            'errors': errors
        }


class DoctorListView(APIView):
    """List all doctors with optional search (read-only for Staff Affairs)"""
    permission_classes = [IsStaffAffairsRole]

    def get(self, request):
        search = request.query_params.get('search', '')
        
        doctors = User.objects.filter(role='DOCTOR')
        
        # Apply search filter if provided
        if search:
            doctors = doctors.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(national_id__icontains=search) |
                Q(email__icontains=search)
            )
        
        doctors = doctors.values('id', 'username', 'first_name', 'last_name', 'national_id', 'email')
        
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
                'written_weight': t.written_weight,
                'practical_weight': t.practical_weight,
                'midterm_weight': t.midterm_weight,
                'final_weight': t.final_weight,
                'is_default': t.is_default,
                'total_weight': t.total_weight(),
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
        specialization_id = request.data.get('specialization_id')

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

        # Get specialization (for Electrical dept level 2+)
        specialization = None
        if specialization_id:
            try:
                specialization = Specialization.objects.get(id=specialization_id)
            except Specialization.DoesNotExist:
                pass

        # Get grading template (priority: specified > subject default > global default)
        grading_template = None
        if grading_template_id:
            try:
                grading_template = GradingTemplate.objects.get(id=grading_template_id)
            except GradingTemplate.DoesNotExist:
                pass
        
        # Use subject's default template if not specified
        if not grading_template and subject.default_grading_template:
            grading_template = subject.default_grading_template
        
        # Fall back to global default
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
                'grading_template': grading_template,
                'specialization': specialization
            }
        )

        # Log audit trail for doctor assignment
        try:
            doctor_name = f"{doctor.first_name} {doctor.last_name}".strip()
            AuditLog.objects.create(
                action=AuditLog.ActionType.DOCTOR_ASSIGNMENT,
                performed_by=request.user,
                entity_type='COURSE_OFFERING',
                entity_id=str(offering.id),
                details={
                    'doctor_id': doctor.id,
                    'doctor_name': doctor_name,
                    'subject': subject.name,
                    'level': level.get_name_display(),
                    'term': term.get_name_display(),
                    'created': created,
                }
            )
        except Exception:
            pass

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


class DoctorDetailView(APIView):
    """Manage individual doctor: edit, reset password"""
    permission_classes = [IsStaffAffairsRole]

    def get(self, request, pk):
        """Get doctor details"""
        try:
            doctor = User.objects.get(id=pk, role='DOCTOR')
            return Response({
                'id': doctor.id,
                'national_id': doctor.national_id,
                'full_name': f"{doctor.first_name} {doctor.last_name}".strip(),
                'first_name': doctor.first_name,
                'last_name': doctor.last_name,
                'email': doctor.email,
                'first_login_required': doctor.first_login_required,
            })
        except User.DoesNotExist:
            return Response({'error': 'Doctor not found'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        """Update doctor info"""
        try:
            doctor = User.objects.get(id=pk, role='DOCTOR')
            
            # Update fields
            if 'first_name' in request.data:
                doctor.first_name = request.data['first_name']
            if 'last_name' in request.data:
                doctor.last_name = request.data['last_name']
            if 'email' in request.data:
                doctor.email = request.data['email']
            if 'national_id' in request.data:
                doctor.national_id = request.data['national_id']
            
            doctor.save()
            
            return Response({
                'id': doctor.id,
                'full_name': f"{doctor.first_name} {doctor.last_name}".strip(),
                'message': 'تم التحديث بنجاح'
            })
        except User.DoesNotExist:
            return Response({'error': 'Doctor not found'}, status=status.HTTP_404_NOT_FOUND)


class DoctorResetPasswordView(APIView):
    """Reset doctor password to national_id"""
    permission_classes = [IsStaffAffairsRole]

    def post(self, request, pk):
        try:
            doctor = User.objects.get(id=pk, role='DOCTOR')
            # Reset password to national_id
            doctor.set_password(doctor.national_id)
            doctor.first_login_required = True
            doctor.save()
            
            return Response({
                'message': 'تم إعادة تعيين كلمة المرور بنجاح',
                'new_password': 'الرقم القومي'
            })
        except User.DoesNotExist:
            return Response({'error': 'Doctor not found'}, status=status.HTTP_404_NOT_FOUND)


class DoctorDeletionRequestView(APIView):
    """Create deletion request for doctor (requires admin approval)"""
    permission_classes = [IsStaffAffairsRole]

    def get(self, request):
        """List deletion requests made by this user"""
        from .models import DoctorDeletionRequest
        
        requests = DoctorDeletionRequest.objects.filter(
            requested_by=request.user
        ).select_related('doctor', 'reviewed_by')
        
        result = []
        for req in requests:
            result.append({
                'id': req.id,
                'doctor_id': req.doctor.id,
                'doctor_name': f"{req.doctor.first_name} {req.doctor.last_name}".strip(),
                'reason': req.reason,
                'status': req.status,
                'status_display': req.get_status_display(),
                'created_at': req.created_at.isoformat(),
                'reviewed_at': req.reviewed_at.isoformat() if req.reviewed_at else None,
                'reviewed_by': f"{req.reviewed_by.first_name} {req.reviewed_by.last_name}".strip() if req.reviewed_by else None,
            })
        
        return Response(result)

    def post(self, request, pk):
        """Create deletion request for a doctor"""
        from .models import DoctorDeletionRequest
        
        try:
            doctor = User.objects.get(id=pk, role='DOCTOR')
            
            # Check for existing pending request
            existing = DoctorDeletionRequest.objects.filter(
                doctor=doctor,
                status=DoctorDeletionRequest.Status.PENDING
            ).exists()
            
            if existing:
                return Response({
                    'error': 'يوجد طلب حذف معلق لهذا الدكتور'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create new request
            deletion_request = DoctorDeletionRequest.objects.create(
                doctor=doctor,
                requested_by=request.user,
                reason=request.data.get('reason', '')
            )
            
            return Response({
                'id': deletion_request.id,
                'message': 'تم إرسال طلب الحذف للمراجعة من قبل الأدمن',
                'status': deletion_request.get_status_display()
            }, status=status.HTTP_201_CREATED)
            
        except User.DoesNotExist:
            return Response({'error': 'Doctor not found'}, status=status.HTTP_404_NOT_FOUND)


class AdminDeletionRequestsView(APIView):
    """Admin view for approving/rejecting doctor deletion requests"""
    from users.permissions import IsAdminRole
    permission_classes = [IsAdminRole]

    def get(self, request):
        """List all pending deletion requests"""
        from .models import DoctorDeletionRequest
        from django.utils import timezone
        
        status_filter = request.query_params.get('status', 'PENDING')
        
        requests = DoctorDeletionRequest.objects.filter(
            status=status_filter
        ).select_related('doctor', 'requested_by')
        
        result = []
        for req in requests:
            result.append({
                'id': req.id,
                'doctor_id': req.doctor.id,
                'doctor_name': f"{req.doctor.first_name} {req.doctor.last_name}".strip(),
                'doctor_national_id': req.doctor.national_id,
                'requested_by_name': f"{req.requested_by.first_name} {req.requested_by.last_name}".strip(),
                'reason': req.reason,
                'status': req.status,
                'status_display': req.get_status_display(),
                'created_at': req.created_at.isoformat(),
            })
        
        return Response(result)

    def post(self, request, pk):
        """Approve or reject a deletion request"""
        from .models import DoctorDeletionRequest, AuditLog
        from django.utils import timezone
        
        try:
            deletion_request = DoctorDeletionRequest.objects.get(id=pk)
            action = request.data.get('action')  # 'approve' or 'reject'
            
            if action == 'approve':
                # Delete the doctor
                doctor = deletion_request.doctor
                doctor_name = f"{doctor.first_name} {doctor.last_name}".strip()
                doctor_nid = doctor.national_id
                deletion_request.status = DoctorDeletionRequest.Status.APPROVED
                deletion_request.reviewed_at = timezone.now()
                deletion_request.reviewed_by = request.user
                deletion_request.save()
                
                # Actually delete the doctor user
                try:
                    doctor.delete()
                except Exception as e:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Failed to delete doctor {doctor.id}: {e}")
                    return Response({
                        'error': f'فشل حذف الدكتور: {str(e)}'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                # U9: Audit log
                try:
                    AuditLog.objects.create(
                        action='DOCTOR_DELETED',
                        performed_by=request.user,
                        entity_type='Doctor',
                        entity_id=pk,
                        details={'doctor_name': doctor_name, 'national_id': doctor_nid}
                    )
                except Exception:
                    pass
                
                return Response({
                    'message': 'تمت الموافقة على الحذف وتم حذف الدكتور',
                })
            elif action == 'reject':
                deletion_request.status = DoctorDeletionRequest.Status.REJECTED
                deletion_request.reviewed_at = timezone.now()
                deletion_request.reviewed_by = request.user
                deletion_request.save()
                
                # U9: Audit log
                try:
                    AuditLog.objects.create(
                        action='GRADE_REJECTED',
                        performed_by=request.user,
                        entity_type='DoctorDeletionRequest',
                        entity_id=pk,
                        details={'doctor_name': f"{deletion_request.doctor.first_name} {deletion_request.doctor.last_name}".strip()}
                    )
                except Exception:
                    pass
                
                return Response({
                    'message': 'تم رفض طلب الحذف',
                })
            else:
                return Response({
                    'error': 'Invalid action. Use "approve" or "reject"'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except DoctorDeletionRequest.DoesNotExist:
            return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)


class AssignmentHistoryView(APIView):
    """View assignment history from audit logs — Staff Affairs"""
    permission_classes = [IsStaffAffairsRole]

    def get(self, request):
        qs = AuditLog.objects.filter(
            action__in=[
                AuditLog.ActionType.DOCTOR_ASSIGNMENT,
                AuditLog.ActionType.DOCTOR_UNASSIGNMENT,
            ]
        ).select_related('performed_by').order_by('-created_at')[:200]

        result = []
        for log in qs:
            details = log.details or {}
            result.append({
                'id': log.id,
                'action': log.action,
                'action_display': log.get_action_display(),
                'performed_by': f"{log.performed_by.first_name} {log.performed_by.last_name}".strip(),
                'doctor_name': details.get('doctor_name', ''),
                'subject': details.get('subject', ''),
                'level': details.get('level', ''),
                'term': details.get('term', ''),
                'created_at': log.created_at,
            })

        return Response(result)
