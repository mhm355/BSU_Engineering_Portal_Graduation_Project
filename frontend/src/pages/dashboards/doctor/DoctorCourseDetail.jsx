import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Card, CardContent, Button, Tabs, Tab, Grid, Paper,
    CircularProgress, Alert, Chip, IconButton, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField, Dialog, DialogTitle,
    DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem,
    Checkbox, Avatar, Fade, Grow, Switch, Tooltip, LinearProgress
} from '@mui/material';
import { keyframes } from '@mui/system';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import GroupIcon from '@mui/icons-material/Group';
import GradingIcon from '@mui/icons-material/Grading';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DeleteIcon from '@mui/icons-material/Delete';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SaveIcon from '@mui/icons-material/Save';
import QuizIcon from '@mui/icons-material/Quiz';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

export default function DoctorCourseDetail() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [students, setStudents] = useState([]);
    const [lectures, setLectures] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Upload Dialog
    const [uploadOpen, setUploadOpen] = useState(false);
    const [uploadData, setUploadData] = useState({ title: '', description: '', file_type: 'PDF', file: null });
    const [uploading, setUploading] = useState(false);

    // Attendance state
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendance, setAttendance] = useState({});
    const [savingAttendance, setSavingAttendance] = useState(false);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [totalSessions, setTotalSessions] = useState(0);
    const [showSummary, setShowSummary] = useState(true);

    // Grades state
    const [grades, setGrades] = useState({});
    const [savingGrades, setSavingGrades] = useState(false);
    const [gradingTemplate, setGradingTemplate] = useState(null);

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    useEffect(() => {
        fetchCourseData();
    }, [courseId]);

    const fetchCourseData = async () => {
        setLoading(true);
        setError('');
        try {
            const courseRes = await axios.get(`/api/academic/course-offerings/${courseId}/`, config);
            setCourse(courseRes.data);

            // Fetch lectures (non-blocking)
            try {
                const lecturesRes = await axios.get(`/api/academic/lectures/?course_offering=${courseId}`, config);
                setLectures(Array.isArray(lecturesRes.data) ? lecturesRes.data : []);
            } catch (err) {
                console.log('Failed to load lectures');
                setLectures([]);
            }

            // Fetch quizzes (non-blocking)
            try {
                const quizzesRes = await axios.get(`/api/academic/quizzes/?course_offering=${courseId}`, config);
                setQuizzes(Array.isArray(quizzesRes.data) ? quizzesRes.data : []);
            } catch (err) {
                console.log('Failed to load quizzes');
                setQuizzes([]);
            }

            // Fetch students - use level_id or level field
            const levelId = courseRes.data.level_id || courseRes.data.level;
            if (levelId) {
                try {
                    let studentUrl = `/api/academic/students/?level=${levelId}`;
                    const specId = courseRes.data.specialization_id || courseRes.data.specialization;
                    if (specId) {
                        studentUrl += `&specialization=${specId}`;
                    }
                    const studentsRes = await axios.get(studentUrl, config);
                    const studentList = Array.isArray(studentsRes.data) ? studentsRes.data : [];
                    setStudents(studentList);

                    const initialAttendance = {};
                    const initialGrades = {};
                    studentList.forEach(s => {
                        initialAttendance[s.id] = true;
                        initialGrades[s.id] = { attendance: '', quizzes: '', coursework: '', midterm: '', final: '' };
                    });
                    setAttendance(initialAttendance);
                    setGrades(initialGrades);
                } catch (err) {
                    console.log('Failed to load students');
                    setStudents([]);
                }
            }

            // Fetch grading template (non-blocking)
            const templateId = courseRes.data.grading_template_id || courseRes.data.grading_template;
            if (templateId) {
                try {
                    const templateRes = await axios.get(`/api/academic/grading-templates/${templateId}/`, config);
                    setGradingTemplate(templateRes.data);
                    if (templateRes.data.attendance_slots) {
                        setTotalSessions(templateRes.data.attendance_slots);
                    }
                } catch (err) {
                    console.log('Failed to load grading template');
                }
            }

            // Fetch attendance records (non-blocking)
            try {
                const attendanceRes = await axios.get(`/api/academic/attendance/?course_offering=${courseId}`, config);
                setAttendanceRecords(Array.isArray(attendanceRes.data) ? attendanceRes.data : []);
            } catch (err) {
                console.log('Failed to load attendance records');
                setAttendanceRecords([]);
            }
        } catch (err) {
            console.error('Course fetch error:', err);
            setError('فشل في تحميل بيانات المقرر');
        } finally {
            setLoading(false);
        }
    };

    const handleUploadLecture = async () => {
        if (!uploadData.title || !uploadData.file) {
            setError('يرجى إدخال العنوان واختيار الملف');
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('course_offering', courseId);
            formData.append('title', uploadData.title);
            formData.append('description', uploadData.description);
            formData.append('file_type', uploadData.file_type);
            formData.append('file', uploadData.file);
            await axios.post('/api/academic/lectures/', formData, { ...config, headers: { ...config.headers, 'Content-Type': 'multipart/form-data' } });
            setSuccess('تم رفع المحاضرة بنجاح');
            setUploadOpen(false);
            setUploadData({ title: '', description: '', file_type: 'PDF', file: null });
            fetchCourseData();
        } catch (err) {
            setError(err.response?.data?.error || 'فشل في رفع المحاضرة');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteLecture = async (lectureId) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه المحاضرة?')) return;
        try {
            await axios.delete(`/api/academic/lectures/${lectureId}/`, config);
            setSuccess('تم حذف المحاضرة');
            fetchCourseData();
        } catch (err) {
            setError('فشل في حذف المحاضرة');
        }
    };

    const handleSaveAttendance = async () => {
        setSavingAttendance(true);
        try {
            const attendanceData = students.map(s => ({ student_id: s.id, course_offering_id: courseId, date: attendanceDate, status: attendance[s.id] ? 'PRESENT' : 'ABSENT' }));
            await axios.post('/api/academic/attendance/bulk/', attendanceData, config);
            setSuccess('تم حفظ الحضور بنجاح');
            // Refresh attendance records
            try {
                const attendanceRes = await axios.get(`/api/academic/attendance/?course_offering=${courseId}`, config);
                setAttendanceRecords(Array.isArray(attendanceRes.data) ? attendanceRes.data : []);
            } catch (err) { }
        } catch (err) {
            setError('فشل في حفظ الحضور');
        } finally {
            setSavingAttendance(false);
        }
    };

    // Calculate attendance count per student
    const getStudentAttendanceCount = (studentId) => {
        return attendanceRecords.filter(r => r.student === studentId && r.status === 'PRESENT').length;
    };

    const getStudentAttendanceDates = (studentId) => {
        return attendanceRecords.filter(r => r.student === studentId).length;
    };

    // Auto-assign attendance grades based on attendance percentage
    const handleAutoAssignAttendanceGrades = async () => {
        if (!gradingTemplate) {
            setError('لا يوجد قالب تقييم محدد للمادة');
            return;
        }
        const sessions = totalSessions || gradingTemplate.attendance_slots || 14;
        const attendanceWeight = gradingTemplate.attendance_weight || 10;

        setSavingGrades(true);
        try {
            const gradesData = students.map(s => {
                const presentCount = getStudentAttendanceCount(s.id);
                const attendanceGrade = Math.round((presentCount / sessions) * attendanceWeight * 10) / 10;
                return {
                    student_id: s.id,
                    course_offering_id: courseId,
                    attendance_grade: Math.min(attendanceGrade, attendanceWeight)
                };
            });
            await axios.post('/api/academic/student-grades/bulk/', gradesData, config);
            setSuccess('تم احتساب درجات الحضور تلقائياً وإضافتها للدرجات');
        } catch (err) {
            setError('فشل في احتساب درجات الحضور');
        } finally {
            setSavingGrades(false);
        }
    };

    const handleSaveGrades = async () => {
        setSavingGrades(true);
        try {
            const gradesData = students.map(s => ({ student_id: s.id, course_offering_id: courseId, attendance_grade: grades[s.id]?.attendance || null, quizzes_grade: grades[s.id]?.quizzes || null, coursework_grade: grades[s.id]?.coursework || null, midterm_grade: grades[s.id]?.midterm || null, final_grade: grades[s.id]?.final || null }));
            await axios.post('/api/academic/student-grades/bulk/', gradesData, config);
            setSuccess('تم حفظ الدرجات بنجاح');
        } catch (err) {
            setError('فشل في حفظ الدرجات');
        } finally {
            setSavingGrades(false);
        }
    };

    const handleGradeChange = (studentId, field, value) => {
        setGrades(prev => ({ ...prev, [studentId]: { ...prev[studentId], [field]: value } }));
    };

    const toggleQuizActive = async (quizId, isActive) => {
        try {
            await axios.patch(`/api/academic/quizzes/${quizId}/`, { is_active: isActive }, config);
            setSuccess(isActive ? 'تم تفعيل الكويز' : 'تم إيقاف الكويز');
            fetchCourseData();
        } catch (err) {
            setError('فشل في تحديث حالة الكويز');
        }
    };

    const getFileIcon = (type) => {
        switch (type) {
            case 'PDF': return <PictureAsPdfIcon sx={{ color: '#d32f2f' }} />;
            case 'SLIDES': return <SlideshowIcon sx={{ color: '#ff9800' }} />;
            case 'VIDEO': return <PlayCircleIcon sx={{ color: '#1976d2' }} />;
            default: return <InsertDriveFileIcon sx={{ color: '#666' }} />;
        }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress size={60} /></Box>;
    }

    const tabStyle = { fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1rem', py: 2 };

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', pb: 6 }}>
            {/* Hero Header */}
            <Box sx={{ background: 'linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)', pt: 4, pb: 6, mb: 4, position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', animation: `${float} 6s ease-in-out infinite` }} />
                <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', animation: `${float} 8s ease-in-out infinite`, animationDelay: '2s' }} />

                <Container maxWidth="xl">
                    <Fade in={true} timeout={800}>
                        <Box>
                            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/doctor/dashboard')} sx={{ color: '#fff', mb: 2, fontFamily: 'Cairo', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                                العودة للوحة التحكم
                            </Button>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Avatar sx={{ width: 90, height: 90, bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                                    <MenuBookIcon sx={{ fontSize: 50, color: '#fff' }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                        {course?.subject_name || 'المقرر'}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5, flexWrap: 'wrap' }}>
                                        <Chip label={course?.subject_code} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }} />
                                        <Chip icon={<SchoolIcon sx={{ color: '#fff !important' }} />} label={course?.department_name} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }} />
                                        <Chip label={course?.level_name} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }} />
                                        <Chip label={course?.term} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }} />
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Container maxWidth="xl">
                {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem' }} onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert icon={<CheckCircleIcon />} severity="success" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem' }} onClose={() => setSuccess('')}>{success}</Alert>}

                {/* Stats Row */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={6} sm={3}>
                        <Grow in={true} timeout={400}>
                            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 50, height: 50, background: 'linear-gradient(135deg, #2196F3, #64B5F6)' }}><VideoLibraryIcon /></Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{lectures.length}</Typography>
                                    <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>المحاضرات</Typography>
                                </Box>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Grow in={true} timeout={500}>
                            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 50, height: 50, background: 'linear-gradient(135deg, #4CAF50, #8BC34A)' }}><GroupIcon /></Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{students.length}</Typography>
                                    <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>الطلاب</Typography>
                                </Box>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Grow in={true} timeout={600}>
                            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 50, height: 50, background: 'linear-gradient(135deg, #9c27b0, #ba68c8)' }}><QuizIcon /></Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{quizzes.length}</Typography>
                                    <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>الكويزات</Typography>
                                </Box>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Grow in={true} timeout={700}>
                            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 50, height: 50, background: 'linear-gradient(135deg, #FF9800, #FFB74D)' }}><GradingIcon /></Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{gradingTemplate?.name?.substring(0, 8) || '-'}</Typography>
                                    <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>قالب التقييم</Typography>
                                </Box>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>

                {/* Tabs */}
                <Paper elevation={0} sx={{ mb: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth" sx={{ bgcolor: '#fafafa' }}>
                        <Tab icon={<VideoLibraryIcon />} label="المحاضرات" sx={tabStyle} />
                        <Tab icon={<GroupIcon />} label="الطلاب" sx={tabStyle} />
                        <Tab icon={<EventAvailableIcon />} label="الحضور" sx={tabStyle} />
                        <Tab icon={<GradingIcon />} label="الدرجات" sx={tabStyle} />
                        <Tab icon={<QuizIcon />} label="الكويزات" sx={{ ...tabStyle, color: '#9c27b0' }} />
                    </Tabs>
                </Paper>

                {/* Tab 0: Lectures */}
                {activeTab === 0 && (
                    <Grow in={true} timeout={400}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ width: 50, height: 50, background: 'linear-gradient(135deg, #2196F3, #64B5F6)' }}><VideoLibraryIcon /></Avatar>
                                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>المحاضرات ({lectures.length})</Typography>
                                </Box>
                                <Button variant="contained" size="large" startIcon={<UploadFileIcon />} onClick={() => setUploadOpen(true)} sx={{ fontFamily: 'Cairo', fontWeight: 'bold', borderRadius: 3, px: 4, background: 'linear-gradient(135deg, #2196F3, #64B5F6)' }}>رفع محاضرة</Button>
                            </Box>

                            {lectures.length > 0 ? (
                                <Grid container spacing={3}>
                                    {lectures.map((lecture, index) => (
                                        <Grid item xs={12} sm={6} md={4} key={lecture.id}>
                                            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.08)', '&:hover': { boxShadow: '0 8px 25px rgba(0,0,0,0.12)' } }}>
                                                <CardContent>
                                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                                                        <Avatar sx={{ bgcolor: '#f5f5f5' }}>{getFileIcon(lecture.file_type)}</Avatar>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{lecture.title}</Typography>
                                                            {lecture.description && <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Cairo' }}>{lecture.description}</Typography>}
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <Chip label={lecture.file_type} size="small" sx={{ fontWeight: 'bold' }} />
                                                        <Box>
                                                            <Button size="small" href={lecture.file} target="_blank" sx={{ fontFamily: 'Cairo' }}>عرض</Button>
                                                            <IconButton color="error" size="small" onClick={() => handleDeleteLecture(lecture.id)}><DeleteIcon /></IconButton>
                                                        </Box>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 8 }}>
                                    <VideoLibraryIcon sx={{ fontSize: 80, color: '#ddd', mb: 2 }} />
                                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', color: '#999' }}>لم يتم رفع أي محاضرات بعد</Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grow>
                )}

                {/* Tab 1: Students */}
                {activeTab === 1 && (
                    <Grow in={true} timeout={400}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                                <Avatar sx={{ width: 50, height: 50, background: 'linear-gradient(135deg, #4CAF50, #8BC34A)' }}><GroupIcon /></Avatar>
                                <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>قائمة الطلاب ({students.length})</Typography>
                            </Box>

                            {students.length > 0 ? (
                                <TableContainer sx={{ borderRadius: 3, border: '1px solid #eee' }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: '#4CAF50' }}>
                                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>#</TableCell>
                                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>الاسم</TableCell>
                                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>الرقم الجامعي</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {students.map((student, idx) => (
                                                <TableRow key={student.id} hover sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                                                    <TableCell><Avatar sx={{ width: 32, height: 32, bgcolor: '#4CAF50', fontSize: 14 }}>{idx + 1}</Avatar></TableCell>
                                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{student.full_name}</TableCell>
                                                    <TableCell sx={{ fontFamily: 'monospace' }}>{student.university_id || student.national_id}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 8 }}>
                                    <GroupIcon sx={{ fontSize: 80, color: '#ddd', mb: 2 }} />
                                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', color: '#999' }}>لا يوجد طلاب مسجلين</Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grow>
                )}

                {/* Tab 2: Attendance */}
                {activeTab === 2 && (
                    <Grow in={true} timeout={400}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                            {/* Header */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ width: 50, height: 50, background: 'linear-gradient(135deg, #FF9800, #FFB74D)' }}><EventAvailableIcon /></Avatar>
                                    <Box>
                                        <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>نظام الحضور</Typography>
                                        <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                            إجمالي المحاضرات: {totalSessions || gradingTemplate?.attendance_slots || 14} | الحضور المسجل: {new Set(attendanceRecords.map(r => r.date)).size} يوم
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        variant={showSummary ? "contained" : "outlined"}
                                        size="small"
                                        onClick={() => setShowSummary(true)}
                                        sx={{ fontFamily: 'Cairo', borderRadius: 2 }}
                                    >
                                        ملخص الحضور
                                    </Button>
                                    <Button
                                        variant={!showSummary ? "contained" : "outlined"}
                                        size="small"
                                        onClick={() => setShowSummary(false)}
                                        sx={{ fontFamily: 'Cairo', borderRadius: 2 }}
                                    >
                                        تسجيل حضور
                                    </Button>
                                </Box>
                            </Box>

                            {/* Summary View */}
                            {showSummary && (
                                <Box>
                                    {/* Auto-assign grades button */}
                                    <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            size="large"
                                            startIcon={savingGrades ? <CircularProgress size={20} color="inherit" /> : <GradingIcon />}
                                            onClick={handleAutoAssignAttendanceGrades}
                                            disabled={savingGrades || students.length === 0 || !gradingTemplate}
                                            sx={{ fontFamily: 'Cairo', fontWeight: 'bold', borderRadius: 3, px: 3 }}
                                        >
                                            احتساب درجات الحضور تلقائياً
                                        </Button>
                                        {gradingTemplate && (
                                            <Chip
                                                label={`وزن الحضور: ${gradingTemplate.attendance_weight || 10}%`}
                                                color="info"
                                                sx={{ fontFamily: 'Cairo' }}
                                            />
                                        )}
                                    </Box>

                                    {/* Student Attendance Cards */}
                                    {students.length > 0 ? (
                                        <Grid container spacing={2}>
                                            {students.map((student, idx) => {
                                                const presentCount = getStudentAttendanceCount(student.id);
                                                const sessions = totalSessions || gradingTemplate?.attendance_slots || 14;
                                                const percentage = Math.round((presentCount / sessions) * 100);
                                                const attendanceWeight = gradingTemplate?.attendance_weight || 10;
                                                const calculatedGrade = Math.min(Math.round((presentCount / sessions) * attendanceWeight * 10) / 10, attendanceWeight);

                                                return (
                                                    <Grid item xs={12} sm={6} md={4} lg={3} key={student.id}>
                                                        <Card sx={{
                                                            borderRadius: 3,
                                                            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                                                            border: percentage >= 75 ? '2px solid #4CAF50' : percentage >= 50 ? '2px solid #FF9800' : '2px solid #f44336',
                                                            transition: 'transform 0.2s',
                                                            '&:hover': { transform: 'translateY(-4px)' }
                                                        }}>
                                                            <CardContent>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                                                    <Avatar sx={{
                                                                        width: 40, height: 40,
                                                                        bgcolor: percentage >= 75 ? '#4CAF50' : percentage >= 50 ? '#FF9800' : '#f44336',
                                                                        fontSize: 16, fontWeight: 'bold'
                                                                    }}>
                                                                        {idx + 1}
                                                                    </Avatar>
                                                                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                                                        <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                            {student.full_name}
                                                                        </Typography>
                                                                        <Typography variant="caption" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                                                            {student.university_id || student.national_id}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>

                                                                {/* Attendance Stats */}
                                                                <Box sx={{ mb: 2 }}>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                                        <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>الحضور</Typography>
                                                                        <Typography variant="body2" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: percentage >= 75 ? '#4CAF50' : percentage >= 50 ? '#FF9800' : '#f44336' }}>
                                                                            {presentCount} / {sessions}
                                                                        </Typography>
                                                                    </Box>
                                                                    <LinearProgress
                                                                        variant="determinate"
                                                                        value={Math.min(percentage, 100)}
                                                                        sx={{
                                                                            height: 8,
                                                                            borderRadius: 4,
                                                                            bgcolor: '#e0e0e0',
                                                                            '& .MuiLinearProgress-bar': {
                                                                                bgcolor: percentage >= 75 ? '#4CAF50' : percentage >= 50 ? '#FF9800' : '#f44336',
                                                                                borderRadius: 4
                                                                            }
                                                                        }}
                                                                    />
                                                                </Box>

                                                                {/* Grade Calculation */}
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f5f5f5', p: 1.5, borderRadius: 2 }}>
                                                                    <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                                                        درجة الحضور المحتسبة
                                                                    </Typography>
                                                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                                                        {calculatedGrade} / {attendanceWeight}
                                                                    </Typography>
                                                                </Box>
                                                            </CardContent>
                                                        </Card>
                                                    </Grid>
                                                );
                                            })}
                                        </Grid>
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 8 }}>
                                            <EventAvailableIcon sx={{ fontSize: 80, color: '#ddd', mb: 2 }} />
                                            <Typography variant="h5" sx={{ fontFamily: 'Cairo', color: '#999' }}>لا يوجد طلاب</Typography>
                                        </Box>
                                    )}
                                </Box>
                            )}

                            {/* Record Attendance View */}
                            {!showSummary && (
                                <Box>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
                                        <TextField type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                                        <Button variant="contained" size="large" startIcon={savingAttendance ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />} onClick={handleSaveAttendance} disabled={savingAttendance || students.length === 0} sx={{ fontFamily: 'Cairo', fontWeight: 'bold', borderRadius: 3, px: 4, background: 'linear-gradient(135deg, #FF9800, #FFB74D)' }}>حفظ الحضور</Button>
                                    </Box>

                                    {students.length > 0 ? (
                                        <TableContainer sx={{ borderRadius: 3, border: '1px solid #eee' }}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow sx={{ bgcolor: '#FF9800' }}>
                                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>#</TableCell>
                                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>الاسم</TableCell>
                                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>الرقم</TableCell>
                                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>الحضور الكلي</TableCell>
                                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>حاضر اليوم</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {students.map((student, idx) => {
                                                        const presentCount = getStudentAttendanceCount(student.id);
                                                        const sessions = totalSessions || gradingTemplate?.attendance_slots || 14;
                                                        return (
                                                            <TableRow key={student.id} hover>
                                                                <TableCell>{idx + 1}</TableCell>
                                                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{student.full_name}</TableCell>
                                                                <TableCell>{student.university_id || student.national_id}</TableCell>
                                                                <TableCell sx={{ textAlign: 'center' }}>
                                                                    <Chip
                                                                        label={`${presentCount} / ${sessions}`}
                                                                        size="small"
                                                                        color={presentCount >= sessions * 0.75 ? 'success' : presentCount >= sessions * 0.5 ? 'warning' : 'error'}
                                                                        sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell sx={{ textAlign: 'center' }}>
                                                                    <Checkbox checked={attendance[student.id] || false} onChange={(e) => setAttendance({ ...attendance, [student.id]: e.target.checked })} color="success" sx={{ transform: 'scale(1.3)' }} />
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 8 }}>
                                            <EventAvailableIcon sx={{ fontSize: 80, color: '#ddd', mb: 2 }} />
                                            <Typography variant="h5" sx={{ fontFamily: 'Cairo', color: '#999' }}>لا يوجد طلاب</Typography>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Paper>
                    </Grow>
                )}

                {/* Tab 3: Grades */}
                {activeTab === 3 && (
                    <Grow in={true} timeout={400}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ width: 50, height: 50, background: 'linear-gradient(135deg, #d32f2f, #ef5350)' }}><GradingIcon /></Avatar>
                                    <Box>
                                        <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>رصد الدرجات</Typography>
                                        {gradingTemplate && <Chip label={`قالب: ${gradingTemplate.name}`} size="small" sx={{ mt: 0.5 }} />}
                                    </Box>
                                </Box>
                                <Button variant="contained" size="large" startIcon={savingGrades ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />} onClick={handleSaveGrades} disabled={savingGrades || students.length === 0} sx={{ fontFamily: 'Cairo', fontWeight: 'bold', borderRadius: 3, px: 4, background: 'linear-gradient(135deg, #d32f2f, #ef5350)' }}>حفظ الدرجات</Button>
                            </Box>

                            {students.length > 0 ? (
                                <TableContainer sx={{ borderRadius: 3, border: '1px solid #eee', overflowX: 'auto' }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: '#d32f2f' }}>
                                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', minWidth: 180 }}>الطالب</TableCell>
                                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>الحضور<br /><small>({gradingTemplate?.attendance_weight || 10}%)</small></TableCell>
                                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>الكويزات<br /><small>({gradingTemplate?.quizzes_weight || 10}%)</small></TableCell>
                                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>أعمال السنة<br /><small>({gradingTemplate?.coursework_weight || 10}%)</small></TableCell>
                                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>منتصف الترم<br /><small>({gradingTemplate?.midterm_weight || 20}%)</small></TableCell>
                                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>النهائي<br /><small>({gradingTemplate?.final_weight || 50}%)</small></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {students.map((student) => (
                                                <TableRow key={student.id} hover>
                                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{student.full_name}</TableCell>
                                                    {['attendance', 'quizzes', 'coursework', 'midterm', 'final'].map(field => (
                                                        <TableCell key={field} sx={{ textAlign: 'center' }}>
                                                            <TextField type="number" size="small" value={grades[student.id]?.[field] || ''} onChange={(e) => handleGradeChange(student.id, field, e.target.value)} sx={{ width: 80, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 8 }}>
                                    <GradingIcon sx={{ fontSize: 80, color: '#ddd', mb: 2 }} />
                                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', color: '#999' }}>لا يوجد طلاب</Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grow>
                )}

                {/* Tab 4: Quizzes */}
                {activeTab === 4 && (
                    <Grow in={true} timeout={400}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ width: 50, height: 50, background: 'linear-gradient(135deg, #9c27b0, #ba68c8)' }}><QuizIcon /></Avatar>
                                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>الكويزات ({quizzes.length})</Typography>
                                </Box>
                                <Button variant="contained" size="large" startIcon={<AddIcon />} onClick={() => navigate(`/doctor/courses/${courseId}/quiz`)} sx={{ fontFamily: 'Cairo', fontWeight: 'bold', borderRadius: 3, px: 4, background: 'linear-gradient(135deg, #9c27b0, #ba68c8)' }}>إنشاء كويز</Button>
                            </Box>

                            {quizzes.length > 0 ? (
                                <Grid container spacing={3}>
                                    {quizzes.map((quiz) => (
                                        <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                                            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.08)', border: quiz.is_active ? '2px solid #4CAF50' : '2px solid #ccc' }}>
                                                <CardContent>
                                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                                                        <Box>
                                                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{quiz.title}</Typography>
                                                            {quiz.description && <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Cairo' }}>{quiz.description}</Typography>}
                                                        </Box>
                                                        <Switch checked={quiz.is_active} onChange={(e) => toggleQuizActive(quiz.id, e.target.checked)} color="success" />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                                        <Chip icon={<QuizIcon />} label={quiz.quiz_type} size="small" />
                                                        <Chip label={`${quiz.total_points} درجة`} size="small" color="primary" />
                                                        {quiz.time_limit_minutes && <Chip icon={<AccessTimeIcon />} label={`${quiz.time_limit_minutes} دقيقة`} size="small" />}
                                                        <Chip label={quiz.is_active ? 'مفعل' : 'موقف'} size="small" color={quiz.is_active ? 'success' : 'default'} />
                                                    </Box>
                                                    <Button fullWidth variant="outlined" startIcon={<VisibilityIcon />} onClick={() => navigate(`/doctor/courses/${courseId}/quiz/${quiz.id}/results`)} sx={{ fontFamily: 'Cairo', borderRadius: 2 }}>عرض النتائج</Button>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 8 }}>
                                    <QuizIcon sx={{ fontSize: 80, color: '#ddd', mb: 2 }} />
                                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', color: '#999', mb: 2 }}>لا توجد كويزات بعد</Typography>
                                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate(`/doctor/courses/${courseId}/quiz`)} sx={{ fontFamily: 'Cairo', fontWeight: 'bold', borderRadius: 3, background: 'linear-gradient(135deg, #9c27b0, #ba68c8)' }}>إنشاء أول كويز</Button>
                                </Box>
                            )}
                        </Paper>
                    </Grow>
                )}
            </Container>

            {/* Upload Dialog */}
            <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontFamily: 'Cairo', fontWeight: 'bold', bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#1976d2' }}><UploadFileIcon /></Avatar>
                    رفع محاضرة جديدة
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                        <TextField label="عنوان المحاضرة" value={uploadData.title} onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })} fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                        <TextField label="الوصف (اختياري)" value={uploadData.description} onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })} fullWidth multiline rows={2} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                        <FormControl fullWidth>
                            <InputLabel>نوع الملف</InputLabel>
                            <Select value={uploadData.file_type} onChange={(e) => setUploadData({ ...uploadData, file_type: e.target.value })} label="نوع الملف" sx={{ borderRadius: 2 }}>
                                <MenuItem value="PDF">PDF</MenuItem>
                                <MenuItem value="SLIDES">عرض تقديمي</MenuItem>
                                <MenuItem value="VIDEO">فيديو</MenuItem>
                                <MenuItem value="OTHER">ملف آخر</MenuItem>
                            </Select>
                        </FormControl>
                        <Button variant="outlined" component="label" startIcon={<UploadFileIcon />} sx={{ py: 2, borderRadius: 2, borderStyle: 'dashed' }}>
                            {uploadData.file ? uploadData.file.name : 'اختر ملف'}
                            <input type="file" hidden onChange={(e) => setUploadData({ ...uploadData, file: e.target.files[0] })} />
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setUploadOpen(false)} sx={{ fontFamily: 'Cairo', borderRadius: 2, px: 4 }}>إلغاء</Button>
                    <Button variant="contained" onClick={handleUploadLecture} disabled={uploading} sx={{ fontFamily: 'Cairo', fontWeight: 'bold', borderRadius: 2, px: 4, background: 'linear-gradient(135deg, #1976d2, #42a5f5)' }}>
                        {uploading ? <CircularProgress size={24} /> : 'رفع'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
