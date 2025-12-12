from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DepartmentViewSet, AcademicYearViewSet, LevelViewSet, CourseViewSet, GradeViewSet, ExamViewSet, AttendanceViewSet, CourseMaterialViewSet, CertificateViewSet, BulkStudentUploadView, BulkGradeUploadView, TeachingAssignmentViewSet

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'years', AcademicYearViewSet)
router.register(r'levels', LevelViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'grades', GradeViewSet)
router.register(r'exams', ExamViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'materials', CourseMaterialViewSet)
router.register(r'certificates', CertificateViewSet)
router.register(r'assignments', TeachingAssignmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('upload-students/', BulkStudentUploadView.as_view(), name='upload-students'),
    path('grades/upload/', BulkGradeUploadView.as_view(), name='upload-grades'),
]
