import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import About from './pages/About';
import AboutPage from './pages/AboutPage';
import DeanWordPage from './pages/DeanWordPage';
import VisionMissionPage from './pages/VisionMissionPage';
import RegulationsPage from './pages/RegulationsPage';
import EthicsPage from './pages/EthicsPage';
import DepartmentsPage from './pages/DepartmentsPage';
import CivilDepartmentPage from './pages/CivilDepartmentPage';
import ArchDepartmentPage from './pages/ArchDepartmentPage';
import ElectricalDepartmentPage from './pages/ElectricalDepartmentPage';
import StaffDirectory from './pages/dashboards/student_affairs/public/StaffDirectory';
import Departments from './pages/dashboards/student_affairs/public/Departments';
import UnifiedNews from './pages/dashboards/admin/UnifiedNews';
import Contact from './pages/Contact';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import ManageDepartments from './pages/dashboards/admin/ManageDepartments';
import ManageUsers from './pages/dashboards/admin/ManageUsers';
import StudentResults from './pages/dashboards/StudentResults';
import PublishResultsDean from './pages/dashboards/dean/PublishResultsDean';
import DeanExportData from './pages/dashboards/dean/DeanExportData';
import PublishResultsSA from './pages/dashboards/student_affairs/PublishResultsSA';
import StudentGrades from './pages/dashboards/student/StudentGrades';
import StudentAttendance from './pages/dashboards/student/StudentAttendance';
import StudentMaterials from './pages/dashboards/student/StudentMaterials';
import StudentExams from './pages/dashboards/student/StudentExams';
import StudentQuizzes from './pages/dashboards/student/StudentQuizzes';
import TakeQuiz from './pages/dashboards/student/TakeQuiz';
import StudentQuizResults from './pages/dashboards/student/StudentQuizResults';
import DoctorCourses from './pages/dashboards/doctor/DoctorCourses';
import StudentAffairsDashboard from './pages/dashboards/StudentAffairsDashboard';
import HierarchyView from './pages/dashboards/student_affairs/HierarchyView';
import UploadStudents from './pages/dashboards/student_affairs/UploadStudents';
import UploadCertificates from './pages/dashboards/student_affairs/UploadCertificates';
import ManageStaffNews from './pages/dashboards/student_affairs/ManageStaffNews';
import UploadExamGrades from './pages/dashboards/student_affairs/UploadExamGrades';
import StudentGradesView from './pages/dashboards/student_affairs/StudentGradesView';
import ManageTuition from './pages/dashboards/student_affairs/ManageTuition';
import DoctorCourseManager from './pages/dashboards/doctor/DoctorCourseManager';
import DoctorCourseDetail from './pages/dashboards/doctor/DoctorCourseDetail';
import UploadGrades from './pages/dashboards/doctor/UploadGrades';
import CreateQuiz from './pages/dashboards/doctor/CreateQuiz';
import QuizResults from './pages/dashboards/doctor/QuizResults';
import GradeQuizAttempt from './pages/dashboards/doctor/GradeQuizAttempt';
import ApprovalCenter from './pages/dashboards/admin/ApprovalCenter';
import AdminAcademicStructure from './pages/dashboards/admin/AdminAcademicStructure';
import ManageLevels from './pages/dashboards/admin/ManageLevels';
import UserProfile from './pages/UserProfile';

import StaffAffairsDashboard from './pages/dashboards/StaffAffairsDashboard';
import UploadDoctors from './pages/dashboards/staff_affairs/UploadDoctors';
import UploadStaffAffairs from './pages/dashboards/staff_affairs/UploadStaffAffairs';
import ViewUsers from './pages/dashboards/staff_affairs/ViewUsers';
import StaffAcademicStructure from './pages/dashboards/staff_affairs/AcademicStructure';
import ManageDoctors from './pages/dashboards/staff_affairs/ManageDoctors';
import DeletionRequests from './pages/dashboards/admin/DeletionRequests';
import ManageAcademicYears from './pages/dashboards/admin/ManageAcademicYears';
import AuditLogViewer from './pages/dashboards/admin/AuditLogViewer';

import ComplaintsDashboard from './pages/dashboards/admin/ComplaintsDashboard';
import PasswordResets from './pages/dashboards/admin/PasswordResets';
import UploadHistory from './pages/dashboards/student_affairs/UploadHistory';
import BulkCertificateUpload from './pages/dashboards/student_affairs/BulkCertificateUpload';
import AssignmentHistory from './pages/dashboards/staff_affairs/AssignmentHistory';

import DeanDashboard from './pages/dashboards/dean/DeanDashboard';
import GradeApprovals from './pages/dashboards/dean/GradeApprovals';

import HODDashboard from './pages/dashboards/hod/HODDashboard';
import AssignDoctorsHOD from './pages/dashboards/hod/AssignDoctorsHOD';
import ManageGradingTemplatesHOD from './pages/dashboards/hod/ManageGradingTemplatesHOD';

import GraduateAffairsDashboard from './pages/dashboards/graduate_affairs/GraduateAffairsDashboard';
import GraduateRequests from './pages/dashboards/graduate_affairs/GraduateRequests';
import GraduateDatabase from './pages/dashboards/graduate_affairs/GraduateDatabase';
import GraduationClearance from './pages/dashboards/graduate_affairs/GraduationClearance';
import GraduateReports from './pages/dashboards/graduate_affairs/GraduateReports';
import ManageCompanies from './pages/dashboards/graduate_affairs/ManageCompanies';
import ManageJobs from './pages/dashboards/graduate_affairs/ManageJobs';
import ManageEvents from './pages/dashboards/graduate_affairs/ManageEvents';
import CareerPortal from './pages/dashboards/student/CareerPortal';
import StudentGraduateRequests from './pages/dashboards/student/StudentGraduateRequests';
import VerifyCertificate from './pages/public/VerifyCertificate';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './hooks/useToast';
import ProtectedRoute from './components/ProtectedRoute';
import OfflineBanner from './components/OfflineBanner';
import axios from 'axios';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <OfflineBanner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/staff" element={<StaffDirectory />} />
                <Route path="/contact" element={<Contact />} />

                {/* Content Pages */}
                <Route path="/about" element={<AboutPage />} />
                <Route path="/dean-word" element={<DeanWordPage />} />
                <Route path="/vision-mission" element={<VisionMissionPage />} />
                <Route path="/regulations" element={<RegulationsPage />} />
                <Route path="/ethics" element={<EthicsPage />} />

                {/* Department Pages */}
                <Route path="/departments" element={<DepartmentsPage />} />
                <Route path="/departments/civil" element={<CivilDepartmentPage />} />
                <Route path="/departments/arch" element={<ArchDepartmentPage />} />
                <Route path="/departments/electrical" element={<ElectricalDepartmentPage />} />

                {/* Public Results Query */}
                <Route path="student/results" element={<StudentResults />} />
                <Route path="verify-certificate" element={<VerifyCertificate />} />

                {/* Protected Student Routes */}
                <Route path="student/dashboard" element={<ProtectedRoute roles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
                <Route path="student/grades" element={<ProtectedRoute roles={['STUDENT']}><StudentGrades /></ProtectedRoute>} />
                <Route path="student/attendance" element={<ProtectedRoute roles={['STUDENT']}><StudentAttendance /></ProtectedRoute>} />
                <Route path="student/materials" element={<ProtectedRoute roles={['STUDENT']}><StudentMaterials /></ProtectedRoute>} />
                <Route path="student/exams" element={<ProtectedRoute roles={['STUDENT']}><StudentExams /></ProtectedRoute>} />
                <Route path="student/quizzes" element={<ProtectedRoute roles={['STUDENT']}><StudentQuizzes /></ProtectedRoute>} />
                <Route path="student/quiz/:quizId" element={<ProtectedRoute roles={['STUDENT']}><TakeQuiz /></ProtectedRoute>} />
                <Route path="student/quiz/:quizId/results" element={<ProtectedRoute roles={['STUDENT']}><StudentQuizResults /></ProtectedRoute>} />
                <Route path="student/career-portal" element={<ProtectedRoute roles={['STUDENT']}><CareerPortal /></ProtectedRoute>} />
                <Route path="student/graduate-requests" element={<ProtectedRoute roles={['STUDENT']}><StudentGraduateRequests /></ProtectedRoute>} />
                <Route path="profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

                {/* Doctor Routes */}
                <Route path="doctor/dashboard" element={<ProtectedRoute roles={['DOCTOR']}><DoctorDashboard /></ProtectedRoute>} />
                <Route path="doctor/courses" element={<ProtectedRoute roles={['DOCTOR']}><DoctorCourses /></ProtectedRoute>} />
                <Route path="doctor/courses/:courseId" element={<ProtectedRoute roles={['DOCTOR']}><DoctorCourseDetail /></ProtectedRoute>} />
                <Route path="doctor/courses/:courseId/manage" element={<ProtectedRoute roles={['DOCTOR']}><DoctorCourseManager /></ProtectedRoute>} />
                <Route path="doctor/courses/:courseId/upload-grades" element={<ProtectedRoute roles={['DOCTOR']}><UploadGrades /></ProtectedRoute>} />
                <Route path="doctor/courses/:courseId/quiz" element={<ProtectedRoute roles={['DOCTOR']}><CreateQuiz /></ProtectedRoute>} />
                <Route path="doctor/courses/:courseId/quiz/:quizId/results" element={<ProtectedRoute roles={['DOCTOR']}><QuizResults /></ProtectedRoute>} />
                <Route path="doctor/courses/:courseId/quiz/:quizId/grade/:attemptId" element={<ProtectedRoute roles={['DOCTOR']}><GradeQuizAttempt /></ProtectedRoute>} />

                {/* Student Affairs Routes */}
                <Route path="staff/dashboard" element={<ProtectedRoute roles={['STUDENT_AFFAIRS']}><StudentAffairsDashboard /></ProtectedRoute>} />
                <Route path="student-affairs/dashboard" element={<ProtectedRoute roles={['STUDENT_AFFAIRS']}><StudentAffairsDashboard /></ProtectedRoute>} />
                <Route path="student-affairs/hierarchy" element={<ProtectedRoute roles={['STUDENT_AFFAIRS']}><HierarchyView /></ProtectedRoute>} />
                <Route path="student-affairs/upload-students" element={<ProtectedRoute roles={['STUDENT_AFFAIRS']}><UploadStudents /></ProtectedRoute>} />
                <Route path="student-affairs/certificates" element={<ProtectedRoute roles={['STUDENT_AFFAIRS']}><UploadCertificates /></ProtectedRoute>} />
                <Route path="student-affairs/news" element={<ProtectedRoute roles={['STUDENT_AFFAIRS']}><ManageStaffNews /></ProtectedRoute>} />
                <Route path="student-affairs/exam-grades" element={<ProtectedRoute roles={['STUDENT_AFFAIRS']}><UploadExamGrades /></ProtectedRoute>} />
                <Route path="student-affairs/grades" element={<ProtectedRoute roles={['STUDENT_AFFAIRS']}><StudentGradesView /></ProtectedRoute>} />
                <Route path="student-affairs/upload-history" element={<ProtectedRoute roles={['STUDENT_AFFAIRS']}><UploadHistory /></ProtectedRoute>} />
                <Route path="student-affairs/bulk-certificates" element={<ProtectedRoute roles={['STUDENT_AFFAIRS']}><BulkCertificateUpload /></ProtectedRoute>} />
                <Route path="student-affairs/publish-results" element={<ProtectedRoute roles={['STUDENT_AFFAIRS']}><PublishResultsSA /></ProtectedRoute>} />
                <Route path="student-affairs/manage-tuition" element={<ProtectedRoute roles={['STUDENT_AFFAIRS']}><ManageTuition /></ProtectedRoute>} />
                
                {/* Graduate Affairs Routes */}
                <Route path="graduate-affairs/dashboard" element={<ProtectedRoute roles={['GRADUATE_AFFAIRS']}><GraduateAffairsDashboard /></ProtectedRoute>} />
                <Route path="graduate-affairs/requests" element={<ProtectedRoute roles={['GRADUATE_AFFAIRS']}><GraduateRequests /></ProtectedRoute>} />
                <Route path="graduate-affairs/database" element={<ProtectedRoute roles={['GRADUATE_AFFAIRS']}><GraduateDatabase /></ProtectedRoute>} />
                <Route path="graduate-affairs/clearance" element={<ProtectedRoute roles={['GRADUATE_AFFAIRS']}><GraduationClearance /></ProtectedRoute>} />
                <Route path="graduate-affairs/reports" element={<ProtectedRoute roles={['GRADUATE_AFFAIRS']}><GraduateReports /></ProtectedRoute>} />
                <Route path="graduate-affairs/companies" element={<ProtectedRoute roles={['GRADUATE_AFFAIRS']}><ManageCompanies /></ProtectedRoute>} />
                <Route path="graduate-affairs/jobs" element={<ProtectedRoute roles={['GRADUATE_AFFAIRS']}><ManageJobs /></ProtectedRoute>} />
                <Route path="graduate-affairs/events" element={<ProtectedRoute roles={['GRADUATE_AFFAIRS']}><ManageEvents /></ProtectedRoute>} />
                <Route path="graduate-affairs/news" element={<ProtectedRoute roles={['GRADUATE_AFFAIRS']}><ManageStaffNews /></ProtectedRoute>} />

                {/* Staff Affairs Routes */}
                <Route path="staff-affairs" element={<ProtectedRoute roles={['STAFF_AFFAIRS']}><StaffAffairsDashboard /></ProtectedRoute>} />
                <Route path="staff-affairs/dashboard" element={<ProtectedRoute roles={['STAFF_AFFAIRS']}><StaffAffairsDashboard /></ProtectedRoute>} />
                <Route path="staff-affairs/upload-doctors" element={<ProtectedRoute roles={['STAFF_AFFAIRS']}><UploadDoctors /></ProtectedRoute>} />
                <Route path="staff-affairs/upload-staff" element={<ProtectedRoute roles={['STAFF_AFFAIRS']}><UploadStaffAffairs /></ProtectedRoute>} />
                <Route path="staff-affairs/view-users" element={<ProtectedRoute roles={['STAFF_AFFAIRS']}><ViewUsers /></ProtectedRoute>} />
                <Route path="staff-affairs/academic-structure" element={<ProtectedRoute roles={['STAFF_AFFAIRS']}><StaffAcademicStructure /></ProtectedRoute>} />
                <Route path="staff-affairs/manage-doctors" element={<ProtectedRoute roles={['STAFF_AFFAIRS']}><ManageDoctors /></ProtectedRoute>} />
                <Route path="staff-affairs/assignment-history" element={<ProtectedRoute roles={['STAFF_AFFAIRS']}><AssignmentHistory /></ProtectedRoute>} />
                <Route path="staff-affairs/news" element={<ProtectedRoute roles={['STAFF_AFFAIRS']}><ManageStaffNews /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="admin/dashboard" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="admin/academic-years" element={<ProtectedRoute roles={['ADMIN']}><ManageAcademicYears /></ProtectedRoute>} />
                <Route path="admin/departments" element={<ProtectedRoute roles={['ADMIN']}><ManageDepartments /></ProtectedRoute>} />
                <Route path="admin/levels" element={<ProtectedRoute roles={['ADMIN']}><ManageLevels /></ProtectedRoute>} />
                <Route path="admin/users" element={<ProtectedRoute roles={['ADMIN']}><ManageUsers /></ProtectedRoute>} />
                <Route path="admin/academic-structure" element={<ProtectedRoute roles={['ADMIN']}><AdminAcademicStructure /></ProtectedRoute>} />
                <Route path="admin/approvals" element={<ProtectedRoute roles={['ADMIN']}><ApprovalCenter /></ProtectedRoute>} />
                <Route path="admin/news" element={<ProtectedRoute roles={['ADMIN']}><UnifiedNews /></ProtectedRoute>} />
                <Route path="admin/deletion-requests" element={<ProtectedRoute roles={['ADMIN']}><DeletionRequests /></ProtectedRoute>} />
                <Route path="admin/audit-logs" element={<ProtectedRoute roles={['ADMIN']}><AuditLogViewer /></ProtectedRoute>} />
                <Route path="admin/announcements" element={<ProtectedRoute roles={['ADMIN']}><UnifiedNews /></ProtectedRoute>} />
                <Route path="admin/complaints" element={<ProtectedRoute roles={['ADMIN']}><ComplaintsDashboard /></ProtectedRoute>} />
                <Route path="admin/password-resets" element={<ProtectedRoute roles={['ADMIN']}><PasswordResets /></ProtectedRoute>} />

                {/* Dean Routes */}
                <Route path="dean/dashboard" element={<ProtectedRoute roles={['DEAN', 'ADMIN']}><DeanDashboard /></ProtectedRoute>} />
                <Route path="dean/publish-results" element={<ProtectedRoute roles={['DEAN', 'ADMIN']}><PublishResultsDean /></ProtectedRoute>} />
                <Route path="dean/export-data" element={<ProtectedRoute roles={['DEAN', 'ADMIN']}><DeanExportData /></ProtectedRoute>} />
                {/* HOD Routes */}
                <Route path="hod/dashboard" element={<ProtectedRoute roles={['HOD', 'ADMIN']}><HODDashboard /></ProtectedRoute>} />
                <Route path="hod/assign-doctors" element={<ProtectedRoute roles={['HOD', 'ADMIN']}><AssignDoctorsHOD /></ProtectedRoute>} />
                <Route path="hod/grading-templates" element={<ProtectedRoute roles={['HOD', 'ADMIN']}><ManageGradingTemplatesHOD /></ProtectedRoute>} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
