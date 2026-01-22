import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Paper, Button, FormControl, Select, MenuItem,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CircularProgress, Alert, Chip, Avatar, Grid, Fade, Grow
} from '@mui/material';
import { keyframes } from '@mui/system';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GradingIcon from '@mui/icons-material/Grading';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CategoryIcon from '@mui/icons-material/Category';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

export default function StudentGradesView() {
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [levels, setLevels] = useState([]);
    const [specializations, setSpecializations] = useState([]);

    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedSpecialization, setSelectedSpecialization] = useState('');

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');
    const [gradesData, setGradesData] = useState(null);

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedDepartment && selectedYear) {
            fetchLevels();
            fetchSpecializations();
        }
    }, [selectedDepartment, selectedYear]);

    // Check if specialization is needed (Electrical Engineering, level 2-4)
    const selectedDeptData = departments.find(d => d.id === selectedDepartment);
    const selectedLevelData = levels.find(l => l.id === selectedLevel);
    const isElectrical = selectedDeptData?.name?.includes('كهرب') || selectedDeptData?.code === 'ELEC';
    const needsSpecialization = isElectrical &&
        selectedLevelData &&
        selectedLevelData.name !== 'FIRST' &&
        selectedLevelData.name !== 'PREPARATORY';

    const fetchInitialData = async () => {
        try {
            const [deptRes, yearRes] = await Promise.all([
                axios.get('/api/academic/departments/', config),
                axios.get('/api/academic/years/', config)
            ]);
            setDepartments(deptRes.data);
            setAcademicYears(yearRes.data);

            const currentYear = yearRes.data.find(y => y.is_current);
            if (currentYear) setSelectedYear(currentYear.id);
        } catch (err) {
            setError('فشل في تحميل البيانات');
        } finally {
            setLoadingData(false);
        }
    };

    const fetchLevels = async () => {
        try {
            const res = await axios.get(
                `/api/academic/levels/?department=${selectedDepartment}&academic_year=${selectedYear}`,
                config
            );
            setLevels(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSpecializations = async () => {
        try {
            const res = await axios.get(
                `/api/academic/specializations/?department=${selectedDepartment}`,
                config
            );
            setSpecializations(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchGrades = async () => {
        if (!selectedDepartment || !selectedYear || !selectedLevel) {
            setError('يرجى اختيار جميع الخيارات');
            return;
        }

        // Check if specialization is required but not selected
        if (needsSpecialization && !selectedSpecialization) {
            setError('يرجى اختيار التخصص');
            return;
        }

        setLoading(true);
        setError('');
        setGradesData(null);

        try {
            let url = `/api/academic/student-affairs/grades/?department=${selectedDepartment}&academic_year=${selectedYear}&level=${selectedLevel}`;

            // Add specialization parameter if needed
            if (needsSpecialization && selectedSpecialization) {
                url += `&specialization=${selectedSpecialization}`;
            }

            const res = await axios.get(url, config);
            setGradesData(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'فشل في تحميل الدرجات');
        } finally {
            setLoading(false);
        }
    };

    const handleDepartmentChange = (e) => {
        setSelectedDepartment(e.target.value);
        setSelectedLevel('');
        setSelectedSpecialization('');
        setGradesData(null);
    };

    const handleLevelChange = (e) => {
        setSelectedLevel(e.target.value);
        setSelectedSpecialization('');
        setGradesData(null);
    };

    const isSelectionComplete = selectedDepartment && selectedYear && selectedLevel &&
        (!needsSpecialization || selectedSpecialization);

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', pb: 6 }}>
            {/* Hero Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #3F51B5 0%, #7986CB 100%)',
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
                                    <AssessmentIcon sx={{ fontSize: 45, color: '#fff' }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                        عرض درجات الطلاب
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: 'rgba(255,255,255,0.9)' }}>
                                        عرض جميع درجات الطلاب حسب القسم والفرقة
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Container maxWidth="xl">
                {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem' }} onClose={() => setError('')}>{error}</Alert>}

                {/* Selection Section */}
                <Grow in={true} timeout={600}>
                    <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, boxShadow: '0 4px 25px rgba(0,0,0,0.1)', border: isSelectionComplete ? '3px solid #4CAF50' : '2px solid #3F51B5' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                            <Avatar sx={{ width: 70, height: 70, background: isSelectionComplete ? 'linear-gradient(135deg, #4CAF50, #8BC34A)' : 'linear-gradient(135deg, #3F51B5, #7986CB)', fontSize: 28, fontWeight: 'bold' }}>
                                {isSelectionComplete ? <CheckCircleIcon sx={{ fontSize: 35 }} /> : <SearchIcon sx={{ fontSize: 35 }} />}
                            </Avatar>
                            <Box>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                    اختر القسم والعام والفرقة
                                </Typography>
                                <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                    حدد المعايير لعرض جدول درجات الطلاب
                                </Typography>
                            </Box>
                        </Box>

                        <Grid container spacing={3} alignItems="flex-end">
                            <Grid item xs={12} md={needsSpecialization ? 2.4 : 3}>
                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1.5, color: '#1a2744' }}>
                                    القسم
                                </Typography>
                                <FormControl fullWidth variant="outlined">
                                    <Select
                                        value={selectedDepartment}
                                        onChange={handleDepartmentChange}
                                        displayEmpty
                                        sx={{ borderRadius: 2, fontSize: '1.2rem', minHeight: 55, bgcolor: '#fafafa', '& .MuiSelect-select': { py: 1.5 } }}
                                    >
                                        <MenuItem value="" disabled sx={{ fontSize: '1.1rem' }}>اختر القسم</MenuItem>
                                        {departments.map((dept) => (
                                            <MenuItem key={dept.id} value={dept.id} sx={{ fontSize: '1.1rem', py: 1.5 }}>{dept.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={needsSpecialization ? 2.4 : 3}>
                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1.5, color: '#1a2744' }}>
                                    العام الدراسي
                                </Typography>
                                <FormControl fullWidth variant="outlined">
                                    <Select
                                        value={selectedYear}
                                        onChange={(e) => { setSelectedYear(e.target.value); setSelectedLevel(''); setSelectedSpecialization(''); setGradesData(null); }}
                                        displayEmpty
                                        sx={{ borderRadius: 2, fontSize: '1.2rem', minHeight: 55, bgcolor: '#fafafa', '& .MuiSelect-select': { py: 1.5 } }}
                                    >
                                        <MenuItem value="" disabled sx={{ fontSize: '1.1rem' }}>اختر العام</MenuItem>
                                        {academicYears.map((year) => (
                                            <MenuItem key={year.id} value={year.id} sx={{ fontSize: '1.1rem', py: 1.5 }}>
                                                {year.name} {year.is_current && <Chip label="الحالي" size="small" color="success" sx={{ ml: 2 }} />}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={needsSpecialization ? 2.4 : 3}>
                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1.5, color: '#1a2744' }}>
                                    الفرقة
                                </Typography>
                                <FormControl fullWidth variant="outlined" disabled={!selectedDepartment || !selectedYear}>
                                    <Select
                                        value={selectedLevel}
                                        onChange={handleLevelChange}
                                        displayEmpty
                                        sx={{ borderRadius: 2, fontSize: '1.2rem', minHeight: 55, bgcolor: '#fafafa', '& .MuiSelect-select': { py: 1.5 } }}
                                    >
                                        <MenuItem value="" disabled sx={{ fontSize: '1.1rem' }}>اختر الفرقة</MenuItem>
                                        {levels.map((level) => (
                                            <MenuItem key={level.id} value={level.id} sx={{ fontSize: '1.1rem', py: 1.5 }}>{level.display_name || level.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Specialization Dropdown - Only for Electrical Engineering Years 2-4 */}
                            {needsSpecialization && (
                                <Grid item xs={12} md={2.4}>
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1.5, color: '#9C27B0' }}>
                                        <CategoryIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 22 }} />
                                        التخصص
                                    </Typography>
                                    <FormControl fullWidth variant="outlined">
                                        <Select
                                            value={selectedSpecialization}
                                            onChange={(e) => { setSelectedSpecialization(e.target.value); setGradesData(null); }}
                                            displayEmpty
                                            sx={{
                                                borderRadius: 2,
                                                fontSize: '1.2rem',
                                                minHeight: 55,
                                                bgcolor: '#f3e5f5',
                                                border: '2px solid #9C27B0',
                                                '& .MuiSelect-select': { py: 1.5 }
                                            }}
                                        >
                                            <MenuItem value="" disabled sx={{ fontSize: '1.1rem' }}>اختر التخصص</MenuItem>
                                            {specializations.map((spec) => (
                                                <MenuItem key={spec.id} value={spec.id} sx={{ fontSize: '1.1rem', py: 1.5 }}>
                                                    {spec.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}

                            <Grid item xs={12} md={needsSpecialization ? 2.4 : 3}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <SearchIcon />}
                                    onClick={fetchGrades}
                                    disabled={!isSelectionComplete || loading}
                                    sx={{
                                        fontFamily: 'Cairo',
                                        fontWeight: 'bold',
                                        py: 2,
                                        fontSize: '1.1rem',
                                        borderRadius: 2,
                                        minHeight: 55,
                                        background: 'linear-gradient(135deg, #3F51B5, #7986CB)',
                                        boxShadow: '0 8px 25px rgba(63, 81, 181, 0.35)',
                                        '&:hover': { background: 'linear-gradient(135deg, #303F9F, #3F51B5)' },
                                        '&:disabled': { background: '#ccc' }
                                    }}
                                >
                                    {loading ? 'جاري التحميل...' : 'عرض الدرجات'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grow>

                {/* Grades Table */}
                {gradesData && (
                    <Grow in={true} timeout={800}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 25px rgba(0,0,0,0.1)' }}>
                            {/* Stats Row */}
                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ width: 50, height: 50, bgcolor: '#3F51B5' }}>
                                            <PeopleIcon />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{gradesData.students.length}</Typography>
                                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>عدد الطلاب</Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: '#e8f5e9', display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ width: 50, height: 50, bgcolor: '#4CAF50' }}>
                                            <MenuBookIcon />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{gradesData.subjects.length}</Typography>
                                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>عدد المواد</Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Avatar sx={{ width: 50, height: 50, background: 'linear-gradient(135deg, #3F51B5, #7986CB)' }}>
                                    <GradingIcon />
                                </Avatar>
                                <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                    جدول الدرجات
                                </Typography>
                            </Box>

                            {gradesData.students.length > 0 ? (
                                <TableContainer sx={{ maxHeight: 600, overflowX: 'auto', borderRadius: 3, border: '1px solid #eee' }}>
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', bgcolor: '#3F51B5', color: '#fff', minWidth: 180, fontSize: '1rem' }}>
                                                    اسم الطالب
                                                </TableCell>
                                                {gradesData.subjects.map((subject) => (
                                                    <TableCell
                                                        key={subject.id}
                                                        colSpan={3}
                                                        align="center"
                                                        sx={{ fontFamily: 'Cairo', fontWeight: 'bold', bgcolor: '#3F51B5', color: '#fff', minWidth: 200, fontSize: '1rem' }}
                                                    >
                                                        {subject.name}
                                                        <br />
                                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>{subject.code}</Typography>
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ bgcolor: '#f5f5f5' }}></TableCell>
                                                {gradesData.subjects.map((subject) => (
                                                    <React.Fragment key={`header-${subject.id}`}>
                                                        <TableCell align="center" sx={{ fontFamily: 'Cairo', fontSize: '0.85rem', fontWeight: 'bold', bgcolor: '#e3f2fd', color: '#1976d2' }}>
                                                            منتصف
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ fontFamily: 'Cairo', fontSize: '0.85rem', fontWeight: 'bold', bgcolor: '#fff3e0', color: '#FF9800' }}>
                                                            أعمال
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ fontFamily: 'Cairo', fontSize: '0.85rem', fontWeight: 'bold', bgcolor: '#e8f5e9', color: '#4CAF50' }}>
                                                            نهائي
                                                        </TableCell>
                                                    </React.Fragment>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {gradesData.students.map((student, index) => (
                                                <TableRow key={student.id} hover sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1rem' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            <Avatar sx={{ width: 35, height: 35, bgcolor: '#3F51B5', fontSize: 14 }}>{index + 1}</Avatar>
                                                            {student.full_name}
                                                        </Box>
                                                    </TableCell>
                                                    {student.subjects.map((subjectGrade) => (
                                                        <React.Fragment key={`${student.id}-${subjectGrade.subject_id}`}>
                                                            <TableCell align="center" sx={{ fontFamily: 'Cairo', fontSize: '1rem', color: subjectGrade.midterm !== null ? '#1976d2' : '#ccc' }}>
                                                                {subjectGrade.midterm !== null ? subjectGrade.midterm : '-'}
                                                            </TableCell>
                                                            <TableCell align="center" sx={{ fontFamily: 'Cairo', fontSize: '1rem', color: subjectGrade.coursework !== null ? '#FF9800' : '#ccc' }}>
                                                                {subjectGrade.coursework !== null ? subjectGrade.coursework : '-'}
                                                            </TableCell>
                                                            <TableCell align="center" sx={{ fontFamily: 'Cairo', fontSize: '1rem', color: subjectGrade.final !== null ? '#4CAF50' : '#ccc' }}>
                                                                {subjectGrade.final !== null ? subjectGrade.final : '-'}
                                                            </TableCell>
                                                        </React.Fragment>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Alert severity="info" sx={{ fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem' }}>
                                    لا يوجد طلاب في هذه الفرقة
                                </Alert>
                            )}

                            <Alert severity="info" sx={{ mt: 3, fontFamily: 'Cairo', borderRadius: 3, fontSize: '1rem' }}>
                                <strong>ملاحظة:</strong> الدرجات للقراءة فقط - يتم إدخالها من قبل الدكاترة
                            </Alert>
                        </Paper>
                    </Grow>
                )}
            </Container>
        </Box>
    );
}
