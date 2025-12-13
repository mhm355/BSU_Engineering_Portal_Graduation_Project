import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Grid, Card, CardContent, Button, Tabs, Tab, Alert, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import GradeIcon from '@mui/icons-material/Grade';
import EventIcon from '@mui/icons-material/Event';
import AssignmentIcon from '@mui/icons-material/Assignment';

// Sub-components for each tab (simplified for now)
const MaterialsTab = ({ courseId }) => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMaterials();
    }, [courseId]);

    const fetchMaterials = async () => {
        try {
            const response = await axios.get(`/api/academic/materials/?course=${courseId}`, { withCredentials: true });
            setMaterials(response.data);
        } catch (err) {
            console.error('Error fetching materials:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !title) return;

        const formData = new FormData();
        formData.append('course', courseId);
        formData.append('title', title);
        formData.append('file', file);

        setUploading(true);
        setError('');
        try {
            await axios.post('/api/academic/materials/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            setTitle('');
            setFile(null);
            fetchMaterials();
        } catch (err) {
            console.error('Error uploading material:', err);
            setError('فشل رفع الملف.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الملف؟')) return;
        try {
            await axios.delete(`/api/academic/materials/${id}/`, { withCredentials: true });
            fetchMaterials();
        } catch (err) {
            console.error('Error deleting material:', err);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo' }}>إضافة مادة جديدة</Typography>
            {error && <Alert severity="error" sx={{ mb: 2, fontFamily: 'Cairo' }}>{error}</Alert>}
            <form onSubmit={handleUpload} style={{ marginBottom: '2rem' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                        <input
                            type="text"
                            placeholder="عنوان الملف"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{ width: '100%', padding: '10px', fontFamily: 'Cairo' }}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            style={{ width: '100%', fontFamily: 'Cairo' }}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={uploading}
                            fullWidth
                            sx={{ fontFamily: 'Cairo' }}
                        >
                            {uploading ? 'جاري الرفع...' : 'رفع'}
                        </Button>
                    </Grid>
                </Grid>
            </form>

            <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo', mt: 4 }}>المواد المرفوعة</Typography>
            {loading ? <CircularProgress /> : (
                <Grid container spacing={2}>
                    {materials.length === 0 ? (
                        <Typography sx={{ p: 2, fontFamily: 'Cairo' }}>لا توجد مواد مرفوعة.</Typography>
                    ) : (
                        materials.map((material) => (
                            <Grid item xs={12} md={6} lg={4} key={material.id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo' }}>{material.title}</Typography>
                                        <Typography variant="caption" display="block" sx={{ mb: 2, fontFamily: 'Cairo' }}>
                                            {new Date(material.uploaded_at).toLocaleDateString('ar-EG')}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button
                                                variant="outlined"
                                                href={material.file}
                                                target="_blank"
                                                size="small"
                                                sx={{ fontFamily: 'Cairo' }}
                                            >
                                                تحميل
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                onClick={() => handleDelete(material.id)}
                                                size="small"
                                                sx={{ fontFamily: 'Cairo' }}
                                            >
                                                حذف
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            )}
        </Box>
    );
};
const GradesTab = ({ courseId }) => {
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);

    useEffect(() => {
        fetchGradesAndStudents();
    }, [courseId]);

    const fetchGradesAndStudents = async () => {
        try {
            // Fetch grades for this course
            const gradesRes = await axios.get(`/api/academic/grades/?course=${courseId}`, { withCredentials: true });
            setGrades(gradesRes.data);

            // Ideally we should fetch enrolled students, but for now we might need to rely on grades or a separate endpoint
            // Since we don't have a direct "enrolled students" endpoint that is easily accessible here without more backend work,
            // we will assume we can edit existing grades or add new ones for students.
            // For simplicity in this iteration, let's just list existing grades and allow editing.
        } catch (err) {
            console.error('Error fetching grades:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGradeChange = async (gradeId, newScore) => {
        try {
            await axios.patch(`/api/academic/grades/${gradeId}/`, { score: newScore }, { withCredentials: true });
            // Update local state
            setGrades(grades.map(g => g.id === gradeId ? { ...g, score: newScore } : g));
        } catch (err) {
            console.error('Error updating grade:', err);
            alert('فشل تحديث الدرجة');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo' }}>رصد الدرجات</Typography>
                <Button
                    variant="contained"
                    color="secondary"
                    href={`/doctor/courses/${courseId}/upload-grades`}
                    sx={{ fontFamily: 'Cairo' }}
                >
                    رفع ملف Excel
                </Button>
            </Box>
            {loading ? <CircularProgress /> : (
                <Box>
                    {grades.length === 0 ? (
                        <Typography sx={{ p: 2, fontFamily: 'Cairo' }}>لا توجد درجات مرصودة.</Typography>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'right' }}>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>الطالب</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>الدرجة</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>التقدير</th>
                                </tr>
                            </thead>
                            <tbody>
                                {grades.map((grade) => (
                                    <tr key={grade.id}>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{grade.student_name || grade.student}</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                            <input
                                                type="number"
                                                value={grade.score}
                                                onChange={(e) => handleGradeChange(grade.id, e.target.value)}
                                                style={{ padding: '5px', width: '80px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{grade.grade_letter}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Box>
            )}
        </Box>
    );
};
const AttendanceTab = ({ courseId }) => {
    const [attendance, setAttendance] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, [courseId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [attRes, studRes] = await Promise.all([
                axios.get(`/api/academic/attendance/?course=${courseId}`, { withCredentials: true }),
                axios.get(`/api/academic/courses/${courseId}/students/`, { withCredentials: true })
            ]);
            setAttendance(attRes.data);
            setStudents(studRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAttendanceChange = (studentId, status) => {
        // Optimistic update or just local state change before save?
        // Let's do immediate save for simplicity or bulk save?
        // Immediate save is better for feedback.
        saveAttendance(studentId, status);
    };

    const saveAttendance = async (studentId, status) => {
        setSaving(true);
        try {
            // Check if record exists for this student and date
            const existingRecord = attendance.find(a =>
                (a.student === studentId || a.student_id === studentId) && a.date === selectedDate
            );

            if (existingRecord) {
                await axios.patch(`/api/academic/attendance/${existingRecord.id}/`, { status }, { withCredentials: true });
                setAttendance(prev => prev.map(a => a.id === existingRecord.id ? { ...a, status } : a));
            } else {
                const res = await axios.post('/api/academic/attendance/', {
                    student: studentId,
                    course: courseId,
                    date: selectedDate,
                    status
                }, { withCredentials: true });
                setAttendance(prev => [...prev, res.data]);
            }
        } catch (err) {
            console.error('Error saving attendance:', err);
            alert('فشل حفظ الحضور');
        } finally {
            setSaving(false);
        }
    };

    const getStudentStatus = (studentId) => {
        const record = attendance.find(a =>
            (a.student === studentId || a.student_id === studentId) && a.date === selectedDate
        );
        return record ? record.status : '';
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontFamily: 'Cairo' }}>سجل الحضور</Typography>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{ padding: '10px', fontFamily: 'Cairo' }}
                />
            </Box>

            {loading ? <CircularProgress /> : (
                <Box>
                    {students.length === 0 ? (
                        <Typography sx={{ p: 2, fontFamily: 'Cairo' }}>لا يوجد طلاب مسجلين في هذا المقرر.</Typography>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'right' }}>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>الطالب</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>الحالة ({selectedDate})</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student.id}>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                            {student.first_name} {student.last_name} ({student.username})
                                        </td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Button
                                                    variant={getStudentStatus(student.id) === 'PRESENT' ? 'contained' : 'outlined'}
                                                    color="success"
                                                    onClick={() => handleAttendanceChange(student.id, 'PRESENT')}
                                                    disabled={saving}
                                                    sx={{ fontFamily: 'Cairo' }}
                                                >
                                                    حاضر
                                                </Button>
                                                <Button
                                                    variant={getStudentStatus(student.id) === 'ABSENT' ? 'contained' : 'outlined'}
                                                    color="error"
                                                    onClick={() => handleAttendanceChange(student.id, 'ABSENT')}
                                                    disabled={saving}
                                                    sx={{ fontFamily: 'Cairo' }}
                                                >
                                                    غائب
                                                </Button>
                                            </Box>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Box>
            )}
        </Box>
    );
};
const ExamsTab = ({ courseId }) => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newExam, setNewExam] = useState({ date: '', start_time: '', duration_minutes: 60, location: '' });
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchExams();
    }, [courseId]);

    const fetchExams = async () => {
        try {
            const response = await axios.get(`/api/academic/exams/?course=${courseId}`, { withCredentials: true });
            setExams(response.data);
        } catch (err) {
            console.error('Error fetching exams:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExam = async (e) => {
        e.preventDefault();
        setAdding(true);
        try {
            await axios.post('/api/academic/exams/', { ...newExam, course: courseId }, { withCredentials: true });
            setNewExam({ date: '', start_time: '', duration_minutes: 60, location: '' });
            fetchExams();
        } catch (err) {
            console.error('Error adding exam:', err);
            alert('فشل إضافة الامتحان');
        } finally {
            setAdding(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo' }}>جدولة امتحان جديد</Typography>
            <form onSubmit={handleAddExam} style={{ marginBottom: '2rem' }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                        <input
                            type="date"
                            value={newExam.date}
                            onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                            style={{ width: '100%', padding: '10px', fontFamily: 'Cairo' }}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <input
                            type="time"
                            value={newExam.start_time}
                            onChange={(e) => setNewExam({ ...newExam, start_time: e.target.value })}
                            style={{ width: '100%', padding: '10px', fontFamily: 'Cairo' }}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <input
                            type="number"
                            placeholder="المدة (دقيقة)"
                            value={newExam.duration_minutes}
                            onChange={(e) => setNewExam({ ...newExam, duration_minutes: e.target.value })}
                            style={{ width: '100%', padding: '10px', fontFamily: 'Cairo' }}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <input
                            type="text"
                            placeholder="المكان"
                            value={newExam.location}
                            onChange={(e) => setNewExam({ ...newExam, location: e.target.value })}
                            style={{ width: '100%', padding: '10px', fontFamily: 'Cairo' }}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={adding}
                            fullWidth
                            sx={{ fontFamily: 'Cairo' }}
                        >
                            {adding ? 'جاري الإضافة...' : 'إضافة'}
                        </Button>
                    </Grid>
                </Grid>
            </form>

            <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo' }}>الامتحانات المجدولة</Typography>
            {loading ? <CircularProgress /> : (
                <Box>
                    {exams.length === 0 ? (
                        <Typography sx={{ p: 2, fontFamily: 'Cairo' }}>لا توجد امتحانات مجدولة.</Typography>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'right' }}>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>التاريخ</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>الوقت</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>المدة</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>المكان</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {exams.map((exam) => (
                                    <tr key={exam.id}>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{exam.date}</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{exam.start_time}</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{exam.duration_minutes} دقيقة</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{exam.location}</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                            <Button
                                                color="error"
                                                size="small"
                                                onClick={async () => {
                                                    if (window.confirm('هل أنت متأكد من حذف هذا الامتحان؟')) {
                                                        try {
                                                            await axios.delete(`/api/academic/exams/${exam.id}/`, { withCredentials: true });
                                                            fetchExams();
                                                        } catch (e) {
                                                            console.error(e);
                                                            alert('فشل الحذف');
                                                        }
                                                    }
                                                }}
                                            >
                                                حذف
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default function DoctorCourseManager() {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        fetchCourseDetails();
    }, [courseId]);

    const fetchCourseDetails = async () => {
        try {
            const response = await axios.get(`/api/academic/courses/${courseId}/`, { withCredentials: true });
            setCourse(response.data);
        } catch (err) {
            console.error('Error fetching course details:', err);
            setError('فشل تحميل تفاصيل المقرر.');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (!course) return <Alert severity="error">المقرر غير موجود.</Alert>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper sx={{ p: 3, mb: 4, bgcolor: '#0A2342', color: 'white' }}>
                <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                    {course.name}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontFamily: 'Cairo' }}>
                    {course.code} | {course.department_name} | {course.level_name}
                </Typography>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo' }}>{error}</Alert>}

            <Paper sx={{ width: '100%' }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab icon={<UploadFileIcon />} label="المواد الدراسية" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} />
                    <Tab icon={<GradeIcon />} label="الدرجات" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} />
                    <Tab icon={<EventIcon />} label="الحضور" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} />
                    <Tab icon={<AssignmentIcon />} label="الامتحانات" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} />
                </Tabs>

                <Box sx={{ p: 2 }}>
                    {tabValue === 0 && <MaterialsTab courseId={courseId} />}
                    {tabValue === 1 && <GradesTab courseId={courseId} />}
                    {tabValue === 2 && <AttendanceTab courseId={courseId} />}
                    {tabValue === 3 && <ExamsTab courseId={courseId} />}
                </Box>
            </Paper>
        </Container>
    );
}
