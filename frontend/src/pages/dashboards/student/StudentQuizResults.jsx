import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Paper, Button, Avatar, Chip, Grid, Card, CardContent,
    CircularProgress, Alert, LinearProgress, Fade, Grow, IconButton, Divider
} from '@mui/material';
import { keyframes } from '@mui/system';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import QuizIcon from '@mui/icons-material/Quiz';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HelpIcon from '@mui/icons-material/Help';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

export default function StudentQuizResults() {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    useEffect(() => {
        fetchResults();
    }, [quizId]);

    const fetchResults = async () => {
        try {
            const res = await axios.get(`/api/academic/student/quizzes/${quizId}/results/`, config);
            setQuiz(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'فشل في تحميل نتائج الكويز');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (percentage) => {
        if (percentage >= 90) return '#4CAF50';
        if (percentage >= 75) return '#8BC34A';
        if (percentage >= 60) return '#FF9800';
        return '#f44336';
    };

    const getScoreLabel = (percentage) => {
        if (percentage >= 90) return 'ممتاز! 🎉';
        if (percentage >= 75) return 'جيد جداً! 👏';
        if (percentage >= 60) return 'جيد 👍';
        return 'يحتاج تحسين 💪';
    };

    if (loading) {
        return (
            <Box sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <CircularProgress size={60} sx={{ color: '#fff' }} />
                <Typography sx={{ mt: 3, fontFamily: 'Cairo', color: '#fff', fontSize: '1.2rem' }}>
                    جاري تحميل النتائج...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ fontFamily: 'Cairo', borderRadius: 3 }}>{error}</Alert>
                <Button
                    onClick={() => navigate('/student/quizzes')}
                    sx={{ mt: 2, fontFamily: 'Cairo' }}
                    startIcon={<ArrowBackIcon />}
                >
                    العودة للكويزات
                </Button>
            </Container>
        );
    }

    const scorePercentage = quiz?.total_points > 0 ? Math.round((quiz.score / quiz.total_points) * 100) : 0;
    const scoreColor = getScoreColor(scorePercentage);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
            {/* Hero Header */}
            <Box sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                            <IconButton onClick={() => navigate('/student/quizzes')} sx={{ color: '#fff', mb: 2 }}>
                                <ArrowBackIcon />
                            </IconButton>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 60, height: 60, bgcolor: 'rgba(255,255,255,0.2)' }}>
                                    <EmojiEventsIcon sx={{ fontSize: 35 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                        نتيجة الكويز
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', opacity: 0.9 }}>
                                        {quiz?.title}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mt: -3, pb: 6 }}>
                {/* Score Summary */}
                <Grow in={true} timeout={400}>
                    <Paper elevation={0} sx={{
                        p: 4,
                        borderRadius: 4,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        textAlign: 'center',
                        mb: 4
                    }}>
                        {/* Score Circle */}
                        <Box sx={{
                            width: 160,
                            height: 160,
                            borderRadius: '50%',
                            border: `8px solid ${scoreColor}`,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            mx: 'auto',
                            mb: 3,
                            background: `linear-gradient(135deg, ${scoreColor}10, ${scoreColor}05)`
                        }}>
                            <Typography variant="h2" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: scoreColor }}>
                                {quiz?.score ?? '?'}
                            </Typography>
                            <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                من {quiz?.total_points}
                            </Typography>
                        </Box>

                        <Chip
                            icon={<StarIcon />}
                            label={getScoreLabel(scorePercentage)}
                            sx={{
                                fontSize: '1.1rem',
                                py: 2.5,
                                px: 2,
                                bgcolor: `${scoreColor}20`,
                                color: scoreColor,
                                fontFamily: 'Cairo',
                                fontWeight: 'bold',
                                mb: 2
                            }}
                        />

                        <LinearProgress
                            variant="determinate"
                            value={scorePercentage}
                            sx={{
                                height: 12,
                                borderRadius: 6,
                                bgcolor: '#e0e0e0',
                                maxWidth: 400,
                                mx: 'auto',
                                '& .MuiLinearProgress-bar': { bgcolor: scoreColor, borderRadius: 6 }
                            }}
                        />
                        <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666', mt: 1 }}>
                            نسبة النجاح: {scorePercentage}%
                        </Typography>
                    </Paper>
                </Grow>

                {/* Stats Row */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={4}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                            <Avatar sx={{ width: 50, height: 50, bgcolor: '#e3f2fd', mx: 'auto', mb: 1 }}>
                                <HelpIcon sx={{ color: '#1976d2' }} />
                            </Avatar>
                            <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                {quiz?.questions?.length || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>إجمالي الأسئلة</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={4}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                            <Avatar sx={{ width: 50, height: 50, bgcolor: '#e8f5e9', mx: 'auto', mb: 1 }}>
                                <CheckCircleIcon sx={{ color: '#4CAF50' }} />
                            </Avatar>
                            <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#4CAF50' }}>
                                {quiz?.correct_count || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>إجابات صحيحة</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={4}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                            <Avatar sx={{ width: 50, height: 50, bgcolor: '#ffebee', mx: 'auto', mb: 1 }}>
                                <CancelIcon sx={{ color: '#f44336' }} />
                            </Avatar>
                            <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#f44336' }}>
                                {quiz?.wrong_count || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>إجابات خاطئة</Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Questions Review */}
                <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744', mb: 3 }}>
                    مراجعة الأسئلة
                </Typography>

                {quiz?.questions?.map((question, idx) => {
                    const isCorrect = question.is_correct;
                    const userAnswer = question.user_answer;

                    return (
                        <Grow in={true} timeout={300 + idx * 100} key={question.id}>
                            <Card sx={{
                                mb: 3,
                                borderRadius: 4,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                border: `2px solid ${isCorrect ? '#4CAF5030' : '#f4433630'}`
                            }}>
                                {/* Question Header */}
                                <Box sx={{
                                    p: 2,
                                    background: isCorrect
                                        ? 'linear-gradient(135deg, #4CAF5015, #4CAF5005)'
                                        : 'linear-gradient(135deg, #f4433615, #f4433605)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: isCorrect ? '#4CAF5020' : '#f4433620' }}>
                                            <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: isCorrect ? '#4CAF50' : '#f44336' }}>
                                                {idx + 1}
                                            </Typography>
                                        </Avatar>
                                        <Chip
                                            icon={isCorrect ? <CheckCircleIcon /> : <CancelIcon />}
                                            label={isCorrect ? 'إجابة صحيحة' : 'إجابة خاطئة'}
                                            size="small"
                                            sx={{
                                                bgcolor: isCorrect ? '#4CAF5020' : '#f4433620',
                                                color: isCorrect ? '#4CAF50' : '#f44336',
                                                fontFamily: 'Cairo',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </Box>
                                    <Chip
                                        icon={<StarIcon />}
                                        label={`${question.earned_points || 0}/${question.points} درجة`}
                                        size="small"
                                        sx={{
                                            bgcolor: '#fff3e0',
                                            color: '#FF9800',
                                            fontFamily: 'Cairo',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </Box>

                                <CardContent sx={{ p: 3 }}>
                                    {/* Question Text */}
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744', mb: 3, lineHeight: 1.8 }}>
                                        {question.question_text}
                                    </Typography>

                                    {/* Question Image */}
                                    {question.question_image && (
                                        <Box sx={{ mb: 3, textAlign: 'center' }}>
                                            <img
                                                src={question.question_image ? question.question_image.replace('http://backend:8000', window.location.protocol + '//' + window.location.hostname + ':8000') : ''}
                                                alt="Question"
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: 300,
                                                    borderRadius: 12,
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                        </Box>
                                    )}

                                    {/* MCQ Answers */}
                                    {question.question_type === 'MCQ' && question.choices && (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            {question.choices.map((choice) => {
                                                const isUserChoice = userAnswer?.choice_id === choice.id;
                                                const isCorrectChoice = choice.is_correct;

                                                return (
                                                    <Paper
                                                        key={choice.id}
                                                        sx={{
                                                            p: 2,
                                                            borderRadius: 3,
                                                            border: isCorrectChoice
                                                                ? '2px solid #4CAF50'
                                                                : isUserChoice
                                                                    ? '2px solid #f44336'
                                                                    : '2px solid #eee',
                                                            bgcolor: isCorrectChoice
                                                                ? '#4CAF5010'
                                                                : isUserChoice
                                                                    ? '#f4433610'
                                                                    : '#fff',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 2
                                                        }}
                                                    >
                                                        {isCorrectChoice ? (
                                                            <CheckCircleIcon sx={{ color: '#4CAF50' }} />
                                                        ) : isUserChoice ? (
                                                            <CancelIcon sx={{ color: '#f44336' }} />
                                                        ) : (
                                                            <Box sx={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #ddd' }} />
                                                        )}
                                                        <Typography sx={{
                                                            fontFamily: 'Cairo',
                                                            color: isCorrectChoice ? '#4CAF50' : isUserChoice ? '#f44336' : '#666'
                                                        }}>
                                                            {choice.choice_text}
                                                        </Typography>
                                                        {isUserChoice && (
                                                            <Chip label="إجابتك" size="small" sx={{ ml: 'auto', fontFamily: 'Cairo' }} />
                                                        )}
                                                        {isCorrectChoice && (
                                                            <Chip label="الإجابة الصحيحة" size="small" color="success" sx={{ ml: 'auto', fontFamily: 'Cairo' }} />
                                                        )}
                                                    </Paper>
                                                );
                                            })}
                                        </Box>
                                    )}

                                    {/* Essay Answer */}
                                    {question.question_type === 'ESSAY' && (
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontFamily: 'Cairo', color: '#666', mb: 1 }}>
                                                إجابتك:
                                            </Typography>
                                            <Paper sx={{ p: 2, bgcolor: '#fafafa', borderRadius: 3 }}>
                                                <Typography sx={{ fontFamily: 'Cairo', whiteSpace: 'pre-wrap' }}>
                                                    {userAnswer?.essay_answer || 'لم تتم الإجابة'}
                                                </Typography>
                                            </Paper>
                                            {question.pending_review && (
                                                <Alert severity="info" sx={{ mt: 2, fontFamily: 'Cairo', borderRadius: 3 }}>
                                                    هذا السؤال ينتظر مراجعة من الدكتور
                                                </Alert>
                                            )}
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grow>
                    );
                })}

                {/* Back Button */}
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/student/quizzes')}
                        startIcon={<ArrowBackIcon />}
                        sx={{
                            fontFamily: 'Cairo',
                            fontWeight: 'bold',
                            px: 5,
                            py: 1.5,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        }}
                    >
                        العودة للكويزات
                    </Button>
                </Box>
            </Container>
        </Box>
    );
}
