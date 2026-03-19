import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Paper, Button, Alert,
    CircularProgress, FormControl, InputLabel, Select, MenuItem,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function BulkQuizImport() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await axios.get('/api/academic/course-offerings/', config);
            setCourses(res.data);
        } catch (err) {
            setError('فشل في تحميل المواد');
        }
    };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.name.endsWith('.json')) {
            setFile(selected);
            setError('');
        } else {
            setError('يجب أن يكون الملف بصيغة JSON');
            setFile(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedCourse) {
            setError('يرجى اختيار المادة');
            return;
        }
        if (!file) {
            setError('يرجى رفع ملف JSON');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        // Read the JSON file and inject course_offering_id
        try {
            const text = await file.text();
            const jsonData = JSON.parse(text);
            jsonData.course_offering_id = parseInt(selectedCourse);

            const blob = new Blob([JSON.stringify(jsonData)], { type: 'application/json' });
            const newFile = new File([blob], file.name, { type: 'application/json' });

            const formData = new FormData();
            formData.append('file', newFile);

            const res = await axios.post('/api/academic/quizzes/bulk-import/', formData, {
                ...config,
                headers: { ...config.headers, 'Content-Type': 'multipart/form-data' }
            });

            setResult(res.data);
        } catch (err) {
            if (err instanceof SyntaxError) {
                setError('ملف JSON غير صالح');
            } else {
                setError(err.response?.data?.error || 'فشل في الاستيراد');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/doctor/dashboard')}
                sx={{ mb: 2, fontFamily: 'Cairo' }}
            >
                عودة للوحة التحكم
            </Button>

            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                استيراد كويزات بالجملة
            </Typography>

            <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666', mb: 3 }}>
                قم برفع ملف JSON يحتوي على الكويزات والأسئلة لإنشائها تلقائياً
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
                    إعدادات الاستيراد
                </Typography>

                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel sx={{ fontFamily: 'Cairo' }}>اختر المادة</InputLabel>
                    <Select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        label="اختر المادة"
                    >
                        {courses.map(c => (
                            <MenuItem key={c.id} value={c.id}>
                                {c.subject_name} — {c.level_name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Box
                    sx={{
                        border: '2px dashed #1976d2',
                        borderRadius: 2,
                        p: 4,
                        textAlign: 'center',
                        bgcolor: file ? '#e3f2fd' : '#fafafa',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': { bgcolor: '#e3f2fd' }
                    }}
                    component="label"
                >
                    <input type="file" hidden accept=".json" onChange={handleFileChange} />
                    {file ? (
                        <>
                            <DescriptionIcon sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
                            <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                {file.name}
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                {(file.size / 1024).toFixed(1)} KB
                            </Typography>
                        </>
                    ) : (
                        <>
                            <CloudUploadIcon sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
                            <Typography sx={{ fontFamily: 'Cairo' }}>
                                اضغط لرفع ملف JSON
                            </Typography>
                        </>
                    )}
                </Box>

                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleUpload}
                    disabled={loading || !file || !selectedCourse}
                    sx={{ mt: 3, fontFamily: 'Cairo', py: 1.5 }}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                >
                    {loading ? 'جاري الاستيراد...' : 'بدء الاستيراد'}
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
                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الكويز</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الخطأ</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {result.errors.map((err, i) => (
                                    <TableRow key={i}>
                                        <TableCell sx={{ fontFamily: 'Cairo' }}>
                                            {err.title || `كويز ${err.quiz_index + 1}`}
                                        </TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', color: '#d32f2f' }}>
                                            {err.error}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* JSON format helper */}
            <Paper sx={{ p: 3, mt: 3, bgcolor: '#f5f5f5' }}>
                <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                    صيغة ملف JSON المطلوبة
                </Typography>
                <Box component="pre" sx={{ direction: 'ltr', textAlign: 'left', fontSize: 13, overflow: 'auto', maxHeight: 300 }}>
                    {`{
  "quizzes": [
    {
      "title": "كويز 1",
      "description": "وصف الكويز",
      "quiz_type": "MCQ",
      "total_points": 10,
      "time_limit_minutes": 15,
      "questions": [
        {
          "question_text": "نص السؤال",
          "points": 2,
          "choices": [
            {"choice_text": "الإجابة أ", "is_correct": false},
            {"choice_text": "الإجابة ب", "is_correct": true},
            {"choice_text": "الإجابة ج", "is_correct": false}
          ]
        }
      ]
    }
  ]
}`}
                </Box>
            </Paper>
        </Container>
    );
}
