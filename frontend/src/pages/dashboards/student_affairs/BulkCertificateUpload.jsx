import React, { useState } from 'react';
import {
    Box, Container, Typography, Paper, Button, Alert,
    CircularProgress, Chip,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function BulkCertificateUpload() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.name.endsWith('.zip')) {
            setFile(selected);
            setError('');
        } else {
            setError('يجب أن يكون الملف بصيغة ZIP');
            setFile(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('يرجى رفع ملف ZIP');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await axios.post('/api/academic/student-affairs/bulk-certificates/', formData, {
                ...config,
                headers: { ...config.headers, 'Content-Type': 'multipart/form-data' }
            });

            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'فشل في رفع الشهادات');
        } finally {
            setLoading(false);
        }
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

            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1E293B' }}>
                رفع الشهادات بالجملة
            </Typography>

            <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666', mb: 3 }}>
                قم برفع ملف ZIP يحتوي على ملفات PDF للشهادات — اسم كل ملف يجب أن يكون الرقم القومي للطالب
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2, fontFamily: 'Cairo' }}>{error}</Alert>}

            {result && (
                <Alert
                    severity={result.error_count > 0 ? 'warning' : 'success'}
                    sx={{ mb: 2, fontFamily: 'Cairo' }}
                    icon={result.error_count > 0 ? <ErrorIcon /> : <CheckCircleIcon />}
                >
                    {result.message}
                    {result.error_count > 0 && ` — ${result.error_count} أخطاء`}
                </Alert>
            )}

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                    رفع ملف الشهادات
                </Typography>

                <Box
                    sx={{
                        border: '2px dashed #00bcd4',
                        borderRadius: 2,
                        p: 4,
                        textAlign: 'center',
                        bgcolor: file ? '#e0f7fa' : '#fafafa',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': { bgcolor: '#e0f7fa' }
                    }}
                    component="label"
                >
                    <input type="file" hidden accept=".zip" onChange={handleFileChange} />
                    {file ? (
                        <>
                            <FolderZipIcon sx={{ fontSize: 48, color: '#00bcd4', mb: 1 }} />
                            <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                {file.name}
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </Typography>
                        </>
                    ) : (
                        <>
                            <CloudUploadIcon sx={{ fontSize: 48, color: '#00bcd4', mb: 1 }} />
                            <Typography sx={{ fontFamily: 'Cairo' }}>
                                اضغط لرفع ملف ZIP يحتوي على الشهادات
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#999', mt: 1 }}>
                                كل ملف PDF يجب تسميته بالرقم القومي (مثل: 12345678901234.pdf)
                            </Typography>
                        </>
                    )}
                </Box>

                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleUpload}
                    disabled={loading || !file}
                    sx={{ mt: 3, fontFamily: 'Cairo', py: 1.5, bgcolor: '#00bcd4', '&:hover': { bgcolor: '#0097a7' } }}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                >
                    {loading ? 'جاري الرفع...' : 'رفع الشهادات'}
                </Button>
            </Paper>

            {/* Error Details */}
            {result?.errors?.length > 0 && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#d32f2f' }}>
                        تفاصيل الأخطاء
                    </Typography>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>#</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الخطأ</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {result.errors.map((err, i) => (
                                    <TableRow key={i}>
                                        <TableCell sx={{ fontFamily: 'Cairo' }}>{i + 1}</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', color: '#d32f2f' }}>{err}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* Instructions */}
            <Paper sx={{ p: 3, mt: 3, bgcolor: '#f5f5f5' }}>
                <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                    تعليمات التجهيز
                </Typography>
                <Box component="ol" sx={{ fontFamily: 'Cairo', pr: 3 }}>
                    <li>جهّز ملفات PDF للشهادات</li>
                    <li>سمِّ كل ملف PDF بالرقم القومي للطالب (مثال: <code>12345678901234.pdf</code>)</li>
                    <li>اضغط على الملفات في ملف ZIP واحد</li>
                    <li>ارفع ملف ZIP من هذه الصفحة</li>
                </Box>
            </Paper>
        </Container>
    );
}
