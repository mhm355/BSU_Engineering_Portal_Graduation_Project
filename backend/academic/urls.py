from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DepartmentViewSet, SpecializationViewSet, AcademicYearViewSet,
    LevelViewSet, SubjectViewSet, StudentViewSet, TeachingAssignmentViewSet,
    CertificateViewSet, StudentProfileView,
    TermViewSet, GradingTemplateViewSet, CourseOfferingViewSet, LectureViewSet
)
from .student_affairs_views import (
    UploadStudentsView, StudentListView, ResetStudentPasswordView,
    FourthYearStudentsView
)
from .staff_affairs_views import (
    UploadDoctorsView, UploadStaffAffairsUsersView, DoctorListView,
    StudentAffairsUserListView, AssignDoctorToSubjectView, DoctorAssignmentsView,
    TermListView, GradingTemplateListView
)
from .exam_grades_views import (
    UploadExamGradesView, PendingExamGradesView, ApproveExamGradesView,
    PendingExamGradesCountView, StudentExamGradesView
)

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'specializations', SpecializationViewSet)
router.register(r'years', AcademicYearViewSet)
router.register(r'terms', TermViewSet)
router.register(r'grading-templates', GradingTemplateViewSet)
router.register(r'levels', LevelViewSet)
router.register(r'subjects', SubjectViewSet)
router.register(r'students', StudentViewSet)
router.register(r'assignments', TeachingAssignmentViewSet)
router.register(r'course-offerings', CourseOfferingViewSet)
router.register(r'lectures', LectureViewSet)
router.register(r'certificates', CertificateViewSet)

urlpatterns = [
    path('', include(router.urls)),

    # Student Affairs endpoints
    path('student-affairs/upload/', UploadStudentsView.as_view(), name='student-affairs-upload'),
    path('student-affairs/students/', StudentListView.as_view(), name='student-affairs-students'),
    path('student-affairs/students/<int:student_id>/reset-password/', ResetStudentPasswordView.as_view(), name='reset-student-password'),
    path('student-affairs/fourth-year-students/', FourthYearStudentsView.as_view(), name='fourth-year-students'),

    # Staff Affairs endpoints
    path('staff-affairs/upload-doctors/', UploadDoctorsView.as_view(), name='upload-doctors'),
    path('staff-affairs/upload-staff/', UploadStaffAffairsUsersView.as_view(), name='upload-staff'),
    path('staff-affairs/doctors/', DoctorListView.as_view(), name='doctor-list'),
    path('staff-affairs/student-affairs-users/', StudentAffairsUserListView.as_view(), name='student-affairs-user-list'),
    path('staff-affairs/assign-doctor/', AssignDoctorToSubjectView.as_view(), name='assign-doctor'),
    path('staff-affairs/assignments/', DoctorAssignmentsView.as_view(), name='doctor-assignments'),
    path('staff-affairs/terms/', TermListView.as_view(), name='term-list'),
    path('staff-affairs/grading-templates/', GradingTemplateListView.as_view(), name='grading-template-list'),

    # Student profile endpoint
    path('student/profile/', StudentProfileView.as_view(), name='student-profile'),

    # Exam Grades endpoints
    path('exam-grades/upload/', UploadExamGradesView.as_view(), name='upload-exam-grades'),
    path('exam-grades/pending/', PendingExamGradesView.as_view(), name='pending-exam-grades'),
    path('exam-grades/approve/<int:level_id>/', ApproveExamGradesView.as_view(), name='approve-exam-grades'),
    path('exam-grades/pending-count/', PendingExamGradesCountView.as_view(), name='pending-exam-grades-count'),
    path('exam-grades/my-grades/', StudentExamGradesView.as_view(), name='student-exam-grades'),
]
