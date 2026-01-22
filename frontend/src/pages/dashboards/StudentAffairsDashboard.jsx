import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Grid, Card, CardContent, Button, Avatar, Paper, Fade, Grow, IconButton
} from '@mui/material';
import { keyframes } from '@mui/system';
import PeopleIcon from '@mui/icons-material/People';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import GradingIcon from '@mui/icons-material/Grading';
import SchoolIcon from '@mui/icons-material/School';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CampaignIcon from '@mui/icons-material/Campaign';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

// Navigation Card Component
const NavCard = ({ icon: Icon, title, description, onClick, gradient, delay = 0 }) => (
    <Grow in={true} timeout={800 + delay}>
        <Card
            onClick={onClick}
            sx={{
                height: '100%',
                borderRadius: 4,
                background: '#fff',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.06)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                    '& .nav-icon': {
                        transform: 'scale(1.1) rotate(5deg)',
                    },
                    '& .nav-arrow': {
                        opacity: 1,
                        transform: 'translateX(0)',
                    }
                }
            }}
        >
            {/* Gradient top bar */}
            <Box sx={{ height: 6, background: gradient }} />

            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
                    <Avatar
                        className="nav-icon"
                        sx={{
                            width: 64,
                            height: 64,
                            background: gradient,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                            transition: 'transform 0.3s ease',
                        }}
                    >
                        <Icon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744', mb: 0.5 }}>
                            {title}
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666', lineHeight: 1.5 }}>
                            {description}
                        </Typography>
                    </Box>
                    <ArrowForwardIcon
                        className="nav-arrow"
                        sx={{
                            color: '#ccc',
                            opacity: 0.5,
                            transition: 'all 0.3s ease',
                            transform: 'translateX(-10px)',
                        }}
                    />
                </Box>
            </CardContent>
        </Card>
    </Grow>
);

// Stats Card Component
const StatCard = ({ icon: Icon, value, label, color, delay = 0 }) => (
    <Grow in={true} timeout={800 + delay}>
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                borderRadius: 3,
                background: '#fff',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.06)',
                transition: 'all 0.3s ease',
                textAlign: 'center',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 15px 35px ${color}20`,
                }
            }}
        >
            <Box
                sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 2.5,
                    background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 6px 20px ${color}35`,
                    mx: 'auto',
                    mb: 1.5,
                }}
            >
                <Icon sx={{ fontSize: 26, color: '#fff' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a2744', fontFamily: 'Cairo', lineHeight: 1.2 }}>
                {value}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Cairo', mt: 0.5 }}>
                {label}
            </Typography>
        </Paper>
    </Grow>
);

export default function StudentAffairsDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else if (user.role !== 'STUDENT_AFFAIRS' && user.role !== 'ADMIN') {
            navigate('/');
        }
    }, [user, navigate]);

    if (!user) return null;

    const navigationCards = [
        {
            icon: AccountTreeIcon,
            title: 'الهيكل الأكاديمي',
            description: 'تصفح الطلاب حسب القسم والسنة والفرقة الدراسية',
            path: '/student-affairs/hierarchy',
            gradient: 'linear-gradient(135deg, #2196F3, #21CBF3)',
        },
        {
            icon: UploadFileIcon,
            title: 'رفع بيانات الطلاب',
            description: 'رفع ملفات Excel/CSV لإضافة بيانات الطلاب الجدد',
            path: '/student-affairs/upload-students',
            gradient: 'linear-gradient(135deg, #FF9800, #FFD93D)',
        },
        {
            icon: EmojiEventsIcon,
            title: 'الشهادات',
            description: 'رفع وإدارة شهادات التخرج للطلاب',
            path: '/student-affairs/certificates',
            gradient: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
        },
        {
            icon: CampaignIcon,
            title: 'الأخبار والإعلانات',
            description: 'نشر الأخبار والإعلانات الهامة للطلاب',
            path: '/student-affairs/news',
            gradient: 'linear-gradient(135deg, #E91E63, #FF4081)',
        },
        {
            icon: GradingIcon,
            title: 'عرض درجات الطلاب',
            description: 'عرض درجات كل فرقة (للقراءة فقط)',
            path: '/student-affairs/grades',
            gradient: 'linear-gradient(135deg, #00BCD4, #00E5FF)',
        },
    ];

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', pb: 6 }}>
            {/* Hero Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)',
                    pt: 4,
                    pb: 6,
                    mb: 4,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Floating Elements */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                        animation: `${float} 6s ease-in-out infinite`,
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -80,
                        left: -80,
                        width: 300,
                        height: 300,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.08)',
                        animation: `${float} 8s ease-in-out infinite`,
                        animationDelay: '2s',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        top: 60,
                        left: '30%',
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.05)',
                        animation: `${float} 5s ease-in-out infinite`,
                        animationDelay: '1s',
                    }}
                />

                <Container maxWidth="xl">
                    <Fade in={true} timeout={800}>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <Avatar
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            backdropFilter: 'blur(10px)',
                                            fontSize: 32,
                                            fontFamily: 'Cairo',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                            مرحباً، {user.first_name} {user.last_name}
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: 'rgba(255,255,255,0.9)' }}>
                                            لوحة تحكم شؤون الطلاب
                                        </Typography>
                                    </Box>
                                </Box>
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
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={PeopleIcon}
                            value="5"
                            label="خدمات متاحة"
                            color="#2196F3"
                            delay={0}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={UploadFileIcon}
                            value="Excel"
                            label="رفع البيانات"
                            color="#FF9800"
                            delay={100}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={EmojiEventsIcon}
                            value="PDF"
                            label="الشهادات"
                            color="#4CAF50"
                            delay={200}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={GradingIcon}
                            value="للقراءة"
                            label="عرض الدرجات"
                            color="#00BCD4"
                            delay={300}
                        />
                    </Grid>
                </Grid>

                {/* Section Title */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: 4,
                        background: '#fff',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    }}
                >
                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                        الخدمات المتاحة
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                        اختر الخدمة التي تريد الوصول إليها
                    </Typography>
                </Paper>

                {/* Navigation Cards */}
                <Grid container spacing={3}>
                    {navigationCards.map((card, idx) => (
                        <Grid item xs={12} md={6} key={idx}>
                            <NavCard
                                icon={card.icon}
                                title={card.title}
                                description={card.description}
                                onClick={() => navigate(card.path)}
                                gradient={card.gradient}
                                delay={idx * 100}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
