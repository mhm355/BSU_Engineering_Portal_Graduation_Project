import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Paper, Grid, Card, CardContent,
    CircularProgress, Alert, Avatar, Chip, Fade, Grow, IconButton
} from '@mui/material';
import { keyframes } from '@mui/system';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TodayIcon from '@mui/icons-material/Today';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

export default function StudentExams() {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const response = await axios.get('/api/academic/exams/', { withCredentials: true });
            setExams(response.data);
        } catch (err) {
            console.error('Error fetching exams:', err);
            setError('فشل تحميل جدول الامتحانات.');
        } finally {
            setLoading(false);
        }
    };

    const getExamStatus = (examDate) => {
        const today = new Date();
        const exam = new Date(examDate);
        const diffDays = Math.ceil((exam - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { label: 'انتهى', color: '#9e9e9e', urgent: false };
        if (diffDays === 0) return { label: 'اليوم!', color: '#f44336', urgent: true };
        if (diffDays <= 3) return { label: `${diffDays} أيام`, color: '#ff9800', urgent: true };
        if (diffDays <= 7) return { label: `${diffDays} أيام`, color: '#2196f3', urgent: false };
        return { label: `${diffDays} يوم`, color: '#4caf50', urgent: false };
    };

    const upcomingExams = exams.filter(e => new Date(e.date) >= new Date());
    const todayExams = exams.filter(e => {
        const today = new Date().toDateString();
        return new Date(e.date).toDateString() === today;
    });

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress size={60} />
        </Box>
    );

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
            {/* Hero Header */}
            <Box sx={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
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
                                    <CalendarMonthIcon sx={{ fontSize: 35 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                        جدول الامتحانات
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', opacity: 0.9 }}>
                                        استعرض مواعيد امتحاناتك القادمة
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mt: -3, pb: 6 }}>
                {/* Stats Row */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={6} md={4}>
                        <Grow in={true} timeout={400}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                                <Avatar sx={{ width: 50, height: 50, bgcolor: '#e3f2fd', mx: 'auto', mb: 1 }}>
                                    <AssignmentIcon sx={{ color: '#1976d2' }} />
                                </Avatar>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{exams.length}</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>إجمالي الامتحانات</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={6} md={4}>
                        <Grow in={true} timeout={600}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                                <Avatar sx={{ width: 50, height: 50, bgcolor: '#fff3e0', mx: 'auto', mb: 1 }}>
                                    <ScheduleIcon sx={{ color: '#FF9800' }} />
                                </Avatar>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{upcomingExams.length}</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>امتحانات قادمة</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Grow in={true} timeout={800}>
                            <Paper elevation={0} sx={{
                                p: 3,
                                borderRadius: 4,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                textAlign: 'center',
                                animation: todayExams.length > 0 ? `${pulse} 2s ease-in-out infinite` : 'none',
                                border: todayExams.length > 0 ? '2px solid #f44336' : 'none'
                            }}>
                                <Avatar sx={{ width: 50, height: 50, bgcolor: todayExams.length > 0 ? '#ffebee' : '#e8f5e9', mx: 'auto', mb: 1 }}>
                                    <TodayIcon sx={{ color: todayExams.length > 0 ? '#f44336' : '#4CAF50' }} />
                                </Avatar>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: todayExams.length > 0 ? '#f44336' : 'inherit' }}>
                                    {todayExams.length}
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>امتحانات اليوم</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>

                {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3 }}>{error}</Alert>}

                {/* Exams Grid */}
                {exams.length === 0 ? (
                    <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <CalendarMonthIcon sx={{ fontSize: 80, color: '#ddd', mb: 2 }} />
                        <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#666', mb: 1 }}>
                            لا توجد امتحانات مجدولة حالياً
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#999' }}>
                            سيظهر جدول الامتحانات هنا عند إضافته
                        </Typography>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {exams.map((exam, idx) => {
                            const status = getExamStatus(exam.date);
                            return (
                                <Grid item xs={12} md={6} lg={4} key={exam.id}>
                                    <Grow in={true} timeout={300 + idx * 100}>
                                        <Card sx={{
                                            height: '100%',
                                            borderRadius: 4,
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                            transition: 'all 0.3s',
                                            border: status.urgent ? `2px solid ${status.color}` : '2px solid transparent',
                                            animation: status.urgent ? `${pulse} 3s ease-in-out infinite` : 'none',
                                            '&:hover': {
                                                transform: 'translateY(-5px)',
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                                            }
                                        }}>
                                            {/* Status Header */}
                                            <Box sx={{
                                                p: 2,
                                                background: `linear-gradient(135deg, ${status.color}20, ${status.color}05)`,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <Avatar sx={{ bgcolor: `${status.color}20` }}>
                                                    <EventIcon sx={{ color: status.color }} />
                                                </Avatar>
                                                <Chip
                                                    label={status.label}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: `${status.color}20`,
                                                        color: status.color,
                                                        fontFamily: 'Cairo',
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                            </Box>

                                            <CardContent sx={{ p: 3 }}>
                                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744', mb: 2 }}>
                                                    {exam.course_name}
                                                </Typography>

                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#666' }}>
                                                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#e3f2fd' }}>
                                                            <EventIcon sx={{ fontSize: 18, color: '#1976d2' }} />
                                                        </Avatar>
                                                        <Typography sx={{ fontFamily: 'Cairo' }}>
                                                            {new Date(exam.date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#666' }}>
                                                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#fff3e0' }}>
                                                            <AccessTimeIcon sx={{ fontSize: 18, color: '#FF9800' }} />
                                                        </Avatar>
                                                        <Typography sx={{ fontFamily: 'Cairo' }}>
                                                            {exam.start_time} ({exam.duration_minutes} دقيقة)
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#666' }}>
                                                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#e8f5e9' }}>
                                                            <LocationOnIcon sx={{ fontSize: 18, color: '#4CAF50' }} />
                                                        </Avatar>
                                                        <Typography sx={{ fontFamily: 'Cairo' }}>
                                                            {exam.location}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grow>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </Container>
        </Box>
    );
}
