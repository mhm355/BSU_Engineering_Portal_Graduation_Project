import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, Chip, CircularProgress, Alert, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid, Card, CardContent, Avatar, Fade, Grow, Tabs, Tab
} from '@mui/material';
import { keyframes } from '@mui/system';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GradingIcon from '@mui/icons-material/Grading';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import SchoolIcon from '@mui/icons-material/School';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.4); }
  70% { transform: scale(1.02); box-shadow: 0 0 0 15px rgba(255, 152, 0, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 152, 0, 0); }
`;

const StatCard = ({ icon: Icon, value, label, color, delay = 0 }) => (
    <Grow in={true} timeout={800 + delay}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-5px)', boxShadow: `0 20px 40px ${color}25` } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 56, height: 56, borderRadius: 3, background: `linear-gradient(135deg, ${color}, ${color}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 24px ${color}40` }}>
                    <Icon sx={{ fontSize: 28, color: '#fff' }} />
                </Box>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a2744', fontFamily: 'Cairo', lineHeight: 1 }}>{value}</Typography>
                    <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Cairo' }}>{label}</Typography>
                </Box>
            </Box>
        </Paper>
    </Grow>
);

const PendingCard = ({ item, onApprove, delay = 0 }) => (
    <Grow in={true} timeout={800 + delay}>
        <Card sx={{ borderRadius: 4, background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '2px solid #FFD93D', transition: 'all 0.3s ease', position: 'relative', overflow: 'visible', animation: `${pulse} 3s infinite`, '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 20px 40px rgba(255, 152, 0, 0.15)' } }}>
            <Chip icon={<HourglassEmptyIcon sx={{ color: '#fff !important', fontSize: 16 }} />} label="في انتظار الموافقة" size="small"
                sx={{ position: 'absolute', top: -12, right: 16, background: 'linear-gradient(135deg, #FFD93D, #FF9800)', color: '#fff', fontFamily: 'Cairo', fontWeight: 'bold', px: 1 }} />
            <CardContent sx={{ p: 3, pt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar sx={{ width: 56, height: 56, background: 'linear-gradient(135deg, #FFD93D, #FF9800)' }}><SchoolIcon sx={{ fontSize: 28 }} /></Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{item.department}</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>{item.level_name} - {item.academic_year}</Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    {item.midterm_count > 0 && <Chip icon={<GradingIcon sx={{ fontSize: 18 }} />} label={`${item.midterm_count} درجة منتصف الترم`} sx={{ fontFamily: 'Cairo', fontWeight: 'bold', bgcolor: '#e3f2fd', color: '#1976d2', px: 1 }} />}
                    {item.final_count > 0 && <Chip icon={<AssignmentTurnedInIcon sx={{ fontSize: 18 }} />} label={`${item.final_count} درجة نهائية`} sx={{ fontFamily: 'Cairo', fontWeight: 'bold', bgcolor: '#fff3e0', color: '#e65100', px: 1 }} />}
                </Box>
                <Button fullWidth variant="contained" color="success" size="large" startIcon={<CheckCircleIcon />} onClick={() => onApprove(item)}
                    sx={{ fontFamily: 'Cairo', fontWeight: 'bold', py: 1.5, borderRadius: 3, background: 'linear-gradient(135deg, #4CAF50, #8BC34A)', boxShadow: '0 8px 24px rgba(76, 175, 80, 0.35)', '&:hover': { background: 'linear-gradient(135deg, #43A047, #7CB342)' } }}>
                    الموافقة على الدرجات
                </Button>
            </CardContent>
        </Card>
    </Grow>
);

export default function PendingApprovals() {
    const navigate = useNavigate();
    const [tab, setTab] = useState(0);

    // Grade Approvals state
    const [pendingGrades, setPendingGrades] = useState([]);
    const [loadingGrades, setLoadingGrades] = useState(true);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, item: null });

    // Deletion Requests state
    const [deletionRequests, setDeletionRequests] = useState([]);
    const [loadingDeletion, setLoadingDeletion] = useState(true);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const config = { withCredentials: true };

    useEffect(() => { fetchPendingGrades(); fetchDeletionRequests(); }, []);

    const fetchPendingGrades = async () => {
        try {
            const res = await axios.get('/api/academic/exam-grades/pending/', config);
            setPendingGrades(res.data);
        } catch { setError('فشل تحميل الدرجات المعلقة'); }
        finally { setLoadingGrades(false); }
    };

    const fetchDeletionRequests = async () => {
        try {
            const res = await axios.get('/api/academic/admin/deletion-requests/', config);
            setDeletionRequests(Array.isArray(res.data) ? res.data : []);
        } catch { /* non-blocking */ }
        finally { setLoadingDeletion(false); }
    };

    const handleApproveGrades = async (levelId) => {
        try {
            const res = await axios.post(`/api/academic/exam-grades/approve/${levelId}/`, {}, config);
            setSuccess(res.data.message || 'تمت الموافقة بنجاح');
            fetchPendingGrades();
            setConfirmDialog({ open: false, item: null });
        } catch (err) { setError(err.response?.data?.error || 'فشلت الموافقة'); }
    };

    const handleDeletionAction = async (requestId, action) => {
        try {
            await axios.post(`/api/academic/admin/deletion-requests/${requestId}/`, { action }, config);
            setSuccess(action === 'approve' ? 'تمت الموافقة على الحذف' : 'تم رفض الطلب');
            fetchDeletionRequests();
        } catch (err) { setError(err.response?.data?.error || 'فشل تنفيذ الإجراء'); }
    };

    const totalMidterm = pendingGrades.reduce((acc, i) => acc + (i.midterm_count || 0), 0);
    const totalFinal = pendingGrades.reduce((acc, i) => acc + (i.final_count || 0), 0);
    const pendingDeletion = deletionRequests.filter(r => r.status === 'PENDING').length;

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', pb: 6 }}>
            {/* Header */}
            <Box sx={{ background: 'linear-gradient(135deg, #FFD93D 0%, #FF9800 100%)', pt: 4, pb: 6, mb: 4, position: 'relative', overflow: 'hidden' }}>
                {/* Decorative circles - REMOVED */}
                {/* <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', animation: `${float} 6s ease-in-out infinite` }} /> */}
                <Container maxWidth="xl">
                    <Fade in={true} timeout={800}>
                        <Box>
                            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/dashboard')} sx={{ color: '#1a2744', mb: 2, fontFamily: 'Cairo', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                                العودة للوحة التحكم
                            </Button>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)' }}>
                                    <PendingActionsIcon sx={{ fontSize: 45, color: '#1a2744' }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>مركز الموافقات</Typography>
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: 'rgba(26,39,68,0.8)' }}>إدارة الموافقات على الدرجات وطلبات الحذف</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Container maxWidth="xl">
                {error && <Fade in><Alert severity="error" sx={{ mb: 3, borderRadius: 3, fontFamily: 'Cairo' }} onClose={() => setError('')}>{error}</Alert></Fade>}
                {success && <Fade in><Alert severity="success" sx={{ mb: 3, borderRadius: 3, fontFamily: 'Cairo' }} onClose={() => setSuccess('')}>{success}</Alert></Fade>}

                {/* Stats */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}><StatCard icon={PendingActionsIcon} value={pendingGrades.length} label="طلبات درجات معلقة" color="#FF9800" delay={0} /></Grid>
                    <Grid item xs={12} sm={6} md={3}><StatCard icon={GradingIcon} value={totalMidterm + totalFinal} label="إجمالي الدرجات" color="#9C27B0" delay={100} /></Grid>
                    <Grid item xs={12} sm={6} md={3}><StatCard icon={WarningAmberIcon} value={totalMidterm} label="درجات منتصف الترم" color="#2196F3" delay={200} /></Grid>
                    <Grid item xs={12} sm={6} md={3}><StatCard icon={PersonRemoveIcon} value={pendingDeletion} label="طلبات حذف معلقة" color="#E53935" delay={300} /></Grid>
                </Grid>

                {/* Tabs */}
                <Paper elevation={0} sx={{ borderRadius: 3, mb: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid #f0f0f0' }}
                        TabIndicatorProps={{ sx: { background: 'linear-gradient(135deg, #FFD93D, #FF9800)', height: 3 } }}>
                        <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontFamily: 'Cairo' }}>
                            <PendingActionsIcon fontSize="small" />
                            الموافقات المعلقة
                            {pendingGrades.length > 0 && <Chip label={pendingGrades.length} size="small" color="warning" sx={{ height: 20 }} />}
                        </Box>} />
                        <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontFamily: 'Cairo' }}>
                            <PersonRemoveIcon fontSize="small" />
                            طلبات الحذف
                            {pendingDeletion > 0 && <Chip label={pendingDeletion} size="small" color="error" sx={{ height: 20 }} />}
                        </Box>} />
                    </Tabs>
                </Paper>

                {/* Tab 0: Pending Grade Approvals */}
                {tab === 0 && (
                    loadingGrades ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress size={50} sx={{ color: '#FF9800' }} /></Box>
                    ) : pendingGrades.length === 0 ? (
                        <Paper elevation={0} sx={{ p: 8, borderRadius: 4, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                            <CheckCircleIcon sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
                            <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#4CAF50', mb: 1 }}>لا توجد طلبات معلقة</Typography>
                            <Typography sx={{ fontFamily: 'Cairo', color: '#666' }}>تمت الموافقة على جميع الدرجات المرفوعة</Typography>
                        </Paper>
                    ) : (
                        <Grid container spacing={3}>
                            {pendingGrades.map((item, idx) => (
                                <Grid item xs={12} md={6} lg={4} key={idx}>
                                    <PendingCard item={item} onApprove={(item) => setConfirmDialog({ open: true, item: { level_id: item.level_id, name: `${item.department} - ${item.level_name}`, midterm_count: item.midterm_count, final_count: item.final_count } })} delay={idx * 100} />
                                </Grid>
                            ))}
                        </Grid>
                    )
                )}

                {/* Tab 1: Deletion Requests */}
                {tab === 1 && (
                    loadingDeletion ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress size={50} sx={{ color: '#E53935' }} /></Box>
                    ) : deletionRequests.length === 0 ? (
                        <Paper elevation={0} sx={{ p: 8, borderRadius: 4, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                            <CheckCircleIcon sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
                            <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#4CAF50' }}>لا توجد طلبات حذف</Typography>
                        </Paper>
                    ) : (
                        <Paper elevation={0} sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#E53935' }}>
                                            {['الدكتور', 'الرقم القومي', 'مقدم الطلب', 'السبب', 'التاريخ', 'الحالة', 'إجراءات'].map(h => (
                                                <TableCell key={h} sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>{h}</TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {deletionRequests.map((req) => (
                                            <TableRow key={req.id} hover>
                                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{req.doctor_name}</TableCell>
                                                <TableCell sx={{ fontFamily: 'monospace' }}>{req.doctor_national_id}</TableCell>
                                                <TableCell sx={{ fontFamily: 'Cairo' }}>{req.requested_by_name}</TableCell>
                                                <TableCell sx={{ fontFamily: 'Cairo', maxWidth: 200 }}>{req.reason || '-'}</TableCell>
                                                <TableCell sx={{ fontFamily: 'Cairo' }}>{new Date(req.created_at).toLocaleDateString('ar-EG')}</TableCell>
                                                <TableCell>
                                                    <Chip label={req.status === 'PENDING' ? 'معلق' : req.status === 'APPROVED' ? 'موافق' : 'مرفوض'}
                                                        color={req.status === 'PENDING' ? 'warning' : req.status === 'APPROVED' ? 'success' : 'error'}
                                                        size="small" sx={{ fontFamily: 'Cairo' }} />
                                                </TableCell>
                                                <TableCell>
                                                    {req.status === 'PENDING' && (
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <Button variant="contained" color="success" size="small" startIcon={<CheckCircleIcon />}
                                                                onClick={() => handleDeletionAction(req.id, 'approve')} sx={{ fontFamily: 'Cairo', borderRadius: 2 }}>موافقة</Button>
                                                            <Button variant="outlined" color="error" size="small" startIcon={<CancelIcon />}
                                                                onClick={() => handleDeletionAction(req.id, 'reject')} sx={{ fontFamily: 'Cairo', borderRadius: 2 }}>رفض</Button>
                                                        </Box>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    )
                )}
            </Container>

            {/* Confirm Dialog */}
            <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, item: null })} PaperProps={{ sx: { borderRadius: 4, p: 1, minWidth: 400 } }}>
                <DialogTitle sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1.3rem', textAlign: 'center' }}>تأكيد الموافقة</DialogTitle>
                <DialogContent>
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Avatar sx={{ width: 70, height: 70, background: 'linear-gradient(135deg, #4CAF50, #8BC34A)', mx: 'auto', mb: 2 }}>
                            <CheckCircleIcon sx={{ fontSize: 40 }} />
                        </Avatar>
                        <Typography sx={{ fontFamily: 'Cairo', fontSize: '1.1rem', mb: 2 }}>هل أنت متأكد من الموافقة على درجات</Typography>
                        <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1.2rem', color: '#1a2744' }}>"{confirmDialog.item?.name}"</Typography>
                        {confirmDialog.item && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                                {confirmDialog.item.midterm_count > 0 && <Chip label={`${confirmDialog.item.midterm_count} منتصف ترم`} color="info" />}
                                {confirmDialog.item.final_count > 0 && <Chip label={`${confirmDialog.item.final_count} نهائي`} color="warning" />}
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'center', gap: 2 }}>
                    <Button onClick={() => setConfirmDialog({ open: false, item: null })} sx={{ fontFamily: 'Cairo', px: 4, borderRadius: 2 }}>إلغاء</Button>
                    <Button variant="contained" color="success" startIcon={<CheckCircleIcon />}
                        onClick={() => handleApproveGrades(confirmDialog.item.level_id)}
                        sx={{ fontFamily: 'Cairo', px: 4, borderRadius: 2, background: 'linear-gradient(135deg, #4CAF50, #8BC34A)' }}>موافقة</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
