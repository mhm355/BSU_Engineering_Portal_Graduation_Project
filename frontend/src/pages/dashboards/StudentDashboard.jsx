import React, { useEffect, useState } from 'react';
import {
    Box, Container, Grid, Paper, Typography, Card, CardContent, Button, Chip, Alert,
    Divider, CircularProgress, Avatar, IconButton, LinearProgress, Fade, Grow, Tooltip
} from '@mui/material';
import { keyframes } from '@mui/system';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DownloadIcon from '@mui/icons-material/Download';
import QuizIcon from '@mui/icons-material/Quiz';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GradeIcon from '@mui/icons-material/Grade';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import StarIcon from '@mui/icons-material/Star';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import LockIcon from '@mui/icons-material/Lock';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

import DashboardCard from '../../components/DashboardCard';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

const avatarPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4), 0 8px 25px rgba(0,0,0,0.2); transform: translateY(0px); }
  50% { box-shadow: 0 0 0 15px rgba(255, 255, 255, 0), 0 12px 30px rgba(0,0,0,0.3); transform: translateY(-4px); }
  100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0), 0 8px 25px rgba(0,0,0,0.2); transform: translateY(0px); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

export default function StudentDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [studentInfo, setStudentInfo] = useState(null);
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [certificateLoading, setCertificateLoading] = useState(false);
    const [quizzes, setQuizzes] = useState([]);
    const [grades, setGrades] = useState(null);
    const [attendanceStats, setAttendanceStats] = useState({ percentage: 0, present: 0, total: 0 });
    const [news, setNews] = useState([]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Fetch student academic info from API
        const fetchStudentInfo = async () => {
            try {
                const response = await axios.get('/api/academic/student/profile/', { withCredentials: true });
                setStudentInfo({
                    level: response.data.level,
                    levelDisplay: response.data.level_display,
                    department: response.data.department,
                    departmentCode: response.data.department_code,
                    academicYear: response.data.academic_year,
                    graduationStatus: response.data.graduation_status,
                    fullName: response.data.full_name,
                    specialization: response.data.specialization,
                    hasPaidTuition: response.data.has_paid_tuition,
                });
            } catch (err) {
                console.error('Error fetching student info:', err);
                // Fallback to user data
                setStudentInfo({
                    level: null,
                    levelDisplay: 'غير محدد',
                    department: null,
                    departmentCode: null,
                    academicYear: null,
                    graduationStatus: user.graduation_status || 'PENDING',
                    fullName: `${user.first_name} ${user.last_name}`,
                    hasPaidTuition: false,
                });
            } finally {
                setLoading(false);
            }
        };

        // Fetch quizzes
        const fetchQuizzes = async () => {
            try {
                const res = await axios.get('/api/academic/student/quizzes/', { withCredentials: true });
                setQuizzes(Array.isArray(res.data) ? res.data.slice(0, 3) : []);
            } catch (err) {
                console.log('Failed to load quizzes');
            }
        };

        // Fetch grades summary
        const fetchGrades = async () => {
            try {
                const res = await axios.get('/api/academic/exam-grades/my-grades/', { withCredentials: true });
                if (res.data && res.data.length > 0) {
                    const totalGrade = res.data.reduce((acc, g) => acc + (g.grade || 0), 0);
                    const maxGrade = res.data.reduce((acc, g) => acc + (g.max_grade || 100), 0);
                    setGrades({
                        subjects: res.data.length,
                        average: Math.round((totalGrade / maxGrade) * 100),
                        data: res.data.slice(0, 4)
                    });
                }
            } catch (err) {
                console.log('Failed to load grades');
            }
        };

        // Fetch news
        const fetchNews = async () => {
            try {
                const res = await axios.get('/api/content/news/', { withCredentials: true });
                const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
                setNews(data.filter(n => n.status === 'PUBLISHED').slice(0, 5));
            } catch (err) {
                console.log('Failed to load news');
            }
        };

        fetchStudentInfo();
        fetchQuizzes();
        fetchGrades();
        fetchAttendance();
        fetchNews();
    }, [user, navigate]);

    // Fetch attendance summary
    const fetchAttendance = async () => {
        try {
            const res = await axios.get('/api/academic/attendance/', { withCredentials: true });
            const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
            const present = data.filter(r => r.status === 'PRESENT').length;
            setAttendanceStats({
                total: data.length,
                present,
                percentage: data.length > 0 ? Math.round((present / data.length) * 100) : 0,
            });
        } catch {
            // Silently fail - attendance widget is optional
        }
    };

    // Fetch certificate for fourth-year students
    useEffect(() => {
        if (studentInfo?.level === 'FOURTH') {
            setCertificateLoading(true);
            axios.get('/api/academic/certificates/', { withCredentials: true })
                .then(response => {
                    if (response.data && response.data.length > 0) {
                        setCertificate(response.data[0]);
                    }
                })
                .catch(err => console.error('Error fetching certificate:', err))
                .finally(() => setCertificateLoading(false));
        }
    }, [studentInfo]);

    if (!user) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    const isPreparatory = studentInfo?.level === 'PREPARATORY';
    const isFourthYear = studentInfo?.level === 'FOURTH';
    const hasCertificate = certificate !== null;

    const getLevelDisplay = (level) => {
        const levels = {
            'PREPARATORY': 'السنة التحضيرية',
            'FIRST': 'السنة الأولى',
            'SECOND': 'السنة الثانية',
            'THIRD': 'السنة الثالثة',
            'FOURTH': 'السنة الرابعة'
        };
        return levels[level] || level;
    };

    let quickActions = [
        {
            title: 'المواد الدراسية',
            icon: MenuBookIcon,
            description: 'عرض المقررات والمحاضرات',
            gradient: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
            path: '/student/materials',
            requiresPayment: false
        },
        {
            title: 'الغياب',
            icon: CheckCircleOutlineIcon,
            description: 'متابعة نسبة الحضور والغياب',
            gradient: 'linear-gradient(135deg, #2e7d32 0%, #81c784 100%)',
            path: '/student/attendance',
            requiresPayment: true
        },
        {
            title: 'النتائج',
            icon: AssessmentIcon,
            description: 'نتائج الامتحانات والتقييمات',
            gradient: 'linear-gradient(135deg, #ed6c02 0%, #ffb74d 100%)',
            path: '/student/results',
            requiresPayment: true
        },
        {
            title: 'الكويزات',
            icon: QuizIcon,
            description: 'الاختبارات القصيرة والتقييمات',
            gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            path: '/student/quizzes',
            requiresPayment: true
        },
    ];

    if (studentInfo?.level?.includes('الرابعة') || studentInfo?.level?.includes('fourth') || studentInfo?.graduation_status === 'APPROVED') {
        quickActions.push(
            { title: 'بوابة التدريب والتوظيف', icon: BusinessCenterIcon, description: 'فرص عمل وتدريب', path: '/student/career-portal', gradient: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)', requiresPayment: false },
            { title: 'خدمات وطلبات الخريجين', icon: AssessmentIcon, description: 'طلبات الافادة والبيانات', path: '/student/graduate-requests', gradient: 'linear-gradient(135deg, #8bc34a 0%, #aed581 100%)', requiresPayment: false }
        );
    }

    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? 'صباح الخير' : currentHour < 17 ? 'مساء الخير' : 'مساء الخير';

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
            {/* Hero Header with Gradient */}
            <Box sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%)',
                backgroundSize: '200% 200%',
                animation: `${shimmer} 15s ease infinite`,
                color: '#fff',
                py: 3,
                px: 3,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: { xs: 0, md: '0 0 30px 30px' },
            }}>
                <Container maxWidth="lg">
                    <Fade in={true} timeout={800}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
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
                                    }
                                }}
                            >
                                <PersonIcon sx={{ fontSize: 40, color: '#fff' }} />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontFamily: 'Cairo', opacity: 0.9, mb: 0.5 }}>
                                    {greeting} 👋
                                </Typography>
                                <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1 }}>
                                    {user.first_name} {user.last_name}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <Chip
                                        icon={<SchoolIcon />}
                                        label={studentInfo?.levelDisplay || 'طالب'}
                                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontFamily: 'Cairo', fontWeight: 'bold' }}
                                    />
                                    {!isPreparatory && studentInfo?.department && (
                                        <Chip
                                            icon={<BusinessIcon />}
                                            label={studentInfo.department}
                                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontFamily: 'Cairo' }}
                                        />
                                    )}
                                    {studentInfo?.specialization && (
                                        <Chip
                                            label={studentInfo.specialization}
                                            sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontFamily: 'Cairo' }}
                                        />
                                    )}
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ textAlign: 'center', display: { xs: 'none', md: 'block' } }}>
                                    <Typography variant="body2" sx={{ fontFamily: 'Cairo', opacity: 0.8 }}>العام الأكاديمي</Typography>
                                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                        {studentInfo?.academicYear || '2024/2025'}
                                    </Typography>
                                </Box>
                                <IconButton
                                    onClick={() => { logout(); navigate('/login'); }}
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

            {!loading && studentInfo && !studentInfo.hasPaidTuition && (
                <Container maxWidth="lg" sx={{ mt: 2 }}>
                    <Fade in={true} timeout={1000}>
                        <Alert 
                            severity="error" 
                            variant="filled"
                            icon={<WarningIcon fontSize="inherit" />}
                            sx={{ 
                                fontFamily: 'Cairo', 
                                fontWeight: 'bold', 
                                fontSize: '1.1rem',
                                borderRadius: 3,
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            عذراً، يرجى سداد المصروفات الدراسية للوصول الي نتائج الامتحانات، المحاضرات، و اداء الاختبارات، أو استخراج شهادة التخرج.
                        </Alert>
                    </Fade>
                </Container>
            )}

            <Container maxWidth="lg" sx={{ mt: !studentInfo?.hasPaidTuition ? 0 : -3, pb: 4, position: 'relative', zIndex: 10 }}>
                {/* Stats Cards Row */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} md={3}>
                        <Grow in={true} timeout={400}>
                            <Paper elevation={0} sx={{
                                p: 3,
                                borderRadius: 4,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                textAlign: 'center',
                                background: '#fff',
                                transition: 'transform 0.3s',
                                '&:hover': { transform: 'translateY(-5px)' }
                            }}>
                                <Avatar sx={{ width: 56, height: 56, bgcolor: '#e3f2fd', mx: 'auto', mb: 1.5 }}>
                                    <MenuBookIcon sx={{ color: '#1976d2', fontSize: 28 }} />
                                </Avatar>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                    {grades?.subjects || 0}
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>المواد الدراسية</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Grow in={true} timeout={600}>
                            <Paper elevation={0} sx={{
                                p: 3,
                                borderRadius: 4,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                textAlign: 'center',
                                background: '#fff',
                                transition: 'transform 0.3s',
                                '&:hover': { transform: 'translateY(-5px)' }
                            }}>
                                <Avatar sx={{ width: 56, height: 56, bgcolor: '#e8f5e9', mx: 'auto', mb: 1.5 }}>
                                    <TrendingUpIcon sx={{ color: '#4CAF50', fontSize: 28 }} />
                                </Avatar>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                    {grades?.average || '--'}%
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>المعدل التراكمي</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Grow in={true} timeout={800}>
                            <Paper elevation={0} sx={{
                                p: 3,
                                borderRadius: 4,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                textAlign: 'center',
                                background: '#fff',
                                transition: 'transform 0.3s',
                                '&:hover': { transform: 'translateY(-5px)' }
                            }}>
                                <Avatar sx={{ width: 56, height: 56, bgcolor: '#fff3e0', mx: 'auto', mb: 1.5 }}>
                                    <QuizIcon sx={{ color: '#FF9800', fontSize: 28 }} />
                                </Avatar>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                    {quizzes.length}
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>كويزات متاحة</Typography>
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
                                background: '#fff',
                                transition: 'transform 0.3s',
                                '&:hover': { transform: 'translateY(-5px)' },
                                border: attendanceStats.percentage > 0
                                    ? `2px solid ${attendanceStats.percentage >= 75 ? '#4CAF5030' : '#f4433630'}`
                                    : 'none',
                            }}>
                                <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                                    <CircularProgress
                                        variant="determinate"
                                        value={attendanceStats.percentage}
                                        size={56}
                                        thickness={5}
                                        sx={{
                                            color: attendanceStats.percentage >= 75 ? '#4CAF50' : '#f44336',
                                            '& .MuiCircularProgress-circle': { strokeLinecap: 'round' },
                                        }}
                                    />
                                    <Box sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography variant="caption" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '0.7rem' }}>
                                            {attendanceStats.percentage}%
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>نسبة الحضور</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>

                {/* Graduation Certificate Section - Only for Fourth Year */}
                {isFourthYear && (
                    <Fade in={true} timeout={600}>
                        <Paper elevation={0} sx={{
                            p: 4,
                            mb: 4,
                            borderRadius: 4,
                            background: hasCertificate
                                ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            color: '#fff',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <Avatar sx={{
                                        width: 70,
                                        height: 70,
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        animation: hasCertificate ? `${pulse} 2s ease-in-out infinite` : 'none'
                                    }}>
                                        <CardMembershipIcon sx={{ fontSize: 40 }} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 0.5 }}>
                                            🎓 شهادة التخرج
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontFamily: 'Cairo', opacity: 0.9 }}>
                                            {certificateLoading
                                                ? 'جاري التحميل...'
                                                : hasCertificate
                                                    ? `مبروك! شهادتك جاهزة للتحميل${certificate.description ? ` - ${certificate.description}` : ''}`
                                                    : 'لم يتم رفع شهادة التخرج بعد. سيتم إشعارك عند رفعها.'}
                                        </Typography>
                                    </Box>
                                </Box>
                                {certificateLoading ? (
                                    <CircularProgress sx={{ color: '#fff' }} />
                                ) : hasCertificate ? (
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Button
                                            variant="contained"
                                            size="large"
                                            startIcon={<DownloadIcon />}
                                            sx={{
                                                fontFamily: 'Cairo',
                                                fontWeight: 'bold',
                                                bgcolor: '#fff',
                                                color: '#4CAF50',
                                                px: 4,
                                                py: 1.5,
                                                borderRadius: 3,
                                                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                                            }}
                                            onClick={() => {
                                                if (!studentInfo?.hasPaidTuition) {
                                                    alert("يرجى سداد المصروفات الدراسية أولاً");
                                                    return;
                                                }
                                                let fileUrl = certificate.file || '';
                                                // Only strip internal Docker hostname, preserve Azure Blob Storage URLs
                                                if (fileUrl.includes('://')) {
                                                    try {
                                                        const url = new URL(fileUrl);
                                                        if (url.hostname === 'backend' || url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
                                                            fileUrl = url.pathname;
                                                        }
                                                    } catch (e) { /* use as-is */ }
                                                }
                                                // Ensure it starts with / if it's a relative path
                                                if (!fileUrl.startsWith('http') && fileUrl && !fileUrl.startsWith('/')) fileUrl = '/' + fileUrl;
                                                window.open(fileUrl, '_blank');
                                            }}
                                        >
                                            تحميل الشهادة
                                        </Button>

                                        {certificate.verification_code && (
                                            <Button
                                                variant="outlined"
                                                size="large"
                                                startIcon={<QrCode2Icon />}
                                                sx={{
                                                    fontFamily: 'Cairo',
                                                    fontWeight: 'bold',
                                                    color: '#fff',
                                                    borderColor: 'rgba(255,255,255,0.5)',
                                                    px: 3,
                                                    py: 1.5,
                                                    borderRadius: 3,
                                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: '#fff' }
                                                }}
                                                onClick={() => setShowQrModal(true)}
                                            >
                                                رمز التحقق
                                            </Button>
                                        )}
                                    </Box>
                                ) : (
                                    <Chip
                                        icon={<AccessTimeIcon />}
                                        label="في الانتظار"
                                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontFamily: 'Cairo', fontSize: '1rem', py: 2.5, px: 1 }}
                                    />
                                )}
                            </Box>
                        </Paper>
                    </Fade>
                )}

                {/* Quick Actions Grid */}
                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon sx={{ color: '#FFD700' }} /> الوصول السريع
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }} direction="column">
                    {quickActions.map((action, index) => (
                        <Grid item xs={12} key={index}>
                            <DashboardCard
                                icon={action.icon}
                                title={action.title}
                                description={action.description}
                                buttonText={!studentInfo?.hasPaidTuition ? "مغلق" : "عرض"}
                                onClick={() => {
                                    if (!studentInfo?.hasPaidTuition) {
                                        alert("عذراً، يرجى سداد المصروفات الدراسية للوصول لهذه الخدمة.");
                                        return;
                                    }
                                    navigate(action.path);
                                }}
                                color={!studentInfo?.hasPaidTuition ? 'inherit' : index === 0 ? 'primary' : index === 1 ? 'secondary' : index === 2 ? 'info' : index === 3 ? 'warning' : 'purple'}
                            />
                        </Grid>
                    ))}
                </Grid>

                {/* Two Column Layout: Available Quizzes + Recent Grades */}
                <Grid container spacing={3}>
                    {/* Available Quizzes */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', height: '100%', opacity: !studentInfo?.hasPaidTuition ? 0.6 : 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar sx={{ bgcolor: '#fff3e0' }}>
                                        <QuizIcon sx={{ color: '#FF9800' }} />
                                    </Avatar>
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                        كويزات متاحة
                                    </Typography>
                                </Box>
                                <Button
                                    size="small"
                                    endIcon={<ArrowForwardIcon />}
                                    onClick={() => {
                                        if (!studentInfo?.hasPaidTuition) {
                                            alert("عذراً، يرجى سداد المصروفات الدراسية للوصول لهذه الخدمة.");
                                            return;
                                        }
                                        navigate('/student/quizzes');
                                    }}
                                    sx={{ fontFamily: 'Cairo' }}
                                >
                                    عرض الكل
                                </Button>
                            </Box>
                            {quizzes.length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {quizzes.map((quiz, idx) => (
                                        <Box
                                            key={quiz.id || idx}
                                            onClick={() => {
                                                if (!studentInfo?.hasPaidTuition) return;
                                                navigate(`/student/quizzes`);
                                            }}
                                            sx={{
                                                p: 2,
                                                borderRadius: 3,
                                                bgcolor: '#fafafa',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                border: '1px solid #eee',
                                                '&:hover': { bgcolor: '#f0f7ff', borderColor: '#1976d2' }
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Box>
                                                    <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                                        {quiz.title}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                                        {quiz.subject_name || quiz.course_name || 'مادة'}
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    label={`${quiz.total_points || 10} درجة`}
                                                    size="small"
                                                    color="primary"
                                                    sx={{ fontFamily: 'Cairo' }}
                                                />
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <QuizIcon sx={{ fontSize: 60, color: '#ddd', mb: 1 }} />
                                    <Typography sx={{ fontFamily: 'Cairo', color: '#999' }}>لا توجد كويزات متاحة حالياً</Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    {/* Recent Grades */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', height: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar sx={{ bgcolor: '#e8f5e9' }}>
                                        <GradeIcon sx={{ color: '#4CAF50' }} />
                                    </Avatar>
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                        آخر الدرجات
                                    </Typography>
                                </Box>
                                <Button
                                    size="small"
                                    endIcon={<ArrowForwardIcon />}
                                    onClick={() => navigate('/student/grades')}
                                    sx={{ fontFamily: 'Cairo' }}
                                >
                                    عرض الكل
                                </Button>
                            </Box>
                            {grades?.data && grades.data.length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {grades.data.map((grade, idx) => {
                                        const percentage = Math.round((grade.grade / (grade.max_grade || 100)) * 100);
                                        const color = percentage >= 75 ? '#4CAF50' : percentage >= 50 ? '#FF9800' : '#f44336';
                                        return (
                                            <Box key={idx} sx={{ p: 2, borderRadius: 3, bgcolor: '#fafafa', border: '1px solid #eee' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                                        {grade.subject_name || 'مادة'}
                                                    </Typography>
                                                    <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color }}>
                                                        {grade.grade}/{grade.max_grade || 100}
                                                    </Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={percentage}
                                                    sx={{
                                                        height: 8,
                                                        borderRadius: 4,
                                                        bgcolor: '#e0e0e0',
                                                        '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 }
                                                    }}
                                                />
                                            </Box>
                                        );
                                    })}
                                </Box>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <GradeIcon sx={{ fontSize: 60, color: '#ddd', mb: 1 }} />
                                    <Typography sx={{ fontFamily: 'Cairo', color: '#999' }}>لا توجد درجات مسجلة بعد</Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>

                {/* News Section */}
                <Paper elevation={0} sx={{ p: 3, mt: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Avatar sx={{ bgcolor: '#fce4ec' }}>
                            <NotificationsActiveIcon sx={{ color: '#E91E63' }} />
                        </Avatar>
                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                            آخر الأخبار والإعلانات
                        </Typography>
                    </Box>
                    {news.length > 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {news.map((item) => (
                                <Box key={item.id} sx={{ p: 2.5, borderRadius: 3, bgcolor: '#fafafa', border: '1px solid #eee', transition: 'all 0.2s', '&:hover': { bgcolor: '#f0f7ff', borderColor: '#1976d2' } }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744', fontSize: '1.1rem' }}>
                                            {item.title}
                                        </Typography>
                                        <Chip
                                            label={item.target_audience === 'ALL' ? 'الجميع' : item.target_audience === 'STUDENTS' ? 'الطلاب' : item.target_audience}
                                            size="small"
                                            sx={{ fontFamily: 'Cairo', bgcolor: item.target_audience === 'STUDENTS' ? '#e3f2fd' : '#e8f5e9', color: item.target_audience === 'STUDENTS' ? '#1976d2' : '#4CAF50' }}
                                        />
                                    </Box>
                                    <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#555', lineHeight: 1.8, mb: 1 }}>
                                        {item.content?.length > 150 ? item.content.substring(0, 150) + '...' : item.content}
                                    </Typography>
                                    {item.image && (
                                        <Box sx={{ borderRadius: 2, overflow: 'hidden', mt: 1, mb: 1 }}>
                                            <img src={item.image} alt={item.title} style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }} />
                                        </Box>
                                    )}
                                    {item.additional_images?.length > 0 && (
                                        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', mt: 1, mb: 2, pb: 1 }}>
                                            {item.additional_images.map(img => (
                                                <Box key={img.id} sx={{ flexShrink: 0, width: 100, height: 100, borderRadius: 2, overflow: 'hidden' }}>
                                                    <img src={img.image} alt="additional" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                    {(item.attachment || item.additional_attachments?.length > 0) && (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                                            {item.attachment && (
                                                <Button size="small" variant="outlined" startIcon={<DownloadIcon />} href={item.attachment} target="_blank" sx={{ fontFamily: 'Cairo', alignSelf: 'flex-start' }}>
                                                    تحميل المرفق الرئيسي
                                                </Button>
                                            )}
                                            {item.additional_attachments?.map(att => (
                                                <Button key={att.id} size="small" variant="outlined" startIcon={<DownloadIcon />} href={att.file} target="_blank" sx={{ fontFamily: 'Cairo', alignSelf: 'flex-start' }}>
                                                    تحميل: {att.file.split('/').pop()}
                                                </Button>
                                            ))}
                                        </Box>
                                    )}
                                    <Typography variant="caption" sx={{ fontFamily: 'Cairo', color: '#999' }}>
                                        {item.created_at ? new Date(item.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#fafafa', borderRadius: 3 }}>
                            <NotificationsActiveIcon sx={{ fontSize: 50, color: '#ddd', mb: 1 }} />
                            <Typography sx={{ fontFamily: 'Cairo', color: '#999' }}>
                                لا توجد أخبار جديدة حالياً
                            </Typography>
                        </Box>
                    )}
                </Paper>
            </Container>
        </Box>
    );
}
