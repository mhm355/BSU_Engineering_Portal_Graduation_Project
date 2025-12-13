import React, { useState } from 'react';
import axios from 'axios';
import { Container, Typography, Button, Paper, Alert, LinearProgress, Box } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNavigate, useParams } from 'react-router-dom';

export default function UploadGrades() {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setStatus({ type: '', message: '' });
    };

    const handleUpload = async () => {
        if (!file) {
            setStatus({ type: 'error', message: 'يرجى اختيار ملف أولاً.' });
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('course_id', courseId);

        try {
            // Using a new endpoint for bulk grade upload
            const res = await axios.post('/api/academic/grades/upload/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true
            });

            setStatus({ type: 'success', message: res.data.message || 'تم رفع الدرجات بنجاح.' });
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.error || 'فشل الرفع. تأكد من تنسيق الملف.';
            setStatus({ type: 'error', message: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Button onClick={() => navigate(`/doctor/courses/${courseId}`)} sx={{ mb: 2, fontFamily: 'Cairo' }}>← عودة للمقرر</Button>

            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom fontWeight="bold" color="primary" sx={{ fontFamily: 'Cairo' }}>
                    رفع الدرجات (Excel)
                </Typography>

                <Alert severity="info" sx={{ mb: 3, textAlign: 'right', fontFamily: 'Cairo' }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ fontFamily: 'Cairo' }}>الأعمدة المطلوبة:</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 1, direction: 'ltr' }}>
                        student_id | score
                    </Typography>
                </Alert>

                <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon sx={{ ml: 1 }} />}
                    sx={{ mb: 2, width: '100%', height: '50px', fontFamily: 'Cairo' }}
                >
                    {file ? file.name : "اختر ملف Excel (.xlsx)"}
                    <input type="file" hidden onChange={handleFileChange} accept=".xlsx, .xls" />
                </Button>

                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleUpload}
                    disabled={loading || !file}
                    sx={{ py: 1.5, mb: 2, fontFamily: 'Cairo', bgcolor: '#0A2342' }}
                >
                    {loading ? "جاري الرفع..." : "رفع الدرجات"}
                </Button>

                {loading && <LinearProgress sx={{ mb: 2 }} />}

                {status.message && (
                    <Alert severity={status.type} sx={{ fontFamily: 'Cairo' }}>{status.message}</Alert>
                )}
            </Paper>
        </Container>
    );
}
