"""
Graduate Affairs URL Configuration
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GraduateAffairsStatsView,
    GraduateRequestViewSet,
    UpdateRequestStatusView,
    GraduateDatabaseView,
    GraduationClearanceViewSet,
    CertificateListView,
    BulkCertificateUploadView,
    SyncCertificatesFromStorageView,
    DirectBulkCertificateUploadView,
    FourthYearGraduatesView,
    CompanyViewSet,
    JobPostingViewSet,
    JobApplicationViewSet,
    TrainingEventViewSet,
    EventRegistrationViewSet,
    NotificationViewSet,
    VerifyCertificateView,
    StudentGraduateRequestViewSet
)

router = DefaultRouter()
router.register(r'requests', GraduateRequestViewSet, basename='graduate-request')
router.register(r'student-requests', StudentGraduateRequestViewSet, basename='student-graduate-request')
router.register(r'clearances', GraduationClearanceViewSet, basename='graduation-clearance')
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'jobs', JobPostingViewSet, basename='job-posting')
router.register(r'applications', JobApplicationViewSet, basename='job-application')
router.register(r'events', TrainingEventViewSet, basename='training-event')
router.register(r'event-registrations', EventRegistrationViewSet, basename='event-registration')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    # Dashboard stats
    path('stats/', GraduateAffairsStatsView.as_view(), name='graduate-affairs-stats'),

    # Graduate database
    path('graduates/', GraduateDatabaseView.as_view(), name='graduate-database'),

    # Fourth year students (for certificate assignment)
    path('fourth-year/', FourthYearGraduatesView.as_view(), name='fourth-year-graduates'),

    # Request status updates
    path('requests/<int:pk>/update-status/', UpdateRequestStatusView.as_view(), name='update-request-status'),

    # Certificate management
    path('certificates/', CertificateListView.as_view(), name='certificate-list'),
    path('certificates/bulk-upload/', BulkCertificateUploadView.as_view(), name='bulk-certificate-upload'),
    path('certificates/sync/', SyncCertificatesFromStorageView.as_view(), name='sync-certificates'),
    path('certificates/bulk-direct/', DirectBulkCertificateUploadView.as_view(), name='direct-bulk-certificates'),

    # Public verification
    path('public/verify-certificate/<uuid:verification_code>/', VerifyCertificateView.as_view(), name='verify-certificate'),

    # Router URLs
    path('', include(router.urls)),
]
