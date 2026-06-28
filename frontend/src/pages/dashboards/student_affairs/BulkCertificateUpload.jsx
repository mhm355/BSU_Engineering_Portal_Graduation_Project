import React, { useState } from 'react';
import {
    Box, Container, Typography, Paper, Button, Alert,
    CircularProgress, Chip, Grid,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SyncIcon from '@mui/icons-material/Sync';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function BulkCertificateUpload() {
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [loadingSync, setLoadingSync] = useState(false);
    const [loadingBulk, setLoadingBulk] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files);
        if (selected.length > 0) {
            setFiles(selected);
            setError('');
        } else {
            setFiles([]);
        }
    };

    const handleSync = async () => {
        setLoadingSync(true);
        setError('');
        setResult(null);

        try {
            const res = await axios.post('/api/academic/student-affairs/certificates/sync/', {}, config);
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'فشل في مزامنة الشهادات');
        } finally {
            setLoadingSync(false);
        }
    };

    const handleBulkUpload = async () => {
        if (files.length === 0) {
            setError('يرجى اختيار ملفات الشهادات');
            return;
        }

        setLoadingBulk(true);
        setError('');
        setResult(null);

        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });

            const res = await axios.post('/api/academic/student-affairs/certificates/bulk-direct/', formData, {
                ...config,
                headers: { ...config.headers, 'Content-Type': 'multipart/form-data' }
            });

            setResult(res.data);
            setFiles([]);
        } catch (err) {
            setError(err.response?.data?.error || 'فشل في رفع الشهادات');
        } finally {
            setLoadingBulk(false);
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
                شهادات التخرج
            </Typography>

            <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666', mb: 3 }}>
                اختر إحدى الطرق التالية لإضافة الشهادات للطلاب
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

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 800, mx: 'auto', mb: 3 }}>
                <Box>
                    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1976d2' }}>
                            Sync Certificates
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666', mb: 3, flexGrow: 1 }}>
                            Use this option if you have already uploaded certificates directly to the Azure Cloud Storage. This process scans the cloud and syncs database records.
                        </Typography>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={handleSync}
                            disabled={loadingSync || loadingBulk}
                            sx={{ fontFamily: 'Cairo', py: 1.5, borderColor: '#1976d2', color: '#1976d2' }}
                            startIcon={loadingSync ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
                        >
                            {loadingSync ? 'Syncing...' : 'Sync Certificates'}
                        </Button>
                    </Paper>
                </Box>

                <Box>
                    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#00bcd4' }}>
                            Bulk Certificates
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666', mb: 3, flexGrow: 1 }}>
                            Select multiple certificate files (.pdf, .png, .jpg) from your device. They will be uploaded and assigned automatically.
                        </Typography>
                        
                        <Box
                            sx={{
                                border: '2px dashed #00bcd4',
                                borderRadius: 2,
                                p: 2,
                                mb: 2,
                                textAlign: 'center',
                                bgcolor: files.length > 0 ? '#e0f7fa' : '#fafafa',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                '&:hover': { bgcolor: '#e0f7fa' }
                            }}
                            component="label"
                        >
                            <input type="file" hidden multiple accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} />
                            {files.length > 0 ? (
                                <>
                                    <CheckCircleIcon sx={{ fontSize: 32, color: '#00bcd4', mb: 1 }} />
                                    <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                        {files.length} Files Selected
                                    </Typography>
                                </>
                            ) : (
                                <>
                                    <CloudUploadIcon sx={{ fontSize: 32, color: '#00bcd4', mb: 1 }} />
                                    <Typography sx={{ fontFamily: 'Cairo' }}>
                                        Click to select files
                                    </Typography>
                                </>
                            )}
                        </Box>

                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleBulkUpload}
                            disabled={loadingBulk || loadingSync || files.length === 0}
                            sx={{ fontFamily: 'Cairo', py: 1.5, bgcolor: '#00bcd4', '&:hover': { bgcolor: '#0097a7' } }}
                            startIcon={loadingBulk ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                        >
                            {loadingBulk ? 'Uploading...' : 'Bulk Certificates'}
                        </Button>
                    </Paper>
                </Box>
            </Box>

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
                    <li>يجب تسمية كل ملف باسم الرقم القومي للطالب (مثال: <code>12345678901234.pdf</code> أو <code>12345678901234.png</code>).</li>
                    <li>يجب أن يكون الطالب في الفرقة الرابعة.</li>
                    <li>في حالة رفع شهادة لطالب يمتلك شهادة بالفعل، سيتم تحديث الشهادة القديمة.</li>
                </Box>
            </Paper>
        </Container>
    );
}
