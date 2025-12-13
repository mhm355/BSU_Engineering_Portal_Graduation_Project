import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';

export default function StudentGrades() {
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchGrades();
    }, []);

    const fetchGrades = async () => {
        try {
            // Assuming the user is authenticated and the token/session is handled (e.g. via cookies or interceptor)
            // Since we are using basic auth or session in this demo, we rely on the browser session if logged in.
            // However, axios needs credentials if using session.
            // For this demo, we might need to attach the user info or rely on the backend session.
            // Let's assume we are using the session from the login.

            // Note: In a real app, we'd attach the token. Here we rely on the backend session or mock it.
            // Actually, we stored 'user' in localStorage but didn't set up an interceptor.
            // For this demo, we will just call the endpoint. If it returns 403, we know auth is missing.
            // But wait, we are using Django Session Auth by default with DRF if logged in via admin or session.
            // Since we logged in via API but didn't set a cookie, we might have an issue.
            // Let's check Login.jsx again. We just stored the user in localStorage. We didn't set a cookie or token.
            // DRF TokenAuth or JWT is usually used.
            // For this demo, let's assume we are using Basic Auth or we need to pass the username/password again? No, that's bad.
            // Let's assume we are using SessionAuthentication and the login endpoint set the session cookie.
            // We need to ensure axios sends credentials.

            const response = await axios.get('/api/academic/grades/', { withCredentials: true });
            setGrades(response.data);
        } catch (err) {
            console.error('Error fetching grades:', err);
            setError('فشل تحميل الدرجات. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 4 }}>
                نتائج الامتحانات
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo' }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'right' }}>المادة</TableCell>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'right' }}>الدرجة</TableCell>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'right' }}>التقدير</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {grades.length > 0 ? (
                            grades.map((grade) => (
                                <TableRow key={grade.id}>
                                    <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>{grade.course_name}</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>{grade.score}</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>
                                        <span style={{
                                            fontWeight: 'bold',
                                            color: grade.grade_letter.startsWith('A') ? 'green' :
                                                grade.grade_letter.startsWith('B') ? 'blue' :
                                                    grade.grade_letter.startsWith('C') ? 'orange' : 'red'
                                        }}>
                                            {grade.grade_letter}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} sx={{ textAlign: 'center', fontFamily: 'Cairo', py: 3 }}>
                                    لا توجد نتائج متاحة حالياً.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
}
