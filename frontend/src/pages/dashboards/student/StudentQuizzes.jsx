import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Paper, Button, Card, CardContent,
    CardActions, Chip, Grid, CircularProgress, Alert, Avatar, Fade, Grow, IconButton
} from '@mui/material';
import { keyframes } from '@mui/system';
import QuizIcon from '@mui/icons-material/Quiz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HelpIcon from '@mui/icons-material/Help';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PendingIcon from '@mui/icons-material/Pending';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
`;

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

    // Calculate statistics
    const stats = {
        total: quizzes.length,
        completed: quizzes.filter(q => q.attempted).length,
        pending: quizzes.filter(q => !q.attempted).length,
        totalScore: quizzes.filter(q => q.attempted).reduce((acc, q) => acc + (q.score || 0), 0),
        maxScore: quizzes.filter(q => q.attempted).reduce((acc, q) => acc + (q.total_points || 0), 0),
    };

    const getScorePercentage = () => {
        if (stats.maxScore === 0) return 0;
        return Math.round((stats.totalScore / stats.maxScore) * 100);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
            {/* Hero Header */}
            <Box sx={{
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                backgroundSize: '200% 200%',
                animation: `${shimmer} 15s ease infinite`,
                color: '#fff',
                py: 5,
                px: 3,
                borderRadius: { xs: 0, md: '0 0 40px 40px' },
            }}>
                <Container maxWidth="lg">
                    <Fade in={true} timeout={600}>
                        <Box>
                            <IconButton onClick={() => navigate('/student/dashboard')} sx={{ color: '#fff', mb: 2 }}>
                                <ArrowBackIcon />
                            </IconButton>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 60, height: 60, bgcolor: 'rgba(255,255,255,0.2)' }}>
                                    <QuizIcon sx={{ fontSize: 35 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                        الكويزات والتقييمات
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', opacity: 0.9 }}>
                                        اختبر معلوماتك في المقررات الدراسية
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mt: -3, pb: 6 }}>
                {/* Stats Row */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={6} md={3}>
                        <Grow in={true} timeout={400}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                                <Avatar sx={{ width: 50, height: 50, bgcolor: '#e3f2fd', mx: 'auto', mb: 1 }}>
                                    <QuizIcon sx={{ color: '#1976d2' }} />
                                </Avatar>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{stats.total}</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>إجمالي الكويزات</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Grow in={true} timeout={600}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                                <Avatar sx={{ width: 50, height: 50, bgcolor: '#e8f5e9', mx: 'auto', mb: 1 }}>
                                    <CheckCircleIcon sx={{ color: '#4CAF50' }} />
                                </Avatar>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#4CAF50' }}>{stats.completed}</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>كويزات محلولة</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Grow in={true} timeout={800}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                                <Avatar sx={{ width: 50, height: 50, bgcolor: '#fff3e0', mx: 'auto', mb: 1 }}>
                                    <PendingIcon sx={{ color: '#FF9800' }} />
                                </Avatar>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#FF9800' }}>{stats.pending}</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>بانتظار الحل</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Grow in={true} timeout={1000}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                                <Avatar sx={{ width: 50, height: 50, bgcolor: '#fce4ec', mx: 'auto', mb: 1 }}>
                                    <EmojiEventsIcon sx={{ color: '#e91e63' }} />
                                </Avatar>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#e91e63' }}>{getScorePercentage()}%</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>معدل الدرجات</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>

                {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3 }}>{error}</Alert>}

                {/* Quizzes Grid */}
                {quizzes.length === 0 ? (
                    <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <QuizIcon sx={{ fontSize: 80, color: '#ddd', mb: 2 }} />
                        <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#666', mb: 1 }}>
                            لا توجد كويزات متاحة حالياً
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#999' }}>
                            سيتم عرض الكويزات هنا عند إضافتها من قبل الأساتذة
                        </Typography>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {quizzes.map((quiz, idx) => {
                            const isCompleted = quiz.attempted;
                            const scorePercentage = isCompleted && quiz.total_points > 0
                                ? Math.round((quiz.score / quiz.total_points) * 100)
                                : 0;
                            const scoreColor = scorePercentage >= 75 ? '#4CAF50' : scorePercentage >= 50 ? '#FF9800' : '#f44336';

                            return (
                                <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                                    <Grow in={true} timeout={300 + idx * 100}>
                                        <Card sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            borderRadius: 4,
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                            transition: 'all 0.3s',
                                            border: isCompleted ? `2px solid ${scoreColor}30` : '2px solid #1976d230',
                                            '&:hover': {
                                                transform: 'translateY(-5px)',
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                                            }
                                        }}>
                                            {/* Header */}
                                            <Box sx={{
                                                p: 2,
                                                background: isCompleted
                                                    ? `linear-gradient(135deg, ${scoreColor}15, ${scoreColor}05)`
                                                    : 'linear-gradient(135deg, #1976d215, #1976d205)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar sx={{
                                                        bgcolor: isCompleted ? `${scoreColor}20` : '#e3f2fd',
                                                        animation: !isCompleted ? `${float} 3s ease-in-out infinite` : 'none'
                                                    }}>
                                                        <QuizIcon sx={{ color: isCompleted ? scoreColor : '#1976d2' }} />
                                                    </Avatar>
                                                    {isCompleted ? (
                                                        <Chip
                                                            icon={<CheckCircleIcon />}
                                                            label={`${quiz.score}/${quiz.total_points}`}
                                                            size="small"
                                                            sx={{ bgcolor: `${scoreColor}20`, color: scoreColor, fontFamily: 'Cairo', fontWeight: 'bold' }}
                                                        />
                                                    ) : (
                                                        <Chip
                                                            label="لم يُحل"
                                                            size="small"
                                                            sx={{ bgcolor: '#fff3e0', color: '#FF9800', fontFamily: 'Cairo', fontWeight: 'bold' }}
                                                        />
                                                    )}
                                                </Box>
                                            </Box>

                                            <CardContent sx={{ flex: 1, p: 3 }}>
                                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744', mb: 1 }}>
                                                    {quiz.title}
                                                </Typography>

                                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666', mb: 2 }}>
                                                    {quiz.subject_name}
                                                </Typography>

                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                    <Chip
                                                        icon={<HelpIcon sx={{ fontSize: 16 }} />}
                                                        label={`${quiz.question_count} سؤال`}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ fontFamily: 'Cairo' }}
                                                    />
                                                    <Chip
                                                        icon={<StarIcon sx={{ fontSize: 16 }} />}
                                                        label={`${quiz.total_points} درجة`}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ fontFamily: 'Cairo' }}
                                                    />
                                                    {quiz.time_limit_minutes && (
                                                        <Chip
                                                            icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
                                                            label={`${quiz.time_limit_minutes} دقيقة`}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ fontFamily: 'Cairo' }}
                                                        />
                                                    )}
                                                </Box>
                                            </CardContent>

                                            <CardActions sx={{ p: 2, pt: 0 }}>
                                                {isCompleted ? (
                                                    <Button
                                                        variant="outlined"
                                                        fullWidth
                                                        onClick={() => navigate(`/student/quiz/${quiz.id}/results`)}
                                                        startIcon={<CheckCircleIcon />}
                                                        sx={{
                                                            fontFamily: 'Cairo',
                                                            fontWeight: 'bold',
                                                            borderRadius: 3,
                                                            py: 1.5,
                                                            borderColor: scoreColor,
                                                            color: scoreColor,
                                                            '&:hover': {
                                                                bgcolor: `${scoreColor}10`,
                                                                borderColor: scoreColor
                                                            }
                                                        }}
                                                    >
                                                        عرض النتيجة - {scorePercentage}%
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="contained"
                                                        fullWidth
                                                        startIcon={<PlayArrowIcon />}
                                                        onClick={() => navigate(`/student/quiz/${quiz.id}`)}
                                                        sx={{
                                                            fontFamily: 'Cairo',
                                                            fontWeight: 'bold',
                                                            borderRadius: 3,
                                                            py: 1.5,
                                                            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                                            '&:hover': {
                                                                background: 'linear-gradient(135deg, #fa709a 30%, #fee140 100%)',
                                                            }
                                                        }}
                                                    >
                                                        ابدأ الكويز
                                                    </Button>
                                                )}
                                            </CardActions>
                                        </Card>
                                    </Grow>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </Container>
        </Box>
    );
}
