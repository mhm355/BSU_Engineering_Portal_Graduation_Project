"""
Graduate Affairs API Views
Handles graduate requests, certificate management, clearance, database, and stats.
"""
import io
import os
import zipfile

from rest_framework import status, viewsets, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.db.models import Q, Count
from django.utils import timezone

from .models import (
    GraduateRequest, GraduateRequestStatusHistory,
    GraduationClearance, GraduateInfoUpdateRequest
)
from .serializers import (
    GraduateRequestSerializer, GraduationClearanceSerializer,
    GraduateInfoUpdateRequestSerializer
)
from academic.models import Student, Certificate, AuditLog, UploadHistory
from users.permissions import IsGraduateAffairsRole, IsStudentRole
from rest_framework.permissions import IsAuthenticated

User = get_user_model()


# ============================================================================
# Dashboard Statistics
# ============================================================================

class GraduateAffairsStatsView(APIView):
    """Dashboard statistics for Graduate Affairs"""
    permission_classes = [IsGraduateAffairsRole]

    def get(self, request):
        total_graduates = Student.objects.filter(level__name='FOURTH').count()
        total_certificates = Certificate.objects.count()
        total_requests = GraduateRequest.objects.count()
        pending_requests = GraduateRequest.objects.filter(
            status__in=['SUBMITTED', 'UNDER_REVIEW']
        ).count()
        completed_requests = GraduateRequest.objects.filter(status='COMPLETED').count()
        total_clearances = GraduationClearance.objects.count()
        completed_clearances = GraduationClearance.objects.filter(overall_status='COMPLETED').count()

        # Requests by type
        requests_by_type = list(
            GraduateRequest.objects.values('request_type')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Requests by status
        requests_by_status = list(
            GraduateRequest.objects.values('status')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Recent requests
        recent_requests = GraduateRequestSerializer(
            GraduateRequest.objects.select_related('graduate', 'assigned_to')[:5],
            many=True
        ).data

        return Response({
            'total_graduates': total_graduates,
            'total_certificates': total_certificates,
            'total_requests': total_requests,
            'pending_requests': pending_requests,
            'completed_requests': completed_requests,
            'total_clearances': total_clearances,
            'completed_clearances': completed_clearances,
            'requests_by_type': requests_by_type,
            'requests_by_status': requests_by_status,
            'recent_requests': recent_requests,
        })


# ============================================================================
# Graduate Requests
# ============================================================================

class GraduateRequestViewSet(viewsets.ModelViewSet):
    """CRUD for graduate service requests"""
    serializer_class = GraduateRequestSerializer
    permission_classes = [IsGraduateAffairsRole]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        queryset = GraduateRequest.objects.select_related(
            'graduate', 'assigned_to'
        ).prefetch_related('status_history')

        # Filters
        status_filter = self.request.query_params.get('status')
        request_type = self.request.query_params.get('request_type')
        search = self.request.query_params.get('search')

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if request_type:
            queryset = queryset.filter(request_type=request_type)
        if search:
            queryset = queryset.filter(
                Q(graduate__first_name__icontains=search) |
                Q(graduate__last_name__icontains=search) |
                Q(graduate__username__icontains=search) |
                Q(notes__icontains=search)
            )
        return queryset

    def perform_create(self, serializer):
        instance = serializer.save()
        # Create initial status history
        GraduateRequestStatusHistory.objects.create(
            request=instance,
            from_status='',
            to_status=instance.status,
            changed_by=self.request.user,
            comment='تم إنشاء الطلب'
        )


class UpdateRequestStatusView(APIView):
    """Update the status of a graduate request with history tracking"""
    permission_classes = [IsGraduateAffairsRole]

    def post(self, request, pk):
        try:
            grad_request = GraduateRequest.objects.get(pk=pk)
        except GraduateRequest.DoesNotExist:
            return Response({'error': 'الطلب غير موجود'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        comment = request.data.get('comment', '')

        if not new_status:
            return Response({'error': 'الحالة الجديدة مطلوبة'}, status=status.HTTP_400_BAD_REQUEST)

        valid_statuses = [s[0] for s in GraduateRequest.Status.choices]
        if new_status not in valid_statuses:
            return Response({'error': 'حالة غير صالحة'}, status=status.HTTP_400_BAD_REQUEST)

        old_status = grad_request.status
        grad_request.status = new_status

        # Update internal notes if provided
        internal_notes = request.data.get('internal_notes')
        if internal_notes is not None:
            grad_request.internal_notes = internal_notes

        # Update assigned_to if provided
        assigned_to = request.data.get('assigned_to')
        if assigned_to:
            grad_request.assigned_to_id = assigned_to

        grad_request.save()

        # Phase 3: Notifications
        from .models import Notification
        from django.core.mail import send_mail
        from django.conf import settings

        if old_status != new_status:
            Notification.objects.create(
                recipient=grad_request.user,
                title="تحديث حالة الطلب",
                message=f"تم تحديث حالة طلبك ({grad_request.get_request_type_display()}) إلى: {grad_request.get_status_display()}",
                notification_type=Notification.NotificationType.INFO if new_status != 'APPROVED' else Notification.NotificationType.SUCCESS,
                link='/student/requests'
            )
            # Send Email
            if grad_request.user.email:
                try:
                    send_mail(
                        subject='بوابة الخريجين - تحديث حالة الطلب',
                        message=f'عزيزي {grad_request.user.first_name}،\n\nتم تحديث حالة طلبك إلى: {grad_request.get_status_display()}.\n\nمع تحيات,\nشؤون الخريجين',
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[grad_request.user.email],
                        fail_silently=True,
                    )
                except Exception:
                    pass

        # Create status history entry
        GraduateRequestStatusHistory.objects.create(
            request=grad_request,
            from_status=old_status,
            to_status=new_status,
            changed_by=request.user,
            comment=comment
        )

        return Response(GraduateRequestSerializer(grad_request).data)


class StudentGraduateRequestViewSet(viewsets.ModelViewSet):
    """CRUD for graduate service requests from the student's perspective"""
    serializer_class = GraduateRequestSerializer
    permission_classes = [IsAuthenticated, IsStudentRole]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return GraduateRequest.objects.filter(
            graduate=self.request.user
        ).prefetch_related('status_history').order_by('-created_at')

    def perform_create(self, serializer):
        instance = serializer.save(graduate=self.request.user, status='PENDING')
        # Create initial status history
        GraduateRequestStatusHistory.objects.create(
            request=instance,
            from_status='',
            to_status='PENDING',
            changed_by=self.request.user,
            comment='تم تقديم الطلب من قبل الخريج/الطالب'
        )

    def update(self, request, *args, **kwargs):
        return Response({'error': 'Students cannot update their requests directly.'}, status=status.HTTP_403_FORBIDDEN)

    def destroy(self, request, *args, **kwargs):
        return Response({'error': 'Students cannot delete requests.'}, status=status.HTTP_403_FORBIDDEN)


# ============================================================================
# Graduate Database
# ============================================================================

class GraduateDatabaseView(APIView):
    """List and search graduates (fourth-year students)"""
    permission_classes = [IsGraduateAffairsRole]

    def get(self, request):
        queryset = Student.objects.filter(
            level__name='FOURTH'
        ).select_related(
            'user', 'department', 'academic_year', 'specialization'
        )

        # Filters
        department = request.query_params.get('department')
        academic_year = request.query_params.get('academic_year')
        search = request.query_params.get('search')
        graduation_status = request.query_params.get('graduation_status')

        if department:
            queryset = queryset.filter(department_id=department)
        if academic_year:
            queryset = queryset.filter(academic_year_id=academic_year)
        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search) |
                Q(national_id__icontains=search) |
                Q(user__username__icontains=search)
            )
        if graduation_status:
            queryset = queryset.filter(user__graduation_status=graduation_status)

        graduates = []
        for student in queryset:
            cert = Certificate.objects.filter(student=student.user).first()
            clearance = GraduationClearance.objects.filter(graduate=student.user).first()

            graduates.append({
                'id': student.id,
                'user_id': student.user.id if student.user else None,
                'national_id': student.national_id,
                'full_name': student.full_name,
                'department': student.department.name if student.department else None,
                'department_id': student.department.id if student.department else None,
                'specialization': student.specialization.name if student.specialization else None,
                'academic_year': student.academic_year.name if student.academic_year else None,
                'graduation_status': student.user.graduation_status if student.user else None,
                'email': student.user.email if student.user else None,
                'phone': student.user.phone_number if student.user else None,
                'has_certificate': cert is not None,
                'certificate_id': cert.id if cert else None,
                'clearance_status': clearance.overall_status if clearance else None,
                'clearance_progress': clearance.get_progress() if clearance else 0,
            })

        return Response(graduates)


# ============================================================================
# Graduation Clearance
# ============================================================================

class GraduationClearanceViewSet(viewsets.ModelViewSet):
    """Manage graduation clearance checklists"""
    serializer_class = GraduationClearanceSerializer
    permission_classes = [IsGraduateAffairsRole]

    def get_queryset(self):
        queryset = GraduationClearance.objects.select_related('graduate')
        search = self.request.query_params.get('search')
        status_filter = self.request.query_params.get('status')

        if search:
            queryset = queryset.filter(
                Q(graduate__first_name__icontains=search) |
                Q(graduate__last_name__icontains=search) |
                Q(graduate__username__icontains=search)
            )
        if status_filter:
            queryset = queryset.filter(overall_status=status_filter)
        return queryset

    def perform_update(self, serializer):
        instance = serializer.save()
        # Auto-update overall status based on fields
        all_cleared = all([
            instance.library_cleared, instance.finance_cleared,
            instance.labs_cleared, instance.department_cleared,
            instance.housing_cleared, instance.other_cleared
        ])
        any_cleared = any([
            instance.library_cleared, instance.finance_cleared,
            instance.labs_cleared, instance.department_cleared,
            instance.housing_cleared, instance.other_cleared
        ])
        if all_cleared:
            instance.overall_status = 'COMPLETED'
        elif any_cleared:
            instance.overall_status = 'IN_PROGRESS'
        else:
            instance.overall_status = 'PENDING'
        instance.save()


# ============================================================================
# Certificate Management (Migrated from Student Affairs)
# ============================================================================

class CertificateListView(APIView):
    """List all certificates with graduate info"""
    permission_classes = [IsGraduateAffairsRole]

    def get(self, request):
        certificates = Certificate.objects.select_related('student').all()

        search = request.query_params.get('search')
        if search:
            certificates = certificates.filter(
                Q(student__first_name__icontains=search) |
                Q(student__last_name__icontains=search) |
                Q(student__username__icontains=search)
            )

        result = []
        for cert in certificates:
            student_record = Student.objects.filter(user=cert.student).first()
            result.append({
                'id': cert.id,
                'student_id': cert.student.id,
                'student_name': f"{cert.student.first_name} {cert.student.last_name}".strip(),
                'national_id': cert.student.national_id or (student_record.national_id if student_record else ''),
                'department': student_record.department.name if student_record and student_record.department else None,
                'file': cert.file.url if cert.file else None,
                'description': cert.description,
                'issued_at': cert.issued_at,
            })

        return Response(result)


class BulkCertificateUploadView(APIView):
    """
    Upload certificates in bulk via ZIP file.
    Each PDF in the ZIP is named <national_id>.pdf.
    """
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsGraduateAffairsRole]

    def post(self, request):
        zip_file = request.FILES.get('file')
        if not zip_file:
            return Response(
                {'error': 'يرجى رفع ملف ZIP يحتوي على الشهادات'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not zip_file.name.endswith('.zip'):
            return Response(
                {'error': 'يجب أن يكون الملف بصيغة ZIP'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            zf = zipfile.ZipFile(io.BytesIO(zip_file.read()))
        except zipfile.BadZipFile:
            return Response(
                {'error': 'ملف ZIP غير صالح'},
                status=status.HTTP_400_BAD_REQUEST
            )

        created_count = 0
        errors = []
        pdf_names = [n for n in zf.namelist() if n.lower().endswith('.pdf')]

        for pdf_name in pdf_names:
            try:
                national_id = pdf_name.rsplit('.', 1)[0].strip()
                if '/' in national_id:
                    national_id = national_id.rsplit('/', 1)[1]

                try:
                    student = Student.objects.get(national_id=national_id)
                except Student.DoesNotExist:
                    errors.append(f'{pdf_name}: الطالب بالرقم القومي {national_id} غير موجود')
                    continue

                if not student.user:
                    errors.append(f'{pdf_name}: الطالب ليس لديه حساب مستخدم')
                    continue

                pdf_content = zf.read(pdf_name)
                cert_file = ContentFile(pdf_content, name=f'{national_id}.pdf')

                Certificate.objects.create(
                    student=student.user,
                    file=cert_file,
                    description=f'شهادة مرفوعة بالجملة - {student.full_name}',
                )
                created_count += 1

            except Exception as e:
                errors.append(f'{pdf_name}: {str(e)}')

        try:
            UploadHistory.objects.create(
                upload_type='CERTIFICATE',
                file_name=zip_file.name,
                uploaded_by=request.user,
                total_rows=len(pdf_names),
                created_count=created_count,
                updated_count=0,
                error_count=len(errors),
                errors_json=errors if errors else None,
            )
        except Exception:
            pass

        return Response({
            'message': f'تم رفع {created_count} شهادة بنجاح',
            'created_count': created_count,
            'error_count': len(errors),
            'errors': errors,
        }, status=status.HTTP_201_CREATED)


class SyncCertificatesFromStorageView(APIView):
    """Sync certificates from Azure Blob Storage"""
    permission_classes = [IsGraduateAffairsRole]

    def post(self, request):
        created_count = 0
        updated_count = 0
        errors = []

        try:
            _, files = default_storage.listdir('certificates')
            supported_exts = ['.pdf', '.png', '.jpg', '.jpeg']
            cert_files = [f for f in files if any(f.lower().endswith(ext) for ext in supported_exts)]

            for file_name in cert_files:
                try:
                    name_without_ext = os.path.splitext(file_name)[0]
                    national_id = name_without_ext.strip()
                    if '/' in national_id:
                        national_id = national_id.rsplit('/', 1)[1]

                    try:
                        student = Student.objects.get(national_id=national_id, level__name='FOURTH')
                    except Student.DoesNotExist:
                        errors.append(f"{file_name}: لم يتم العثور على طالب في الفرقة الرابعة بهذا الرقم القومي")
                        continue

                    if not student.user:
                        errors.append(f"{file_name}: الطالب ليس لديه حساب مستخدم")
                        continue

                    file_path = f"certificates/{file_name}"
                    cert = Certificate.objects.filter(student=student.user).first()

                    if cert:
                        cert.file = file_path
                        cert.description = f'تم تحديث المزامنة من Azure Storage - {student.full_name}'
                        cert.save()
                        updated_count += 1
                    else:
                        Certificate.objects.create(
                            student=student.user,
                            file=file_path,
                            description=f'تمت المزامنة من Azure Storage - {student.full_name}'
                        )
                        created_count += 1

                except Exception as e:
                    errors.append(f"{file_name}: {str(e)}")

            try:
                AuditLog.objects.create(
                    action=AuditLog.ActionType.CERTIFICATE_GENERATED,
                    performed_by=request.user,
                    entity_type='SYNC_CERTIFICATES',
                    details={
                        'created': created_count,
                        'updated': updated_count,
                        'errors': len(errors)
                    }
                )
            except Exception:
                pass

            return Response({
                'message': f'تمت مزامنة الشهادات بنجاح. تم إنشاء {created_count} وتحديث {updated_count}',
                'created_count': created_count,
                'updated_count': updated_count,
                'error_count': len(errors),
                'errors': errors
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DirectBulkCertificateUploadView(APIView):
    """Upload multiple certificate files directly"""
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsGraduateAffairsRole]

    def post(self, request):
        files = request.FILES.getlist('files')

        if not files:
            return Response(
                {'error': 'يرجى اختيار ملفات الشهادات'},
                status=status.HTTP_400_BAD_REQUEST
            )

        created_count = 0
        updated_count = 0
        errors = []
        supported_exts = ['.pdf', '.png', '.jpg', '.jpeg']

        for file in files:
            file_name = file.name
            try:
                ext = os.path.splitext(file_name)[1].lower()
                if ext not in supported_exts:
                    errors.append(f"{file_name}: صيغة غير مدعومة")
                    continue

                national_id = os.path.splitext(file_name)[0].strip()

                try:
                    student = Student.objects.get(national_id=national_id, level__name='FOURTH')
                except Student.DoesNotExist:
                    errors.append(f"{file_name}: لم يتم العثور على طالب في الفرقة الرابعة بهذا الرقم القومي")
                    continue

                if not student.user:
                    errors.append(f"{file_name}: الطالب ليس لديه حساب مستخدم")
                    continue

                cert = Certificate.objects.filter(student=student.user).first()

                if cert:
                    cert.file = file
                    cert.description = f'شهادة محدثة مباشرة - {student.full_name}'
                    cert.save()
                    updated_count += 1
                else:
                    Certificate.objects.create(
                        student=student.user,
                        file=file,
                        description=f'شهادة مرفوعة مباشرة - {student.full_name}'
                    )
                    created_count += 1

            except Exception as e:
                errors.append(f"{file_name}: {str(e)}")

        try:
            UploadHistory.objects.create(
                upload_type='CERTIFICATE',
                file_name='Direct Bulk Upload',
                uploaded_by=request.user,
                total_rows=len(files),
                created_count=created_count,
                updated_count=updated_count,
                error_count=len(errors),
                errors_json=errors if errors else None,
            )
        except Exception:
            pass

        return Response({
            'message': f'تم رفع الشهادات بنجاح. تم إنشاء {created_count} وتحديث {updated_count}',
            'created_count': created_count,
            'updated_count': updated_count,
            'error_count': len(errors),
            'errors': errors
        }, status=status.HTTP_201_CREATED)


# ============================================================================
# Fourth Year Students (for certificate assignment)
# ============================================================================

class FourthYearGraduatesView(APIView):
    """List fourth-year students for certificate management"""
    permission_classes = [IsGraduateAffairsRole]

    def get(self, request):
        students = Student.objects.filter(
            level__name='FOURTH'
        ).select_related('user', 'department', 'specialization')

        result = []
        for student in students:
            cert = Certificate.objects.filter(student=student.user).first()
            result.append({
                'id': student.id,
                'user_id': student.user.id if student.user else None,
                'national_id': student.national_id,
                'full_name': student.full_name,
                'department': student.department.name if student.department else None,
                'specialization': student.specialization.name if student.specialization else None,
                'has_certificate': cert is not None,
                'certificate_url': cert.file.url if cert and cert.file else None,
                'graduation_status': student.user.graduation_status if student.user else None,
            })

        return Response(result)


# ============================================================================
# Phase 2: Employment & Training Portal Views
# ============================================================================

from rest_framework.permissions import IsAuthenticated
from .models import Company, JobPosting, JobApplication, TrainingEvent, EventRegistration, Notification
from .serializers import (
    CompanySerializer, JobPostingSerializer, JobApplicationSerializer,
    TrainingEventSerializer, EventRegistrationSerializer, NotificationSerializer
)
from academic.models import Certificate

class CompanyViewSet(viewsets.ModelViewSet):
    """CRUD for partner companies. Staff only."""
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsGraduateAffairsRole]
    parser_classes = [MultiPartParser, FormParser, JSONParser]


class JobPostingViewSet(viewsets.ModelViewSet):
    """Job postings. Staff can CRUD, Students/Graduates can only Read."""
    queryset = JobPosting.objects.select_related('company').all()
    serializer_class = JobPostingSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsGraduateAffairsRole()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class JobApplicationViewSet(viewsets.ModelViewSet):
    """Job Applications. Graduates can apply. Staff can review."""
    serializer_class = JobApplicationSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.action in ['create', 'list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsGraduateAffairsRole()]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['GRADUATE_AFFAIRS', 'ADMIN']:
            return JobApplication.objects.select_related('job__company', 'applicant').all()
        return JobApplication.objects.select_related('job__company').filter(applicant=user)

    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)

    def perform_update(self, serializer):
        old_status = self.get_object().status
        instance = serializer.save()
        
        if old_status != instance.status:
            from .models import Notification
            from django.core.mail import send_mail
            from django.conf import settings

            Notification.objects.create(
                recipient=instance.applicant,
                title="تحديث حالة طلب التوظيف",
                message=f"تم تحديث حالة طلبك لوظيفة ({instance.job.title}) إلى: {instance.get_status_display()}",
                notification_type=Notification.NotificationType.INFO if instance.status != 'ACCEPTED' else Notification.NotificationType.SUCCESS,
                link='/student/career-portal'
            )

            if instance.applicant.email:
                try:
                    send_mail(
                        subject='بوابة التوظيف - تحديث حالة الطلب',
                        message=f'عزيزي {instance.applicant.first_name}،\n\nتم تحديث حالة طلب التوظيف الخاص بك ({instance.job.title}) إلى: {instance.get_status_display()}.\n\nمع تحيات,\nشؤون الخريجين',
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[instance.applicant.email],
                        fail_silently=True,
                    )
                except Exception:
                    pass


class TrainingEventViewSet(viewsets.ModelViewSet):
    """Training events and workshops."""
    queryset = TrainingEvent.objects.select_related('provider').all()
    serializer_class = TrainingEventSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsGraduateAffairsRole()]


class EventRegistrationViewSet(viewsets.ModelViewSet):
    """Event registrations. Graduates can register."""
    serializer_class = EventRegistrationSerializer

    def get_permissions(self):
        if self.action in ['create', 'list', 'retrieve', 'destroy']:
            return [IsAuthenticated()]
        return [IsGraduateAffairsRole()]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['GRADUATE_AFFAIRS', 'ADMIN']:
            return EventRegistration.objects.select_related('event', 'attendee').all()
        return EventRegistration.objects.select_related('event').filter(attendee=user)

    def perform_create(self, serializer):
        # Additional validation could be added here (e.g., max_attendees check)
        serializer.save(attendee=self.request.user)


# ============================================================================
# Phase 3: Notifications & Verification Views
# ============================================================================
from rest_framework.decorators import action

class NotificationViewSet(viewsets.ModelViewSet):
    """User notifications"""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({'status': 'all marked as read'})


from rest_framework.permissions import AllowAny

class VerifyCertificateView(APIView):
    """Public endpoint to verify certificate by UUID"""
    permission_classes = [AllowAny]

    def get(self, request, verification_code):
        try:
            cert = Certificate.objects.select_related('student', 'student__department').get(verification_code=verification_code)
            return Response({
                'valid': True,
                'student_name': f"{cert.student.first_name} {cert.student.last_name}",
                'national_id': cert.student.national_id,
                'department': cert.student.department.name if cert.student.department else None,
                'graduation_status': cert.student.get_graduation_status_display(),
                'issued_at': cert.issued_at
            })
        except Certificate.DoesNotExist:
            return Response({'valid': False, 'error': 'Invalid verification code'}, status=404)
