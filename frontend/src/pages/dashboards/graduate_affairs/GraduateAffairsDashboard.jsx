import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Grid, Card, CardContent, Avatar, Paper, Fade, Grow, IconButton, CircularProgress
} from '@mui/material';
import { keyframes } from '@mui/system';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CampaignIcon from '@mui/icons-material/Campaign';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import WorkIcon from '@mui/icons-material/Work';
import EventIcon from '@mui/icons-material/Event';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import DashboardCard from '../../../components/DashboardCard';

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

export default function GraduateAffairsDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else if (user.role !== 'GRADUATE_AFFAIRS' && user.role !== 'ADMIN') {
            navigate('/');
        }
    }, [user, navigate]);

    if (!user) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    const [stats, setStats] = useState({ 
        graduates: 0, 
        pendingRequests: 0, 
        certificates: 0, 
        clearances: 0 
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const config = { withCredentials: true };
                const res = await axios.get('/api/graduate-affairs/stats/', config);
                const data = res.data;
                
                setStats({
                    graduates: data.total_graduates || 0,
                    pendingRequests: data.pending_requests || 0,
                    certificates: data.total_certificates || 0,
                    clearances: data.completed_clearances || 0,
                });
            } catch (error) {
                console.error("Failed to fetch graduate affairs stats:", error);
            }
        };
        fetchStats();
    }, []);

    const navigationCards = [
        {
            icon: PeopleIcon,
            title: 'قاعدة بيانات الخريجين',
            description: 'تصفح بيانات جميع خريجي الكلية',
            buttonText: 'قاعدة البيانات',
            onClick: () => navigate('/graduate-affairs/graduates'),
            color: 'primary',
        },
        {
            icon: EmojiEventsIcon,
            title: 'الشهادات',
            description: 'رفع وإدارة شهادات التخرج',
            buttonText: 'الشهادات',
            onClick: () => navigate('/graduate-affairs/bulk-certificates'),
            color: 'secondary',
        },
        {
            icon: CheckCircleIcon,
            title: 'إخلاء الطرف',
            description: 'إدارة وتتبع إجراءات إخلاء الطرف للخريجين',
            buttonText: 'إخلاء الطرف',
            onClick: () => navigate('/graduate-affairs/clearance'),
            color: 'success',
        },
        {
            icon: AssignmentIcon,
            title: 'طلبات الخريجين',
            description: 'إدارة ومعالجة طلبات الإفادات وتحديث البيانات',
            buttonText: 'الطلبات',
            onClick: () => navigate('/graduate-affairs/requests'),
            color: 'warning',
        },
        {
            icon: CampaignIcon,
            title: 'الأخبار والإعلانات',
            description: 'نشر الأخبار وإعلانات التوظيف للخريجين',
            buttonText: 'الأخبار',
            onClick: () => navigate('/graduate-affairs/news'),
            color: 'error',
        },
        {
            icon: AssessmentIcon,
            title: 'التقارير والإحصائيات',
            description: 'تقارير شاملة عن أعداد الخريجين والخدمات',
            buttonText: 'التقارير',
            onClick: () => navigate('/graduate-affairs/reports'),
            color: 'info',
        },
        {
            icon: BusinessCenterIcon,
            title: 'الشركات الشريكة',
            description: 'إدارة بيانات الشركات وجهات التوظيف',
            buttonText: 'الشركات',
            onClick: () => navigate('/graduate-affairs/companies'),
            color: 'primary',
        },
        {
            icon: WorkIcon,
            title: 'الوظائف والتدريب',
            description: 'إدارة إعلانات الوظائف وفرص التدريب',
            buttonText: 'الوظائف',
            onClick: () => navigate('/graduate-affairs/jobs'),
            color: 'secondary',
        },
        {
            icon: EventIcon,
            title: 'الفعاليات',
            description: 'إدارة ملتقيات التوظيف والورش التدريبية',
            buttonText: 'الفعاليات',
            onClick: () => navigate('/graduate-affairs/events'),
            color: 'success',
        },
    ];

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', pb: 6 }}>
            {/* Hero Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #7B1FA2 0%, #E1BEE7 100%)',
                    pt: 2.5,
                    pb: 3,
                    mb: 2.5,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Container maxWidth="xl">
                    <Fade in={true} timeout={800}>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <Avatar
                                        src={user.profile_picture || undefined}
                                        sx={{
                                            width: 85,
                                            height: 85,
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            backdropFilter: 'blur(10px)',
                                            border: '4px solid rgba(255, 255, 255, 0.9)',
                                            boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                                            animation: `${avatarPulse} 4s ease-in-out infinite`,
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'scale(1.05) translateY(-5px)',
                                            },
                                            fontSize: 32,
                                            fontFamily: 'Cairo',
                                            fontWeight: 'bold',
                                            color: '#fff'
                                        }}
                                    >
                                        {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                                            مرحباً، {user.first_name} {user.last_name}
                                        </Typography>
                                        <Typography variant="subtitle1" sx={{ fontFamily: 'Cairo', color: 'rgba(255,255,255,0.9)' }}>
                                            لوحة تحكم شؤون الخريجين
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
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={SchoolIcon}
                            value={String(stats.graduates)}
                            label="إجمالي الخريجين"
                            color="#9C27B0"
                            delay={0}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={AssignmentIcon}
                            value={String(stats.pendingRequests)}
                            label="طلبات معلقة"
                            color="#FF9800"
                            delay={100}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={EmojiEventsIcon}
                            value={String(stats.certificates)}
                            label="الشهادات المرفوعة"
                            color="#4CAF50"
                            delay={200}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={CheckCircleIcon}
                            value={String(stats.clearances)}
                            label="إخلاء طرف مكتمل"
                            color="#2196F3"
                            delay={300}
                        />
                    </Grid>
                </Grid>

                {/* Section Title */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2.5,
                        mb: 2.5,
                        borderRadius: 4,
                        background: '#fff',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    }}
                >
                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                        الخدمات المتاحة
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                        اختر الخدمة التي تريد الوصول إليها
                    </Typography>
                </Paper>

                {/* Navigation Cards */}
                <Grid container spacing={2} direction="column">
                    {navigationCards.map((card, idx) => (
                        <Grid item xs={12} key={idx}>
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
