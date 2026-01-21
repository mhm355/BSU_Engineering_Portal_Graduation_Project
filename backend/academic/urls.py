from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DepartmentViewSet, SpecializationViewSet, AcademicYearViewSet,
    LevelViewSet, SubjectViewSet, StudentViewSet, TeachingAssignmentViewSet,
    CertificateViewSet, StudentProfileView,
    TermViewSet, GradingTemplateViewSet, CourseOfferingViewSet, LectureViewSet,
    BulkAttendanceView, BulkStudentGradeView, AttendanceViewSet,
    StudentExamsView, StudentCoursesView
)
from .student_affairs_views import (
    UploadStudentsView, StudentListView, ResetStudentPasswordView,
    FourthYearStudentsView, StudentAffairsGradesView
)
from .staff_affairs_views import (
    UploadDoctorsView, UploadStaffAffairsUsersView, DoctorListView,
    StudentAffairsUserListView, AssignDoctorToSubjectView, DoctorAssignmentsView,
    TermListView, GradingTemplateListView, DoctorDetailView, DoctorResetPasswordView,
    DoctorDeletionRequestView, AdminDeletionRequestsView
)
from .exam_grades_views import (
    UploadExamGradesView, PendingExamGradesView, ApproveExamGradesView,
    PendingExamGradesCountView, StudentExamGradesView
)
from .quiz_views import (
    QuizViewSet, StudentQuizListView, StudentQuizAttemptView, QuizResultsView
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
router.register(r'quizzes', QuizViewSet)
router.register(r'attendance', AttendanceViewSet)

urlpatterns = [
    # Bulk operations MUST come before router to avoid being intercepted
    path('attendance/bulk/', BulkAttendanceView.as_view(), name='bulk-attendance'),
    path('student-grades/bulk/', BulkStudentGradeView.as_view(), name='bulk-student-grades'),
    
    path('', include(router.urls)),

    # Student Affairs endpoints
    path('student-affairs/upload/', UploadStudentsView.as_view(), name='student-affairs-upload'),
    path('student-affairs/students/', StudentListView.as_view(), name='student-affairs-students'),
    path('student-affairs/students/<int:student_id>/reset-password/', ResetStudentPasswordView.as_view(), name='reset-student-password'),
    path('student-affairs/fourth-year-students/', FourthYearStudentsView.as_view(), name='fourth-year-students'),
    path('student-affairs/grades/', StudentAffairsGradesView.as_view(), name='student-affairs-grades'),

    # Staff Affairs endpoints
    path('staff-affairs/upload-doctors/', UploadDoctorsView.as_view(), name='upload-doctors'),
    path('staff-affairs/upload-staff/', UploadStaffAffairsUsersView.as_view(), name='upload-staff'),
    path('staff-affairs/doctors/', DoctorListView.as_view(), name='doctor-list'),
    path('staff-affairs/student-affairs-users/', StudentAffairsUserListView.as_view(), name='student-affairs-user-list'),
    path('staff-affairs/assign-doctor/', AssignDoctorToSubjectView.as_view(), name='assign-doctor'),
    path('staff-affairs/assignments/', DoctorAssignmentsView.as_view(), name='doctor-assignments'),
    path('staff-affairs/terms/', TermListView.as_view(), name='term-list'),
    path('staff-affairs/grading-templates/', GradingTemplateListView.as_view(), name='grading-template-list'),
    path('staff-affairs/doctors/<int:pk>/', DoctorDetailView.as_view(), name='doctor-detail'),
    path('staff-affairs/doctors/<int:pk>/reset-password/', DoctorResetPasswordView.as_view(), name='doctor-reset-password'),
    path('staff-affairs/doctors/<int:pk>/delete-request/', DoctorDeletionRequestView.as_view(), name='doctor-delete-request'),
    path('staff-affairs/deletion-requests/', DoctorDeletionRequestView.as_view(), name='my-deletion-requests'),
    
    # Admin endpoints
    path('admin/deletion-requests/', AdminDeletionRequestsView.as_view(), name='admin-deletion-requests'),
    path('admin/deletion-requests/<int:pk>/', AdminDeletionRequestsView.as_view(), name='admin-deletion-request-action'),

    # Student profile endpoint
    path('student/profile/', StudentProfileView.as_view(), name='student-profile'),

    # Exam Grades endpoints
    path('exam-grades/upload/', UploadExamGradesView.as_view(), name='upload-exam-grades'),
    path('exam-grades/pending/', PendingExamGradesView.as_view(), name='pending-exam-grades'),
    path('exam-grades/approve/<int:level_id>/', ApproveExamGradesView.as_view(), name='approve-exam-grades'),
    path('exam-grades/pending-count/', PendingExamGradesCountView.as_view(), name='pending-exam-grades-count'),
    path('exam-grades/my-grades/', StudentExamGradesView.as_view(), name='student-exam-grades'),

    # Quiz endpoints
    path('student/quizzes/', StudentQuizListView.as_view(), name='student-quizzes'),
    path('student/quizzes/<int:quiz_id>/attempt/', StudentQuizAttemptView.as_view(), name='quiz-attempt'),
    path('student/quizzes/<int:quiz_id>/results/', QuizResultsView.as_view(), name='student-quiz-results'),
    path('quizzes/<int:quiz_id>/results/', QuizResultsView.as_view(), name='quiz-results'),
    path('exams/', StudentExamsView.as_view(), name='student-exams'),
    path('student/courses/', StudentCoursesView.as_view(), name='student-courses'),
]
