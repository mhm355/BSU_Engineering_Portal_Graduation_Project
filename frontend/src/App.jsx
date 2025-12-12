import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import About from './pages/About';
import StaffDirectory from './pages/public/StaffDirectory';
import Departments from './pages/public/Departments';
import ManageNews from './pages/dashboards/admin/ManageNews';
import Contact from './pages/Contact';
import Login from './pages/Login';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import ManageDepartments from './pages/dashboards/admin/ManageDepartments';
import ManageCourses from './pages/dashboards/admin/ManageCourses';
import ManageUsers from './pages/dashboards/admin/ManageUsers';
import StudentGrades from './pages/dashboards/student/StudentGrades';
import StudentAttendance from './pages/dashboards/student/StudentAttendance';
import StudentMaterials from './pages/dashboards/student/StudentMaterials';
import StudentExams from './pages/dashboards/student/StudentExams';
import DoctorCourses from './pages/dashboards/doctor/DoctorCourses';
import StudentAffairsDashboard from './pages/dashboards/StudentAffairsDashboard';
import HierarchyView from './pages/dashboards/student_affairs/HierarchyView';
import UploadStudents from './pages/dashboards/student_affairs/UploadStudents';
import UploadCertificates from './pages/dashboards/student_affairs/UploadCertificates';
import DoctorCourseManager from './pages/dashboards/doctor/DoctorCourseManager';
import UploadGrades from './pages/dashboards/doctor/UploadGrades';
import ApprovalCenter from './pages/dashboards/admin/ApprovalCenter';
import ManageYears from './pages/dashboards/admin/ManageYears';
import ManageLevels from './pages/dashboards/admin/ManageLevels';
import CourseAssignment from './pages/dashboards/admin/CourseAssignment';
import UserProfile from './pages/UserProfile';

import { AuthProvider } from './context/AuthContext';
import axios from 'axios';

// Configure Axios defaults
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/staff" element={<StaffDirectory />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="departments" element={<Departments />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<Login />} />
            <Route path="about" element={<About />} /> {/* Kept existing route not in instruction */}

            {/* Protected Dashboard Routes */}
            <Route path="student/dashboard" element={<StudentDashboard />} />
            <Route path="student/grades" element={<StudentGrades />} />
            <Route path="student/attendance" element={<StudentAttendance />} />
            <Route path="student/materials" element={<StudentMaterials />} />
            <Route path="student/exams" element={<StudentExams />} />
            <Route path="profile" element={<UserProfile />} />

            {/* Doctor Routes */}
            <Route path="doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="doctor/courses" element={<DoctorCourses />} />
            <Route path="doctor/courses/:courseId" element={<DoctorCourseManager />} />
            <Route path="doctor/courses/:courseId/upload-grades" element={<UploadGrades />} />
            <Route path="staff/dashboard" element={<StudentAffairsDashboard />} /> {/* Keep old route for backward compat or redirect? Let's use new one */}
            <Route path="student-affairs/dashboard" element={<StudentAffairsDashboard />} />
            <Route path="student-affairs/hierarchy" element={<HierarchyView />} />
            <Route path="student-affairs/upload-students" element={<UploadStudents />} />
            <Route path="student-affairs/certificates" element={<UploadCertificates />} />
            <Route path="admin/dashboard" element={<AdminDashboard />} />

            {/* Admin Routes */}
            <Route path="admin/departments" element={<ManageDepartments />} />
            <Route path="admin/years" element={<ManageYears />} />
            <Route path="admin/levels" element={<ManageLevels />} />
            <Route path="admin/courses" element={<ManageCourses />} />
            <Route path="admin/users" element={<ManageUsers />} />
            <Route path="admin/approvals" element={<ApprovalCenter />} />
            <Route path="admin/course-assignment" element={<CourseAssignment />} />
            <Route path="admin/news" element={<ManageNews />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
