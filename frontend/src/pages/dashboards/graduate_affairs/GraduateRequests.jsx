import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Button, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function GraduateRequests() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [statusUpdate, setStatusUpdate] = useState('');
    const [adminNotes, setAdminNotes] = useState('');

    const fetchRequests = async () => {
        try {
            const config = { withCredentials: true };
            const res = await axios.get('/api/graduate-affairs/requests/', config);
            setRequests(Array.isArray(res.data) ? res.data : (res.data?.results || []));
            setError('');
        } catch (err) {
            setError('فشل تحميل الطلبات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'IN_PROGRESS': return 'info';
            case 'COMPLETED': return 'success';
            case 'REJECTED': return 'error';
            default: return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'PENDING': return 'قيد الانتظار';
            case 'IN_PROGRESS': return 'جاري العمل';
            case 'COMPLETED': return 'مكتمل';
            case 'REJECTED': return 'مرفوض';
            default: return status;
        }
    };

    const handleViewRequest = (request) => {
        setSelectedRequest(request);
        setStatusUpdate(request.status);
        setAdminNotes(request.admin_notes || '');
        setOpenDialog(true);
    };

    const handleUpdateRequest = async () => {
        try {
            const config = { withCredentials: true };
            await axios.patch(`/api/graduate-affairs/requests/${selectedRequest.id}/update-status/`, {
                status: statusUpdate,
                admin_notes: adminNotes
            }, config);
            setOpenDialog(false);
            fetchRequests();
        } catch (err) {
            setError('فشل تحديث الطلب');
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/graduate-affairs/dashboard')}
                sx={{ mb: 2, fontFamily: 'Cairo' }}
            >
                عودة للوحة التحكم
            </Button>

            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                طلبات الخريجين
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>رقم الطلب</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الخريج</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>نوع الطلب</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>تاريخ الطلب</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الحالة</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>إجراءات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {requests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4, fontFamily: 'Cairo' }}>لا توجد طلبات حالياً</TableCell>
                                </TableRow>
                            ) : (
                                requests.map((req) => (
                                    <TableRow key={req.id} hover>
                                        <TableCell>#{req.id}</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo' }}>{req.student_name || req.graduate?.user?.full_name || 'غير معروف'}</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo' }}>{req.request_type === 'CERTIFICATE' ? 'إفادة تخرج' : 'تحديث بيانات'}</TableCell>
                                        <TableCell>{new Date(req.created_at).toLocaleDateString('ar-EG')}</TableCell>
                                        <TableCell>
                                            <Chip label={getStatusText(req.status)} color={getStatusColor(req.status)} size="small" sx={{ fontFamily: 'Cairo' }} />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton color="primary" onClick={() => handleViewRequest(req)}>
                                                <VisibilityIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>تحديث حالة الطلب #{selectedRequest?.id}</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', mb: 1 }}><strong>تفاصيل الطلب:</strong> {selectedRequest?.details || 'لا توجد تفاصيل إضافية'}</Typography>
                        </Box>

                        <FormControl fullWidth>
                            <InputLabel sx={{ fontFamily: 'Cairo' }}>الحالة</InputLabel>
                            <Select
                                value={statusUpdate}
                                onChange={(e) => setStatusUpdate(e.target.value)}
                                label="الحالة"
                                sx={{ fontFamily: 'Cairo' }}
                            >
                                <MenuItem value="PENDING" sx={{ fontFamily: 'Cairo' }}>قيد الانتظار</MenuItem>
                                <MenuItem value="IN_PROGRESS" sx={{ fontFamily: 'Cairo' }}>جاري العمل</MenuItem>
                                <MenuItem value="COMPLETED" sx={{ fontFamily: 'Cairo' }}>مكتمل</MenuItem>
                                <MenuItem value="REJECTED" sx={{ fontFamily: 'Cairo' }}>مرفوض</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="ملاحظات إدارية (تظهر للطالب)"
                            multiline
                            rows={3}
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            fullWidth
                            InputProps={{ sx: { fontFamily: 'Cairo' } }}
                            InputLabelProps={{ sx: { fontFamily: 'Cairo' } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ fontFamily: 'Cairo' }}>إلغاء</Button>
                    <Button onClick={handleUpdateRequest} variant="contained" sx={{ fontFamily: 'Cairo' }}>حفظ التعديلات</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
