import React, { useState } from 'react';
import {
    Box, Container, Typography, Paper, TextField, Button, CircularProgress,
    Alert, Grid, Avatar, Chip, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Fade, Grow
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AssessmentIcon from '@mui/icons-material/Assessment';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function StudentResults() {
    const navigate = useNavigate();
    const [nationalId, setNationalId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!nationalId.trim()) {
            setError('يرجى إدخال الرقم القومي');
            return;
        }

        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const response = await axios.get(`/api/academic/results/query/?national_id=${nationalId.trim()}`, {
                withCredentials: true
            });
            setResults(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'حدث خطأ أثناء الاستعلام عن النتيجة. تأكد من صحة الرقم القومي.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: 4 }}>
            <Container maxWidth="lg">
                <Button 
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => navigate('/student/dashboard')} 
                    sx={{ mb: 2, fontFamily: 'Cairo', color: '#1976d2' }}
                >
                    العودة للوحة التحكم
                </Button>
                <Fade in={true} timeout={600}>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: '#1976d2', width: 50, height: 50 }}>
                                <AssessmentIcon fontSize="large" />
                            </Avatar>
                            الاستعلام عن النتائج
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666', mt: 1, ml: 8 }}>
                            أدخل الرقم القومي الخاص بك لعرض نتائج الفصلين الدراسيين الأول والثاني.
                        </Typography>
                    </Box>
                </Fade>

                <Grow in={true} timeout={800}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', mb: 4 }}>
                        <form onSubmit={handleSearch}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={8}>
                                    <TextField
                                        fullWidth
                                        label="الرقم القومي"
                                        variant="outlined"
                                        value={nationalId}
                                        onChange={(e) => setNationalId(e.target.value)}
                                        placeholder="أدخل 14 رقماً"
                                        InputProps={{
                                            sx: { fontFamily: 'Cairo', borderRadius: 2 }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        disabled={loading}
                                        startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <SearchIcon />}
                                        sx={{
                                            py: 1.8,
                                            fontFamily: 'Cairo',
                                            fontWeight: 'bold',
                                            borderRadius: 2,
                                            background: 'linear-gradient(135deg, #1976d2, #1565c0)',
                                            fontSize: '1.1rem'
                                        }}
                                    >
                                        بحث عن النتيجة
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </Grow>

                {error && (
                    <Fade in={true}>
                        <Alert severity="error" sx={{ mb: 4, fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem', alignItems: 'center' }}>
                            {error}
                        </Alert>
                    </Fade>
                )}

                {results && (
                    <Fade in={true} timeout={800}>
                        <Box>
                            {/* Student Info Card */}
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', mb: 4, background: 'linear-gradient(135deg, #f0f7ff, #e3f2fd)', border: '1px solid #bbdefb' }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" sx={{ fontFamily: 'Cairo', color: '#666' }}>اسم الطالب</Typography>
                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{results.student.full_name}</Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" sx={{ fontFamily: 'Cairo', color: '#666' }}>الرقم القومي</Typography>
                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{results.student.national_id}</Typography>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Typography variant="subtitle2" sx={{ fontFamily: 'Cairo', color: '#666' }}>الفرقة</Typography>
                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{results.student.level}</Typography>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Typography variant="subtitle2" sx={{ fontFamily: 'Cairo', color: '#666' }}>القسم</Typography>
                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{results.student.department}</Typography>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Typography variant="subtitle2" sx={{ fontFamily: 'Cairo', color: '#666' }}>العام الأكاديمي</Typography>
                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{results.student.academic_year}</Typography>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Terms Results */}
                            {results.terms.map((term, index) => (
                                <Paper key={index} elevation={0} sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', mb: 4 }}>
                                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744', mb: 3, pb: 1, borderBottom: '2px solid #eee' }}>
                                        {term.term_name}
                                    </Typography>

                                    {!term.is_published ? (
                                        <Alert icon={<WarningIcon fontSize="inherit" />} severity="warning" sx={{ fontFamily: 'Cairo', borderRadius: 2 }}>
                                            لم يتم اعتماد نتيجة {term.term_name} رسمياً بعد من قبل إدارة الكلية. يرجى المحاولة في وقت لاحق.
                                        </Alert>
                                    ) : !term.is_fully_graded ? (
                                        <Alert icon={<WarningIcon fontSize="inherit" />} severity="info" sx={{ fontFamily: 'Cairo', borderRadius: 2 }}>
                                            جارٍ الانتهاء من رصد درجات بعض المقررات لـ {term.term_name}. لن تظهر النتيجة إلا بعد اكتمال رصد جميع المقررات.
                                        </Alert>
                                    ) : term.courses && term.courses.length > 0 ? (
                                        <TableContainer sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>كود المادة</TableCell>
                                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>اسم المادة</TableCell>
                                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center' }}>أعمال السنة</TableCell>
                                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center' }}>الميدتيرم</TableCell>
                                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center' }}>النهائي</TableCell>
                                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center' }}>المجموع</TableCell>
                                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center' }}>التقدير / النسبة</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {term.courses.map((course, idx) => {
                                                        const percentage = (course.total / course.max_grade) * 100;
                                                        let color = percentage >= 85 ? '#4CAF50' : percentage >= 65 ? '#2196F3' : percentage >= 50 ? '#FF9800' : '#f44336';
                                                        let gradeText = percentage >= 85 ? 'ممتاز' : percentage >= 75 ? 'جيد جداً' : percentage >= 65 ? 'جيد' : percentage >= 50 ? 'مقبول' : 'ضعيف';

                                                        return (
                                                            <TableRow key={idx} hover>
                                                                <TableCell sx={{ fontFamily: 'Cairo' }}>{course.subject_code}</TableCell>
                                                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{course.subject_name}</TableCell>
                                                                <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'center' }}>{course.coursework || '-'}</TableCell>
                                                                <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'center' }}>{course.midterm || '-'}</TableCell>
                                                                <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'center' }}>{course.final || '-'}</TableCell>
                                                                <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'center', fontWeight: 'bold' }}>{course.total} / {course.max_grade}</TableCell>
                                                                <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'center' }}>
                                                                    <Chip label={gradeText} sx={{ bgcolor: `${color}15`, color: color, fontWeight: 'bold', fontFamily: 'Cairo' }} />
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    ) : (
                                        <Alert severity="info" sx={{ fontFamily: 'Cairo', borderRadius: 2 }}>
                                            لا توجد مقررات مسجلة لك في هذا الفصل الدراسي.
                                        </Alert>
                                    )}
                                </Paper>
                            ))}
                        </Box>
                    </Fade>
                )}
            </Container>
        </Box>
    );
}
