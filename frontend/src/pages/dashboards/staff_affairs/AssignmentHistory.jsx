import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Paper, Button, Alert,
    CircularProgress, Chip,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HistoryIcon from '@mui/icons-material/History';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AssignmentHistory() {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/academic/staff-affairs/assignment-history/', config);
            setHistory(res.data);
        } catch (err) {
            setError('فشل في تحميل سجل التعيينات');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/staff-affairs/dashboard')}
                sx={{ mb: 2, fontFamily: 'Cairo' }}
            >
                عودة للوحة التحكم
            </Button>

            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1E293B' }}>
                <HistoryIcon sx={{ mr: 1, verticalAlign: 'bottom', fontSize: 36 }} />
                سجل التعيينات
            </Typography>

            <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666', mb: 3 }}>
                تتبع جميع عمليات تعيين وإلغاء تعيين الدكاترة
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2, fontFamily: 'Cairo' }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ textAlign: 'center', py: 5 }}><CircularProgress /></Box>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#4F46E5' }}>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>#</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>الإجراء</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>الدكتور</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>المادة</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>الفرقة</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>الترم</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>بواسطة</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>التاريخ</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {history.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} sx={{ textAlign: 'center', fontFamily: 'Cairo', py: 4 }}>
                                        لا توجد سجلات تعيين بعد
                                    </TableCell>
                                </TableRow>
                            ) : history.map((record, index) => (
                                <TableRow key={record.id} hover>
                                    <TableCell sx={{ fontFamily: 'Cairo' }}>{index + 1}</TableCell>
                                    <TableCell>
                                        <Chip
                                            icon={record.action === 'DOCTOR_ASSIGNMENT' ? <PersonAddIcon /> : <PersonRemoveIcon />}
                                            label={record.action_display}
                                            size="small"
                                            sx={{
                                                fontFamily: 'Cairo',
                                                bgcolor: record.action === 'DOCTOR_ASSIGNMENT' ? '#e8f5e9' : '#ffebee',
                                                color: record.action === 'DOCTOR_ASSIGNMENT' ? '#2e7d32' : '#c62828',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{record.doctor_name}</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo' }}>{record.subject}</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo' }}>{record.level}</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo' }}>{record.term}</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo' }}>{record.performed_by}</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', direction: 'ltr', fontSize: 13 }}>
                                        {new Date(record.created_at).toLocaleString('ar-EG')}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
}
