from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DepartmentViewSet, AcademicYearViewSet, LevelViewSet, CourseViewSet, GradeViewSet, ExamViewSet, AttendanceViewSet, CourseMaterialViewSet, CertificateViewSet, BulkStudentUploadView, BulkGradeUploadView, TeachingAssignmentViewSet
from .student_affairs_views import UploadStudentsView, StudentListView, ResetStudentPasswordView, FourthYearStudentsView, StudentProfileView

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
    # Student Affairs endpoints
    path('student-affairs/upload/', UploadStudentsView.as_view(), name='student-affairs-upload'),
    path('student-affairs/students/', StudentListView.as_view(), name='student-affairs-students'),
    path('student-affairs/students/<int:student_id>/reset-password/', ResetStudentPasswordView.as_view(), name='reset-student-password'),
    path('student-affairs/fourth-year-students/', FourthYearStudentsView.as_view(), name='fourth-year-students'),
    # Student profile endpoint (for students to get their own info)
    path('student/profile/', StudentProfileView.as_view(), name='student-profile'),
]


