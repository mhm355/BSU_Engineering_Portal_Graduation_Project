import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Card, CardContent, Button, Tabs, Tab,
    CircularProgress, Alert, Chip, IconButton, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, TextField, Dialog, DialogTitle,
    DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem,
    Checkbox, Snackbar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import GroupIcon from '@mui/icons-material/Group';
import GradingIcon from '@mui/icons-material/Grading';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DeleteIcon from '@mui/icons-material/Delete';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function DoctorCourseDetail() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [students, setStudents] = useState([]);
    const [lectures, setLectures] = useState([]);
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
        try {
            // Fetch course details
            const courseRes = await axios.get(`/api/academic/course-offerings/${courseId}/`, config);
            setCourse(courseRes.data);

            // Fetch lectures for this course
            const lecturesRes = await axios.get(`/api/academic/lectures/?course_offering=${courseId}`, config);
            setLectures(lecturesRes.data);

            // Fetch students for this course offering (using Doctor-accessible endpoint)
            const studentsRes = await axios.get(
                `/api/academic/course-offerings/${courseId}/students/`,
                config
            );
            if (studentsRes.data) {
                setStudents(studentsRes.data);

                // Initialize attendance and grades
                const initialAttendance = {};
                const initialGrades = {};
                studentsRes.data.forEach(s => {
                    initialAttendance[s.id] = true; // Default present
                    initialGrades[s.id] = {
                        attendance: '',
                        quizzes: '',
                        coursework: '',
                        midterm: '',
                        final: ''
                    };
                });
                setAttendance(initialAttendance);
                setGrades(initialGrades);
            }

            // Fetch grading template if available
            if (courseRes.data.grading_template_id) {
                try {
                    const templateRes = await axios.get(
                        `/api/academic/grading-templates/${courseRes.data.grading_template_id}/`,
                        config
                    );
                    setGradingTemplate(templateRes.data);
                } catch (err) {
                    console.log('No grading template');
                }
            }
        } catch (err) {
            console.error(err);
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

            await axios.post('/api/academic/lectures/', formData, {
                ...config,
                headers: { ...config.headers, 'Content-Type': 'multipart/form-data' }
            });

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
            const attendanceData = students.map(s => ({
                student_id: s.id,
                course_offering_id: courseId,
                date: attendanceDate,
                status: attendance[s.id] ? 'PRESENT' : 'ABSENT'
            }));

            await axios.post('/api/academic/attendance/bulk/', attendanceData, config);
            setSuccess('تم حفظ الحضور بنجاح');
        } catch (err) {
            setError('فشل في حفظ الحضور');
        } finally {
            setSavingAttendance(false);
        }
    };

    const handleSaveGrades = async () => {
        setSavingGrades(true);
        try {
            const gradesData = students.map(s => ({
                student_id: s.id,
                course_offering_id: courseId,
                attendance_grade: grades[s.id]?.attendance || null,
                quizzes_grade: grades[s.id]?.quizzes || null,
                coursework_grade: grades[s.id]?.coursework || null,
                midterm_grade: grades[s.id]?.midterm || null,
                final_grade: grades[s.id]?.final || null
            }));

            await axios.post('/api/academic/student-grades/bulk/', gradesData, config);
            setSuccess('تم حفظ الدرجات بنجاح');
        } catch (err) {
            setError('فشل في حفظ الدرجات');
        } finally {
            setSavingGrades(false);
        }
    };

    const handleGradeChange = (studentId, field, value) => {
        setGrades(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value
            }
        }));
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <IconButton onClick={() => navigate('/doctor/dashboard')}>
                    <ArrowBackIcon />
                </IconButton>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                        {course?.subject_name || 'المقرر'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip label={course?.subject_code} size="small" />
                        <Chip label={course?.department_name} size="small" color="primary" variant="outlined" />
                        <Chip label={course?.level_name} size="small" color="secondary" variant="outlined" />
                        <Chip label={course?.term} size="small" />
                    </Box>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth">
                    <Tab icon={<VideoLibraryIcon />} label="المحاضرات" sx={{ fontFamily: 'Cairo' }} />
                    <Tab icon={<GroupIcon />} label="الطلاب" sx={{ fontFamily: 'Cairo' }} />
                    <Tab icon={<EventAvailableIcon />} label="الحضور" sx={{ fontFamily: 'Cairo' }} />
                    <Tab icon={<GradingIcon />} label="الدرجات" sx={{ fontFamily: 'Cairo' }} />
                </Tabs>
            </Paper>

            {/* Tab 0: Lectures */}
            {activeTab === 0 && (
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                المحاضرات ({lectures.length})
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<UploadFileIcon />}
                                onClick={() => setUploadOpen(true)}
                                sx={{ fontFamily: 'Cairo' }}
                            >
                                رفع محاضرة
                            </Button>
                        </Box>

                        {lectures.length > 0 ? (
                            <TableContainer>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>العنوان</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>النوع</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>تاريخ الرفع</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>إجراءات</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {lectures.map((lecture) => (
                                            <TableRow key={lecture.id}>
                                                <TableCell sx={{ fontFamily: 'Cairo' }}>
                                                    <Box>
                                                        <Typography fontWeight="bold">{lecture.title}</Typography>
                                                        {lecture.description && (
                                                            <Typography variant="body2" color="textSecondary">
                                                                {lecture.description}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={lecture.file_type} size="small" color={lecture.file_type === 'VIDEO' ? 'primary' : 'default'} />
                                                </TableCell>
                                                <TableCell>{new Date(lecture.uploaded_at).toLocaleDateString('ar-EG')}</TableCell>
                                                <TableCell>
                                                    <Button size="small" href={lecture.file} target="_blank" sx={{ fontFamily: 'Cairo' }}>عرض</Button>
                                                    <IconButton color="error" size="small" onClick={() => handleDeleteLecture(lecture.id)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#fafafa' }}>
                                <VideoLibraryIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                                <Typography sx={{ fontFamily: 'Cairo', color: '#999' }}>لم يتم رفع أي محاضرات بعد</Typography>
                            </Paper>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Tab 1: Students */}
            {activeTab === 1 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 3 }}>
                            قائمة الطلاب ({students.length})
                        </Typography>

                        {students.length > 0 ? (
                            <TableContainer>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>#</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الاسم</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الرقم الجامعي</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {students.map((student, idx) => (
                                            <TableRow key={student.id}>
                                                <TableCell>{idx + 1}</TableCell>
                                                <TableCell sx={{ fontFamily: 'Cairo' }}>{student.first_name} {student.last_name}</TableCell>
                                                <TableCell>{student.university_id || student.national_id}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#fafafa' }}>
                                <GroupIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                                <Typography sx={{ fontFamily: 'Cairo', color: '#999' }}>لا يوجد طلاب مسجلين في هذا المستوى</Typography>
                            </Paper>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Tab 2: Attendance */}
            {activeTab === 2 && (
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                تسجيل الحضور
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <TextField
                                    type="date"
                                    label="التاريخ"
                                    value={attendanceDate}
                                    onChange={(e) => setAttendanceDate(e.target.value)}
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                />
                                <Button
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    onClick={handleSaveAttendance}
                                    disabled={savingAttendance || students.length === 0}
                                    sx={{ fontFamily: 'Cairo' }}
                                >
                                    {savingAttendance ? <CircularProgress size={24} /> : 'حفظ الحضور'}
                                </Button>
                            </Box>
                        </Box>

                        {students.length > 0 ? (
                            <TableContainer>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>#</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الاسم</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الرقم الجامعي</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center' }}>حاضر</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {students.map((student, idx) => (
                                            <TableRow key={student.id}>
                                                <TableCell>{idx + 1}</TableCell>
                                                <TableCell sx={{ fontFamily: 'Cairo' }}>{student.first_name} {student.last_name}</TableCell>
                                                <TableCell>{student.university_id || student.national_id}</TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <Checkbox
                                                        checked={attendance[student.id] || false}
                                                        onChange={(e) => setAttendance({ ...attendance, [student.id]: e.target.checked })}
                                                        color="success"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#fafafa' }}>
                                <EventAvailableIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                                <Typography sx={{ fontFamily: 'Cairo', color: '#999' }}>لا يوجد طلاب لتسجيل الحضور</Typography>
                            </Paper>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Tab 3: Grades */}
            {activeTab === 3 && (
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Box>
                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                    رصد الدرجات
                                </Typography>
                                {gradingTemplate && (
                                    <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Cairo' }}>
                                        قالب التقييم: {gradingTemplate.name}
                                    </Typography>
                                )}
                            </Box>
                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={handleSaveGrades}
                                disabled={savingGrades || students.length === 0}
                                sx={{ fontFamily: 'Cairo' }}
                            >
                                {savingGrades ? <CircularProgress size={24} /> : 'حفظ الدرجات'}
                            </Button>
                        </Box>

                        {students.length > 0 ? (
                            <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                                <Table size="small">
                                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', minWidth: 150 }}>الطالب</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center' }}>
                                                الحضور
                                                {gradingTemplate && <br />}
                                                {gradingTemplate && <small>({gradingTemplate.attendance_weight}%)</small>}
                                            </TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center' }}>
                                                الكويزات
                                                {gradingTemplate && <br />}
                                                {gradingTemplate && <small>({gradingTemplate.quizzes_weight}%)</small>}
                                            </TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center' }}>
                                                أعمال السنة
                                                {gradingTemplate && <br />}
                                                {gradingTemplate && <small>({gradingTemplate.coursework_weight}%)</small>}
                                            </TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center' }}>
                                                منتصف الترم
                                                {gradingTemplate && <br />}
                                                {gradingTemplate && <small>({gradingTemplate.midterm_weight}%)</small>}
                                            </TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center' }}>
                                                النهائي
                                                {gradingTemplate && <br />}
                                                {gradingTemplate && <small>({gradingTemplate.final_weight}%)</small>}
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {students.map((student) => (
                                            <TableRow key={student.id}>
                                                <TableCell sx={{ fontFamily: 'Cairo' }}>
                                                    {student.first_name} {student.last_name}
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        value={grades[student.id]?.attendance || ''}
                                                        onChange={(e) => handleGradeChange(student.id, 'attendance', e.target.value)}
                                                        inputProps={{ min: 0, max: gradingTemplate?.attendance_weight || 10 }}
                                                        sx={{ width: 70 }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        value={grades[student.id]?.quizzes || ''}
                                                        onChange={(e) => handleGradeChange(student.id, 'quizzes', e.target.value)}
                                                        inputProps={{ min: 0, max: gradingTemplate?.quizzes_weight || 10 }}
                                                        sx={{ width: 70 }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        value={grades[student.id]?.coursework || ''}
                                                        onChange={(e) => handleGradeChange(student.id, 'coursework', e.target.value)}
                                                        inputProps={{ min: 0, max: gradingTemplate?.coursework_weight || 10 }}
                                                        sx={{ width: 70 }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        value={grades[student.id]?.midterm || ''}
                                                        onChange={(e) => handleGradeChange(student.id, 'midterm', e.target.value)}
                                                        inputProps={{ min: 0, max: gradingTemplate?.midterm_weight || 20 }}
                                                        sx={{ width: 70 }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        value={grades[student.id]?.final || ''}
                                                        onChange={(e) => handleGradeChange(student.id, 'final', e.target.value)}
                                                        inputProps={{ min: 0, max: gradingTemplate?.final_weight || 50 }}
                                                        sx={{ width: 70 }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#fafafa' }}>
                                <GradingIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                                <Typography sx={{ fontFamily: 'Cairo', color: '#999' }}>لا يوجد طلاب لرصد الدرجات</Typography>
                            </Paper>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Upload Dialog */}
            <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>رفع محاضرة جديدة</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="عنوان المحاضرة"
                            value={uploadData.title}
                            onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="الوصف (اختياري)"
                            value={uploadData.description}
                            onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                            fullWidth
                            multiline
                            rows={2}
                        />
                        <FormControl fullWidth>
                            <InputLabel>نوع الملف</InputLabel>
                            <Select
                                value={uploadData.file_type}
                                onChange={(e) => setUploadData({ ...uploadData, file_type: e.target.value })}
                                label="نوع الملف"
                            >
                                <MenuItem value="PDF">PDF</MenuItem>
                                <MenuItem value="SLIDES">عرض تقديمي</MenuItem>
                                <MenuItem value="VIDEO">فيديو</MenuItem>
                                <MenuItem value="OTHER">ملف آخر</MenuItem>
                            </Select>
                        </FormControl>
                        <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
                            {uploadData.file ? uploadData.file.name : 'اختر ملف'}
                            <input type="file" hidden onChange={(e) => setUploadData({ ...uploadData, file: e.target.files[0] })} />
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUploadOpen(false)} sx={{ fontFamily: 'Cairo' }}>إلغاء</Button>
                    <Button variant="contained" onClick={handleUploadLecture} disabled={uploading} sx={{ fontFamily: 'Cairo' }}>
                        {uploading ? <CircularProgress size={24} /> : 'رفع'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
