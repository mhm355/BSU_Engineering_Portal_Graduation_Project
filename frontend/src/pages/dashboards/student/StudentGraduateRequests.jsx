import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Button, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert, useTheme
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function StudentGraduateRequests() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({
        request_type: 'CERTIFICATE',
        details: ''
    });

    const fetchRequests = async () => {
        try {
            const config = { withCredentials: true };
            const res = await axios.get('/api/graduate-affairs/student-requests/', config);
            setRequests(Array.isArray(res.data) ? res.data : (res.data?.results || []));
            setError('');
        } catch (err) {
            setError('فشل تحميل الطلبات. الرجاء المحاولة لاحقاً.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const getStatusChip = (status) => {
        switch (status) {
            case 'COMPLETED': return <Chip icon={<CheckCircleIcon />} label="مكتمل" color="success" size="small" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} />;
            case 'REJECTED': return <Chip label="مرفوض" color="error" size="small" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} />;
            case 'IN_PROGRESS': return <Chip icon={<PendingIcon />} label="جاري العمل" color="info" size="small" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} />;
            case 'PENDING': default: return <Chip label="قيد الانتظار" color="warning" size="small" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} />;
        }
    };

    const handleCreateRequest = async () => {
        if (!formData.details && formData.request_type !== 'CERTIFICATE') {
            setError('يرجى إضافة تفاصيل الطلب');
            return;
        }
        
        try {
            const config = { withCredentials: true };
            await axios.post('/api/graduate-affairs/student-requests/', formData, config);
            setOpenDialog(false);
            setFormData({ request_type: 'CERTIFICATE', details: '' });
            fetchRequests();
        } catch (err) {
            setError('فشل تقديم الطلب');
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/student/dashboard')}
                sx={{ mb: 2, fontFamily: 'Cairo' }}
            >
                عودة للرئيسية
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                    طلبات وخدمات الخريجين
                </Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={() => setOpenDialog(true)}
                    sx={{ fontFamily: 'Cairo', borderRadius: 2 }}
                >
                    تقديم طلب جديد
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo' }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: isDark ? 'background.default' : '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>رقم الطلب</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>نوع الطلب</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>تاريخ التقديم</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الحالة</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>ملاحظات الإدارة</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {requests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4, fontFamily: 'Cairo' }}>
                                        لم تقم بتقديم أي طلبات حتى الآن
                                    </TableCell>
                                </TableRow>
                            ) : (
                                requests.map((req) => (
                                    <TableRow key={req.id} hover>
                                        <TableCell sx={{ fontFamily: 'monospace' }}>#{req.id}</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo' }}>
                                            {req.request_type === 'CERTIFICATE' ? 'إفادة تخرج' : 
                                             req.request_type === 'UPDATE_INFO' ? 'تحديث بيانات' : 'أخرى'}
                                        </TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo' }}>
                                            {new Date(req.created_at).toLocaleDateString('ar-EG')}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusChip(req.status)}
                                        </TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', color: 'text.secondary' }}>
                                            {req.admin_notes || '-'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Create Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                    تقديم طلب جديد
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel sx={{ fontFamily: 'Cairo' }}>نوع الطلب</InputLabel>
                            <Select
                                value={formData.request_type}
                                onChange={(e) => setFormData({ ...formData, request_type: e.target.value })}
                                label="نوع الطلب"
                                sx={{ fontFamily: 'Cairo' }}
                            >
                                <MenuItem value="CERTIFICATE" sx={{ fontFamily: 'Cairo' }}>طلب إفادة تخرج / شهادة</MenuItem>
                                <MenuItem value="UPDATE_INFO" sx={{ fontFamily: 'Cairo' }}>طلب تحديث بيانات</MenuItem>
                                <MenuItem value="OTHER" sx={{ fontFamily: 'Cairo' }}>طلب آخر</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="تفاصيل الطلب (أو سبب الطلب)"
                            multiline
                            rows={3}
                            value={formData.details}
                            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                            fullWidth
                            InputProps={{ sx: { fontFamily: 'Cairo' } }}
                            InputLabelProps={{ sx: { fontFamily: 'Cairo' } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ fontFamily: 'Cairo' }}>إلغاء</Button>
                    <Button onClick={handleCreateRequest} variant="contained" sx={{ fontFamily: 'Cairo' }}>
                        إرسال الطلب
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
