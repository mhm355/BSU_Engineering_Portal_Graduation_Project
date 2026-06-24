import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Alert, CircularProgress,
    Avatar, Chip, Grid, Card, CardContent, LinearProgress, Fade, Grow, IconButton
} from '@mui/material';
import { keyframes } from '@mui/system';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SchoolIcon from '@mui/icons-material/School';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

export default function StudentAttendance() {
    const navigate = useNavigate();
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const response = await axios.get('/api/academic/attendance/', { withCredentials: true });
            setAttendance(response.data);
        } catch (err) {
            console.error('Error fetching attendance:', err);
            setError('فشل تحميل سجل الحضور. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    // Calculate statistics
    const stats = {
        total: attendance.length,
        present: attendance.filter(r => r.status === 'PRESENT').length,
        absent: attendance.filter(r => r.status === 'ABSENT').length,
        percentage: attendance.length > 0
            ? Math.round((attendance.filter(r => r.status === 'PRESENT').length / attendance.length) * 100)
            : 0
    };

    // Group by course
    const courseGroups = attendance.reduce((acc, record) => {
        const course = record.course_name || 'غير محدد';
        if (!acc[course]) {
            acc[course] = { present: 0, absent: 0, records: [] };
        }
        acc[course].records.push(record);
        if (record.status === 'PRESENT') {
            acc[course].present++;
        } else {
            acc[course].absent++;
        }
        return acc;
    }, {});

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress size={60} />
        </Box>
    );

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
            {/* Hero Header */}
            <Box sx={{
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
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
                                    <EventAvailableIcon sx={{ fontSize: 35 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                        سجل الحضور والغياب
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', opacity: 0.9 }}>
                                        متابعة حضورك في جميع المقررات
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
                    <Grid item xs={6} md={3}>
                        <Grow in={true} timeout={400}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                                <Avatar sx={{ width: 50, height: 50, bgcolor: '#e3f2fd', mx: 'auto', mb: 1 }}>
                                    <CalendarTodayIcon sx={{ color: '#1976d2' }} />
                                </Avatar>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{stats.total}</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>إجمالي الجلسات</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Grow in={true} timeout={600}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                                <Avatar sx={{ width: 50, height: 50, bgcolor: '#e8f5e9', mx: 'auto', mb: 1 }}>
                                    <CheckCircleIcon sx={{ color: '#4CAF50' }} />
                                </Avatar>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#4CAF50' }}>{stats.present}</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>حضور</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Grow in={true} timeout={800}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                                <Avatar sx={{ width: 50, height: 50, bgcolor: '#ffebee', mx: 'auto', mb: 1 }}>
                                    <CancelIcon sx={{ color: '#f44336' }} />
                                </Avatar>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#f44336' }}>{stats.absent}</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>غياب</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Grow in={true} timeout={1000}>
                            <Paper elevation={0} sx={{
                                p: 3,
                                borderRadius: 4,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                textAlign: 'center',
                                border: stats.percentage < 75 ? '2px solid #f44336' : '2px solid #4CAF50'
                            }}>
                                <Avatar sx={{
                                    width: 50,
                                    height: 50,
                                    bgcolor: stats.percentage >= 75 ? '#e8f5e9' : '#ffebee',
                                    mx: 'auto',
                                    mb: 1
                                }}>
                                    <TrendingUpIcon sx={{ color: stats.percentage >= 75 ? '#4CAF50' : '#f44336' }} />
                                </Avatar>
                                <Typography variant="h4" sx={{
                                    fontFamily: 'Cairo',
                                    fontWeight: 'bold',
                                    color: stats.percentage >= 75 ? '#4CAF50' : '#f44336'
                                }}>
                                    {stats.percentage}%
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>نسبة الحضور</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>

                {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3 }}>{error}</Alert>}

                {/* Course Summary Cards */}
                {Object.keys(courseGroups).length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 2, color: '#1a2744' }}>
                            ملخص حسب المادة
                        </Typography>
                        <Grid container spacing={3}>
                            {Object.entries(courseGroups).map(([course, data], idx) => {
                                const percentage = Math.round((data.present / (data.present + data.absent)) * 100);
                                const color = percentage >= 75 ? '#4CAF50' : percentage >= 50 ? '#FF9800' : '#f44336';
                                return (
                                    <Grid item xs={12} sm={6} md={4} key={course}>
                                        <Grow in={true} timeout={300 + idx * 100}>
                                            <Card sx={{
                                                borderRadius: 4,
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                                border: `2px solid ${color}30`
                                            }}>
                                                <CardContent>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                        <Avatar sx={{ bgcolor: `${color}20` }}>
                                                            <SchoolIcon sx={{ color }} />
                                                        </Avatar>
                                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                                            {course}
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{ mb: 2 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>نسبة الحضور</Typography>
                                                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color }}>{percentage}%</Typography>
                                                        </Box>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={percentage}
                                                            sx={{
                                                                height: 10,
                                                                borderRadius: 5,
                                                                bgcolor: '#e0e0e0',
                                                                '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 5 }
                                                            }}
                                                        />
                                                    </Box>

                                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                                        <Chip
                                                            icon={<CheckCircleIcon />}
                                                            label={`${data.present} حضور`}
                                                            size="small"
                                                            sx={{ bgcolor: '#e8f5e9', color: '#4CAF50', fontFamily: 'Cairo' }}
                                                        />
                                                        <Chip
                                                            icon={<CancelIcon />}
                                                            label={`${data.absent} غياب`}
                                                            size="small"
                                                            sx={{ bgcolor: '#ffebee', color: '#f44336', fontFamily: 'Cairo' }}
                                                        />
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grow>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Box>
                )}

                {/* Attendance Table */}
                <Paper elevation={0} sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    <Box sx={{ p: 3, bgcolor: '#fafafa', borderBottom: '1px solid #eee' }}>
                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                            سجل الحضور التفصيلي
                        </Typography>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'right' }}>المادة</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'right' }}>التاريخ</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center' }}>الحالة</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {attendance.length > 0 ? (
                                    attendance.map((record) => (
                                        <TableRow key={record.id} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                                            <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#e3f2fd' }}>
                                                        <SchoolIcon sx={{ fontSize: 18, color: '#1976d2' }} />
                                                    </Avatar>
                                                    {record.course_name || 'غير محدد'}
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>
                                                {new Date(record.date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <Chip
                                                    icon={record.status === 'PRESENT' ? <CheckCircleIcon /> : <CancelIcon />}
                                                    label={record.status === 'PRESENT' ? 'حاضر' : 'غائب'}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: record.status === 'PRESENT' ? '#e8f5e9' : '#ffebee',
                                                        color: record.status === 'PRESENT' ? '#4CAF50' : '#f44336',
                                                        fontFamily: 'Cairo',
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} sx={{ textAlign: 'center', py: 6 }}>
                                            <EventAvailableIcon sx={{ fontSize: 60, color: '#ddd', mb: 1 }} />
                                            <Typography sx={{ fontFamily: 'Cairo', color: '#999' }}>
                                                لا توجد سجلات حضور متاحة حالياً
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Container>
        </Box>
    );
}
