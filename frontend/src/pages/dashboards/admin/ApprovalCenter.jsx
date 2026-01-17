import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip, Alert, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';

export default function ApprovalCenter() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionMessage, setActionMessage] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await axios.get('/api/system/delete-requests/', { withCredentials: true });
            setRequests(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching requests:', err);
            setError('فشل تحميل الطلبات.');
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            await axios.post(`/api/system/delete-requests/${id}/${action}/`, {}, { withCredentials: true });
            setActionMessage(action === 'approve' ? 'تمت الموافقة والحذف بنجاح.' : 'تم رفض الطلب.');
            fetchRequests(); // Refresh list
            setTimeout(() => setActionMessage(''), 3000);
        } catch (err) {
            console.error(`Error ${action} request:`, err);
            setError('حدث خطأ أثناء تنفيذ الإجراء.');
        }
    };

    const getStatusChip = (request) => {
        if (request.is_approved) return <Chip label="مقبول" color="success" size="small" sx={{ fontFamily: 'Cairo' }} />;
        if (request.is_rejected) return <Chip label="مرفوض" color="error" size="small" sx={{ fontFamily: 'Cairo' }} />;
        return <Chip label="قيد الانتظار" color="warning" size="small" sx={{ fontFamily: 'Cairo' }} />;
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 4 }}>
                مركز الموافقات (طلبات الحذف)
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo' }}>{error}</Alert>}
            {actionMessage && <Alert severity="success" sx={{ mb: 3, fontFamily: 'Cairo' }}>{actionMessage}</Alert>}

            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                {loading ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer sx={{ maxHeight: 600 }}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="right" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', bgcolor: '#f5f5f5' }}>مقدم الطلب</TableCell>
                                    <TableCell align="right" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', bgcolor: '#f5f5f5' }}>نوع العنصر</TableCell>
                                    <TableCell align="right" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', bgcolor: '#f5f5f5' }}>رقم العنصر (ID)</TableCell>
                                    <TableCell align="right" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', bgcolor: '#f5f5f5' }}>السبب</TableCell>
                                    <TableCell align="right" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', bgcolor: '#f5f5f5' }}>الحالة</TableCell>
                                    <TableCell align="center" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', bgcolor: '#f5f5f5' }}>الإجراءات</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {requests.map((req) => (
                                    <TableRow key={req.id} hover>
                                        <TableCell align="right" sx={{ fontFamily: 'Cairo' }}>{req.requested_by_name}</TableCell>
                                        <TableCell align="right" sx={{ fontFamily: 'Cairo' }}>{req.item_type}</TableCell>
                                        <TableCell align="right" sx={{ fontFamily: 'Cairo' }}>{req.item_id}</TableCell>
                                        <TableCell align="right" sx={{ fontFamily: 'Cairo' }}>{req.reason || '-'}</TableCell>
                                        <TableCell align="right">{getStatusChip(req)}</TableCell>
                                        <TableCell align="center">
                                            {!req.is_approved && !req.is_rejected && (
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        onClick={() => handleAction(req.id, 'approve')}
                                                        startIcon={<CheckCircleIcon />}
                                                        sx={{ fontFamily: 'Cairo' }}
                                                    >
                                                        موافقة
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        color="error"
                                                        size="small"
                                                        onClick={() => handleAction(req.id, 'reject')}
                                                        startIcon={<CancelIcon />}
                                                        sx={{ fontFamily: 'Cairo' }}
                                                    >
                                                        رفض
                                                    </Button>
                                                </Box>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {requests.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 3, fontFamily: 'Cairo' }}>
                                            لا توجد طلبات حالياً.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Container>
    );
}
