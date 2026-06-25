import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    CircularProgress,
    Alert,
    IconButton,
    Avatar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

export default function PasswordResets() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            navigate('/dashboard');
            return;
        }
        fetchRequests();
    }, [user, navigate]);

    const fetchRequests = async () => {
        try {
            const response = await axios.get('/api/auth/admin/password-resets/?status=PENDING', {
                withCredentials: true,
            });
            setRequests(response.data);
        } catch (err) {
            setError('فشل في تحميل الطلبات.');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        setActionLoading(id);
        setError('');
        setSuccess('');
        try {
            await axios.post(`/api/auth/admin/password-resets/${id}/`, { action }, { withCredentials: true });
            setSuccess(`تم ${action === 'approve' ? 'الموافقة على' : 'رفض'} الطلب بنجاح.`);
            setRequests(requests.filter(req => req.id !== id));
        } catch (err) {
            setError(err.response?.data?.error || 'حدث خطأ أثناء معالجة الطلب.');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', background: '#f5f7fa', pb: 6 }}>
            {/* Header */}
            <Box sx={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', pt: 3, pb: 4, mb: 4 }}>
                <Container maxWidth="xl">
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/admin/dashboard')}
                        sx={{ color: '#fff', mb: 2, fontFamily: 'Cairo' }}
                    >
                        العودة للوحة التحكم
                    </Button>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Avatar sx={{ width: 60, height: 60, bgcolor: 'rgba(255,255,255,0.2)' }}>
                            <VpnKeyIcon sx={{ fontSize: 35, color: '#fff' }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>
                                طلبات إعادة تعيين كلمة المرور
                            </Typography>
                            <Typography sx={{ fontFamily: 'Cairo', color: 'rgba(255,255,255,0.8)' }}>
                                الموافقة على تعيين كلمة المرور إلى الرقم القومي
                            </Typography>
                        </Box>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="xl">
                {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo' }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3, fontFamily: 'Cairo' }}>{success}</Alert>}

                <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                            <CircularProgress />
                        </Box>
                    ) : requests.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 5 }}>
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                لا توجد طلبات قيد الانتظار حالياً
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>رقم الطلب</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>اسم المستخدم</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الرقم القومي</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>نوع المستخدم</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>تاريخ الطلب</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>السبب</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center' }}>إجراءات</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {requests.map((req) => (
                                        <TableRow key={req.id}>
                                            <TableCell>#{req.id}</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{req.user_name}</TableCell>
                                            <TableCell>{req.national_id || <Chip label="غير متوفر" color="error" size="small" />}</TableCell>
                                            <TableCell>{req.user_role}</TableCell>
                                            <TableCell>{new Date(req.requested_at).toLocaleDateString('ar-EG')}</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', color: '#555', maxWidth: 200 }}>
                                                {req.reason || 'لا يوجد'}
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    disabled={actionLoading === req.id || !req.national_id}
                                                    onClick={() => handleAction(req.id, 'approve')}
                                                    sx={{ fontFamily: 'Cairo', mr: 1 }}
                                                    startIcon={<CheckCircleIcon />}
                                                >
                                                    موافقة
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    size="small"
                                                    disabled={actionLoading === req.id}
                                                    onClick={() => handleAction(req.id, 'reject')}
                                                    sx={{ fontFamily: 'Cairo' }}
                                                    startIcon={<CancelIcon />}
                                                >
                                                    رفض
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            </Container>
        </Box>
    );
}
