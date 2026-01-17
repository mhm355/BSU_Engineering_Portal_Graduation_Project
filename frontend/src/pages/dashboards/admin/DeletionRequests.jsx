import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, Alert, Chip, CircularProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';

export default function DeletionRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await axios.get('/api/academic/admin/deletion-requests/', { withCredentials: true });
            setRequests(response.data);
            setLoading(false);
        } catch (err) {
            setError('فشل تحميل طلبات الحذف');
            setLoading(false);
        }
    };

    const handleAction = async (requestId, action) => {
        try {
            await axios.post(
                `/api/academic/admin/deletion-requests/${requestId}/`,
                { action },
                { withCredentials: true }
            );
            setSuccess(action === 'approve' ? 'تمت الموافقة على الحذف' : 'تم رفض الطلب');
            fetchRequests();
        } catch (err) {
            setError('فشل تنفيذ الإجراء');
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button onClick={() => window.history.back()} sx={{ mb: 2, fontFamily: 'Cairo' }}>← عودة</Button>

            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 4 }}>
                طلبات حذف الأعضاء
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo' }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3, fontFamily: 'Cairo' }} onClose={() => setSuccess('')}>{success}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
            ) : requests.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography sx={{ fontFamily: 'Cairo', color: 'text.secondary' }}>
                        لا توجد طلبات حذف معلقة
                    </Typography>
                </Paper>
            ) : (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                        الطلبات المعلقة ({requests.length})
                    </Typography>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الدكتور</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الرقم القومي</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>مقدم الطلب</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>السبب</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>التاريخ</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>إجراءات</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {requests.map((req) => (
                                    <TableRow key={req.id} hover>
                                        <TableCell sx={{ fontFamily: 'Cairo' }}>{req.doctor_name}</TableCell>
                                        <TableCell sx={{ fontFamily: 'monospace' }}>{req.doctor_national_id}</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo' }}>{req.requested_by_name}</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo' }}>{req.reason || '-'}</TableCell>
                                        <TableCell>{new Date(req.created_at).toLocaleDateString('ar-EG')}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                size="small"
                                                startIcon={<CheckCircleIcon />}
                                                onClick={() => handleAction(req.id, 'approve')}
                                                sx={{ fontFamily: 'Cairo', mr: 1 }}
                                            >
                                                موافقة
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                startIcon={<CancelIcon />}
                                                onClick={() => handleAction(req.id, 'reject')}
                                                sx={{ fontFamily: 'Cairo' }}
                                            >
                                                رفض
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}
        </Container>
    );
}
