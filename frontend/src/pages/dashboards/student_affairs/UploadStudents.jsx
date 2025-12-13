import React, { useState } from 'react';
import { Box, Container, Typography, Paper, Button, Alert, LinearProgress, List, ListItem, ListItemText } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

export default function UploadStudents() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setResult(null);
        setError('');
    };

    const handleUpload = async () => {
        if (!file) {
            setError('يرجى اختيار ملف أولاً.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setError('');
        setResult(null);

        try {
            const response = await axios.post('/api/academic/upload-students/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            });
            setResult(response.data);
        } catch (err) {
            console.error('Error uploading file:', err);
            setError('فشل رفع الملف. تأكد من صحة البيانات.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Button onClick={() => window.history.back()} sx={{ mb: 2, fontFamily: 'Cairo' }}>← عودة</Button>
            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 4 }}>
                رفع بيانات الطلاب
            </Typography>

            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" paragraph sx={{ fontFamily: 'Cairo' }}>
                    يرجى رفع ملف Excel (.xlsx) أو CSV يحتوي على بيانات الطلاب.
                    <br />
                    الأعمدة المطلوبة: <b>student_id, student_name</b>
                </Typography>

                <Box sx={{ my: 3 }}>
                    <input
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        style={{ display: 'none' }}
                        id="raised-button-file"
                        type="file"
                        onChange={handleFileChange}
                    />
                    <label htmlFor="raised-button-file">
                        <Button variant="outlined" component="span" startIcon={<CloudUploadIcon />} sx={{ fontFamily: 'Cairo' }}>
                            اختيار ملف
                        </Button>
                    </label>
                    {file && <Typography sx={{ mt: 1, fontFamily: 'Cairo' }}>{file.name}</Typography>}
                </Box>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    sx={{ fontFamily: 'Cairo', px: 4 }}
                >
                    {uploading ? 'جاري الرفع...' : 'رفع البيانات'}
                </Button>

                {uploading && <LinearProgress sx={{ mt: 3 }} />}

                {error && <Alert severity="error" sx={{ mt: 3, fontFamily: 'Cairo' }}>{error}</Alert>}

                {result && (
                    <Box sx={{ mt: 3, textAlign: 'right' }}>
                        <Alert severity="success" sx={{ fontFamily: 'Cairo' }}>
                            تمت العملية بنجاح! تم إضافة {result.created} طالب.
                        </Alert>
                        {result.errors && result.errors.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography color="error" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الأخطاء:</Typography>
                                <List dense>
                                    {result.errors.map((err, index) => (
                                        <ListItem key={index}>
                                            <ListItemText primary={err} primaryTypographyProps={{ fontFamily: 'Cairo', color: 'error' }} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        )}
                    </Box>
                )}
            </Paper>
        </Container>
    );
}
