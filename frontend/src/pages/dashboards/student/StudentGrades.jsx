import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Alert, CircularProgress,
    IconButton, Chip, LinearProgress, Card, CardContent, Grid, Avatar, Fade, Grow
} from '@mui/material';
import { keyframes } from '@mui/system';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GradeIcon from '@mui/icons-material/Grade';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

export default function StudentGrades() {
    const navigate = useNavigate();
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    useEffect(() => {
        fetchGrades();
    }, []);

    const fetchGrades = async () => {
        try {
            const response = await axios.get('/api/academic/exam-grades/my-grades/', config);
            setGrades(response.data);
        } catch (err) {
            console.error('Error fetching grades:', err);
            setError('فشل تحميل الدرجات. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    const getGradeColor = (percentage) => {
        if (percentage === null || percentage === undefined) return '#9e9e9e';
        if (percentage >= 90) return '#4caf50';
        if (percentage >= 75) return '#2196f3';
        if (percentage >= 60) return '#ff9800';
        return '#f44336';
    };

    const getGradeLabel = (percentage) => {
        if (percentage === null || percentage === undefined) return '-';
        if (percentage >= 90) return 'ممتاز';
        if (percentage >= 80) return 'جيد جداً';
        if (percentage >= 70) return 'جيد';
        if (percentage >= 60) return 'مقبول';
        return 'راسب';
    };

    const calculateTotal = (grade) => {
        const attendance = grade.attendance_grade || 0;
        const quizzes = grade.quizzes_grade || 0;
        const coursework = grade.coursework_grade || 0;
        const midterm = grade.midterm_grade || 0;
        const final = grade.final_grade || 0;
        return attendance + quizzes + coursework + midterm + final;
    };

    // Calculate statistics
    const stats = {
        totalSubjects: grades.length,
        average: grades.length > 0 ? Math.round(grades.reduce((acc, g) => acc + calculateTotal(g), 0) / grades.length) : 0,
        passed: grades.filter(g => calculateTotal(g) >= 60).length,
        excellent: grades.filter(g => calculateTotal(g) >= 90).length,
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress size={60} />
        </Box>
    );

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
            {/* Hero Header */}
            <Box sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundSize: '200% 200%',
                animation: `${shimmer} 15s ease infinite`,
                color: '#fff',
                py: 5,
                px: 3,
                borderRadius: { xs: 0, md: '0 0 40px 40px' },
            }}>
                <Container maxWidth="lg">
                    <Fade in={true} timeout={600}>
                        <Box>
                            <IconButton onClick={() => navigate('/student/dashboard')} sx={{ color: '#fff', mb: 2 }}>
                                <ArrowBackIcon />
                            </IconButton>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 60, height: 60, bgcolor: 'rgba(255,255,255,0.2)' }}>
                                    <GradeIcon sx={{ fontSize: 35 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                        نتائج الامتحانات والدرجات
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', opacity: 0.9 }}>
                                        متابعة درجاتك في جميع المواد الدراسية
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mt: -3, pb: 6 }}>
                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={6} md={3}>
                        <Grow in={true} timeout={400}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                                <Avatar sx={{ width: 50, height: 50, bgcolor: '#e3f2fd', mx: 'auto', mb: 1 }}>
                                    <SchoolIcon sx={{ color: '#1976d2' }} />
                                </Avatar>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{stats.totalSubjects}</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>إجمالي المواد</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Grow in={true} timeout={600}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                                <Avatar sx={{ width: 50, height: 50, bgcolor: '#e8f5e9', mx: 'auto', mb: 1 }}>
                                    <TrendingUpIcon sx={{ color: '#4CAF50' }} />
                                </Avatar>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: getGradeColor(stats.average) }}>{stats.average}%</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>المعدل العام</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Grow in={true} timeout={800}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                                <Avatar sx={{ width: 50, height: 50, bgcolor: '#fff3e0', mx: 'auto', mb: 1 }}>
                                    <CheckCircleIcon sx={{ color: '#FF9800' }} />
                                </Avatar>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{stats.passed}</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>مواد ناجحة</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Grow in={true} timeout={1000}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                                <Avatar sx={{ width: 50, height: 50, bgcolor: '#fce4ec', mx: 'auto', mb: 1 }}>
                                    <EmojiEventsIcon sx={{ color: '#e91e63' }} />
                                </Avatar>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{stats.excellent}</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>تقدير ممتاز</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>

                {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3 }} onClose={() => setError('')}>{error}</Alert>}

                {/* Grades List */}
                {grades.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {grades.map((grade, idx) => {
                            const total = calculateTotal(grade);
                            const color = getGradeColor(total);
                            return (
                                <Grow in={true} timeout={400 + idx * 100} key={idx}>
                                    <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'visible', border: `2px solid ${color}20` }}>
                                        <CardContent sx={{ p: 3 }}>
                                            {/* Course Header */}
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar sx={{ width: 50, height: 50, bgcolor: `${color}20` }}>
                                                        <SchoolIcon sx={{ color }} />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                                            {grade.course_name || grade.subject_name}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                                            {grade.course_code || grade.subject_code}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Chip
                                                        icon={<StarIcon />}
                                                        label={getGradeLabel(total)}
                                                        sx={{ bgcolor: `${color}20`, color, fontFamily: 'Cairo', fontWeight: 'bold' }}
                                                    />
                                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color }}>
                                                        {total}%
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Progress Bar */}
                                            <Box sx={{ mb: 3 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={Math.min(total, 100)}
                                                    sx={{
                                                        height: 12,
                                                        borderRadius: 6,
                                                        bgcolor: '#e0e0e0',
                                                        '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 6 }
                                                    }}
                                                />
                                            </Box>

                                            {/* Grade Components */}
                                            <Grid container spacing={2}>
                                                {grade.attendance_weight > 0 && (
                                                    <Grid item xs={6} sm={4} md={2.4}>
                                                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fafafa', borderRadius: 3 }}>
                                                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666', mb: 0.5 }}>الحضور</Typography>
                                                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                                                {grade.attendance_grade ?? '--'}/{grade.attendance_weight}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                )}
                                                {grade.quizzes_weight > 0 && (
                                                    <Grid item xs={6} sm={4} md={2.4}>
                                                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fafafa', borderRadius: 3 }}>
                                                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666', mb: 0.5 }}>الكويزات</Typography>
                                                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                                                {grade.quizzes_grade ?? '--'}/{grade.quizzes_weight}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                )}
                                                {grade.coursework_weight > 0 && (
                                                    <Grid item xs={6} sm={4} md={2.4}>
                                                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fafafa', borderRadius: 3 }}>
                                                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666', mb: 0.5 }}>أعمال السنة</Typography>
                                                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                                                {grade.coursework_grade ?? '--'}/{grade.coursework_weight}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                )}
                                                <Grid item xs={6} sm={4} md={2.4}>
                                                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0', borderRadius: 3 }}>
                                                        <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666', mb: 0.5 }}>منتصف الترم</Typography>
                                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#FF9800' }}>
                                                            {grade.midterm_grade ?? '--'}/{grade.midterm_weight || 20}
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                                <Grid item xs={6} sm={4} md={2.4}>
                                                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd', borderRadius: 3 }}>
                                                        <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666', mb: 0.5 }}>النهائي</Typography>
                                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1976d2' }}>
                                                            {grade.final_grade ?? '--'}/{grade.final_weight || 50}
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                </Grow>
                            );
                        })}
                    </Box>
                ) : (
                    <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <GradeIcon sx={{ fontSize: 80, color: '#ddd', mb: 2 }} />
                        <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#666', mb: 1 }}>
                            لا توجد درجات متاحة حالياً
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#999' }}>
                            ستظهر درجاتك هنا بعد أن يقوم الأساتذة برصدها
                        </Typography>
                    </Paper>
                )}
            </Container>
        </Box>
    );
}
