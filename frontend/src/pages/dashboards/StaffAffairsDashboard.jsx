import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, Box, Card, CardContent, CardActionArea,
    Avatar, Grid, Fade, Grow, CircularProgress
} from '@mui/material';
import { keyframes } from '@mui/system';
import {
    Person as DoctorIcon,
    People as PeopleIcon,
    Assignment as AssignmentIcon,
    School as SchoolIcon,
    ManageAccounts as ManageAccountsIcon,
    CloudUpload as UploadIcon,
    AccountCircle as AccountCircleIcon,
    TrendingUp as TrendingUpIcon,
    Groups as GroupsIcon,
    Badge as BadgeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const StaffAffairsDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [doctorCount, setDoctorCount] = useState(0);
    const [assignmentCount, setAssignmentCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [doctorsRes, assignmentsRes] = await Promise.all([
                axios.get('/api/academic/staff-affairs/doctors/', config).catch(() => ({ data: [] })),
                axios.get('/api/academic/staff-affairs/assignments/', config).catch(() => ({ data: [] }))
            ]);
            setDoctorCount(doctorsRes.data.length);
            setAssignmentCount(assignmentsRes.data.length);
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const dashboardCards = [
        {
            title: 'رفع الدكاترة',
            description: 'رفع ملف Excel للدكاترة الجدد',
            icon: <UploadIcon sx={{ fontSize: 40 }} />,
            gradient: 'linear-gradient(135deg, #1976d2, #42a5f5)',
            path: '/staff-affairs/upload-doctors',
        },
        {
            title: 'إدارة الأعضاء',
            description: 'تعديل، حذف، إعادة تعيين كلمة المرور',
            icon: <ManageAccountsIcon sx={{ fontSize: 40 }} />,
            gradient: 'linear-gradient(135deg, #d32f2f, #ef5350)',
            path: '/staff-affairs/manage-doctors',
        },
        {
            title: 'تعيين الدكاترة',
            description: 'تعيين دكتور لمادة معينة',
            icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
            gradient: 'linear-gradient(135deg, #ed6c02, #ff9800)',
            path: '/staff-affairs/assign-doctors',
        },
        {
            title: 'عرض الدكاترة',
            description: 'عرض قائمة الدكاترة المسجلين',
            icon: <PeopleIcon sx={{ fontSize: 40 }} />,
            gradient: 'linear-gradient(135deg, #9c27b0, #ba68c8)',
            path: '/staff-affairs/view-users',
        },
        {
            title: 'الهيكل الأكاديمي',
            description: 'عرض الأقسام والفرق والمواد',
            icon: <SchoolIcon sx={{ fontSize: 40 }} />,
            gradient: 'linear-gradient(135deg, #0288d1, #03a9f4)',
            path: '/staff-affairs/academic-structure',
        },
    ];

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', pb: 6 }}>
            {/* Hero Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    pt: 4,
                    pb: 6,
                    mb: 4,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', animation: `${float} 6s ease-in-out infinite` }} />
                <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', animation: `${float} 8s ease-in-out infinite`, animationDelay: '2s' }} />
                <Box sx={{ position: 'absolute', top: 100, left: '50%', width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', animation: `${float} 7s ease-in-out infinite`, animationDelay: '1s' }} />

                <Container maxWidth="lg">
                    <Fade in={true} timeout={800}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Avatar
                                sx={{
                                    width: 90,
                                    height: 90,
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(10px)',
                                    border: '3px solid rgba(255,255,255,0.3)',
                                }}
                            >
                                <AccountCircleIcon sx={{ fontSize: 55, color: '#fff' }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                    مرحباً، {user.first_name || 'شئون العاملين'}
                                </Typography>
                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: 'rgba(255,255,255,0.9)' }}>
                                    لوحة تحكم شئون العاملين - إدارة الدكاترة والموظفين
                                </Typography>
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Container maxWidth="lg">
                {/* Stats Row */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Grow in={true} timeout={400}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ width: 60, height: 60, borderRadius: 3, background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <BadgeIcon sx={{ fontSize: 30, color: '#fff' }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                        {loading ? <CircularProgress size={24} /> : doctorCount}
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>عدد الدكاترة</Typography>
                                </Box>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Grow in={true} timeout={500}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ width: 60, height: 60, borderRadius: 3, background: 'linear-gradient(135deg, #ed6c02, #ff9800)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <AssignmentIcon sx={{ fontSize: 30, color: '#fff' }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                        {loading ? <CircularProgress size={24} /> : assignmentCount}
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>التعيينات</Typography>
                                </Box>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Grow in={true} timeout={600}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ width: 60, height: 60, borderRadius: 3, background: 'linear-gradient(135deg, #4CAF50, #8BC34A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <TrendingUpIcon sx={{ fontSize: 30, color: '#fff' }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>5</Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>الأقسام</Typography>
                                </Box>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Grow in={true} timeout={700}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ width: 60, height: 60, borderRadius: 3, background: 'linear-gradient(135deg, #9c27b0, #ba68c8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <GroupsIcon sx={{ fontSize: 30, color: '#fff' }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>2</Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>التخصصات</Typography>
                                </Box>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>

                {/* Navigation Cards */}
                <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744', mb: 3 }}>
                    الإجراءات السريعة
                </Typography>
                <Grid container spacing={3}>
                    {dashboardCards.map((card, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Grow in={true} timeout={400 + index * 100}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        height: '100%',
                                        borderRadius: 4,
                                        boxShadow: '0 4px 25px rgba(0,0,0,0.08)',
                                        transition: 'all 0.3s ease',
                                        overflow: 'hidden',
                                        border: '2px solid transparent',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: '0 15px 40px rgba(0,0,0,0.15)',
                                            borderColor: '#667eea',
                                        },
                                    }}
                                >
                                    <CardActionArea onClick={() => navigate(card.path)} sx={{ height: '100%' }}>
                                        <Box sx={{ height: 8, background: card.gradient }} />
                                        <CardContent sx={{ p: 4 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                <Avatar sx={{ width: 65, height: 65, background: card.gradient, boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }}>
                                                    {card.icon}
                                                </Avatar>
                                                <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                                    {card.title}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666', lineHeight: 1.7 }}>
                                                {card.description}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grow>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default StaffAffairsDashboard;
