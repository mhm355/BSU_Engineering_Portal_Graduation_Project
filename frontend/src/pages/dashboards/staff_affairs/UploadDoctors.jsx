import React, { useState } from 'react';
import {
    Container, Paper, Typography, Box, Button, Alert, CircularProgress,
    Avatar, Grid, Fade, Grow, Chip, Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import { keyframes } from '@mui/system';
import {
    CloudUpload as UploadIcon,
    ArrowBack as ArrowBackIcon,
    Person as PersonIcon,
    InsertDriveFile as FileIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
    Description as DescriptionIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const UploadDoctors = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('يرجى اختيار ملف');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.post(
                '/api/academic/staff-affairs/upload-doctors/',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'حدث خطأ أثناء رفع الملف');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', pb: 6 }}>
            {/* Hero Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    pt: 4,
                    pb: 6,
                    mb: 4,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', animation: `${float} 6s ease-in-out infinite` }} />
                <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', animation: `${float} 8s ease-in-out infinite`, animationDelay: '2s' }} />

                <Container maxWidth="lg">
                    <Fade in={true} timeout={800}>
                        <Box>
                            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/staff-affairs/dashboard')} sx={{ color: '#fff', mb: 2, fontFamily: 'Cairo', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                                العودة للوحة التحكم
                            </Button>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                                    <PersonIcon sx={{ fontSize: 45, color: '#fff' }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                        رفع الدكاترة
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: 'rgba(255,255,255,0.9)' }}>
                                        رفع ملف Excel لإضافة حسابات الدكاترة الجدد
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    {/* Left Column - File Format Info */}
                    <Grid item xs={12} md={5}>
                        <Grow in={true} timeout={600}>
                            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 25px rgba(0,0,0,0.1)', height: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <Avatar sx={{ width: 50, height: 50, background: 'linear-gradient(135deg, #1976d2, #42a5f5)' }}>
                                        <InfoIcon />
                                    </Avatar>
                                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                        تنسيق الملف المطلوب
                                    </Typography>
                                </Box>

                                <Alert severity="info" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3, fontSize: '1rem' }}>
                                    يجب أن يحتوي ملف Excel على الأعمدة التالية بالترتيب
                                </Alert>

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 2, color: '#1a2744' }}>
                                        الأعمدة المطلوبة:
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                                        <Chip icon={<CheckCircleIcon />} label="national_id (الرقم القومي - 14 رقم)" color="primary" sx={{ fontFamily: 'Cairo', fontSize: '1rem', py: 2.5 }} />
                                        <Chip icon={<CheckCircleIcon />} label="full_name (الاسم الكامل)" color="primary" sx={{ fontFamily: 'Cairo', fontSize: '1rem', py: 2.5 }} />
                                        <Chip icon={<InfoIcon />} label="email (اختياري)" color="default" sx={{ fontFamily: 'Cairo', fontSize: '1rem', py: 2.5 }} />
                                    </Box>
                                </Box>

                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 2, color: '#1a2744' }}>
                                    مثال على البيانات:
                                </Typography>
                                <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: '#1976d2' }}>
                                                <TableCell sx={{ color: '#fff', fontFamily: 'Cairo', fontWeight: 'bold' }}>national_id</TableCell>
                                                <TableCell sx={{ color: '#fff', fontFamily: 'Cairo', fontWeight: 'bold' }}>full_name</TableCell>
                                                <TableCell sx={{ color: '#fff', fontFamily: 'Cairo', fontWeight: 'bold' }}>email</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell sx={{ fontFamily: 'Cairo' }}>12345678901234</TableCell>
                                                <TableCell sx={{ fontFamily: 'Cairo' }}>د. أحمد محمد</TableCell>
                                                <TableCell sx={{ fontFamily: 'Cairo' }}>ahmed@example.com</TableCell>
                                            </TableRow>
                                            <TableRow sx={{ bgcolor: '#fafafa' }}>
                                                <TableCell sx={{ fontFamily: 'Cairo' }}>98765432109876</TableCell>
                                                <TableCell sx={{ fontFamily: 'Cairo' }}>د. سارة علي</TableCell>
                                                <TableCell sx={{ fontFamily: 'Cairo' }}>-</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </Paper>

                                <Alert severity="warning" sx={{ mt: 3, fontFamily: 'Cairo', borderRadius: 3 }}>
                                    <strong>ملاحظة:</strong> كلمة المرور الافتراضية لكل دكتور هي الرقم القومي
                                </Alert>
                            </Paper>
                        </Grow>
                    </Grid>

                    {/* Right Column - Upload Section */}
                    <Grid item xs={12} md={7}>
                        <Grow in={true} timeout={800}>
                            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 25px rgba(0,0,0,0.1)' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                                    <Avatar sx={{ width: 50, height: 50, background: 'linear-gradient(135deg, #4CAF50, #8BC34A)' }}>
                                        <UploadIcon />
                                    </Avatar>
                                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                        رفع الملف
                                    </Typography>
                                </Box>

                                {error && (
                                    <Alert icon={<ErrorIcon />} severity="error" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem' }} onClose={() => setError(null)}>
                                        {error}
                                    </Alert>
                                )}

                                {result && (
                                    <Alert icon={<CheckCircleIcon />} severity="success" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem' }}>
                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1 }}>
                                            تم رفع الملف بنجاح!
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                            <Chip icon={<CheckCircleIcon />} label={`تم إنشاء: ${result.created} حساب`} color="success" sx={{ fontFamily: 'Cairo', fontSize: '1rem' }} />
                                            <Chip label={`تم تخطي: ${result.skipped} (موجود مسبقاً)`} color="warning" sx={{ fontFamily: 'Cairo', fontSize: '1rem' }} />
                                        </Box>
                                        {result.errors && result.errors.length > 0 && (
                                            <Box sx={{ mt: 2 }}>
                                                <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#d32f2f', fontWeight: 'bold' }}>
                                                    أخطاء ({result.errors.length}):
                                                </Typography>
                                                {result.errors.slice(0, 5).map((err, i) => (
                                                    <Typography key={i} variant="body2" sx={{ fontFamily: 'Cairo', color: '#d32f2f' }}>
                                                        • {err}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        )}
                                    </Alert>
                                )}

                                {/* Drag & Drop Zone */}
                                <Box
                                    sx={{
                                        border: '3px dashed',
                                        borderColor: file ? '#4CAF50' : '#ddd',
                                        borderRadius: 4,
                                        p: 6,
                                        mb: 4,
                                        bgcolor: file ? '#e8f5e9' : '#fafafa',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        '&:hover': { borderColor: '#1976d2', bgcolor: '#e3f2fd' }
                                    }}
                                >
                                    <input
                                        type="file"
                                        hidden
                                        id="doctor-file-upload"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={handleFileChange}
                                    />
                                    <label htmlFor="doctor-file-upload" style={{ cursor: 'pointer' }}>
                                        {file ? (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <FileIcon sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
                                                <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#4CAF50' }}>
                                                    {file.name}
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666', mt: 1 }}>
                                                    انقر لتغيير الملف
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <UploadIcon sx={{ fontSize: 80, color: '#bbb', mb: 2 }} />
                                                <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#666' }}>
                                                    اسحب الملف هنا أو انقر للاختيار
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#999', mt: 1 }}>
                                                    ملف Excel أو CSV (.xlsx, .xls, .csv)
                                                </Typography>
                                            </Box>
                                        )}
                                    </label>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={handleUpload}
                                        disabled={!file || loading}
                                        startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <UploadIcon />}
                                        sx={{
                                            fontFamily: 'Cairo',
                                            fontWeight: 'bold',
                                            px: 6,
                                            py: 2,
                                            fontSize: '1.2rem',
                                            borderRadius: 3,
                                            background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                                            boxShadow: '0 10px 30px rgba(25, 118, 210, 0.4)',
                                            '&:hover': { background: 'linear-gradient(135deg, #1565c0, #1976d2)' },
                                            '&:disabled': { background: '#ccc' }
                                        }}
                                    >
                                        {loading ? 'جاري الرفع...' : 'رفع الملف'}
                                    </Button>
                                </Box>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default UploadDoctors;
