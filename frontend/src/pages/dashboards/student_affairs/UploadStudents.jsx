import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Paper, Button, Alert, LinearProgress,
    List, ListItem, ListItemText, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, FormControl, InputLabel, Select, MenuItem,
    Avatar, Fade, Grow, Grid
} from '@mui/material';
import { keyframes } from '@mui/system';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderIcon from '@mui/icons-material/Folder';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SchoolIcon from '@mui/icons-material/School';
import CategoryIcon from '@mui/icons-material/Category';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export default function UploadStudents() {
    const navigate = useNavigate();

    // Selection state
    const [departments, setDepartments] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [levels, setLevels] = useState([]);

    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [specializations, setSpecializations] = useState([]);
    const [selectedSpecialization, setSelectedSpecialization] = useState('');

    // Upload state
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loadingData, setLoadingData] = useState(true);

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedDepartment && selectedYear) {
            fetchLevels();
            const dept = departments.find(d => d.id === selectedDepartment);
            if (dept && dept.name.includes('كهرب')) {
                fetchSpecializations();
            } else {
                setSpecializations([]);
                setSelectedSpecialization('');
            }
        }
    }, [selectedDepartment, selectedYear]);

    const fetchInitialData = async () => {
        try {
            const [deptRes, yearRes] = await Promise.all([
                axios.get('/api/academic/departments/', config),
                axios.get('/api/academic/years/', config)
            ]);
            setDepartments(deptRes.data);
            setAcademicYears(yearRes.data);

            const currentYear = yearRes.data.find(y => y.is_current);
            if (currentYear) {
                setSelectedYear(currentYear.id);
            }
        } catch (err) {
            setError('فشل في تحميل البيانات');
        } finally {
            setLoadingData(false);
        }
    };

    const fetchLevels = async () => {
        try {
            const url = `/api/academic/levels/?department=${selectedDepartment}&academic_year=${selectedYear}`;
            const res = await axios.get(url, config);
            setLevels(res.data);

            if (res.data.length === 1) {
                setSelectedLevel(res.data[0].id);
            }
        } catch (err) {
            console.error('Error fetching levels:', err);
        }
    };

    const fetchSpecializations = async () => {
        try {
            const res = await axios.get(`/api/academic/specializations/?department=${selectedDepartment}`, config);
            setSpecializations(res.data);
        } catch (err) {
            console.error('Error fetching specializations:', err);
        }
    };

    const selectedLevelData = levels.find(l => l.id === selectedLevel);
    const needsSpecialization = specializations.length > 0 &&
        selectedLevelData && selectedLevelData.name !== 'FIRST';

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setResult(null);
        setError('');
    };

    const handleUpload = async () => {
        if (!selectedDepartment || !selectedYear || !selectedLevel) {
            setError('يرجى اختيار القسم والعام الدراسي والفرقة أولاً');
            return;
        }
        if (needsSpecialization && !selectedSpecialization) {
            setError('يرجى اختيار التخصص (اتصالات/قوى)');
            return;
        }
        if (!file) {
            setError('يرجى اختيار ملف أولاً.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('department_id', selectedDepartment);
        formData.append('academic_year_id', selectedYear);
        formData.append('level_id', selectedLevel);
        if (needsSpecialization && selectedSpecialization) {
            formData.append('specialization_id', selectedSpecialization);
        }

        setUploading(true);
        setError('');
        setResult(null);

        try {
            const response = await axios.post('/api/academic/student-affairs/upload/', formData, {
                ...config,
                headers: { ...config.headers, 'Content-Type': 'multipart/form-data' }
            });
            setResult(response.data);
            setFile(null);
        } catch (err) {
            console.error('Error uploading file:', err);
            const errorMsg = err.response?.data?.error || 'فشل رفع الملف. تأكد من صحة البيانات.';
            setError(errorMsg);
        } finally {
            setUploading(false);
        }
    };

    const sampleData = [
        { national_id: '12345678901234', full_name: 'أحمد محمد علي', email: 'ahmed@example.com' },
        { national_id: '23456789012345', full_name: 'محمد سعيد أحمد', email: '' },
    ];

    const isPrepDepartment = levels.length === 1;
    const isSelectionComplete = selectedDepartment && selectedYear && selectedLevel &&
        (!needsSpecialization || selectedSpecialization);

    const getActiveStep = () => {
        if (result) return 3;
        if (file) return 2;
        if (isSelectionComplete) return 1;
        return 0;
    };

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', pb: 6 }}>
            {/* Hero Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                    pt: 4,
                    pb: 6,
                    mb: 4,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', animation: `${float} 6s ease-in-out infinite` }} />
                <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', animation: `${float} 8s ease-in-out infinite`, animationDelay: '2s' }} />

                <Container maxWidth="xl">
                    <Fade in={true} timeout={800}>
                        <Box>
                            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/student-affairs/dashboard')} sx={{ color: '#fff', mb: 2, fontFamily: 'Cairo', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                                العودة للوحة التحكم
                            </Button>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                                    <UploadFileIcon sx={{ fontSize: 45, color: '#fff' }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                        رفع بيانات الطلاب
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: 'rgba(255,255,255,0.9)' }}>
                                        رفع ملفات Excel/CSV لإضافة بيانات الطلاب
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Container maxWidth="lg">
                {/* Step 1: Selection - Full Width */}
                <Grow in={true} timeout={600}>
                    <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, boxShadow: '0 4px 25px rgba(0,0,0,0.1)', border: isSelectionComplete ? '3px solid #4CAF50' : '2px solid #2196F3' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                            <Avatar sx={{ width: 70, height: 70, background: isSelectionComplete ? 'linear-gradient(135deg, #4CAF50, #8BC34A)' : 'linear-gradient(135deg, #2196F3, #21CBF3)', fontSize: 28, fontWeight: 'bold' }}>
                                {isSelectionComplete ? <CheckCircleIcon sx={{ fontSize: 35 }} /> : '1'}
                            </Avatar>
                            <Box>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                    الخطوة 1: اختر القسم والعام والفرقة
                                </Typography>
                                <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                    حدد القسم والسنة الدراسية والفرقة لرفع بيانات الطلاب
                                </Typography>
                            </Box>
                        </Box>

                        <Grid container spacing={4}>
                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1.5, color: '#1a2744' }}>
                                    القسم
                                </Typography>
                                <FormControl fullWidth variant="outlined">
                                    <Select
                                        value={selectedDepartment}
                                        onChange={(e) => { setSelectedDepartment(e.target.value); setSelectedLevel(''); }}
                                        displayEmpty
                                        sx={{
                                            borderRadius: 2,
                                            fontSize: '1.3rem',
                                            minHeight: 60,
                                            bgcolor: '#fafafa',
                                            '& .MuiSelect-select': { py: 2 }
                                        }}
                                    >
                                        <MenuItem value="" disabled sx={{ fontSize: '1.2rem' }}>اختر القسم</MenuItem>
                                        {departments.map((dept) => (
                                            <MenuItem key={dept.id} value={dept.id} sx={{ fontSize: '1.2rem', py: 1.5 }}>{dept.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1.5, color: '#1a2744' }}>
                                    العام الدراسي
                                </Typography>
                                <FormControl fullWidth variant="outlined">
                                    <Select
                                        value={selectedYear}
                                        onChange={(e) => { setSelectedYear(e.target.value); setSelectedLevel(''); }}
                                        displayEmpty
                                        sx={{
                                            borderRadius: 2,
                                            fontSize: '1.3rem',
                                            minHeight: 60,
                                            bgcolor: '#fafafa',
                                            '& .MuiSelect-select': { py: 2 }
                                        }}
                                    >
                                        <MenuItem value="" disabled sx={{ fontSize: '1.2rem' }}>اختر العام الدراسي</MenuItem>
                                        {academicYears.map((year) => (
                                            <MenuItem key={year.id} value={year.id} sx={{ fontSize: '1.2rem', py: 1.5 }}>
                                                {year.name}
                                                {year.is_current && <Chip label="الحالي" size="medium" color="success" sx={{ ml: 2, fontSize: '1rem' }} />}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            {!isPrepDepartment && (
                                <Grid item xs={12}>
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1.5, color: '#1a2744' }}>
                                        الفرقة
                                    </Typography>
                                    <FormControl fullWidth variant="outlined">
                                        <Select
                                            value={selectedLevel}
                                            onChange={(e) => { setSelectedLevel(e.target.value); setSelectedSpecialization(''); }}
                                            displayEmpty
                                            disabled={!selectedDepartment || !selectedYear || levels.length === 0}
                                            sx={{
                                                borderRadius: 2,
                                                fontSize: '1.3rem',
                                                minHeight: 60,
                                                bgcolor: '#fafafa',
                                                '& .MuiSelect-select': { py: 2 }
                                            }}
                                        >
                                            <MenuItem value="" disabled sx={{ fontSize: '1.2rem' }}>اختر الفرقة</MenuItem>
                                            {levels.map((level) => (
                                                <MenuItem key={level.id} value={level.id} sx={{ fontSize: '1.2rem', py: 1.5 }}>{level.display_name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}
                            {needsSpecialization && (
                                <Grid item xs={12}>
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1.5, color: '#1a2744' }}>
                                        التخصص
                                    </Typography>
                                    <FormControl fullWidth variant="outlined">
                                        <Select
                                            value={selectedSpecialization}
                                            onChange={(e) => setSelectedSpecialization(e.target.value)}
                                            displayEmpty
                                            sx={{
                                                borderRadius: 2,
                                                fontSize: '1.3rem',
                                                minHeight: 60,
                                                bgcolor: '#fafafa',
                                                '& .MuiSelect-select': { py: 2 }
                                            }}
                                        >
                                            <MenuItem value="" disabled sx={{ fontSize: '1.2rem' }}>اختر التخصص</MenuItem>
                                            {specializations.map((spec) => (
                                                <MenuItem key={spec.id} value={spec.id} sx={{ fontSize: '1.2rem', py: 1.5 }}>{spec.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}
                        </Grid>

                        {isSelectionComplete && (
                            <Alert icon={<CheckCircleIcon sx={{ fontSize: 28 }} />} severity="success" sx={{ mt: 4, fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem', py: 2 }}>
                                <strong>تم اختيار:</strong> {departments.find(d => d.id === selectedDepartment)?.name} - {academicYears.find(y => y.id === selectedYear)?.name}
                                {!isPrepDepartment && ` - ${levels.find(l => l.id === selectedLevel)?.display_name}`}
                                {needsSpecialization && ` - ${specializations.find(s => s.id === selectedSpecialization)?.name}`}
                            </Alert>
                        )}
                    </Paper>
                </Grow>

                {/* Step 2: File Format - Full Width */}
                <Grow in={true} timeout={800}>
                    <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, boxShadow: '0 4px 25px rgba(0,0,0,0.1)', border: '2px solid #9C27B0', opacity: isSelectionComplete ? 1 : 0.6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                            <Avatar sx={{ width: 70, height: 70, background: 'linear-gradient(135deg, #9C27B0, #E040FB)', fontSize: 28, fontWeight: 'bold' }}>
                                2
                            </Avatar>
                            <Box>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                    الخطوة 2: تنسيق الملف المطلوب
                                </Typography>
                                <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                    تأكد من أن الملف يحتوي على الأعمدة المطلوبة
                                </Typography>
                            </Box>
                        </Box>

                        <Grid container spacing={4}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 2, color: '#1a2744' }}>
                                    الأعمدة المطلوبة:
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                                    <Chip label="national_id (الرقم القومي)" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', bgcolor: '#e3f2fd', color: '#1976d2', fontSize: '1rem', py: 2.5, px: 1 }} />
                                    <Chip label="full_name (الاسم بالكامل)" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', bgcolor: '#e3f2fd', color: '#1976d2', fontSize: '1rem', py: 2.5, px: 1 }} />
                                    <Chip label="email (اختياري)" variant="outlined" sx={{ fontFamily: 'Cairo', borderColor: '#9C27B0', color: '#9C27B0', fontSize: '1rem', py: 2.5, px: 1 }} />
                                </Box>

                                <Alert severity="info" sx={{ fontFamily: 'Cairo', borderRadius: 3, fontSize: '1rem' }}>
                                    <strong>ملاحظة:</strong> القسم والعام الدراسي والفرقة يتم تحديدهم من القائمة أعلاه، وليس من الملف.
                                </Alert>

                                <Box sx={{ mt: 3, p: 2.5, bgcolor: '#fff3e0', borderRadius: 3 }}>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#e65100' }}>
                                        <strong>تلميح:</strong> تأكد من أن الرقم القومي مكون من 14 رقماً بالضبط
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 2, color: '#1a2744' }}>
                                    مثال على الملف:
                                </Typography>
                                <TableContainer sx={{ borderRadius: 3, overflow: 'hidden', border: '2px solid #eee' }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#1976d2', fontSize: '1rem' }}>national_id</TableCell>
                                                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#1976d2', fontSize: '1rem' }}>full_name</TableCell>
                                                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#9C27B0', fontSize: '1rem' }}>email</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {sampleData.map((row, index) => (
                                                <TableRow key={index} sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                                                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '1rem' }}>{row.national_id}</TableCell>
                                                    <TableCell sx={{ fontFamily: 'Cairo', fontSize: '1rem' }}>{row.full_name}</TableCell>
                                                    <TableCell sx={{ color: row.email ? 'inherit' : '#ccc', fontSize: '1rem' }}>{row.email || '-'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grow>

                {/* Step 3: Upload - Full Width */}
                <Grow in={true} timeout={1000}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 25px rgba(0,0,0,0.1)', border: result ? '3px solid #4CAF50' : '2px solid #FF9800', opacity: isSelectionComplete ? 1 : 0.6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                            <Avatar sx={{ width: 70, height: 70, background: result ? 'linear-gradient(135deg, #4CAF50, #8BC34A)' : 'linear-gradient(135deg, #FF9800, #FFB74D)', fontSize: 28, fontWeight: 'bold' }}>
                                {result ? <CheckCircleIcon sx={{ fontSize: 35 }} /> : '3'}
                            </Avatar>
                            <Box>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                    الخطوة 3: رفع الملف
                                </Typography>
                                <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                    اختر ملف Excel أو CSV وارفعه للنظام
                                </Typography>
                            </Box>
                        </Box>

                        {!isSelectionComplete && (
                            <Alert severity="warning" sx={{ mb: 4, fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem' }}>
                                يرجى إكمال الخطوة 1 أولاً (اختيار القسم والعام والفرقة)
                            </Alert>
                        )}

                        {/* Drag & Drop Zone */}
                        <Box
                            sx={{
                                border: '3px dashed',
                                borderColor: file ? '#4CAF50' : '#ddd',
                                borderRadius: 4,
                                p: 6,
                                mb: 4,
                                bgcolor: file ? '#e8f5e9' : '#fafafa',
                                transition: 'all 0.3s ease',
                                cursor: isSelectionComplete ? 'pointer' : 'not-allowed',
                                opacity: isSelectionComplete ? 1 : 0.5,
                                textAlign: 'center',
                            }}
                        >
                            <input
                                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                style={{ display: 'none' }}
                                id="raised-button-file"
                                type="file"
                                onChange={handleFileChange}
                                disabled={!isSelectionComplete}
                            />
                            <label htmlFor="raised-button-file" style={{ cursor: isSelectionComplete ? 'pointer' : 'not-allowed' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    {file ? (
                                        <>
                                            <InsertDriveFileIcon sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
                                            <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#4CAF50' }}>{file.name}</Typography>
                                            <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666', mt: 1 }}>انقر لتغيير الملف</Typography>
                                        </>
                                    ) : (
                                        <>
                                            <CloudUploadIcon sx={{ fontSize: 80, color: '#bbb', mb: 2 }} />
                                            <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#666' }}>اسحب الملف هنا أو انقر للاختيار</Typography>
                                            <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#999', mt: 1 }}>Excel أو CSV</Typography>
                                        </>
                                    )}
                                </Box>
                            </label>
                        </Box>

                        <Box sx={{ textAlign: 'center' }}>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleUpload}
                                disabled={!file || uploading || !isSelectionComplete}
                                sx={{
                                    fontFamily: 'Cairo',
                                    fontWeight: 'bold',
                                    px: 8,
                                    py: 2,
                                    fontSize: '1.2rem',
                                    borderRadius: 4,
                                    background: 'linear-gradient(135deg, #FF9800, #FFB74D)',
                                    boxShadow: '0 10px 30px rgba(255, 152, 0, 0.4)',
                                    '&:hover': { background: 'linear-gradient(135deg, #F57C00, #FF9800)' },
                                    '&:disabled': { background: '#ccc' }
                                }}
                            >
                                {uploading ? 'جاري الرفع...' : 'رفع البيانات'}
                            </Button>
                        </Box>

                        {uploading && <LinearProgress sx={{ mt: 4, borderRadius: 3, height: 8 }} />}
                        {error && <Alert severity="error" sx={{ mt: 4, fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem' }}>{error}</Alert>}

                        {result && (
                            <Fade in={true}>
                                <Box sx={{ mt: 4 }}>
                                    <Alert icon={<CheckCircleIcon sx={{ fontSize: 30 }} />} severity="success" sx={{ fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem', py: 2 }}>
                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>تمت العملية بنجاح!</Typography>
                                        • تم إنشاء {result.created} حساب جديد<br />
                                        • تم تحديث {result.updated} حساب موجود
                                    </Alert>
                                    {result.errors && result.errors.length > 0 && (
                                        <Box sx={{ mt: 3 }}>
                                            <Alert icon={<ErrorOutlineIcon />} severity="warning" sx={{ fontFamily: 'Cairo', borderRadius: 3 }}>
                                                <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>بعض الأخطاء ({result.errors.length}):</Typography>
                                            </Alert>
                                            <List dense sx={{ maxHeight: 200, overflow: 'auto', bgcolor: '#fff3e0', borderRadius: 3, mt: 1 }}>
                                                {result.errors.map((err, index) => (
                                                    <ListItem key={index}>
                                                        <ListItemText primary={err} primaryTypographyProps={{ fontFamily: 'Cairo', color: 'error' }} />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>
                                    )}
                                </Box>
                            </Fade>
                        )}
                    </Paper>
                </Grow>
            </Container>
        </Box>
    );
}
