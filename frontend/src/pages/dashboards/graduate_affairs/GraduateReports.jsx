import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Paper, Grid, CircularProgress, Alert, useTheme, Card, CardContent
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from '@mui/material/Button';
import PeopleIcon from '@mui/icons-material/People';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function GraduateReports() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const config = { withCredentials: true };
                const res = await axios.get('/api/graduate-affairs/stats/', config);
                setStats(res.data);
                setError('');
            } catch (err) {
                setError('فشل تحميل بيانات التقارير');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon, color, gradient }) => (
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', background: gradient || 'transparent' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3, gap: 3 }}>
                <Box sx={{
                    bgcolor: gradient ? 'rgba(255,255,255,0.2)' : `${color}15`,
                    color: gradient ? '#fff' : color,
                    p: 2, borderRadius: '50%', display: 'flex'
                }}>
                    {icon}
                </Box>
                <Box>
                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: gradient ? '#fff' : 'text.primary', mb: 0.5 }}>
                        {value}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: gradient ? 'rgba(255,255,255,0.8)' : 'text.secondary', fontWeight: 'bold' }}>
                        {title}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/graduate-affairs/dashboard')}
                sx={{ mb: 3, fontFamily: 'Cairo' }}
            >
                عودة للوحة التحكم
            </Button>

            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 4 }}>
                التقارير والإحصائيات الشاملة
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo' }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>
            ) : stats ? (
                <Grid container spacing={3}>
                    {/* Core Stats */}
                    <Grid item xs={12} md={6} lg={3}>
                        <StatCard
                            title="إجمالي الخريجين"
                            value={stats.total_graduates}
                            icon={<PeopleIcon fontSize="large" />}
                            color="#2196F3"
                        />
                    </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                        <StatCard
                            title="الشهادات المصدرة"
                            value={stats.total_certificates}
                            icon={<EmojiEventsIcon fontSize="large" />}
                            color="#4CAF50"
                        />
                    </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                        <StatCard
                            title="إخلاء طرف مكتمل"
                            value={stats.completed_clearances}
                            icon={<CheckCircleIcon fontSize="large" />}
                            gradient="linear-gradient(135deg, #0ba360 0%, #3cba92 100%)"
                        />
                    </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                        <StatCard
                            title="إجمالي طلبات الخريجين"
                            value={stats.total_requests}
                            icon={<AssignmentIcon fontSize="large" />}
                            color="#9C27B0"
                        />
                    </Grid>

                    {/* Additional Breakdowns */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 3 }}>
                                تفاصيل طلبات الخريجين
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f5f5f5', borderRadius: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PendingIcon color="warning" />
                                        <Typography sx={{ fontFamily: 'Cairo' }}>طلبات قيد الانتظار</Typography>
                                    </Box>
                                    <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{stats.pending_requests}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f5f5f5', borderRadius: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CheckCircleIcon color="success" />
                                        <Typography sx={{ fontFamily: 'Cairo' }}>طلبات مكتملة</Typography>
                                    </Box>
                                    <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{stats.completed_requests}</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 3 }}>
                                إخلاء الطرف
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f5f5f5', borderRadius: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography sx={{ fontFamily: 'Cairo' }}>إجمالي إجراءات إخلاء الطرف المفتوحة</Typography>
                                    </Box>
                                    <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{stats.total_clearances}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f5f5f5', borderRadius: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography sx={{ fontFamily: 'Cairo' }}>مكتملة بالكامل</Typography>
                                    </Box>
                                    <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#4CAF50' }}>{stats.completed_clearances}</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            ) : null}
        </Container>
    );
}
