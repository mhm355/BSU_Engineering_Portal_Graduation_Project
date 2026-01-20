import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Paper, Button, Alert, CircularProgress,
    FormControl, Select, MenuItem, RadioGroup, FormControlLabel, Radio,
    Avatar, Grid, Fade, Grow, Chip
} from '@mui/material';
import { keyframes } from '@mui/system';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import GradingIcon from '@mui/icons-material/Grading';
import SchoolIcon from '@mui/icons-material/School';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ClassIcon from '@mui/icons-material/Class';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

export default function UploadExamGrades() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Selection state
    const [departments, setDepartments] = useState([]);
    const [years, setYears] = useState([]);
    const [levels, setLevels] = useState([]);
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [gradeType, setGradeType] = useState('midterm');
    const [file, setFile] = useState(null);

    useEffect(() => {
        fetchDepartments();
        fetchYears();
    }, []);

    useEffect(() => {
        if (selectedDept && selectedYear) {
            fetchLevels();
        }
    }, [selectedDept, selectedYear]);

    const fetchDepartments = async () => {
        try {
            const res = await axios.get('/api/academic/departments/', { withCredentials: true });
            setDepartments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchYears = async () => {
        try {
            const res = await axios.get('/api/academic/years/', { withCredentials: true });
            setYears(res.data);
            // Auto-select current year
            const currentYear = res.data.find(y => y.is_current);
            if (currentYear) setSelectedYear(currentYear.id);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchLevels = async () => {
        try {
            const res = await axios.get(`/api/academic/levels/?department=${selectedDept}&academic_year=${selectedYear}`, { withCredentials: true });
            setLevels(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const getLevelName = (name) => {
        const names = {
            'PREPARATORY': 'الفرقة الإعدادية',
            'FIRST': 'الفرقة الأولى',
            'SECOND': 'الفرقة الثانية',
            'THIRD': 'الفرقة الثالثة',
            'FOURTH': 'الفرقة الرابعة',
        };
        return names[name] || name;
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedLevel || !file) {
            setError('يرجى تحديد الفرقة ورفع الملف');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('level_id', selectedLevel);
        formData.append('grade_type', gradeType);

        try {
            const res = await axios.post('/api/academic/exam-grades/upload/', formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess(res.data.message);
            if (res.data.errors && res.data.errors.length > 0) {
                setError(`بعض الأخطاء: ${res.data.errors.join(', ')}`);
            }
            setFile(null);
        } catch (err) {
            setError(err.response?.data?.error || 'فشل رفع الدرجات');
        }
        setLoading(false);
    };

    const isSelectionComplete = selectedDept && selectedYear && selectedLevel;

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', pb: 6 }}>
            {/* Hero Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #009688 0%, #4DB6AC 100%)',
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
                                    <GradingIcon sx={{ fontSize: 45, color: '#fff' }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                        رفع درجات الامتحانات
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: 'rgba(255,255,255,0.9)' }}>
                                        رفع درجات امتحانات منتصف الترم والنهائي من ملف Excel
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Container maxWidth="lg">
                {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem' }} onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert icon={<CheckCircleIcon />} severity="success" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem' }} onClose={() => setSuccess('')}>{success}</Alert>}

                {/* Step 1: Selection */}
                <Grow in={true} timeout={600}>
                    <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, boxShadow: '0 4px 25px rgba(0,0,0,0.1)', border: isSelectionComplete ? '3px solid #4CAF50' : '2px solid #009688' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                            <Avatar sx={{ width: 70, height: 70, background: isSelectionComplete ? 'linear-gradient(135deg, #4CAF50, #8BC34A)' : 'linear-gradient(135deg, #009688, #4DB6AC)', fontSize: 28, fontWeight: 'bold' }}>
                                {isSelectionComplete ? <CheckCircleIcon sx={{ fontSize: 35 }} /> : '1'}
                            </Avatar>
                            <Box>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                    الخطوة 1: حدد القسم والسنة والفرقة
                                </Typography>
                                <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                    اختر القسم والسنة الأكاديمية والفرقة الدراسية
                                </Typography>
                            </Box>
                        </Box>

                        <Grid container spacing={4}>
                            <Grid item xs={12} md={4}>
                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1.5, color: '#1a2744' }}>
                                    القسم
                                </Typography>
                                <FormControl fullWidth variant="outlined">
                                    <Select
                                        value={selectedDept}
                                        onChange={(e) => { setSelectedDept(e.target.value); setSelectedLevel(''); }}
                                        displayEmpty
                                        sx={{ borderRadius: 2, fontSize: '1.2rem', minHeight: 60, bgcolor: '#fafafa', '& .MuiSelect-select': { py: 2 } }}
                                    >
                                        <MenuItem value="" disabled sx={{ fontSize: '1.1rem' }}>اختر القسم</MenuItem>
                                        {departments.map(d => (
                                            <MenuItem key={d.id} value={d.id} sx={{ fontSize: '1.1rem', py: 1.5 }}>{d.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1.5, color: '#1a2744' }}>
                                    السنة الأكاديمية
                                </Typography>
                                <FormControl fullWidth variant="outlined">
                                    <Select
                                        value={selectedYear}
                                        onChange={(e) => { setSelectedYear(e.target.value); setSelectedLevel(''); }}
                                        displayEmpty
                                        sx={{ borderRadius: 2, fontSize: '1.2rem', minHeight: 60, bgcolor: '#fafafa', '& .MuiSelect-select': { py: 2 } }}
                                    >
                                        <MenuItem value="" disabled sx={{ fontSize: '1.1rem' }}>اختر السنة</MenuItem>
                                        {years.map(y => (
                                            <MenuItem key={y.id} value={y.id} sx={{ fontSize: '1.1rem', py: 1.5 }}>
                                                {y.name} {y.is_current && <Chip label="الحالي" size="small" color="success" sx={{ ml: 2 }} />}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1.5, color: '#1a2744' }}>
                                    الفرقة
                                </Typography>
                                <FormControl fullWidth variant="outlined" disabled={!selectedDept || !selectedYear}>
                                    <Select
                                        value={selectedLevel}
                                        onChange={(e) => setSelectedLevel(e.target.value)}
                                        displayEmpty
                                        sx={{ borderRadius: 2, fontSize: '1.2rem', minHeight: 60, bgcolor: '#fafafa', '& .MuiSelect-select': { py: 2 } }}
                                    >
                                        <MenuItem value="" disabled sx={{ fontSize: '1.1rem' }}>اختر الفرقة</MenuItem>
                                        {levels.map(l => (
                                            <MenuItem key={l.id} value={l.id} sx={{ fontSize: '1.1rem', py: 1.5 }}>{l.display_name || getLevelName(l.name)}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grow>

                {/* Step 2: Grade Type */}
                <Grow in={true} timeout={800}>
                    <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, boxShadow: '0 4px 25px rgba(0,0,0,0.1)', border: '2px solid #2196F3', opacity: isSelectionComplete ? 1 : 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                            <Avatar sx={{ width: 70, height: 70, background: 'linear-gradient(135deg, #2196F3, #21CBF3)', fontSize: 28, fontWeight: 'bold' }}>
                                2
                            </Avatar>
                            <Box>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                    الخطوة 2: نوع الامتحان
                                </Typography>
                                <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                    اختر نوع الامتحان (منتصف الترم أو النهائي)
                                </Typography>
                            </Box>
                        </Box>

                        <RadioGroup row value={gradeType} onChange={(e) => setGradeType(e.target.value)} sx={{ justifyContent: 'center', gap: 4 }}>
                            <Paper
                                elevation={0}
                                onClick={() => setGradeType('midterm')}
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    cursor: 'pointer',
                                    border: gradeType === 'midterm' ? '3px solid #2196F3' : '2px solid #eee',
                                    bgcolor: gradeType === 'midterm' ? '#e3f2fd' : '#fafafa',
                                    minWidth: 200,
                                    textAlign: 'center',
                                    transition: 'all 0.3s ease',
                                    '&:hover': { borderColor: '#2196F3' }
                                }}
                            >
                                <Avatar sx={{ width: 60, height: 60, mx: 'auto', mb: 2, bgcolor: gradeType === 'midterm' ? '#2196F3' : '#bbb' }}>
                                    <AssignmentIcon sx={{ fontSize: 30 }} />
                                </Avatar>
                                <FormControlLabel
                                    value="midterm"
                                    control={<Radio checked={gradeType === 'midterm'} />}
                                    label={<Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>منتصف الترم</Typography>}
                                    labelPlacement="bottom"
                                    sx={{ m: 0 }}
                                />
                            </Paper>
                            <Paper
                                elevation={0}
                                onClick={() => setGradeType('final')}
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    cursor: 'pointer',
                                    border: gradeType === 'final' ? '3px solid #4CAF50' : '2px solid #eee',
                                    bgcolor: gradeType === 'final' ? '#e8f5e9' : '#fafafa',
                                    minWidth: 200,
                                    textAlign: 'center',
                                    transition: 'all 0.3s ease',
                                    '&:hover': { borderColor: '#4CAF50' }
                                }}
                            >
                                <Avatar sx={{ width: 60, height: 60, mx: 'auto', mb: 2, bgcolor: gradeType === 'final' ? '#4CAF50' : '#bbb' }}>
                                    <GradingIcon sx={{ fontSize: 30 }} />
                                </Avatar>
                                <FormControlLabel
                                    value="final"
                                    control={<Radio checked={gradeType === 'final'} />}
                                    label={<Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>النهائي</Typography>}
                                    labelPlacement="bottom"
                                    sx={{ m: 0 }}
                                />
                            </Paper>
                        </RadioGroup>
                    </Paper>
                </Grow>

                {/* Step 3: File Upload */}
                <Grow in={true} timeout={1000}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 25px rgba(0,0,0,0.1)', border: '2px solid #FF9800', opacity: isSelectionComplete ? 1 : 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                            <Avatar sx={{ width: 70, height: 70, background: 'linear-gradient(135deg, #FF9800, #FFB74D)', fontSize: 28, fontWeight: 'bold' }}>
                                3
                            </Avatar>
                            <Box>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                    الخطوة 3: رفع ملف الدرجات
                                </Typography>
                                <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                    ارفع ملف Excel يحتوي على درجات الطلاب
                                </Typography>
                            </Box>
                        </Box>

                        <Alert severity="info" sx={{ mb: 4, fontFamily: 'Cairo', borderRadius: 3, fontSize: '1rem' }}>
                            <strong>صيغة الملف المطلوبة:</strong> الصف الأول يحتوي على الأعمدة: national_id | [أكواد المواد...]
                            <br />
                            كل صف يحتوي على الرقم القومي للطالب ثم درجاته في كل مادة
                        </Alert>

                        {/* Drag & Drop Zone */}
                        <Box
                            sx={{
                                border: '3px dashed',
                                borderColor: file ? '#4CAF50' : '#ddd',
                                borderRadius: 4,
                                p: 6,
                                mb: 4,
                                bgcolor: file ? '#e8f5e9' : '#fafafa',
                                textAlign: 'center',
                                cursor: isSelectionComplete ? 'pointer' : 'not-allowed',
                                opacity: isSelectionComplete ? 1 : 0.5,
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <input
                                type="file"
                                hidden
                                id="grades-file"
                                accept=".xlsx,.xls"
                                onChange={handleFileChange}
                                disabled={!isSelectionComplete}
                            />
                            <label htmlFor="grades-file" style={{ cursor: isSelectionComplete ? 'pointer' : 'not-allowed' }}>
                                {file ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <InsertDriveFileIcon sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
                                        <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#4CAF50' }}>{file.name}</Typography>
                                        <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666', mt: 1 }}>انقر لتغيير الملف</Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <CloudUploadIcon sx={{ fontSize: 80, color: '#bbb', mb: 2 }} />
                                        <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#666' }}>اسحب الملف هنا أو انقر للاختيار</Typography>
                                        <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#999', mt: 1 }}>ملف Excel فقط (.xlsx, .xls)</Typography>
                                    </Box>
                                )}
                            </label>
                        </Box>

                        <Box sx={{ textAlign: 'center' }}>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <CloudUploadIcon />}
                                onClick={handleUpload}
                                disabled={loading || !file || !isSelectionComplete}
                                sx={{
                                    fontFamily: 'Cairo',
                                    fontWeight: 'bold',
                                    px: 8,
                                    py: 2,
                                    fontSize: '1.3rem',
                                    borderRadius: 4,
                                    background: 'linear-gradient(135deg, #009688, #4DB6AC)',
                                    boxShadow: '0 10px 30px rgba(0, 150, 136, 0.4)',
                                    '&:hover': { background: 'linear-gradient(135deg, #00796B, #009688)' },
                                    '&:disabled': { background: '#ccc' }
                                }}
                            >
                                {loading ? 'جاري الرفع...' : 'رفع الدرجات'}
                            </Button>
                        </Box>
                    </Paper>
                </Grow>
            </Container>
        </Box>
    );
}
