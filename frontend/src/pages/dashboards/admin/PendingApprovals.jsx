import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, Chip, CircularProgress, Alert, Dialog, DialogTitle,
    DialogContent, DialogActions, IconButton
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GradingIcon from '@mui/icons-material/Grading';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function PendingApprovals() {
    const navigate = useNavigate();
    const [pendingGrades, setPendingGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [confirmDialog, setConfirmDialog] = useState({ open: false, item: null });

    useEffect(() => {
        fetchPendingGrades();
    }, []);

    const fetchPendingGrades = async () => {
        try {
            const response = await axios.get('/api/academic/exam-grades/pending/', { withCredentials: true });
            setPendingGrades(response.data);
            setLoading(false);
        } catch (err) {
            setError('فشل تحميل البيانات');
            setLoading(false);
        }
    };

    const handleApproveGrades = async (levelId) => {
        try {
            const response = await axios.post(`/api/academic/exam-grades/approve/${levelId}/`, {}, { withCredentials: true });
            setSuccess(response.data.message || 'تمت الموافقة بنجاح');
            fetchPendingGrades();
            setConfirmDialog({ open: false, item: null });
        } catch (err) {
            setError(err.response?.data?.error || 'فشلت الموافقة');
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <IconButton onClick={() => navigate('/admin/dashboard')}>
                    <ArrowBackIcon />
                </IconButton>
                <GradingIcon sx={{ fontSize: 40, color: '#7b1fa2' }} />
                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                    الموافقات المعلقة - الدرجات
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Paper sx={{ p: 2 }}>
                {loading ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
                ) : pendingGrades.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: 'text.secondary' }}>
                            ✅ لا توجد درجات معلقة للموافقة
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: '#7b1fa2' }}>
                                <TableRow>
                                    <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>القسم</TableCell>
                                    <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>الفرقة</TableCell>
                                    <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>السنة الأكاديمية</TableCell>
                                    <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>عدد الدرجات</TableCell>
                                    <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>الإجراءات</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pendingGrades.map((item, idx) => (
                                    <TableRow key={idx} hover>
                                        <TableCell sx={{ fontFamily: 'Cairo' }}>{item.department}</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo' }}>{item.level_name}</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo' }}>{item.academic_year}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                {item.midterm_count > 0 && <Chip label={`${item.midterm_count} منتصف ترم`} size="small" color="info" />}
                                                {item.final_count > 0 && <Chip label={`${item.final_count} نهائي`} size="small" color="warning" />}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Button size="small" variant="contained" color="success" startIcon={<CheckCircleIcon />}
                                                onClick={() => setConfirmDialog({ open: true, item: { level_id: item.level_id, name: `${item.department} - ${item.level_name}` } })}
                                                sx={{ fontFamily: 'Cairo' }}>موافقة</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, item: null })}>
                <DialogTitle sx={{ fontFamily: 'Cairo' }}>تأكيد الموافقة</DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontFamily: 'Cairo' }}>
                        هل أنت متأكد من الموافقة على درجات "{confirmDialog.item?.name}"؟
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialog({ open: false, item: null })} sx={{ fontFamily: 'Cairo' }}>إلغاء</Button>
                    <Button variant="contained" color="success"
                        onClick={() => handleApproveGrades(confirmDialog.item.level_id)}
                        sx={{ fontFamily: 'Cairo' }}>موافقة</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
