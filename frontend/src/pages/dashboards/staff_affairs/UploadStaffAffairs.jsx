import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    Alert,
    CircularProgress,
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UploadStaffAffairs = () => {
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
                '/api/academic/staff-affairs/upload-staff/',
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
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                    رفع موظفي شئون الطلاب
                </Typography>

                <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                        <strong>تنسيق الملف المطلوب:</strong>
                        <br />
                        يجب أن يحتوي ملف Excel على الأعمدة التالية:
                        <br />
                        <code>national_id</code> (الرقم القومي - 14 رقم) ، <code>full_name</code> (الاسم
                        الكامل) ، <code>email</code> (اختياري)
                    </Typography>
                </Alert>

                <Box
                    sx={{
                        border: '2px dashed #ccc',
                        borderRadius: 2,
                        p: 4,
                        textAlign: 'center',
                        mb: 3,
                        backgroundColor: file ? '#e8f5e9' : '#fafafa',
                    }}
                >
                    <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        id="staff-file-upload"
                    />
                    <label htmlFor="staff-file-upload">
                        <Button
                            variant="outlined"
                            component="span"
                            startIcon={<UploadIcon />}
                            size="large"
                            color="success"
                        >
                            اختيار ملف
                        </Button>
                    </label>
                    {file && (
                        <Typography sx={{ mt: 2 }} color="success.main">
                            الملف المحدد: {file.name}
                        </Typography>
                    )}
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {result && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        <Typography>
                            تم رفع الملف بنجاح!
                            <br />
                            تم إنشاء: {result.created} حساب
                            <br />
                            تم تخطي: {result.skipped} (موجود مسبقاً)
                        </Typography>
                        {result.errors && result.errors.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                                <Typography color="error">
                                    أخطاء: {result.errors.length}
                                </Typography>
                                {result.errors.slice(0, 5).map((err, i) => (
                                    <Typography key={i} variant="body2" color="error">
                                        {err}
                                    </Typography>
                                ))}
                            </Box>
                        )}
                    </Alert>
                )}

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/staff-affairs')}
                    >
                        رجوع
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleUpload}
                        disabled={!file || loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}
                    >
                        {loading ? 'جاري الرفع...' : 'رفع الملف'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default UploadStaffAffairs;
