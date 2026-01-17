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
import ManageNews from './pages/dashboards/admin/ManageNews';
import Contact from './pages/Contact';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import ManageDepartments from './pages/dashboards/admin/ManageDepartments';
import ManageUsers from './pages/dashboards/admin/ManageUsers';
import StudentGrades from './pages/dashboards/student/StudentGrades';
import StudentAttendance from './pages/dashboards/student/StudentAttendance';
import StudentMaterials from './pages/dashboards/student/StudentMaterials';
import StudentExams from './pages/dashboards/student/StudentExams';
import StudentQuizzes from './pages/dashboards/student/StudentQuizzes';
import TakeQuiz from './pages/dashboards/student/TakeQuiz';
import DoctorCourses from './pages/dashboards/doctor/DoctorCourses';
import StudentAffairsDashboard from './pages/dashboards/StudentAffairsDashboard';
import HierarchyView from './pages/dashboards/student_affairs/HierarchyView';
import UploadStudents from './pages/dashboards/student_affairs/UploadStudents';
import UploadCertificates from './pages/dashboards/student_affairs/UploadCertificates';
import ManageStaffNews from './pages/dashboards/student_affairs/ManageStaffNews';
import UploadExamGrades from './pages/dashboards/student_affairs/UploadExamGrades';
import StudentGradesView from './pages/dashboards/student_affairs/StudentGradesView';
import DoctorCourseManager from './pages/dashboards/doctor/DoctorCourseManager';
import DoctorCourseDetail from './pages/dashboards/doctor/DoctorCourseDetail';
import UploadGrades from './pages/dashboards/doctor/UploadGrades';
import CreateQuiz from './pages/dashboards/doctor/CreateQuiz';
import ApprovalCenter from './pages/dashboards/admin/ApprovalCenter';
import PendingApprovals from './pages/dashboards/admin/PendingApprovals';
import AdminAcademicStructure from './pages/dashboards/admin/AdminAcademicStructure';
import ManageYears from './pages/dashboards/admin/ManageYears';
import ManageLevels from './pages/dashboards/admin/ManageLevels';
import UserProfile from './pages/UserProfile';

import StaffAffairsDashboard from './pages/dashboards/StaffAffairsDashboard';
import UploadDoctors from './pages/dashboards/staff_affairs/UploadDoctors';
import UploadStaffAffairs from './pages/dashboards/staff_affairs/UploadStaffAffairs';
import AssignDoctors from './pages/dashboards/staff_affairs/AssignDoctors';
import ViewUsers from './pages/dashboards/staff_affairs/ViewUsers';
import StaffAcademicStructure from './pages/dashboards/staff_affairs/AcademicStructure';
import ManageDoctors from './pages/dashboards/staff_affairs/ManageDoctors';
import DeletionRequests from './pages/dashboards/admin/DeletionRequests';

import ManageAcademicYears from './pages/dashboards/admin/ManageAcademicYears';
import ManageGradingTemplates from './pages/dashboards/admin/ManageGradingTemplates';

import { AuthProvider } from './context/AuthContext';
import axios from 'axios';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/staff" element={<StaffDirectory />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<Login />} />

            {/* Content Pages */}
            <Route path="about" element={<AboutPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/dean-word" element={<DeanWordPage />} />
            <Route path="/vision-mission" element={<VisionMissionPage />} />
            <Route path="/regulations" element={<RegulationsPage />} />
            <Route path="/ethics" element={<EthicsPage />} />

            {/* Department Pages */}
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="departments" element={<DepartmentsPage />} />
            <Route path="/departments/civil" element={<CivilDepartmentPage />} />
            <Route path="/departments/arch" element={<ArchDepartmentPage />} />
            <Route path="/departments/electrical" element={<ElectricalDepartmentPage />} />

            {/* Protected Dashboard Routes */}
            <Route path="student/dashboard" element={<StudentDashboard />} />
            <Route path="student/grades" element={<StudentGrades />} />
            <Route path="student/attendance" element={<StudentAttendance />} />
            <Route path="student/materials" element={<StudentMaterials />} />
            <Route path="student/exams" element={<StudentExams />} />
            <Route path="student/quizzes" element={<StudentQuizzes />} />
            <Route path="student/quiz/:quizId" element={<TakeQuiz />} />
            <Route path="profile" element={<UserProfile />} />

            {/* Doctor Routes */}
            <Route path="doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="doctor/courses" element={<DoctorCourses />} />
            <Route path="doctor/courses/:courseId" element={<DoctorCourseDetail />} />
            <Route path="doctor/courses/:courseId/manage" element={<DoctorCourseManager />} />
            <Route path="doctor/courses/:courseId/upload-grades" element={<UploadGrades />} />
            <Route path="doctor/courses/:courseId/quiz" element={<CreateQuiz />} />

            {/* Student Affairs Routes */}
            <Route path="staff/dashboard" element={<StudentAffairsDashboard />} />
            <Route path="student-affairs/dashboard" element={<StudentAffairsDashboard />} />
            <Route path="student-affairs/hierarchy" element={<HierarchyView />} />
            <Route path="student-affairs/upload-students" element={<UploadStudents />} />
            <Route path="student-affairs/certificates" element={<UploadCertificates />} />
            <Route path="student-affairs/news" element={<ManageStaffNews />} />
            <Route path="student-affairs/exam-grades" element={<UploadExamGrades />} />
            <Route path="student-affairs/grades" element={<StudentGradesView />} />

            {/* Staff Affairs Routes (NEW) */}
            <Route path="staff-affairs" element={<StaffAffairsDashboard />} />
            <Route path="staff-affairs/dashboard" element={<StaffAffairsDashboard />} />
            <Route path="staff-affairs/upload-doctors" element={<UploadDoctors />} />
            <Route path="staff-affairs/upload-staff" element={<UploadStaffAffairs />} />
            <Route path="staff-affairs/assign-doctors" element={<AssignDoctors />} />
            <Route path="staff-affairs/view-users" element={<ViewUsers />} />
            <Route path="staff-affairs/academic-structure" element={<StaffAcademicStructure />} />
            <Route path="staff-affairs/manage-doctors" element={<ManageDoctors />} />

            {/* Admin Routes */}
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/academic-years" element={<ManageAcademicYears />} />
            <Route path="admin/grading-templates" element={<ManageGradingTemplates />} />
            <Route path="admin/departments" element={<ManageDepartments />} />
            <Route path="admin/years" element={<ManageYears />} />
            <Route path="admin/levels" element={<ManageLevels />} />
            <Route path="admin/users" element={<ManageUsers />} />
            <Route path="admin/academic-structure" element={<AdminAcademicStructure />} />
            <Route path="admin/approvals" element={<ApprovalCenter />} />
            <Route path="admin/pending-approvals" element={<PendingApprovals />} />
            <Route path="admin/news" element={<ManageNews />} />
            <Route path="admin/deletion-requests" element={<DeletionRequests />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
