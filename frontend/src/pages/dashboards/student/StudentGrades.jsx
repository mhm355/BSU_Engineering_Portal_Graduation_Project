import React, { useEffect, useState, useRef } from 'react';
import {
    Box, Container, Typography, Paper, Alert, CircularProgress,
    IconButton, Chip, LinearProgress, Card, CardContent, Grid, Avatar, Fade, Grow,
    Button, Tooltip
} from '@mui/material';
import { keyframes } from '@mui/system';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GradeIcon from '@mui/icons-material/Grade';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import BarChartIcon from '@mui/icons-material/BarChart';
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
    const printRef = useRef();

    useEffect(() => {
        fetchGrades();
    }, []);

    const fetchGrades = async () => {
        try {
            const response = await axios.get('/api/academic/exam-grades/my-grades/', { withCredentials: true });
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

    const getGradeLabel = (grade) => {
        const percentage = grade.total_grade || calculateTotal(grade);
        const yearStatus = grade.year_status;
        
        // Don't show "راسب" when term is still open
        if (yearStatus === 'OPEN' && percentage < 60) {
            return 'مستمر';
        }
        
        if (percentage === null || percentage === undefined) return '-';
        if (percentage >= 90) return 'ممتاز';
        if (percentage >= 80) return 'جيد جداً';
        if (percentage >= 70) return 'جيد';
        if (percentage >= 60) return 'مقبول';
        return 'راسب';
    };

    const calculateTotal = (grade) => {
        const attendance = Number(grade.attendance_grade) || 0;
        const quizzes = Number(grade.quizzes_grade) || 0;
        const coursework = Number(grade.coursework_grade) || 0;
        const midterm = Number(grade.midterm_grade) || 0;
        const final_g = Number(grade.final_grade) || 0;
        return attendance + quizzes + coursework + midterm + final_g;
    };

    // GPA 4.0 scale conversion
    const percentageToGPA = (pct) => {
        if (pct >= 93) return 4.0;
        if (pct >= 90) return 3.7;
        if (pct >= 87) return 3.3;
        if (pct >= 83) return 3.0;
        if (pct >= 80) return 2.7;
        if (pct >= 77) return 2.3;
        if (pct >= 73) return 2.0;
        if (pct >= 70) return 1.7;
        if (pct >= 67) return 1.3;
        if (pct >= 60) return 1.0;
        return 0.0;
    };

    // Calculate statistics
    const stats = {
        totalSubjects: grades.length,
        average: grades.length > 0 ? Math.round(grades.reduce((acc, g) => acc + calculateTotal(g), 0) / grades.length) : 0,
        passed: grades.filter(g => calculateTotal(g) >= 60).length,
        excellent: grades.filter(g => calculateTotal(g) >= 90).length,
    };

    // GPA calculation
    const gpa = grades.length > 0
        ? (grades.reduce((acc, g) => acc + percentageToGPA(calculateTotal(g)), 0) / grades.length).toFixed(2)
        : '0.00';

    // Export grades as printable PDF
    const handleExportPDF = () => {
        const printContent = printRef.current;
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html dir="rtl">
            <head>
                <title>كشف الدرجات</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
                    body { font-family: 'Cairo', sans-serif; margin: 30px; direction: rtl; color: #333; }
                    h1 { text-align: center; color: #1a2744; margin-bottom: 5px; }
                    h3 { text-align: center; color: #666; margin-top: 0; margin-bottom: 25px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { border: 1px solid #ddd; padding: 10px 12px; text-align: center; font-size: 14px; }
                    th { background: #1a2744; color: #fff; }
                    tr:nth-child(even) { background: #f9f9f9; }
                    .summary { display: flex; justify-content: space-around; margin-bottom: 20px; padding: 15px; background: #f0f4ff; border-radius: 8px; }
                    .summary div { text-align: center; }
                    .summary .value { font-size: 24px; font-weight: bold; color: #1a2744; }
                    .summary .label { font-size: 13px; color: #666; }
                    @media print { body { margin: 15px; } }
                </style>
            </head>
            <body>
                <h1>كشف درجات الطالب</h1>
                <h3>كلية الهندسة - جامعة بنها</h3>
                <div class="summary">
                    <div><div class="value">${stats.totalSubjects}</div><div class="label">عدد المواد</div></div>
                    <div><div class="value">${stats.average}%</div><div class="label">المعدل العام</div></div>
                    <div><div class="value">${gpa}</div><div class="label">GPA</div></div>
                    <div><div class="value">${stats.passed}</div><div class="label">مواد ناجحة</div></div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>المادة</th>
                            <th>الكود</th>
                            <th>الحضور</th>
                            <th>الكويزات</th>
                            <th>أعمال السنة</th>
                            <th>منتصف الترم</th>
                            <th>النهائي</th>
                            <th>المجموع</th>
                            <th>التقدير</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${grades.map(g => {
            const total = calculateTotal(g);
            return `<tr>
                                <td>${g.course_name || g.subject_name || '-'}</td>
                                <td>${g.course_code || g.subject_code || '-'}</td>
                                <td>${g.attendance_grade ?? '-'}</td>
                                <td>${g.quizzes_grade ?? '-'}</td>
                                <td>${g.coursework_grade ?? '-'}</td>
                                <td>${g.midterm_grade ?? '-'}</td>
                                <td>${g.final_grade ?? '-'}</td>
                                <td style="font-weight:bold">${total}</td>
                                <td>${getGradeLabel(g)}</td>
                            </tr>`;
        }).join('')}
                    </tbody>
                </table>
                <p style="text-align:center; color:#999; font-size:12px;">تم الطباعة بتاريخ ${new Date().toLocaleDateString('ar-EG')}</p>
            </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
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
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <IconButton onClick={() => navigate('/student/dashboard')} sx={{ color: '#fff' }}>
                                    <ArrowBackIcon />
                                </IconButton>
                                <Button
                                    variant="outlined"
                                    startIcon={<PictureAsPdfIcon />}
                                    onClick={handleExportPDF}
                                    disabled={grades.length === 0}
                                    sx={{
                                        color: '#fff',
                                        borderColor: 'rgba(255,255,255,0.5)',
                                        fontFamily: 'Cairo',
                                        fontWeight: 'bold',
                                        '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' },
                                    }}
                                >
                                    تصدير PDF
                                </Button>
                            </Box>
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

            <Container maxWidth="lg" sx={{ mt: -3, pb: 6 }} ref={printRef}>
                {/* Stats Cards — now with GPA */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={6} md={2.4}>
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
                    <Grid item xs={6} md={2.4}>
                        <Grow in={true} timeout={500}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                                <Avatar sx={{ width: 50, height: 50, bgcolor: '#e8f5e9', mx: 'auto', mb: 1 }}>
                                    <TrendingUpIcon sx={{ color: '#4CAF50' }} />
                                </Avatar>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: getGradeColor(stats.average) }}>{stats.average}%</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>المعدل العام</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={6} md={2.4}>
                        <Grow in={true} timeout={600}>
                            <Paper elevation={0} sx={{
                                p: 3, borderRadius: 4,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, #667eea10, #764ba210)',
                                border: '2px solid #667eea30',
                            }}>
                                <Avatar sx={{ width: 50, height: 50, bgcolor: '#ede7f6', mx: 'auto', mb: 1 }}>
                                    <BarChartIcon sx={{ color: '#673ab7' }} />
                                </Avatar>
                                <Tooltip title="Grade Point Average (4.0 scale)">
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#673ab7' }}>{gpa}</Typography>
                                </Tooltip>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>GPA</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={6} md={2.4}>
                        <Grow in={true} timeout={700}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                                <Avatar sx={{ width: 50, height: 50, bgcolor: '#fff3e0', mx: 'auto', mb: 1 }}>
                                    <CheckCircleIcon sx={{ color: '#FF9800' }} />
                                </Avatar>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{stats.passed}</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>مواد ناجحة</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={6} md={2.4}>
                        <Grow in={true} timeout={800}>
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

                {/* Grade Trend Chart (CSS-only bar chart) */}
                {grades.length > 1 && (
                    <Grow in={true} timeout={900}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', mb: 4 }}>
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744', mb: 3 }}>
                                📊 مخطط الدرجات
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 200, overflowX: 'auto', pb: 1 }}>
                                {grades.map((g, idx) => {
                                    const total = calculateTotal(g);
                                    const color = getGradeColor(total);
                                    return (
                                        <Tooltip key={idx} title={`${g.course_name || g.subject_name}: ${total}%`} arrow>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 50, flex: 1 }}>
                                                <Typography variant="caption" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color, mb: 0.5 }}>
                                                    {total}%
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        width: '100%',
                                                        maxWidth: 60,
                                                        height: `${Math.max(total * 1.6, 10)}px`,
                                                        bgcolor: color,
                                                        borderRadius: '8px 8px 0 0',
                                                        transition: 'height 0.8s ease',
                                                        opacity: 0.85,
                                                        '&:hover': { opacity: 1, transform: 'scaleY(1.05)' },
                                                    }}
                                                />
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        fontFamily: 'Cairo',
                                                        fontSize: '0.6rem',
                                                        color: '#666',
                                                        mt: 0.5,
                                                        textAlign: 'center',
                                                        maxWidth: 60,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {(g.course_code || g.subject_code || '').slice(0, 8)}
                                                </Typography>
                                            </Box>
                                        </Tooltip>
                                    );
                                })}
                            </Box>
                            {/* Pass/fail line */}
                            <Box sx={{ position: 'relative', mt: -1 }}>
                                <Box sx={{
                                    position: 'absolute',
                                    bottom: `${60 * 1.6 + 30}px`,
                                    left: 0,
                                    right: 0,
                                    borderTop: '2px dashed #ff980050',
                                }} />
                            </Box>
                        </Paper>
                    </Grow>
                )}

                {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3 }} onClose={() => setError('')}>{error}</Alert>}

                {/* Grades List */}
                {grades.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {grades.map((grade, idx) => {
                            const total = calculateTotal(grade);
                            const color = getGradeColor(total);
                            const courseGPA = percentageToGPA(total);
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
                                                        label={getGradeLabel(grade)}
                                                        sx={{ bgcolor: `${color}20`, color, fontFamily: 'Cairo', fontWeight: 'bold' }}
                                                    />
                                                    <Tooltip title={`GPA: ${courseGPA}`}>
                                                        <Chip
                                                            label={`GPA ${courseGPA}`}
                                                            size="small"
                                                            sx={{ bgcolor: '#ede7f6', color: '#673ab7', fontFamily: 'Cairo', fontWeight: 'bold' }}
                                                        />
                                                    </Tooltip>
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
                                                <Grid item xs={6} sm={4} md={3}>
                                                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fafafa', borderRadius: 3 }}>
                                                        <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666', mb: 0.5 }}>الحضور</Typography>
                                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                                            {grade.attendance_grade ?? '--'}/{grade.attendance_weight || 10}
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                                <Grid item xs={6} sm={4} md={3}>
                                                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fafafa', borderRadius: 3 }}>
                                                        <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666', mb: 0.5 }}>الكويزات</Typography>
                                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                                            {grade.quizzes_grade ?? '--'}/{grade.quizzes_weight || 10}
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                                <Grid item xs={6} sm={4} md={3}>
                                                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fafafa', borderRadius: 3 }}>
                                                        <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666', mb: 0.5 }}>أعمال السنة</Typography>
                                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                                            {grade.coursework_grade ?? '--'}/{grade.coursework_weight || 10}
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                                <Grid item xs={6} sm={4} md={3}>
                                                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0', borderRadius: 3 }}>
                                                        <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666', mb: 0.5 }}>منتصف الترم</Typography>
                                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#FF9800' }}>
                                                            {grade.midterm_grade ?? '--'}/{grade.midterm_weight || 20}
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
