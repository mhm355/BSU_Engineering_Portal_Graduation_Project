import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, Chip, Alert, CircularProgress, Grid, Card, CardContent,
    Avatar, Fade, Grow, Tooltip, IconButton
} from '@mui/material';
import { keyframes } from '@mui/system';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import VerifiedIcon from '@mui/icons-material/Verified';
import PersonIcon from '@mui/icons-material/Person';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Animations
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

// Request Card Component
const RequestCard = ({ request, onApprove, onReject, delay = 0 }) => {
    const isPending = request.status === 'PENDING';
    const isApproved = request.status === 'APPROVED';
    const isRejected = request.status === 'REJECTED';

    return (
        <Grow in={true} timeout={800 + delay}>
            <Card
                sx={{
                    borderRadius: 4,
                    background: '#fff',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: isPending ? '2px solid #FF9800' : '1px solid rgba(0,0,0,0.06)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'visible',
                    '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                    }
                }}
            >
                {/* Status Badge */}
                <Chip
                    icon={
                        isApproved ? <VerifiedIcon sx={{ color: '#fff !important', fontSize: 16 }} /> :
                            isRejected ? <CancelIcon sx={{ color: '#fff !important', fontSize: 16 }} /> :
                                <HourglassEmptyIcon sx={{ color: '#fff !important', fontSize: 16 }} />
                    }
                    label={request.status_display || (isApproved ? 'تمت الموافقة' : isRejected ? 'مرفوض' : 'قيد الانتظار')}
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: -12,
                        right: 16,
                        background: isApproved ? 'linear-gradient(135deg, #4CAF50, #8BC34A)' :
                            isRejected ? 'linear-gradient(135deg, #e53935, #EF5350)' :
                                'linear-gradient(135deg, #FF9800, #FFD93D)',
                        color: '#fff',
                        fontFamily: 'Cairo',
                        fontWeight: 'bold',
                        px: 1,
                    }}
                />

                <CardContent sx={{ p: 3, pt: 4 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar
                            sx={{
                                width: 50,
                                height: 50,
                                background: 'linear-gradient(135deg, #e53935, #EF5350)',
                            }}
                        >
                            <DeleteForeverIcon sx={{ fontSize: 26 }} />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744', lineHeight: 1.2 }}>
                                طلب حذف دكتور
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                {request.doctor_name}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Details */}
                    <Box sx={{ mb: 2, p: 2, bgcolor: '#fafafa', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PersonIcon sx={{ fontSize: 18, color: '#666' }} />
                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                مقدم الطلب:
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                {request.requested_by_name}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                الرقم القومي:
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#1a2744' }}>
                                {request.doctor_national_id}
                            </Typography>
                        </Box>
                        {request.reason && (
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                    السبب:
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#1a2744', mt: 0.5 }}>
                                    "{request.reason}"
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Actions */}
                    {isPending && (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => onApprove(request.id)}
                                sx={{
                                    fontFamily: 'Cairo',
                                    fontWeight: 'bold',
                                    py: 1.5,
                                    borderRadius: 2,
                                    background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
                                    boxShadow: '0 6px 20px rgba(76, 175, 80, 0.35)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #43A047, #7CB342)',
                                    }
                                }}
                            >
                                موافقة
                            </Button>
                            <Button
                                fullWidth
                                variant="contained"
                                color="error"
                                startIcon={<CancelIcon />}
                                onClick={() => onReject(request.id)}
                                sx={{
                                    fontFamily: 'Cairo',
                                    fontWeight: 'bold',
                                    py: 1.5,
                                    borderRadius: 2,
                                    background: 'linear-gradient(135deg, #e53935, #EF5350)',
                                    boxShadow: '0 6px 20px rgba(229, 57, 53, 0.35)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #c62828, #E53935)',
                                    }
                                }}
                            >
                                رفض
                            </Button>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Grow>
    );
};

export default function ApprovalCenter() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionMessage, setActionMessage] = useState('');

    const token = localStorage.getItem('access_token');
    const config = {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            // Fetch all statuses
            const [pending, approved, rejected] = await Promise.all([
                axios.get('/api/academic/admin/deletion-requests/?status=PENDING', config),
                axios.get('/api/academic/admin/deletion-requests/?status=APPROVED', config),
                axios.get('/api/academic/admin/deletion-requests/?status=REJECTED', config),
            ]);
            setRequests([...pending.data, ...approved.data, ...rejected.data]);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching requests:', err);
            setError('فشل تحميل الطلبات.');
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            await axios.post(`/api/academic/admin/deletion-requests/${id}/`, { action }, config);
            setActionMessage(action === 'approve' ? 'تمت الموافقة والحذف بنجاح.' : 'تم رفض الطلب.');
            fetchRequests();
            setTimeout(() => setActionMessage(''), 3000);
        } catch (err) {
            console.error(`Error ${action} request:`, err);
            setError('حدث خطأ أثناء تنفيذ الإجراء.');
        }
    };

    // Statistics
    const pendingCount = requests.filter(r => r.status === 'PENDING').length;
    const approvedCount = requests.filter(r => r.status === 'APPROVED').length;
    const rejectedCount = requests.filter(r => r.status === 'REJECTED').length;

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', pb: 6 }}>
            {/* Hero Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #e53935 0%, #EF5350 100%)',
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
                                    <DeleteForeverIcon sx={{ fontSize: 45, color: '#fff' }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                        مركز الموافقات
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: 'rgba(255,255,255,0.9)' }}>
                                        مراجعة طلبات حذف الدكاترة والموافقة عليها أو رفضها
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
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 3, fontFamily: 'Cairo' }} onClose={() => setError('')}>
                            {error}
                        </Alert>
                    </Fade>
                )}
                {actionMessage && (
                    <Fade in={true}>
                        <Alert severity="success" sx={{ mb: 3, borderRadius: 3, fontFamily: 'Cairo' }} onClose={() => setActionMessage('')}>
                            {actionMessage}
                        </Alert>
                    </Fade>
                )}

                {/* Stats Row */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={InventoryIcon}
                            value={requests.length}
                            label="إجمالي الطلبات"
                            color="#9C27B0"
                            delay={0}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={HourglassEmptyIcon}
                            value={pendingCount}
                            label="قيد الانتظار"
                            color="#FF9800"
                            delay={100}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={ThumbUpIcon}
                            value={approvedCount}
                            label="تمت الموافقة"
                            color="#4CAF50"
                            delay={200}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={ThumbDownIcon}
                            value={rejectedCount}
                            label="مرفوض"
                            color="#e53935"
                            delay={300}
                        />
                    </Grid>
                </Grid>

                {/* Content */}
                {loading ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <CircularProgress size={50} sx={{ color: '#e53935' }} />
                        <Typography sx={{ mt: 2, fontFamily: 'Cairo', color: '#666' }}>جاري التحميل...</Typography>
                    </Box>
                ) : requests.length === 0 ? (
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
                        <VerifiedIcon sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
                        <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#4CAF50', mb: 1 }}>
                            لا توجد طلبات حذف
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                            لم يتم تقديم أي طلبات حذف دكاترة بعد
                        </Typography>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {requests.map((request, idx) => (
                            <Grid item xs={12} md={6} lg={4} key={request.id}>
                                <RequestCard
                                    request={request}
                                    onApprove={(id) => handleAction(id, 'approve')}
                                    onReject={(id) => handleAction(id, 'reject')}
                                    delay={idx * 100}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
}
