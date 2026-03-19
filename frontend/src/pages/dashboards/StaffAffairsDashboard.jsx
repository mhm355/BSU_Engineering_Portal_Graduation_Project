import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, Box, Card, CardContent, CardActionArea,
    Avatar, Grid, Fade, Grow, CircularProgress, IconButton, Button,
    TextField, InputAdornment
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
    Logout as LogoutIcon,
    History as HistoryIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import { exportToCsv } from '../../utils/exportCsv';

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
    const { logout } = useAuth();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [doctorCount, setDoctorCount] = useState(0);
    const [assignmentCount, setAssignmentCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const config = { withCredentials: true };
    const [departmentCount, setDepartmentCount] = useState(0);
    const [specCount, setSpecCount] = useState(0);
    const [doctors, setDoctors] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [doctorsRes, assignmentsRes, deptsRes, specsRes] = await Promise.all([
                axios.get('/api/academic/staff-affairs/doctors/', config).catch(() => ({ data: [] })),
                axios.get('/api/academic/staff-affairs/assignments/', config).catch(() => ({ data: [] })),
                axios.get('/api/academic/departments/', config).catch(() => ({ data: [] })),
                axios.get('/api/academic/specializations/', config).catch(() => ({ data: [] }))
            ]);
            const doctors = Array.isArray(doctorsRes.data) ? doctorsRes.data : (doctorsRes.data?.results || []);
            const assignments = Array.isArray(assignmentsRes.data) ? assignmentsRes.data : (assignmentsRes.data?.results || []);
            const depts = Array.isArray(deptsRes.data) ? deptsRes.data : (deptsRes.data?.results || []);
            const specs = Array.isArray(specsRes.data) ? specsRes.data : (specsRes.data?.results || []);
            setDoctorCount(doctors.length);
            setDoctors(doctors);
            setAssignmentCount(assignments.length);
            setDepartmentCount(depts.length);
            setSpecCount(specs.length);
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
        {
            title: 'سجل التعيينات',
            description: 'تتبع جميع عمليات تعيين وإلغاء تعيين الدكاترة',
            icon: <HistoryIcon sx={{ fontSize: 40 }} />,
            gradient: 'linear-gradient(135deg, #607D8B, #90A4AE)',
            path: '/staff-affairs/assignment-history',
        },
    ];

    const filteredDoctors = doctors.filter(d => {
        if (!searchQuery) return false; // only show when searching
        const q = searchQuery.toLowerCase();
        return (
            (d.first_name || '').toLowerCase().includes(q) ||
            (d.last_name || '').toLowerCase().includes(q) ||
            (d.username || '').toLowerCase().includes(q) ||
            (d.email || '').toLowerCase().includes(q)
        );
    });

    const handleExportDoctors = () => {
        exportToCsv(doctors, [
            { key: 'username', label: 'اسم المستخدم' },
            { key: 'first_name', label: 'الاسم الأول' },
            { key: 'last_name', label: 'اسم العائلة' },
            { key: 'email', label: 'البريد الإلكتروني' },
        ], 'doctors_list');
    };

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
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
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
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{loading ? <CircularProgress size={24} /> : departmentCount}</Typography>
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
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{loading ? <CircularProgress size={24} /> : specCount}</Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>التخصصات</Typography>
                                </Box>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>

                {/* Doctor Search & Export */}
                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <TextField
                            placeholder="ابحث عن دكتور بالاسم أو البريد..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            size="small"
                            sx={{
                                flex: 1,
                                minWidth: 250,
                                '& .MuiOutlinedInput-root': { fontFamily: 'Cairo', borderRadius: 3, bgcolor: '#f8fafc' },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#999' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={handleExportDoctors}
                            disabled={doctors.length === 0}
                            sx={{
                                fontFamily: 'Cairo',
                                fontWeight: 'bold',
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
                            }}
                        >
                            تصدير CSV
                        </Button>
                    </Box>
                    {searchQuery && filteredDoctors.length > 0 && (
                        <Box sx={{ mt: 2, maxHeight: 200, overflowY: 'auto' }}>
                            {filteredDoctors.map((d, i) => (
                                <Box key={i} sx={{ py: 1, px: 2, borderBottom: '1px solid #eee', fontFamily: 'Cairo', display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#ede7f6', fontSize: 14 }}>
                                        {(d.first_name || '?')[0]}
                                    </Avatar>
                                    <Typography variant="body2" sx={{ fontFamily: 'Cairo' }}>
                                        {d.first_name} {d.last_name} — {d.email || d.username}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    )}
                    {searchQuery && filteredDoctors.length === 0 && (
                        <Typography variant="caption" sx={{ fontFamily: 'Cairo', color: '#999', mt: 1, display: 'block' }}>
                            لا توجد نتائج
                        </Typography>
                    )}
                </Paper>

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
