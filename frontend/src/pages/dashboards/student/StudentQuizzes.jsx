import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Paper, Button, Card, CardContent,
    CardActions, Chip, Grid, CircularProgress, Alert
} from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function StudentQuizzes() {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const res = await axios.get('/api/academic/student/quizzes/', config);
            setQuizzes(res.data);
        } catch (err) {
            setError('فشل في تحميل الكويزات');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/student/dashboard')}
                sx={{ mb: 2, fontFamily: 'Cairo' }}
            >
                عودة
            </Button>

            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                الكويزات المتاحة
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo' }}>{error}</Alert>}

            {quizzes.length === 0 ? (
                <Alert severity="info" sx={{ fontFamily: 'Cairo' }}>
                    لا توجد كويزات متاحة حالياً
                </Alert>
            ) : (
                <Grid container spacing={3}>
                    {quizzes.map((quiz) => (
                        <Grid item xs={12} md={6} lg={4} key={quiz.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <QuizIcon sx={{ fontSize: 40, color: '#1976d2' }} />
                                        {quiz.attempted ? (
                                            <Chip
                                                icon={<CheckCircleIcon />}
                                                label={`${quiz.score}/${quiz.total_points}`}
                                                color="success"
                                                size="small"
                                            />
                                        ) : (
                                            <Chip label="لم يُحل" color="warning" size="small" />
                                        )}
                                    </Box>

                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1 }}>
                                        {quiz.title}
                                    </Typography>

                                    <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Cairo', mb: 2 }}>
                                        {quiz.subject_name}
                                    </Typography>

                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        <Chip label={`${quiz.question_count} سؤال`} size="small" variant="outlined" />
                                        <Chip label={`${quiz.total_points} درجة`} size="small" variant="outlined" />
                                        {quiz.time_limit_minutes && (
                                            <Chip label={`${quiz.time_limit_minutes} دقيقة`} size="small" variant="outlined" />
                                        )}
                                    </Box>
                                </CardContent>

                                <CardActions sx={{ p: 2, pt: 0 }}>
                                    {quiz.attempted ? (
                                        <Button
                                            variant="outlined"
                                            fullWidth
                                            disabled
                                            sx={{ fontFamily: 'Cairo' }}
                                        >
                                            تم الحل
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            onClick={() => navigate(`/student/quiz/${quiz.id}`)}
                                            sx={{ fontFamily: 'Cairo' }}
                                        >
                                            ابدأ الكويز
                                        </Button>
                                    )}
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}
