import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Grid, Avatar, Fade, Grow, IconButton, Paper
} from '@mui/material';
import { keyframes } from '@mui/system';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import DashboardCard from '../../../components/DashboardCard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SchoolIcon from '@mui/icons-material/School';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';

// Animations
const avatarPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4), 0 8px 25px rgba(0,0,0,0.2); transform: translateY(0px); }
  50% { box-shadow: 0 0 0 15px rgba(255, 255, 255, 0), 0 12px 30px rgba(0,0,0,0.3); transform: translateY(-4px); }
  100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0), 0 8px 25px rgba(0,0,0,0.2); transform: translateY(0px); }
`;

// Stats Card Component
const StatCard = ({ icon: Icon, value, label, color, delay = 0 }) => (
    <Grow in={true} timeout={800 + delay}>
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 4,
                background: '#fff',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.06)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 20px 40px ${color}25`,
                }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 8px 24px ${color}40`,
                    }}
                >
                    <Icon sx={{ fontSize: 28, color: '#fff' }} />
                </Box>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a2744', fontFamily: 'Cairo', lineHeight: 1 }}>
                        {value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Cairo' }}>
                        {label}
                    </Typography>
                </Box>
            </Box>
        </Paper>
    </Grow>
);

export default function DeanDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        students: 0,
        doctors: 0,
        staff_affairs: 0,
        student_affairs: 0,
        hods: 0,
        graduate_affairs: 0,
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else if (user.role !== 'DEAN' && user.role !== 'ADMIN') {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { 
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true 
                };
                // Using existing admin users endpoint since DEAN might have access or we can create a quick count endpoint.
                // Assuming we have /api/academic/admin/users/ or similar, but for now we'll mock or try to fetch.
                // It's better to request the admin users endpoint if Dean has access.
                const res = await axios.get('/api/auth/users/', config);
                const users = res.data;
                const usersList = Array.isArray(users) ? users : (users.results || []);
                setStats({
                    students: usersList.filter(u => u.role === 'STUDENT').length,
                    doctors: usersList.filter(u => u.role === 'DOCTOR').length,
                    staff_affairs: usersList.filter(u => u.role === 'STAFF_AFFAIRS').length,
                    student_affairs: usersList.filter(u => u.role === 'STUDENT_AFFAIRS').length,
                    hods: usersList.filter(u => u.role === 'HOD').length,
                    graduate_affairs: usersList.filter(u => u.role === 'GRADUATE_AFFAIRS').length,
                });
            } catch (err) {
                console.error("Failed to fetch user stats", err);
            }
        };
        fetchStats();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    const navigationCards = [
        {
            icon: AssessmentIcon,
            title: 'نشر النتائج',
            description: 'إدارة نشر نتائج الامتحانات للطلاب',
            buttonText: 'نشر النتائج',
            onClick: () => navigate('/dean/publish-results'),
            color: 'primary',
        },
        {
            icon: SchoolIcon, // Use a suitable icon like FileDownload
            title: 'تصدير البيانات',
            description: 'تصدير بيانات الأعوام والفصول المغلقة',
            buttonText: 'تصدير',
            onClick: () => navigate('/dean/export-data'),
            color: 'success',
        },
    ];

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', pb: 6 }}>
            {/* Hero Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #1A237E 0%, #3949AB 100%)',
                    pt: 4,
                    pb: 6,
                    mb: 4,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Container maxWidth="xl">
                    <Fade in={true} timeout={800}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <IconButton
                                    onClick={() => navigate('/')}
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        color: '#fff',
                                        width: 50,
                                        height: 50,
                                        mr: 2,
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                                    }}
                                >
                                    <ArrowBackIcon />
                                </IconButton>
                                <Avatar
                                    src={user.profile_picture || undefined}
                                    sx={{
                                        width: 90,
                                        height: 90,
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        backdropFilter: 'blur(10px)',
                                        border: '4px solid rgba(255, 255, 255, 0.9)',
                                        boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                                        animation: `${avatarPulse} 4s ease-in-out infinite`,
                                        fontSize: 35,
                                        fontFamily: 'Cairo',
                                        fontWeight: 'bold',
                                        color: '#fff'
                                    }}
                                >
                                    {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                                        مرحباً، عميد الكلية
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: 'rgba(255,255,255,0.9)' }}>
                                        {user.first_name} {user.last_name}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton
                                    onClick={() => navigate('/profile')}
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.15)',
                                        color: '#fff',
                                        width: 50,
                                        height: 50,
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                                    }}
                                >
                                    <SettingsIcon />
                                </IconButton>
                                <IconButton
                                    onClick={handleLogout}
                                    sx={{
                                        bgcolor: 'rgba(211,47,47,0.2)',
                                        color: '#fff',
                                        width: 50,
                                        height: 50,
                                        '&:hover': { bgcolor: 'rgba(211,47,47,0.4)' }
                                    }}
                                >
                                    <LogoutIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Container maxWidth="xl">
                {/* Stats Row */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={2}>
                        <StatCard icon={SchoolIcon} value={stats.students} label="الطلاب" color="#2196F3" delay={0} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <StatCard icon={PersonIcon} value={stats.doctors} label="أعضاء هيئة التدريس" color="#4CAF50" delay={100} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <StatCard icon={PeopleIcon} value={stats.hods} label="رؤساء الأقسام" color="#FF9800" delay={200} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <StatCard icon={PeopleIcon} value={stats.student_affairs} label="شؤون الطلاب" color="#9C27B0" delay={300} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <StatCard icon={PeopleIcon} value={stats.staff_affairs} label="شؤون العاملين" color="#f44336" delay={400} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <StatCard icon={PeopleIcon} value={stats.graduate_affairs} label="شؤون الخريجين" color="#00BCD4" delay={500} />
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                    {navigationCards.map((card, idx) => (
                        <Grid item xs={12} md={6} key={idx}>
                            <DashboardCard
                                icon={card.icon}
                                title={card.title}
                                description={card.description}
                                buttonText={card.buttonText}
                                onClick={card.onClick}
                                color={card.color}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
