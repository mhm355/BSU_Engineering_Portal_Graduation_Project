import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Paper, Grid, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, IconButton, Tooltip, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions, Alert, Chip, CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import axios from 'axios';

export default function ManageDoctors() {
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

    useEffect(() => {
        fetchDoctors();
        fetchDeletionRequests();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await axios.get('/api/academic/staff-affairs/doctors/', { withCredentials: true });
            setDoctors(response.data);
            setLoading(false);
        } catch (err) {
            setError('فشل تحميل قائمة الأعضاء');
            setLoading(false);
        }
    };

    const fetchDeletionRequests = async () => {
        try {
            const response = await axios.get('/api/academic/staff-affairs/deletion-requests/', { withCredentials: true });
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
            await axios.put(
                `/api/academic/staff-affairs/doctors/${editDialog.doctor.id}/`,
                editForm,
                { withCredentials: true }
            );
            setSuccess('تم تحديث البيانات بنجاح');
            setEditDialog({ open: false, doctor: null });
            fetchDoctors();
        } catch (err) {
            setError('فشل تحديث البيانات');
        }
    };

    const handleResetPassword = async () => {
        try {
            await axios.post(
                `/api/academic/staff-affairs/doctors/${resetDialog.doctor.id}/reset-password/`,
                {},
                { withCredentials: true }
            );
            setSuccess(`تم إعادة تعيين كلمة مرور ${resetDialog.doctor.full_name} إلى الرقم القومي`);
            setResetDialog({ open: false, doctor: null });
        } catch (err) {
            setError('فشل إعادة تعيين كلمة المرور');
        }
    };

    const handleDeleteRequest = async () => {
        try {
            await axios.post(
                `/api/academic/staff-affairs/doctors/${deleteDialog.doctor.id}/delete-request/`,
                { reason: deleteDialog.reason },
                { withCredentials: true }
            );
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

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button onClick={() => window.history.back()} sx={{ mb: 2, fontFamily: 'Cairo' }}>← عودة</Button>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                    إدارة أعضاء هيئة التدريس
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<UploadFileIcon />}
                    onClick={() => window.location.href = '/staff-affairs/upload-doctors'}
                    sx={{ fontFamily: 'Cairo' }}
                >
                    رفع أعضاء جدد
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo' }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3, fontFamily: 'Cairo' }} onClose={() => setSuccess('')}>{success}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
            ) : (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                        قائمة الأعضاء ({doctors.length})
                    </Typography>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الاسم</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الرقم القومي</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>البريد الإلكتروني</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الحالة</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>إجراءات</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {doctors.map((doctor) => (
                                    <TableRow key={doctor.id} hover>
                                        <TableCell sx={{ fontFamily: 'Cairo' }}>{doctor.full_name}</TableCell>
                                        <TableCell sx={{ fontFamily: 'monospace' }}>{doctor.national_id}</TableCell>
                                        <TableCell>{doctor.email || '-'}</TableCell>
                                        <TableCell>
                                            {hasPendingRequest(doctor.id) ? (
                                                <Chip label="طلب حذف معلق" color="warning" size="small" sx={{ fontFamily: 'Cairo' }} />
                                            ) : (
                                                <Chip label="فعال" color="success" size="small" sx={{ fontFamily: 'Cairo' }} />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="تعديل">
                                                <IconButton color="primary" onClick={() => handleEditOpen(doctor)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="إعادة تعيين كلمة المرور">
                                                <IconButton color="info" onClick={() => setResetDialog({ open: true, doctor })}>
                                                    <LockResetIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="طلب حذف">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => setDeleteDialog({ open: true, doctor, reason: '' })}
                                                    disabled={hasPendingRequest(doctor.id)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* My Deletion Requests */}
            {deletionRequests.length > 0 && (
                <Paper sx={{ p: 3, mt: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                        طلبات الحذف الخاصة بي
                    </Typography>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الدكتور</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>السبب</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الحالة</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>التاريخ</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {deletionRequests.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell sx={{ fontFamily: 'Cairo' }}>{req.doctor_name}</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo' }}>{req.reason || '-'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={req.status_display}
                                                color={req.status === 'PENDING' ? 'warning' : req.status === 'APPROVED' ? 'success' : 'error'}
                                                size="small"
                                                sx={{ fontFamily: 'Cairo' }}
                                            />
                                        </TableCell>
                                        <TableCell>{new Date(req.created_at).toLocaleDateString('ar-EG')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* Edit Dialog */}
            <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, doctor: null })} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontFamily: 'Cairo' }}>تعديل بيانات {editDialog.doctor?.full_name}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                            <TextField
                                label="الاسم الأول"
                                fullWidth
                                value={editForm.first_name}
                                onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                                InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="اسم العائلة"
                                fullWidth
                                value={editForm.last_name}
                                onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                                InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="البريد الإلكتروني"
                                fullWidth
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialog({ open: false, doctor: null })} sx={{ fontFamily: 'Cairo' }}>إلغاء</Button>
                    <Button variant="contained" onClick={handleEditSubmit} sx={{ fontFamily: 'Cairo' }}>حفظ</Button>
                </DialogActions>
            </Dialog>

            {/* Reset Password Dialog */}
            <Dialog open={resetDialog.open} onClose={() => setResetDialog({ open: false, doctor: null })}>
                <DialogTitle sx={{ fontFamily: 'Cairo' }}>إعادة تعيين كلمة المرور</DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontFamily: 'Cairo' }}>
                        هل تريد إعادة تعيين كلمة مرور "{resetDialog.doctor?.full_name}"؟
                        <br />
                        سيتم تعيين كلمة المرور إلى الرقم القومي.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setResetDialog({ open: false, doctor: null })} sx={{ fontFamily: 'Cairo' }}>إلغاء</Button>
                    <Button variant="contained" color="primary" onClick={handleResetPassword} sx={{ fontFamily: 'Cairo' }}>تأكيد</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Request Dialog */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, doctor: null, reason: '' })} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontFamily: 'Cairo', color: '#d32f2f' }}>طلب حذف عضو</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2, fontFamily: 'Cairo' }}>
                        سيتم إرسال طلب الحذف للأدمن للموافقة عليه.
                    </Alert>
                    <Typography sx={{ fontFamily: 'Cairo', mb: 2 }}>
                        هل تريد حذف "{deleteDialog.doctor?.full_name}"؟
                    </Typography>
                    <TextField
                        label="سبب الحذف (اختياري)"
                        fullWidth
                        multiline
                        rows={2}
                        value={deleteDialog.reason}
                        onChange={(e) => setDeleteDialog({ ...deleteDialog, reason: e.target.value })}
                        InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, doctor: null, reason: '' })} sx={{ fontFamily: 'Cairo' }}>إلغاء</Button>
                    <Button variant="contained" color="error" onClick={handleDeleteRequest} sx={{ fontFamily: 'Cairo' }}>إرسال طلب الحذف</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
