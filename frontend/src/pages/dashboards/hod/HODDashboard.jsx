import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Grid, Avatar, Fade, Grow, IconButton, Paper
} from '@mui/material';
import { keyframes } from '@mui/system';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardCard from '../../../components/DashboardCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';

// Animations
const avatarPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4), 0 8px 25px rgba(0,0,0,0.2); transform: translateY(0px); }
  50% { box-shadow: 0 0 0 15px rgba(255, 255, 255, 0), 0 12px 30px rgba(0,0,0,0.3); transform: translateY(-4px); }
  100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0), 0 8px 25px rgba(0,0,0,0.2); transform: translateY(0px); }
`;

export default function HODDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else if (user.role !== 'HOD' && user.role !== 'ADMIN') {
            navigate('/');
        }
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    const navigationCards = [
        {
            icon: PersonAddIcon,
            title: 'تعيين الدكاترة',
            description: 'إسناد المقررات الدراسية لأعضاء هيئة التدريس بالقسم',
            buttonText: 'إدارة التعيينات',
            onClick: () => navigate('/hod/assign-doctors'),
            color: 'primary',
        },
        {
            icon: SettingsApplicationsIcon,
            title: 'قوالب الدرجات',
            description: 'إدارة وتخصيص قوالب توزيع الدرجات لمقررات القسم',
            buttonText: 'إدارة القوالب',
            onClick: () => navigate('/hod/grading-templates'),
            color: 'secondary',
        },
    ];

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', pb: 6 }}>
            {/* Hero Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #0288D1 0%, #03A9F4 100%)',
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
                                        مرحباً، رئيس القسم
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
