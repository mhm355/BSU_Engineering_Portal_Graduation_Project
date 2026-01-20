import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Paper, Grid, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, IconButton, Tooltip, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions, Alert, Chip, CircularProgress,
    Avatar, Fade, Grow
} from '@mui/material';
import { keyframes } from '@mui/system';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

export default function ManageDoctors() {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Edit dialog
    const [editDialog, setEditDialog] = useState({ open: false, doctor: null });
    const [editForm, setEditForm] = useState({ first_name: '', last_name: '', email: '' });

    // Reset password dialog
    const [resetDialog, setResetDialog] = useState({ open: false, doctor: null });

    // Delete dialog
    const [deleteDialog, setDeleteDialog] = useState({ open: false, doctor: null, reason: '' });

    // Deletion requests
    const [deletionRequests, setDeletionRequests] = useState([]);

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    useEffect(() => {
        fetchDoctors();
        fetchDeletionRequests();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await axios.get('/api/academic/staff-affairs/doctors/', config);
            setDoctors(response.data);
            setLoading(false);
        } catch (err) {
            setError('فشل تحميل قائمة الأعضاء');
            setLoading(false);
        }
    };

    const fetchDeletionRequests = async () => {
        try {
            const response = await axios.get('/api/academic/staff-affairs/deletion-requests/', config);
            setDeletionRequests(response.data);
        } catch (err) {
            console.error('Error fetching deletion requests:', err);
        }
    };

    const handleEditOpen = (doctor) => {
        setEditForm({
            first_name: doctor.full_name.split(' ')[0] || '',
            last_name: doctor.full_name.split(' ').slice(1).join(' ') || '',
            email: doctor.email || ''
        });
        setEditDialog({ open: true, doctor });
    };

    const handleEditSubmit = async () => {
        try {
            await axios.put(`/api/academic/staff-affairs/doctors/${editDialog.doctor.id}/`, editForm, config);
            setSuccess('تم تحديث البيانات بنجاح');
            setEditDialog({ open: false, doctor: null });
            fetchDoctors();
        } catch (err) {
            setError('فشل تحديث البيانات');
        }
    };

    const handleResetPassword = async () => {
        try {
            await axios.post(`/api/academic/staff-affairs/doctors/${resetDialog.doctor.id}/reset-password/`, {}, config);
            setSuccess(`تم إعادة تعيين كلمة مرور ${resetDialog.doctor.full_name} إلى الرقم القومي`);
            setResetDialog({ open: false, doctor: null });
        } catch (err) {
            setError('فشل إعادة تعيين كلمة المرور');
        }
    };

    const handleDeleteRequest = async () => {
        try {
            await axios.post(`/api/academic/staff-affairs/doctors/${deleteDialog.doctor.id}/delete-request/`, { reason: deleteDialog.reason }, config);
            setSuccess('تم إرسال طلب الحذف للمراجعة من قبل الأدمن');
            setDeleteDialog({ open: false, doctor: null, reason: '' });
            fetchDeletionRequests();
        } catch (err) {
            setError(err.response?.data?.error || 'فشل إرسال طلب الحذف');
        }
    };

    const hasPendingRequest = (doctorId) => {
        return deletionRequests.some(req => req.doctor_id === doctorId && req.status === 'PENDING');
    };

    const activeCount = doctors.filter(d => !hasPendingRequest(d.id)).length;
    const pendingCount = doctors.filter(d => hasPendingRequest(d.id)).length;

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', pb: 6 }}>
            {/* Hero Header */}
            <Box sx={{ background: 'linear-gradient(135deg, #d32f2f 0%, #ef5350 100%)', pt: 4, pb: 6, mb: 4, position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', animation: `${float} 6s ease-in-out infinite` }} />
                <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', animation: `${float} 8s ease-in-out infinite`, animationDelay: '2s' }} />

                <Container maxWidth="lg">
                    <Fade in={true} timeout={800}>
                        <Box>
                            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/staff-affairs/dashboard')} sx={{ color: '#fff', mb: 2, fontFamily: 'Cairo', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                                العودة للوحة التحكم
                            </Button>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                                        <ManageAccountsIcon sx={{ fontSize: 45, color: '#fff' }} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                            إدارة أعضاء هيئة التدريس
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: 'rgba(255,255,255,0.9)' }}>
                                            تعديل البيانات، إعادة تعيين كلمة المرور، طلب الحذف
                                        </Typography>
                                    </Box>
                                </Box>
                                <Button variant="contained" startIcon={<UploadFileIcon />} onClick={() => navigate('/staff-affairs/upload-doctors')} sx={{ fontFamily: 'Cairo', fontWeight: 'bold', bgcolor: '#fff', color: '#d32f2f', px: 4, py: 1.5, fontSize: '1.1rem', '&:hover': { bgcolor: '#f5f5f5' } }}>
                                    رفع أعضاء جدد
                                </Button>
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Container maxWidth="lg">
                {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem' }} onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert icon={<CheckCircleIcon />} severity="success" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem' }} onClose={() => setSuccess('')}>{success}</Alert>}

                {/* Stats Row */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={4}>
                        <Grow in={true} timeout={400}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 55, height: 55, background: 'linear-gradient(135deg, #d32f2f, #ef5350)' }}>
                                    <PersonIcon sx={{ fontSize: 28 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{doctors.length}</Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>إجمالي الأعضاء</Typography>
                                </Box>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Grow in={true} timeout={500}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 55, height: 55, background: 'linear-gradient(135deg, #4CAF50, #8BC34A)' }}>
                                    <CheckCircleIcon sx={{ fontSize: 28 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{activeCount}</Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>أعضاء فعالين</Typography>
                                </Box>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Grow in={true} timeout={600}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 55, height: 55, background: 'linear-gradient(135deg, #FF9800, #FFB74D)' }}>
                                    <WarningIcon sx={{ fontSize: 28 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{pendingCount}</Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>طلبات حذف معلقة</Typography>
                                </Box>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={50} /></Box>
                ) : (
                    <Grow in={true} timeout={700}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 25px rgba(0,0,0,0.1)' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Avatar sx={{ width: 50, height: 50, background: 'linear-gradient(135deg, #d32f2f, #ef5350)' }}>
                                    <PersonIcon />
                                </Avatar>
                                <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                    قائمة الأعضاء ({doctors.length})
                                </Typography>
                            </Box>

                            <TableContainer sx={{ borderRadius: 3, border: '1px solid #eee' }}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#d32f2f' }}>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>#</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>الاسم</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>الرقم القومي</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>البريد الإلكتروني</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>الحالة</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>إجراءات</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {doctors.map((doctor, index) => (
                                            <TableRow key={doctor.id} hover sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                                                <TableCell>
                                                    <Avatar sx={{ width: 35, height: 35, bgcolor: '#d32f2f', fontSize: 14 }}>{index + 1}</Avatar>
                                                </TableCell>
                                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1rem' }}>{doctor.full_name}</TableCell>
                                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '1rem' }}>{doctor.national_id}</TableCell>
                                                <TableCell sx={{ fontSize: '1rem' }}>{doctor.email || '-'}</TableCell>
                                                <TableCell>
                                                    {hasPendingRequest(doctor.id) ? (
                                                        <Chip icon={<WarningIcon />} label="طلب حذف معلق" color="warning" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} />
                                                    ) : (
                                                        <Chip icon={<CheckCircleIcon />} label="فعال" color="success" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} />
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Tooltip title="تعديل">
                                                        <IconButton sx={{ bgcolor: '#e3f2fd', mr: 1, '&:hover': { bgcolor: '#bbdefb' } }} onClick={() => handleEditOpen(doctor)}>
                                                            <EditIcon color="primary" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="إعادة تعيين كلمة المرور">
                                                        <IconButton sx={{ bgcolor: '#fff3e0', mr: 1, '&:hover': { bgcolor: '#ffe0b2' } }} onClick={() => setResetDialog({ open: true, doctor })}>
                                                            <LockResetIcon sx={{ color: '#ff9800' }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="طلب حذف">
                                                        <IconButton sx={{ bgcolor: '#ffebee', '&:hover': { bgcolor: '#ffcdd2' } }} onClick={() => setDeleteDialog({ open: true, doctor, reason: '' })} disabled={hasPendingRequest(doctor.id)}>
                                                            <DeleteIcon color="error" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grow>
                )}

                {/* My Deletion Requests */}
                {deletionRequests.length > 0 && (
                    <Grow in={true} timeout={900}>
                        <Paper elevation={0} sx={{ p: 4, mt: 4, borderRadius: 4, boxShadow: '0 4px 25px rgba(0,0,0,0.1)' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Avatar sx={{ width: 50, height: 50, background: 'linear-gradient(135deg, #FF9800, #FFB74D)' }}>
                                    <WarningIcon />
                                </Avatar>
                                <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                    طلبات الحذف الخاصة بي ({deletionRequests.length})
                                </Typography>
                            </Box>
                            <TableContainer sx={{ borderRadius: 3, border: '1px solid #eee' }}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#FF9800' }}>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>الدكتور</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>السبب</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>الحالة</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>التاريخ</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {deletionRequests.map((req) => (
                                            <TableRow key={req.id} hover>
                                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{req.doctor_name}</TableCell>
                                                <TableCell sx={{ fontFamily: 'Cairo' }}>{req.reason || '-'}</TableCell>
                                                <TableCell>
                                                    <Chip label={req.status_display} color={req.status === 'PENDING' ? 'warning' : req.status === 'APPROVED' ? 'success' : 'error'} sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} />
                                                </TableCell>
                                                <TableCell sx={{ fontFamily: 'Cairo' }}>{new Date(req.created_at).toLocaleDateString('ar-EG')}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grow>
                )}
            </Container>

            {/* Edit Dialog */}
            <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, doctor: null })} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontFamily: 'Cairo', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#e3f2fd', py: 2 }}>
                    <Avatar sx={{ bgcolor: '#1976d2' }}><EditIcon /></Avatar>
                    تعديل بيانات {editDialog.doctor?.full_name}
                    <IconButton onClick={() => setEditDialog({ open: false, doctor: null })} sx={{ ml: 'auto' }}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Grid container spacing={3} sx={{ mt: 0 }}>
                        <Grid item xs={6}>
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1 }}>الاسم الأول</Typography>
                            <TextField fullWidth value={editForm.first_name} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fafafa' } }} />
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1 }}>اسم العائلة</Typography>
                            <TextField fullWidth value={editForm.last_name} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fafafa' } }} />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1 }}>البريد الإلكتروني</Typography>
                            <TextField fullWidth type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fafafa' } }} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button variant="outlined" onClick={() => setEditDialog({ open: false, doctor: null })} sx={{ fontFamily: 'Cairo', borderRadius: 2, px: 4 }}>إلغاء</Button>
                    <Button variant="contained" onClick={handleEditSubmit} sx={{ fontFamily: 'Cairo', fontWeight: 'bold', borderRadius: 2, px: 4, background: 'linear-gradient(135deg, #1976d2, #42a5f5)' }}>حفظ</Button>
                </DialogActions>
            </Dialog>

            {/* Reset Password Dialog */}
            <Dialog open={resetDialog.open} onClose={() => setResetDialog({ open: false, doctor: null })} PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontFamily: 'Cairo', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#fff3e0', py: 2 }}>
                    <Avatar sx={{ bgcolor: '#ff9800' }}><LockResetIcon /></Avatar>
                    إعادة تعيين كلمة المرور
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Typography variant="h6" sx={{ fontFamily: 'Cairo' }}>
                        هل تريد إعادة تعيين كلمة مرور "<strong>{resetDialog.doctor?.full_name}</strong>"؟
                    </Typography>
                    <Alert severity="info" sx={{ mt: 2, fontFamily: 'Cairo', borderRadius: 2 }}>
                        سيتم تعيين كلمة المرور إلى الرقم القومي
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button variant="outlined" onClick={() => setResetDialog({ open: false, doctor: null })} sx={{ fontFamily: 'Cairo', borderRadius: 2, px: 4 }}>إلغاء</Button>
                    <Button variant="contained" onClick={handleResetPassword} sx={{ fontFamily: 'Cairo', fontWeight: 'bold', borderRadius: 2, px: 4, background: 'linear-gradient(135deg, #ff9800, #ffb74d)' }}>تأكيد</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Request Dialog */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, doctor: null, reason: '' })} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontFamily: 'Cairo', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#ffebee', color: '#d32f2f', py: 2 }}>
                    <Avatar sx={{ bgcolor: '#d32f2f' }}><DeleteIcon /></Avatar>
                    طلب حذف عضو
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Alert severity="warning" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 2 }}>
                        سيتم إرسال طلب الحذف للأدمن للموافقة عليه
                    </Alert>
                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', mb: 2 }}>
                        هل تريد حذف "<strong>{deleteDialog.doctor?.full_name}</strong>"؟
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1 }}>سبب الحذف (اختياري)</Typography>
                    <TextField fullWidth multiline rows={3} value={deleteDialog.reason} onChange={(e) => setDeleteDialog({ ...deleteDialog, reason: e.target.value })} placeholder="أدخل سبب الحذف..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fafafa' } }} />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button variant="outlined" onClick={() => setDeleteDialog({ open: false, doctor: null, reason: '' })} sx={{ fontFamily: 'Cairo', borderRadius: 2, px: 4 }}>إلغاء</Button>
                    <Button variant="contained" color="error" onClick={handleDeleteRequest} sx={{ fontFamily: 'Cairo', fontWeight: 'bold', borderRadius: 2, px: 4 }}>إرسال طلب الحذف</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
