import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Paper, TextField, Button, Alert, MenuItem, Grid, Chip,
    CircularProgress, Avatar, Fade, Grow, Select, FormControl
} from '@mui/material';
import { keyframes } from '@mui/system';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PersonIcon from '@mui/icons-material/Person';
import FolderIcon from '@mui/icons-material/Folder';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

export default function UploadCertificates() {
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);
    const [students, setStudents] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loadingDepts, setLoadingDepts] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await axios.get('/api/academic/departments/', { withCredentials: true });
            setDepartments(response.data);
            setLoadingDepts(false);
            const yearsRes = await axios.get('/api/academic/years/', { withCredentials: true });
            setAcademicYears(yearsRes.data);
            const currentYear = yearsRes.data.find(y => y.is_current);
            if (currentYear) setSelectedYear(currentYear.id);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('فشل تحميل البيانات');
            setLoadingDepts(false);
        }
    };

    const fetchStudentsByDepartment = async (deptId, yearId) => {
        if (!deptId || !yearId) return;
        setLoadingStudents(true);
        try {
            const response = await axios.get(
                `/api/academic/student-affairs/students/?level_name=FOURTH&department=${deptId}&academic_year=${yearId}`,
                { withCredentials: true }
            );
            setStudents(response.data);
            setLoadingStudents(false);
        } catch (err) {
            console.error('Error fetching students:', err);
            setError('فشل تحميل الطلاب');
            setStudents([]);
            setLoadingStudents(false);
        }
    };

    const handleDepartmentChange = (e) => {
        const deptId = e.target.value;
        setSelectedDepartment(deptId);
        setSelectedStudent('');
        if (deptId && selectedYear) {
            fetchStudentsByDepartment(deptId, selectedYear);
        } else {
            setStudents([]);
        }
    };

    const handleYearChange = (e) => {
        const yearId = e.target.value;
        setSelectedYear(yearId);
        setSelectedStudent('');
        if (selectedDepartment && yearId) {
            fetchStudentsByDepartment(selectedDepartment, yearId);
        } else {
            setStudents([]);
        }
    };

    const handleUpload = async () => {
        if (!selectedStudent || !file) {
            setError('يرجى اختيار الطالب والملف.');
            return;
        }

        const student = students.find(s => s.id.toString() === selectedStudent.toString());
        if (!student || !student.user_id) {
            setError('خطأ في بيانات الطالب.');
            return;
        }

        const formData = new FormData();
        formData.append('student', student.user_id);
        formData.append('file', file);
        formData.append('description', description || 'شهادة التخرج');

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            await axios.post('/api/academic/certificates/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });
            setSuccess(`تم رفع الشهادة بنجاح للطالب ${student.full_name}`);
            setSelectedStudent('');
            setDescription('');
            setFile(null);
        } catch (err) {
            console.error('Error uploading certificate:', err);
            setError('فشل رفع الشهادة. تأكد من صحة البيانات.');
        } finally {
            setUploading(false);
        }
    };

    const getSelectedStudent = () => students.find(s => s.id.toString() === selectedStudent.toString());

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', pb: 6 }}>
            {/* Hero Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #673AB7 0%, #9C27B0 100%)',
                    pt: 4,
                    pb: 6,
                    mb: 4,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', animation: `${float} 6s ease-in-out infinite` }} />
                <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', animation: `${float} 8s ease-in-out infinite`, animationDelay: '2s' }} />

                <Container maxWidth="lg">
                    <Fade in={true} timeout={800}>
                        <Box>
                            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/student-affairs/dashboard')} sx={{ color: '#fff', mb: 2, fontFamily: 'Cairo', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                                العودة للوحة التحكم
                            </Button>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                                    <CardMembershipIcon sx={{ fontSize: 45, color: '#fff' }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                        رفع شهادات التخرج
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: 'rgba(255,255,255,0.9)' }}>
                                        رفع شهادات التخرج لطلاب السنة الرابعة
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Container maxWidth="lg">
                {/* Info Alert */}
                <Alert icon={<SchoolIcon />} severity="info" sx={{ mb: 4, fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem', py: 2 }}>
                    اختر القسم والعام الدراسي ثم اختر الطالب من طلاب السنة الرابعة لرفع شهادة التخرج.
                </Alert>

                {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem' }} onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert icon={<CheckCircleIcon />} severity="success" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem' }} onClose={() => setSuccess('')}>{success}</Alert>}

                {loadingDepts ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={50} /></Box>
                ) : (
                    <>
                        {/* Step 1: Select Department and Year */}
                        <Grow in={true} timeout={600}>
                            <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, boxShadow: '0 4px 25px rgba(0,0,0,0.1)', border: selectedDepartment && selectedYear ? '3px solid #4CAF50' : '2px solid #673AB7' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                                    <Avatar sx={{ width: 70, height: 70, background: selectedDepartment && selectedYear ? 'linear-gradient(135deg, #4CAF50, #8BC34A)' : 'linear-gradient(135deg, #673AB7, #9C27B0)', fontSize: 28, fontWeight: 'bold' }}>
                                        {selectedDepartment && selectedYear ? <CheckCircleIcon sx={{ fontSize: 35 }} /> : '1'}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                            الخطوة 1: اختر القسم والعام الدراسي
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                            حدد القسم والسنة الدراسية للبحث عن طلاب السنة الرابعة
                                        </Typography>
                                    </Box>
                                </Box>

                                <Grid container spacing={4}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1.5, color: '#1a2744' }}>
                                            القسم
                                        </Typography>
                                        <FormControl fullWidth variant="outlined">
                                            <Select
                                                value={selectedDepartment}
                                                onChange={handleDepartmentChange}
                                                displayEmpty
                                                sx={{ borderRadius: 2, fontSize: '1.3rem', minHeight: 60, bgcolor: '#fafafa', '& .MuiSelect-select': { py: 2 } }}
                                            >
                                                <MenuItem value="" disabled sx={{ fontSize: '1.2rem' }}>اختر القسم</MenuItem>
                                                {departments.filter(d => d.code !== 'PREP').map((dept) => (
                                                    <MenuItem key={dept.id} value={dept.id} sx={{ fontSize: '1.2rem', py: 1.5 }}>
                                                        {dept.name} ({dept.code})
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1.5, color: '#1a2744' }}>
                                            العام الدراسي
                                        </Typography>
                                        <FormControl fullWidth variant="outlined">
                                            <Select
                                                value={selectedYear}
                                                onChange={handleYearChange}
                                                displayEmpty
                                                sx={{ borderRadius: 2, fontSize: '1.3rem', minHeight: 60, bgcolor: '#fafafa', '& .MuiSelect-select': { py: 2 } }}
                                            >
                                                <MenuItem value="" disabled sx={{ fontSize: '1.2rem' }}>اختر العام الدراسي</MenuItem>
                                                {academicYears.map((year) => (
                                                    <MenuItem key={year.id} value={year.id} sx={{ fontSize: '1.2rem', py: 1.5 }}>
                                                        {year.name} {year.is_current && <Chip label="الحالي" size="small" color="success" sx={{ ml: 2 }} />}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grow>

                        {/* Step 2: Select Student */}
                        <Grow in={true} timeout={800}>
                            <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, boxShadow: '0 4px 25px rgba(0,0,0,0.1)', border: selectedStudent ? '3px solid #4CAF50' : '2px solid #2196F3', opacity: selectedDepartment && selectedYear ? 1 : 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                                    <Avatar sx={{ width: 70, height: 70, background: selectedStudent ? 'linear-gradient(135deg, #4CAF50, #8BC34A)' : 'linear-gradient(135deg, #2196F3, #21CBF3)', fontSize: 28, fontWeight: 'bold' }}>
                                        {selectedStudent ? <CheckCircleIcon sx={{ fontSize: 35 }} /> : '2'}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                            الخطوة 2: اختر الطالب
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                            اختر طالب من طلاب السنة الرابعة في القسم المحدد
                                        </Typography>
                                    </Box>
                                </Box>

                                {!selectedDepartment || !selectedYear ? (
                                    <Alert severity="warning" sx={{ fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem' }}>
                                        يرجى اختيار القسم والعام الدراسي أولاً
                                    </Alert>
                                ) : loadingStudents ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={40} /></Box>
                                ) : students.length === 0 ? (
                                    <Alert severity="warning" sx={{ fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem' }}>
                                        لا يوجد طلاب في السنة الرابعة في هذا القسم.
                                    </Alert>
                                ) : (
                                    <>
                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1.5, color: '#1a2744' }}>
                                            الطالب ({students.length} طالب متاح)
                                        </Typography>
                                        <FormControl fullWidth variant="outlined">
                                            <Select
                                                value={selectedStudent}
                                                onChange={(e) => setSelectedStudent(e.target.value)}
                                                displayEmpty
                                                sx={{ borderRadius: 2, fontSize: '1.3rem', minHeight: 60, bgcolor: '#fafafa', '& .MuiSelect-select': { py: 2 } }}
                                            >
                                                <MenuItem value="" disabled sx={{ fontSize: '1.2rem' }}>اختر الطالب</MenuItem>
                                                {students.map((student) => (
                                                    <MenuItem key={student.id} value={student.id} sx={{ fontSize: '1.2rem', py: 1.5 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                <Avatar sx={{ width: 35, height: 35, bgcolor: '#673AB7', fontSize: 14 }}>{student.full_name?.charAt(0)}</Avatar>
                                                                <span>{student.full_name}</span>
                                                            </Box>
                                                            <Chip
                                                                size="small"
                                                                label={student.graduation_status === 'APPROVED' ? 'معتمد' : 'قيد المراجعة'}
                                                                color={student.graduation_status === 'APPROVED' ? 'success' : 'warning'}
                                                            />
                                                        </Box>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        {selectedStudent && getSelectedStudent() && (
                                            <Paper sx={{ p: 3, mt: 3, borderRadius: 3, bgcolor: '#e8f5e9', border: '2px solid #4CAF50' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar sx={{ width: 50, height: 50, bgcolor: '#4CAF50' }}>{getSelectedStudent()?.full_name?.charAt(0)}</Avatar>
                                                    <Box>
                                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{getSelectedStudent()?.full_name}</Typography>
                                                        <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>الرقم القومي: {getSelectedStudent()?.national_id}</Typography>
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        )}
                                    </>
                                )}
                            </Paper>
                        </Grow>

                        {/* Step 3: Upload Certificate */}
                        <Grow in={true} timeout={1000}>
                            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 25px rgba(0,0,0,0.1)', border: '2px solid #FF9800', opacity: selectedStudent ? 1 : 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                                    <Avatar sx={{ width: 70, height: 70, background: 'linear-gradient(135deg, #FF9800, #FFB74D)', fontSize: 28, fontWeight: 'bold' }}>
                                        3
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                            الخطوة 3: رفع الشهادة
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                            ارفع ملف شهادة التخرج (PDF أو صورة)
                                        </Typography>
                                    </Box>
                                </Box>

                                {!selectedStudent ? (
                                    <Alert severity="warning" sx={{ fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem' }}>
                                        يرجى اختيار الطالب أولاً
                                    </Alert>
                                ) : (
                                    <Grid container spacing={4}>
                                        <Grid item xs={12}>
                                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1.5, color: '#1a2744' }}>
                                                وصف الشهادة (اختياري)
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="مثل: شهادة التخرج - دفعة 2024"
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '1.2rem', bgcolor: '#fafafa' } }}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1.5, color: '#1a2744' }}>
                                                ملف الشهادة
                                            </Typography>
                                            <Box
                                                sx={{
                                                    border: '3px dashed',
                                                    borderColor: file ? '#4CAF50' : '#ddd',
                                                    borderRadius: 3,
                                                    p: 5,
                                                    bgcolor: file ? '#e8f5e9' : '#fafafa',
                                                    textAlign: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                }}
                                            >
                                                <input
                                                    type="file"
                                                    hidden
                                                    id="certificate-file"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={(e) => setFile(e.target.files[0])}
                                                />
                                                <label htmlFor="certificate-file" style={{ cursor: 'pointer' }}>
                                                    {file ? (
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                            <PictureAsPdfIcon sx={{ fontSize: 60, color: '#4CAF50', mb: 2 }} />
                                                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#4CAF50' }}>{file.name}</Typography>
                                                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>انقر لتغيير الملف</Typography>
                                                        </Box>
                                                    ) : (
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                            <CloudUploadIcon sx={{ fontSize: 60, color: '#bbb', mb: 2 }} />
                                                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#666' }}>اسحب الملف هنا أو انقر للاختيار</Typography>
                                                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#999' }}>PDF أو صورة (JPG, PNG)</Typography>
                                                        </Box>
                                                    )}
                                                </label>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                size="large"
                                                onClick={handleUpload}
                                                disabled={uploading || !file}
                                                sx={{
                                                    fontFamily: 'Cairo',
                                                    fontWeight: 'bold',
                                                    py: 2,
                                                    fontSize: '1.3rem',
                                                    borderRadius: 3,
                                                    background: 'linear-gradient(135deg, #673AB7, #9C27B0)',
                                                    boxShadow: '0 10px 30px rgba(103, 58, 183, 0.4)',
                                                    '&:hover': { background: 'linear-gradient(135deg, #512DA8, #7B1FA2)' },
                                                    '&:disabled': { background: '#ccc' }
                                                }}
                                            >
                                                {uploading ? 'جاري الرفع...' : 'رفع الشهادة'}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                )}
                            </Paper>
                        </Grow>
                    </>
                )}
            </Container>
        </Box>
    );
}
