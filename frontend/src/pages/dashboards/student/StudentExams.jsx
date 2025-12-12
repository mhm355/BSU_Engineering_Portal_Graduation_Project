import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Grid, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function StudentExams() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/academic/exams/', { withCredentials: true });
            setExams(response.data);
        } catch (err) {
            console.error('Error fetching exams:', err);
            setError('فشل تحميل جدول الامتحانات.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                    جدول الامتحانات
                </Typography>
                <Typography variant="subtitle1" color="textSecondary" sx={{ fontFamily: 'Cairo' }}>
                    استعرض مواعيد امتحاناتك القادمة
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo' }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {exams.length === 0 ? (
                        <Grid item xs={12}>
                            <Paper sx={{ p: 4, textAlign: 'center' }}>
                                <Typography sx={{ fontFamily: 'Cairo' }}>لا توجد امتحانات مجدولة حالياً.</Typography>
                            </Paper>
                        </Grid>
                    ) : (
                        exams.map((exam) => (
                            <Grid item xs={12} md={6} lg={4} key={exam.id}>
                                <Card sx={{ height: '100%', transition: '0.3s', '&:hover': { boxShadow: 6 } }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                                            {exam.course_name}
                                        </Typography>

                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, color: 'text.secondary' }}>
                                            <EventIcon sx={{ mr: 1, fontSize: 20 }} />
                                            <Typography sx={{ fontFamily: 'Cairo' }}>
                                                {new Date(exam.date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, color: 'text.secondary' }}>
                                            <AccessTimeIcon sx={{ mr: 1, fontSize: 20 }} />
                                            <Typography sx={{ fontFamily: 'Cairo' }}>
                                                {exam.start_time} ({exam.duration_minutes} دقيقة)
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                            <LocationOnIcon sx={{ mr: 1, fontSize: 20 }} />
                                            <Typography sx={{ fontFamily: 'Cairo' }}>
                                                {exam.location}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            )}
        </Container>
    );
}
