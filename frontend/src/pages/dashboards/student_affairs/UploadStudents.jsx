import React, { useState } from 'react';
import { Box, Container, Typography, Paper, Button, Alert, LinearProgress, List, ListItem, ListItemText, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
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
            const response = await axios.post('/api/academic/student-affairs/upload/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            });
            setResult(response.data);
        } catch (err) {
            console.error('Error uploading file:', err);
            const errorMsg = err.response?.data?.error || 'فشل رفع الملف. تأكد من صحة البيانات.';
            setError(errorMsg);
        } finally {
            setUploading(false);
        }
    };

    // Sample data for file format example
    const sampleData = [
        { national_id: '12345678901234', full_name: 'أحمد محمد علي', academic_year: '2024-2025', level: 'FIRST', department_code: 'CS' },
        { national_id: '23456789012345', full_name: 'محمد سعيد أحمد', academic_year: '2024-2025', level: 'PREPARATORY', department_code: '' },
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button onClick={() => window.history.back()} sx={{ mb: 2, fontFamily: 'Cairo' }}>← عودة</Button>
            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 4 }}>
                رفع بيانات الطلاب
            </Typography>

            {/* File Format Info */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                    تنسيق الملف المطلوب
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Cairo', mb: 2 }}>
                    يجب أن يحتوي الملف على الأعمدة التالية:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip label="national_id" color="primary" size="small" />
                    <Chip label="full_name" color="primary" size="small" />
                    <Chip label="academic_year" color="primary" size="small" />
                    <Chip label="level" color="primary" size="small" />
                    <Chip label="department_code" color="secondary" size="small" />
                </Box>
                <Alert severity="info" sx={{ mb: 2, fontFamily: 'Cairo' }}>
                    <strong>ملاحظة:</strong> عمود department_code مطلوب فقط للمستويات من الأولى إلى الرابعة. السنة التحضيرية لا تحتاج قسم.
                </Alert>

                {/* Sample Table */}
                <Typography variant="body2" sx={{ fontFamily: 'Cairo', mb: 1, fontWeight: 'bold' }}>
                    مثال على الملف:
                </Typography>
                <TableContainer sx={{ maxHeight: 200 }}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>national_id</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>full_name</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>academic_year</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>level</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>department_code</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sampleData.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell sx={{ fontFamily: 'monospace' }}>{row.national_id}</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo' }}>{row.full_name}</TableCell>
                                    <TableCell>{row.academic_year}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={row.level}
                                            size="small"
                                            color={row.level === 'PREPARATORY' ? 'default' : 'primary'}
                                        />
                                    </TableCell>
                                    <TableCell>{row.department_code || '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Typography variant="caption" sx={{ fontFamily: 'Cairo', display: 'block', mt: 1 }}>
                    القيم المسموحة للمستوى (level): PREPARATORY, FIRST, SECOND, THIRD, FOURTH
                </Typography>
            </Paper>

            {/* Upload Section */}
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                    رفع الملف
                </Typography>
                <Typography variant="body1" paragraph sx={{ fontFamily: 'Cairo' }}>
                    يرجى رفع ملف Excel (.xlsx) أو CSV يحتوي على بيانات الطلاب.
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
                        <Alert severity="success" sx={{ fontFamily: 'Cairo', mb: 2 }}>
                            تمت العملية!
                            <br />
                            • تم إنشاء {result.created} حساب جديد
                            <br />
                            • تم تحديث {result.updated} حساب موجود
                        </Alert>
                        {result.errors && result.errors.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Alert severity="warning" sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>
                                    <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>بعض الأخطاء ({result.errors.length}):</Typography>
                                </Alert>
                                <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
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

