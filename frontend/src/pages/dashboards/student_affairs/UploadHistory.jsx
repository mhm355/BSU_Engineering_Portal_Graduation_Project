import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Paper, Button, Alert,
    CircularProgress, Chip,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HistoryIcon from '@mui/icons-material/History';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function UploadHistory() {
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
            const res = await axios.get('/api/academic/student-affairs/upload-history/', config);
            setHistory(res.data);
        } catch (err) {
            setError('فشل في تحميل سجل الرفع');
        } finally {
            setLoading(false);
        }
    };

    const downloadErrorReport = (record) => {
        if (!record.errors_json || record.errors_json.length === 0) return;

        const csvContent = 'الصف,الخطأ\n' +
            record.errors_json.map((err, i) => `${i + 1},"${err}"`).join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `error_report_${record.id}_${record.upload_type}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getTypeLabel = (type) => {
        const labels = {
            'STUDENT': 'طلاب',
            'DOCTOR': 'دكاترة',
            'STAFF': 'موظفين',
            'GRADE': 'درجات',
            'CERTIFICATE': 'شهادات',
        };
        return labels[type] || type;
    };

    const getTypeColor = (type) => {
        const colors = {
            'STUDENT': '#1976d2',
            'DOCTOR': '#9c27b0',
            'STAFF': '#ff9800',
            'GRADE': '#4caf50',
            'CERTIFICATE': '#00bcd4',
        };
        return colors[type] || '#757575';
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/student-affairs/dashboard')}
                sx={{ mb: 2, fontFamily: 'Cairo' }}
            >
                عودة للوحة التحكم
            </Button>

            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                <HistoryIcon sx={{ mr: 1, verticalAlign: 'bottom', fontSize: 36 }} />
                سجل عمليات الرفع
            </Typography>

            <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666', mb: 3 }}>
                تتبع جميع عمليات الرفع السابقة وتحميل تقارير الأخطاء
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2, fontFamily: 'Cairo' }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ textAlign: 'center', py: 5 }}><CircularProgress /></Box>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#0A2342' }}>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>#</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>النوع</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>اسم الملف</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>إجمالي الصفوف</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>تم إنشاء</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>تم تحديث</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>أخطاء</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>التاريخ</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>تقرير</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {history.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} sx={{ textAlign: 'center', fontFamily: 'Cairo', py: 4 }}>
                                        لا توجد عمليات رفع سابقة
                                    </TableCell>
                                </TableRow>
                            ) : history.map((record, index) => (
                                <TableRow key={record.id} hover>
                                    <TableCell sx={{ fontFamily: 'Cairo' }}>{index + 1}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getTypeLabel(record.upload_type)}
                                            size="small"
                                            sx={{
                                                bgcolor: getTypeColor(record.upload_type),
                                                color: '#fff',
                                                fontFamily: 'Cairo',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo' }}>{record.file_name}</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'center' }}>{record.total_rows}</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'center' }}>
                                        <Chip label={record.created_count} size="small" color="success" variant="outlined" />
                                    </TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'center' }}>
                                        <Chip label={record.updated_count} size="small" color="info" variant="outlined" />
                                    </TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'center' }}>
                                        {record.error_count > 0 ? (
                                            <Chip
                                                icon={<ErrorIcon />}
                                                label={record.error_count}
                                                size="small"
                                                color="error"
                                            />
                                        ) : (
                                            <CheckCircleIcon sx={{ color: '#4caf50' }} />
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', direction: 'ltr', fontSize: 13 }}>
                                        {new Date(record.created_at).toLocaleString('ar-EG')}
                                    </TableCell>
                                    <TableCell>
                                        {record.error_count > 0 && record.errors_json ? (
                                            <Tooltip title="تحميل تقرير الأخطاء">
                                                <IconButton
                                                    color="error"
                                                    size="small"
                                                    onClick={() => downloadErrorReport(record)}
                                                >
                                                    <DownloadIcon />
                                                </IconButton>
                                            </Tooltip>
                                        ) : (
                                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#ccc' }}>—</Typography>
                                        )}
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
