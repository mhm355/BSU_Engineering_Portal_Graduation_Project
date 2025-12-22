import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Alert, CircularProgress,
    IconButton, Chip, LinearProgress, Card, CardContent
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function StudentGrades() {
    const navigate = useNavigate();
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    useEffect(() => {
        fetchGrades();
    }, []);

    const fetchGrades = async () => {
        try {
            // Try new StudentGrade endpoint first, fallback to exam-grades
            const response = await axios.get('/api/academic/exam-grades/my-grades/', config);
            setGrades(response.data);
        } catch (err) {
            console.error('Error fetching grades:', err);
            setError('فشل تحميل الدرجات. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    const getGradeColor = (percentage) => {
        if (percentage === null || percentage === undefined) return '#9e9e9e';
        if (percentage >= 90) return '#4caf50';
        if (percentage >= 75) return '#2196f3';
        if (percentage >= 60) return '#ff9800';
        return '#f44336';
    };

    const getGradeLabel = (percentage) => {
        if (percentage === null || percentage === undefined) return '-';
        if (percentage >= 90) return 'ممتاز';
        if (percentage >= 80) return 'جيد جداً';
        if (percentage >= 70) return 'جيد';
        if (percentage >= 60) return 'مقبول';
        return 'راسب';
    };

    const calculateTotal = (grade) => {
        const attendance = grade.attendance_grade || 0;
        const quizzes = grade.quizzes_grade || 0;
        const coursework = grade.coursework_grade || 0;
        const midterm = grade.midterm_grade || 0;
        const final = grade.final_grade || 0;
        return attendance + quizzes + coursework + midterm + final;
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <IconButton onClick={() => navigate('/student/dashboard')}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                    نتائج الامتحانات والدرجات
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo' }} onClose={() => setError('')}>{error}</Alert>}

            {grades.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {grades.map((grade, idx) => (
                        <Card key={idx} sx={{ overflow: 'visible' }}>
                            <CardContent>
                                {/* Course Header */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                            {grade.course_name || grade.subject_name}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {grade.course_code || grade.subject_code}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={`${calculateTotal(grade)}%`}
                                        sx={{
                                            bgcolor: getGradeColor(calculateTotal(grade)),
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: '1.1rem',
                                            px: 2
                                        }}
                                    />
                                </Box>

                                {/* Grade Progress Bar */}
                                <Box sx={{ mb: 2 }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={calculateTotal(grade)}
                                        sx={{
                                            height: 10,
                                            borderRadius: 5,
                                            bgcolor: '#e0e0e0',
                                            '& .MuiLinearProgress-bar': {
                                                bgcolor: getGradeColor(calculateTotal(grade)),
                                                borderRadius: 5
                                            }
                                        }}
                                    />
                                </Box>

                                {/* Grade Components */}
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>العنصر</TableCell>
                                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center' }}>الدرجة</TableCell>
                                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center' }}>من</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {grade.attendance_weight > 0 && (
                                                <TableRow>
                                                    <TableCell sx={{ fontFamily: 'Cairo' }}>الحضور</TableCell>
                                                    <TableCell sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                                                        {grade.attendance_grade ?? '--'}
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>{grade.attendance_weight}</TableCell>
                                                </TableRow>
                                            )}
                                            {grade.quizzes_weight > 0 && (
                                                <TableRow>
                                                    <TableCell sx={{ fontFamily: 'Cairo' }}>الكويزات</TableCell>
                                                    <TableCell sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                                                        {grade.quizzes_grade ?? '--'}
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>{grade.quizzes_weight}</TableCell>
                                                </TableRow>
                                            )}
                                            {grade.coursework_weight > 0 && (
                                                <TableRow>
                                                    <TableCell sx={{ fontFamily: 'Cairo' }}>أعمال السنة</TableCell>
                                                    <TableCell sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                                                        {grade.coursework_grade ?? '--'}
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>{grade.coursework_weight}</TableCell>
                                                </TableRow>
                                            )}
                                            <TableRow>
                                                <TableCell sx={{ fontFamily: 'Cairo' }}>منتصف الترم</TableCell>
                                                <TableCell sx={{ textAlign: 'center', fontWeight: 'bold', color: getGradeColor(grade.midterm_grade) }}>
                                                    {grade.midterm_grade ?? '--'}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>{grade.midterm_weight || 20}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontFamily: 'Cairo' }}>النهائي</TableCell>
                                                <TableCell sx={{ textAlign: 'center', fontWeight: 'bold', color: getGradeColor(grade.final_grade) }}>
                                                    {grade.final_grade ?? '--'}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>{grade.final_weight || 50}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                {/* Grade Label */}
                                <Box sx={{ mt: 2, textAlign: 'center' }}>
                                    <Chip
                                        label={getGradeLabel(calculateTotal(grade))}
                                        color={calculateTotal(grade) >= 60 ? 'success' : 'error'}
                                        variant="outlined"
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            ) : (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                        لا توجد درجات متاحة حالياً
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Cairo', mt: 1 }}>
                        ستظهر درجاتك هنا بعد أن يقوم الأساتذة برصدها
                    </Typography>
                </Paper>
            )}
        </Container>
    );
}
