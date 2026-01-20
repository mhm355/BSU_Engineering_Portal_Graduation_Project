import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, Box, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Alert, Chip, Switch, FormControlLabel,
    Grid, Card, CardContent, Avatar, Tooltip, Fade, Grow, Skeleton
} from '@mui/material';
import { keyframes } from '@mui/system';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EventIcon from '@mui/icons-material/Event';
import TodayIcon from '@mui/icons-material/Today';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

// Year Card Component (for card view)
const YearCard = ({ year, idx, onEdit, onToggleStatus, onSetCurrent, delay = 0 }) => (
    <Grow in={true} timeout={800 + delay}>
        <Card
            sx={{
                borderRadius: 4,
                background: year.is_current
                    ? 'linear-gradient(135deg, #11998e15, #38ef7d15)'
                    : '#fff',
                boxShadow: year.is_current
                    ? '0 8px 32px rgba(17, 153, 142, 0.15)'
                    : '0 4px 20px rgba(0,0,0,0.08)',
                border: year.is_current
                    ? '2px solid #11998e'
                    : '1px solid rgba(0,0,0,0.06)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'visible',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                }
            }}
        >
            {/* Current Badge */}
            {year.is_current && (
                <Chip
                    icon={<StarIcon sx={{ color: '#fff !important', fontSize: 16 }} />}
                    label="العام الحالي"
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: -12,
                        right: 16,
                        bgcolor: 'linear-gradient(135deg, #11998e, #38ef7d)',
                        background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                        color: '#fff',
                        fontFamily: 'Cairo',
                        fontWeight: 'bold',
                        px: 1,
                        animation: `${pulse} 2s infinite`,
                    }}
                />
            )}

            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                            sx={{
                                width: 56,
                                height: 56,
                                bgcolor: year.status === 'OPEN' ? '#11998e' : '#9e9e9e',
                                fontSize: 24,
                            }}
                        >
                            <CalendarMonthIcon sx={{ fontSize: 28 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                {year.name}
                            </Typography>
                            <Chip
                                icon={year.status === 'OPEN' ? <LockOpenIcon sx={{ fontSize: 16 }} /> : <LockIcon sx={{ fontSize: 16 }} />}
                                label={year.status === 'OPEN' ? 'مفتوح' : 'مغلق'}
                                size="small"
                                sx={{
                                    mt: 0.5,
                                    bgcolor: year.status === 'OPEN' ? '#e8f5e9' : '#ffebee',
                                    color: year.status === 'OPEN' ? '#2e7d32' : '#c62828',
                                    fontFamily: 'Cairo',
                                    fontWeight: 'bold',
                                }}
                            />
                        </Box>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Cairo' }}>
                        #{idx + 1}
                    </Typography>
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1, mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                    <Tooltip title="تعديل">
                        <IconButton
                            onClick={() => onEdit(year)}
                            sx={{
                                bgcolor: '#e3f2fd',
                                color: '#1976d2',
                                '&:hover': { bgcolor: '#bbdefb' }
                            }}
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={year.status === 'OPEN' ? 'إغلاق العام' : 'فتح العام'}>
                        <IconButton
                            onClick={() => onToggleStatus(year)}
                            sx={{
                                bgcolor: year.status === 'OPEN' ? '#ffebee' : '#e8f5e9',
                                color: year.status === 'OPEN' ? '#c62828' : '#2e7d32',
                                '&:hover': {
                                    bgcolor: year.status === 'OPEN' ? '#ffcdd2' : '#c8e6c9'
                                }
                            }}
                        >
                            {year.status === 'OPEN' ? <LockIcon /> : <LockOpenIcon />}
                        </IconButton>
                    </Tooltip>
                    {!year.is_current && (
                        <Tooltip title="تعيين كالعام الحالي">
                            <IconButton
                                onClick={() => onSetCurrent(year)}
                                sx={{
                                    bgcolor: '#fff8e1',
                                    color: '#f9a825',
                                    '&:hover': { bgcolor: '#ffecb3' }
                                }}
                            >
                                <StarIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </CardContent>
        </Card>
    </Grow>
);

export default function ManageAcademicYears() {
    const navigate = useNavigate();
    const [years, setYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [open, setOpen] = useState(false);
    const [currentYear, setCurrentYear] = useState({ name: '', is_current: false });
    const [isEdit, setIsEdit] = useState(false);

    const token = localStorage.getItem('access_token');
    const config = {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    };

    useEffect(() => {
        fetchYears();
    }, []);

    const fetchYears = async () => {
        try {
            const response = await axios.get('/api/academic/years/', config);
            setYears(response.data);
        } catch (err) {
            setError('فشل في تحميل الأعوام الدراسية');
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = (year = null) => {
        if (year) {
            setCurrentYear(year);
            setIsEdit(true);
        } else {
            setCurrentYear({ name: '', is_current: false });
            setIsEdit(false);
        }
        setOpen(true);
        setError('');
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentYear({ name: '', is_current: false });
    };

    const handleSave = async () => {
        if (!currentYear.name.trim()) {
            setError('يرجى إدخال اسم العام الدراسي');
            return;
        }

        try {
            if (isEdit) {
                await axios.put(`/api/academic/years/${currentYear.id}/`, currentYear, config);
                setSuccess('تم تحديث العام الدراسي بنجاح');
            } else {
                await axios.post('/api/academic/years/', currentYear, config);
                setSuccess('تم إنشاء العام الدراسي بنجاح');
            }
            fetchYears();
            handleClose();
        } catch (err) {
            console.error('Save error:', err.response);
            if (err.response?.status === 403) {
                setError('ليس لديك صلاحية لإضافة الأعوام الدراسية. تأكد من تسجيل الدخول كأدمن.');
            } else {
                setError(err.response?.data?.name?.[0] || err.response?.data?.detail || 'حدث خطأ أثناء الحفظ');
            }
        }
    };

    const handleToggleStatus = async (year) => {
        try {
            const response = await axios.post(`/api/academic/years/${year.id}/toggle_status/`, {}, config);
            setSuccess(`تم ${response.data.status === 'OPEN' ? 'فتح' : 'إغلاق'} العام الدراسي`);
            fetchYears();
        } catch (err) {
            setError('فشل في تغيير حالة العام الدراسي');
        }
    };

    const handleSetCurrent = async (year) => {
        try {
            await axios.post(`/api/academic/years/${year.id}/set_current/`, {}, config);
            setSuccess('تم تعيين العام الدراسي كحالي');
            fetchYears();
        } catch (err) {
            setError('فشل في تعيين العام الدراسي كحالي');
        }
    };

    // Statistics
    const openYears = years.filter(y => y.status === 'OPEN').length;
    const closedYears = years.filter(y => y.status === 'CLOSED').length;
    const currentAcademicYear = years.find(y => y.is_current);

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', pb: 6 }}>
            {/* Hero Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
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

                <Container maxWidth="xl">
                    <Fade in={true} timeout={800}>
                        <Box>
                            <Button
                                startIcon={<ArrowBackIcon />}
                                onClick={() => navigate('/admin/dashboard')}
                                sx={{
                                    color: '#fff',
                                    mb: 2,
                                    fontFamily: 'Cairo',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                                }}
                            >
                                العودة للوحة التحكم
                            </Button>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Avatar
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        backdropFilter: 'blur(10px)',
                                    }}
                                >
                                    <CalendarMonthIcon sx={{ fontSize: 45, color: '#fff' }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                        إدارة الأعوام الدراسية
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: 'rgba(255,255,255,0.9)' }}>
                                        إضافة وتعديل وإدارة الأعوام الأكاديمية
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Container maxWidth="xl">
                {/* Alerts */}
                {error && (
                    <Fade in={true}>
                        <Alert
                            severity="error"
                            sx={{ mb: 3, borderRadius: 3, fontFamily: 'Cairo' }}
                            onClose={() => setError('')}
                        >
                            {error}
                        </Alert>
                    </Fade>
                )}
                {success && (
                    <Fade in={true}>
                        <Alert
                            severity="success"
                            sx={{ mb: 3, borderRadius: 3, fontFamily: 'Cairo' }}
                            onClose={() => setSuccess('')}
                        >
                            {success}
                        </Alert>
                    </Fade>
                )}

                {/* Stats Row */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={EventIcon}
                            value={years.length}
                            label="إجمالي الأعوام"
                            color="#2196F3"
                            delay={0}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={CheckCircleIcon}
                            value={openYears}
                            label="أعوام مفتوحة"
                            color="#11998e"
                            delay={100}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={CancelIcon}
                            value={closedYears}
                            label="أعوام مغلقة"
                            color="#e53935"
                            delay={200}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={TodayIcon}
                            value={currentAcademicYear?.name || '-'}
                            label="العام الحالي"
                            color="#9c27b0"
                            delay={300}
                        />
                    </Grid>
                </Grid>

                {/* Action Bar */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 4,
                        borderRadius: 4,
                        background: '#fff',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2,
                    }}
                >
                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                        الأعوام الدراسية ({years.length})
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpen()}
                        sx={{
                            fontFamily: 'Cairo',
                            fontWeight: 'bold',
                            px: 4,
                            py: 1.5,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                            boxShadow: '0 8px 24px rgba(17, 153, 142, 0.35)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #0f8a7f, #32d971)',
                                boxShadow: '0 12px 32px rgba(17, 153, 142, 0.45)',
                            }
                        }}
                    >
                        إضافة عام دراسي جديد
                    </Button>
                </Paper>

                {/* Years Grid */}
                {loading ? (
                    <Grid container spacing={3}>
                        {[1, 2, 3].map((i) => (
                            <Grid item xs={12} sm={6} lg={4} key={i}>
                                <Skeleton variant="rounded" height={200} sx={{ borderRadius: 4 }} />
                            </Grid>
                        ))}
                    </Grid>
                ) : years.length === 0 ? (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 8,
                            borderRadius: 4,
                            background: '#fff',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            textAlign: 'center',
                        }}
                    >
                        <CalendarMonthIcon sx={{ fontSize: 80, color: '#ddd', mb: 2 }} />
                        <Typography variant="h5" sx={{ fontFamily: 'Cairo', color: '#999', mb: 1 }}>
                            لا توجد أعوام دراسية
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#bbb', mb: 3 }}>
                            قم بإضافة عام دراسي جديد للبدء
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpen()}
                            sx={{
                                fontFamily: 'Cairo',
                                fontWeight: 'bold',
                                px: 4,
                                py: 1.5,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                            }}
                        >
                            إضافة عام دراسي
                        </Button>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {years.map((year, idx) => (
                            <Grid item xs={12} sm={6} lg={4} key={year.id}>
                                <YearCard
                                    year={year}
                                    idx={idx}
                                    onEdit={handleOpen}
                                    onToggleStatus={handleToggleStatus}
                                    onSetCurrent={handleSetCurrent}
                                    delay={idx * 100}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>

            {/* Add/Edit Dialog */}
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        p: 1,
                    }
                }}
            >
                <DialogTitle sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1.5rem' }}>
                    {isEdit ? 'تعديل العام الدراسي' : 'إضافة عام دراسي جديد'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                        <TextField
                            label="اسم العام الدراسي"
                            placeholder="مثال: 2024-2025"
                            fullWidth
                            required
                            value={currentYear.name}
                            onChange={(e) => setCurrentYear({ ...currentYear, name: e.target.value })}
                            InputLabelProps={{ sx: { fontFamily: 'Cairo' } }}
                            InputProps={{ sx: { borderRadius: 2 } }}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={currentYear.is_current}
                                    onChange={(e) => setCurrentYear({ ...currentYear, is_current: e.target.checked })}
                                    color="success"
                                />
                            }
                            label="تعيين كالعام الحالي"
                            sx={{ fontFamily: 'Cairo' }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button
                        onClick={handleClose}
                        sx={{ fontFamily: 'Cairo', px: 3, borderRadius: 2 }}
                    >
                        إلغاء
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        sx={{
                            fontFamily: 'Cairo',
                            px: 4,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #0f8a7f, #32d971)',
                            }
                        }}
                    >
                        حفظ
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
