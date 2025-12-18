import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, CircularProgress, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function StudentGrades() {
    const navigate = useNavigate();
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchGrades();
    }, []);

    const fetchGrades = async () => {
        try {
            const response = await axios.get('/api/academic/exam-grades/my-grades/', { withCredentials: true });
            setGrades(response.data);
        } catch (err) {
            console.error('Error fetching grades:', err);
            setError('فشل تحميل الدرجات. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    const getGradeColor = (grade) => {
        if (grade === null || grade === undefined) return '#9e9e9e';
        if (grade >= 90) return '#4caf50';
        if (grade >= 75) return '#2196f3';
        if (grade >= 60) return '#ff9800';
        return '#f44336';
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <IconButton onClick={() => navigate('/student/dashboard')}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                    نتائج الامتحانات
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo' }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: '#1976d2' }}>
                        <TableRow>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: 'white' }}>المادة</TableCell>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: 'white', textAlign: 'center' }}>درجة منتصف الترم</TableCell>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: 'white', textAlign: 'center' }}>درجة النهائي</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {grades.length > 0 ? (
                            grades.map((grade, idx) => (
                                <TableRow key={idx} hover>
                                    <TableCell sx={{ fontFamily: 'Cairo' }}>
                                        <strong>{grade.course_name}</strong>
                                        <Typography variant="body2" color="textSecondary">{grade.course_code}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <Typography sx={{
                                            fontWeight: 'bold',
                                            fontSize: '1.2rem',
                                            color: getGradeColor(grade.midterm_grade)
                                        }}>
                                            {grade.midterm_grade !== null ? grade.midterm_grade : '--'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <Typography sx={{
                                            fontWeight: 'bold',
                                            fontSize: '1.2rem',
                                            color: getGradeColor(grade.final_grade)
                                        }}>
                                            {grade.final_grade !== null ? grade.final_grade : '--'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} sx={{ textAlign: 'center', fontFamily: 'Cairo', py: 4 }}>
                                    <Typography sx={{ fontFamily: 'Cairo' }}>لا توجد درجات متاحة حالياً</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
}
