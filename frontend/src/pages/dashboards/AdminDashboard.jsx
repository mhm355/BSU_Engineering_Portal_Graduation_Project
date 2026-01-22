import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    Button,
    Badge,
    Avatar,
    IconButton,
    Chip,
    Fade,
    Grow
} from '@mui/material';
import { keyframes } from '@mui/system';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DomainIcon from '@mui/icons-material/Domain';
import GroupIcon from '@mui/icons-material/Group';
import DeleteIcon from '@mui/icons-material/Delete';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GradingIcon from '@mui/icons-material/Grading';
import SchoolIcon from '@mui/icons-material/School';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

// Animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
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
                cursor: 'pointer',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 20px 40px ${color}25`,
                }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                    sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 8px 24px ${color}40`,
                    }}
                >
                    <Icon sx={{ fontSize: 30, color: '#fff' }} />
                </Box>
                <Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 'bold',
                            color: '#1a2744',
                            fontFamily: 'Cairo',
                            lineHeight: 1
                        }}
                    >
                        {value}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#666',
                            fontFamily: 'Cairo'
                        }}
                    >
                        {label}
                    </Typography>
                </Box>
            </Box>
        </Paper>
    </Grow>
);

// Navigation Card Component
const NavCard = ({ icon: Icon, title, description, buttonText, onClick, gradient, delay = 0, badge = 0 }) => (
    <Grow in={true} timeout={1000 + delay}>
        <Card
            sx={{
                height: '100%',
                borderRadius: 4,
                background: '#fff',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.06)',
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
                    '& .card-icon': {
                        transform: 'scale(1.1) rotate(5deg)',
                    },
                    '& .card-arrow': {
                        transform: 'translateX(-10px)',
                        opacity: 1,
                    },
                    '& .card-gradient': {
                        opacity: 0.08,
                    }
                }
            }}
            onClick={onClick}
        >
            {/* Gradient Overlay */}
            <Box
                className="card-gradient"
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: gradient,
                    opacity: 0.03,
                    transition: 'opacity 0.4s ease',
                }}
            />

            <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                {/* Badge */}
                {badge > 0 && (
                    <Badge
                        badgeContent={badge}
                        color="error"
                        max={99}
                        sx={{
                            position: 'absolute',
                            top: 20,
                            left: 20,
                            '& .MuiBadge-badge': {
                                animation: `${pulse} 2s infinite`,
                                fontSize: 14,
                                height: 26,
                                minWidth: 26,
                                borderRadius: 13,
                            }
                        }}
                    >
                        <Box sx={{ width: 1, height: 1 }} />
                    </Badge>
                )}

                {/* Icon */}
                <Box
                    className="card-icon"
                    sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 4,
                        background: gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                        boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
                        transition: 'transform 0.4s ease',
                    }}
                >
                    <Icon sx={{ fontSize: 40, color: '#fff' }} />
                </Box>

                {/* Title */}
                <Typography
                    variant="h5"
                    sx={{
                        fontFamily: 'Cairo',
                        fontWeight: 'bold',
                        color: '#1a2744',
                        mb: 1,
                    }}
                >
                    {title}
                </Typography>

                {/* Description */}
                <Typography
                    variant="body1"
                    sx={{
                        fontFamily: 'Cairo',
                        color: '#666',
                        mb: 3,
                        minHeight: 48,
                    }}
                >
                    {description}
                </Typography>

                {/* Button */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Button
                        variant="contained"
                        size="large"
                        sx={{
                            background: gradient,
                            fontFamily: 'Cairo',
                            fontWeight: 'bold',
                            px: 4,
                            py: 1.5,
                            borderRadius: 3,
                            textTransform: 'none',
                            fontSize: '1rem',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                            '&:hover': {
                                background: gradient,
                                boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
                            }
                        }}
                    >
                        {buttonText}
                    </Button>
                    <ArrowForwardIcon
                        className="card-arrow"
                        sx={{
                            color: '#ccc',
                            fontSize: 28,
                            transition: 'all 0.4s ease',
                            opacity: 0,
                            transform: 'translateX(0)',
                        }}
                    />
                </Box>
            </CardContent>
        </Card>
    </Grow>
);

export default function AdminDashboard() {
    const { logout } = useAuth();
    const [user, setUser] = useState(null);
    const [pendingCount, setPendingCount] = useState(0);
    const [stats, setStats] = useState({
        users: 0,
        departments: 5,
        academicYear: 'جاري التحميل...',
    });
    const [currentTime, setCurrentTime] = useState(new Date());
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            // Fetch pending count
            axios.get('/api/academic/approval/count/', { withCredentials: true })
                .then(res => setPendingCount(res.data.pending_count || 0))
                .catch(() => { });

            // Fetch current academic year
            axios.get('/api/academic/years/', { withCredentials: true })
                .then(res => {
                    const years = Array.isArray(res.data) ? res.data : (res.data?.results || []);
                    const currentYear = years.find(y => y.is_current);
                    if (currentYear) {
                        setStats(prev => ({ ...prev, academicYear: currentYear.name }));
                    } else if (years.length > 0) {
                        setStats(prev => ({ ...prev, academicYear: years[0].name }));
                    } else {
                        setStats(prev => ({ ...prev, academicYear: '-' }));
                    }
                })
                .catch(() => setStats(prev => ({ ...prev, academicYear: '-' })));
        } else {
            navigate('/login');
        }

        // Update time every second
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, [navigate]);

    if (!user) return null;

    const formatDate = (date) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('ar-EG', options);
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    };

    const navigationCards = [
        {
            icon: CalendarMonthIcon,
            title: 'الأعوام الدراسية',
            description: 'إنشاء وإدارة الأعوام الدراسية والفصول الدراسية',
            buttonText: 'إدارة الأعوام',
            onClick: () => navigate('/admin/academic-years'),
            gradient: 'linear-gradient(135deg, #11998e, #38ef7d)',
        },
        {
            icon: GradingIcon,
            title: 'قوالب التقييم',
            description: 'تعريف توزيع الدرجات ونماذج التقييم',
            buttonText: 'إدارة القوالب',
            onClick: () => navigate('/admin/grading-templates'),
            gradient: 'linear-gradient(135deg, #8E2DE2, #4A00E0)',
        },
        {
            icon: AccountTreeIcon,
            title: 'الهيكل الأكاديمي',
            description: 'استعراض الأقسام والسنوات والفرق والطلاب',
            buttonText: 'استعراض الهيكل',
            onClick: () => navigate('/admin/academic-structure'),
            gradient: 'linear-gradient(135deg, #2196F3, #21CBF3)',
        },
        {
            icon: GroupIcon,
            title: 'إدارة المستخدمين',
            description: 'شئون طلاب | شئون عاملين | أعضاء هيئة التدريس',
            buttonText: 'إدارة المستخدمين',
            onClick: () => navigate('/admin/users'),
            gradient: 'linear-gradient(135deg, #FF6B35, #F7931E)',
        },
        {
            icon: PendingActionsIcon,
            title: 'الموافقات المعلقة',
            description: 'مراجعة والموافقة على طلبات الدرجات',
            buttonText: 'عرض الطلبات',
            onClick: () => navigate('/admin/pending-approvals'),
            gradient: 'linear-gradient(135deg, #FFD93D, #FF9800)',
            badge: pendingCount,
        },
        {
            icon: DeleteIcon,
            title: 'طلبات الحذف',
            description: 'مراجعة والموافقة على طلبات حذف البيانات',
            buttonText: 'عرض الطلبات',
            onClick: () => navigate('/admin/approvals'),
            gradient: 'linear-gradient(135deg, #E53935, #FF5252)',
        },
    ];

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
                backgroundAttachment: 'fixed',
                pb: 6,
            }}
        >
            {/* Hero Section */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #0A2342 0%, #1a3a5c 50%, #2d5a87 100%)',
                    pt: 4,
                    pb: 6,
                    mb: 4,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Animated Background Elements */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -100,
                        right: -100,
                        width: 400,
                        height: 400,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
                        animation: `${float} 6s ease-in-out infinite`,
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -150,
                        left: -100,
                        width: 500,
                        height: 500,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(255, 193, 7, 0.08) 0%, transparent 70%)',
                        animation: `${float} 8s ease-in-out infinite`,
                        animationDelay: '2s',
                    }}
                />

                <Container maxWidth="xl">
                    <Fade in={true} timeout={800}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                            {/* Profile Section */}
                            <Avatar
                                src={user.profile_picture || undefined}
                                sx={{
                                    width: 100,
                                    height: 100,
                                    border: '4px solid rgba(255,255,255,0.3)',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                                    fontSize: 40,
                                    bgcolor: '#FFC107',
                                    color: '#0A2342',
                                }}
                            >
                                {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                            </Avatar>

                            <Box sx={{ flexGrow: 1 }}>
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontFamily: 'Cairo',
                                        fontWeight: 'bold',
                                        color: '#fff',
                                        textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                        mb: 0.5,
                                    }}
                                >
                                    مرحباً، {user.first_name} {user.last_name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                    <Chip
                                        icon={<AdminPanelSettingsIcon sx={{ color: '#0A2342 !important' }} />}
                                        label="مدير النظام"
                                        sx={{
                                            bgcolor: '#FFC107',
                                            color: '#0A2342',
                                            fontFamily: 'Cairo',
                                            fontWeight: 'bold',
                                            px: 1,
                                        }}
                                    />
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(255,255,255,0.8)' }}>
                                        <AccessTimeIcon sx={{ fontSize: 18 }} />
                                        <Typography variant="body2" sx={{ fontFamily: 'Cairo' }}>
                                            {formatTime(currentTime)} - {formatDate(currentTime)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Quick Actions */}
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.15)',
                                        color: '#fff',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                                    }}
                                >
                                    <Badge badgeContent={pendingCount} color="error">
                                        <NotificationsActiveIcon />
                                    </Badge>
                                </IconButton>
                                <IconButton
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.15)',
                                        color: '#fff',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                                    }}
                                    onClick={() => navigate('/profile')}
                                >
                                    <SettingsIcon />
                                </IconButton>
                                <IconButton
                                    onClick={handleLogout}
                                    sx={{
                                        bgcolor: 'rgba(211,47,47,0.2)',
                                        color: '#fff',
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
                <Grid container spacing={3} sx={{ mb: 5 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={GroupIcon}
                            value={stats.users || '∞'}
                            label="إجمالي المستخدمين"
                            color="#2196F3"
                            delay={0}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={SchoolIcon}
                            value={stats.departments}
                            label="الأقسام الأكاديمية"
                            color="#9C27B0"
                            delay={100}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={CalendarMonthIcon}
                            value={stats.academicYear}
                            label="العام الدراسي الحالي"
                            color="#00BCD4"
                            delay={200}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={PendingActionsIcon}
                            value={pendingCount}
                            label="موافقات معلقة"
                            color="#FF9800"
                            delay={300}
                        />
                    </Grid>
                </Grid>

                {/* Section Title */}
                <Box sx={{ mb: 4 }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontFamily: 'Cairo',
                            fontWeight: 'bold',
                            color: '#0A2342',
                            mb: 1,
                        }}
                    >
                        لوحة التحكم
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            fontFamily: 'Cairo',
                            color: '#666',
                        }}
                    >
                        إدارة جميع جوانب النظام الأكاديمي
                    </Typography>
                </Box>

                {/* Navigation Cards Grid */}
                <Grid container spacing={4}>
                    {navigationCards.map((card, index) => (
                        <Grid item xs={12} sm={6} lg={4} key={index}>
                            <NavCard
                                {...card}
                                delay={index * 100}
                            />
                        </Grid>
                    ))}
                </Grid>

                {/* Footer Info */}
                <Box
                    sx={{
                        mt: 6,
                        pt: 4,
                        borderTop: '1px solid rgba(0,0,0,0.1)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2,
                    }}
                >
                    <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Cairo' }}>
                        نظام بوابة كلية الهندسة - جامعة بني سويف
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Cairo' }}>
                        الإصدار 2.0.0
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
