import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Container, Typography, Paper, Button, RadioGroup,
    FormControlLabel, Radio, TextField, Alert, CircularProgress,
    LinearProgress, Divider, Avatar, Chip, Grid, Card, CardContent,
    Fade, Grow, IconButton, Stepper, Step, StepLabel, StepButton
} from '@mui/material';
import { keyframes } from '@mui/system';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
import QuizIcon from '@mui/icons-material/Quiz';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HelpIcon from '@mui/icons-material/Help';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CelebrationIcon from '@mui/icons-material/Celebration';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const celebrate = keyframes`
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
`;

const confetti = keyframes`
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
`;

export default function TakeQuiz() {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeLeft, setTimeLeft] = useState(null);
    const [showAllQuestions, setShowAllQuestions] = useState(false);

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    useEffect(() => {
        fetchQuiz();
    }, [quizId]);

    // Timer effect
    useEffect(() => {
        if (quiz?.time_limit_minutes && timeLeft === null) {
            setTimeLeft(quiz.time_limit_minutes * 60);
        }
    }, [quiz]);

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(); // Auto-submit when time runs out
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const fetchQuiz = async () => {
        try {
            const res = await axios.get(`/api/academic/student/quizzes/${quizId}/attempt/`, config);
            setQuiz(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'فشل في تحميل الكويز');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId, value, isEssay = false) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: isEssay ? { essay_answer: value } : { choice_id: value }
        }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');

        const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
            question_id: parseInt(questionId),
            ...answer
        }));

        try {
            const res = await axios.post(
                `/api/academic/student/quizzes/${quizId}/attempt/`,
                { answers: formattedAnswers },
                config
            );
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'فشل في تسليم الكويز');
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getAnsweredCount = () => Object.keys(answers).length;
    const getProgressPercentage = () => quiz ? (getAnsweredCount() / quiz.questions.length) * 100 : 0;

    const isQuestionAnswered = (questionId) => !!answers[questionId];

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
        return 'حاول مرة أخرى 💪';
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
                    جاري تحميل الكويز...
                </Typography>
            </Box>
        );
    }

    // Result Screen
    if (result) {
        const scorePercentage = result.total_points > 0 ? Math.round((result.score / result.total_points) * 100) : 0;
        const scoreColor = getScoreColor(scorePercentage);

        return (
            <Box sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                py: 6
            }}>
                <Container maxWidth="sm">
                    <Fade in={true} timeout={800}>
                        <Paper sx={{
                            p: 5,
                            textAlign: 'center',
                            borderRadius: 5,
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                        }}>
                            {/* Celebration Icon */}
                            <Avatar sx={{
                                width: 100,
                                height: 100,
                                bgcolor: `${scoreColor}20`,
                                mx: 'auto',
                                mb: 3,
                                animation: `${celebrate} 1s ease-in-out infinite`
                            }}>
                                {scorePercentage >= 60 ? (
                                    <EmojiEventsIcon sx={{ fontSize: 60, color: scoreColor }} />
                                ) : (
                                    <QuizIcon sx={{ fontSize: 60, color: scoreColor }} />
                                )}
                            </Avatar>

                            <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744', mb: 1 }}>
                                تم تسليم الكويز بنجاح!
                            </Typography>
                            <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666', mb: 4 }}>
                                {quiz?.title}
                            </Typography>

                            {result.score !== null ? (
                                <>
                                    {/* Score Circle */}
                                    <Box sx={{
                                        width: 180,
                                        height: 180,
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
                                            {result.score}
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                            من {result.total_points}
                                        </Typography>
                                    </Box>

                                    {/* Score Label */}
                                    <Chip
                                        icon={<StarIcon />}
                                        label={getScoreLabel(scorePercentage)}
                                        sx={{
                                            fontSize: '1.2rem',
                                            py: 3,
                                            px: 2,
                                            bgcolor: `${scoreColor}20`,
                                            color: scoreColor,
                                            fontFamily: 'Cairo',
                                            fontWeight: 'bold',
                                            mb: 3
                                        }}
                                    />

                                    {/* Percentage */}
                                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', color: '#1a2744', mb: 1 }}>
                                        نسبة النجاح: {scorePercentage}%
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={scorePercentage}
                                        sx={{
                                            height: 12,
                                            borderRadius: 6,
                                            bgcolor: '#e0e0e0',
                                            mb: 4,
                                            '& .MuiLinearProgress-bar': { bgcolor: scoreColor, borderRadius: 6 }
                                        }}
                                    />
                                </>
                            ) : (
                                <Alert severity="info" sx={{ mb: 4, fontFamily: 'Cairo', borderRadius: 3 }}>
                                    <Typography sx={{ fontFamily: 'Cairo' }}>
                                        سيتم مراجعة إجاباتك من قبل الدكتور وستظهر درجتك لاحقاً
                                    </Typography>
                                </Alert>
                            )}

                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/student/quizzes')}
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
                        </Paper>
                    </Fade>
                </Container>
            </Box>
        );
    }

    if (!quiz) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ fontFamily: 'Cairo' }}>{error || 'لم يتم العثور على الكويز'}</Alert>
                <Button onClick={() => navigate('/student/quizzes')} sx={{ mt: 2, fontFamily: 'Cairo' }}>
                    العودة
                </Button>
            </Container>
        );
    }

    const currentQ = quiz.questions[currentQuestion];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
            {/* Fixed Header */}
            <Box sx={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                py: 2,
                px: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton onClick={() => navigate('/student/quizzes')} sx={{ color: '#fff' }}>
                                <ArrowBackIcon />
                            </IconButton>
                            <Box>
                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                    {quiz.title}
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', opacity: 0.8 }}>
                                    {quiz.subject_name}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                            {/* Timer */}
                            {timeLeft !== null && (
                                <Chip
                                    icon={<AccessTimeIcon />}
                                    label={formatTime(timeLeft)}
                                    sx={{
                                        bgcolor: timeLeft < 60 ? '#f44336' : 'rgba(255,255,255,0.2)',
                                        color: '#fff',
                                        fontFamily: 'Cairo',
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        animation: timeLeft < 60 ? `${pulse} 1s ease-in-out infinite` : 'none'
                                    }}
                                />
                            )}

                            {/* Progress */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography sx={{ fontFamily: 'Cairo' }}>
                                    {getAnsweredCount()} / {quiz.questions.length}
                                </Typography>
                                <CheckCircleIcon sx={{ fontSize: 20 }} />
                            </Box>

                            {/* Points */}
                            <Chip
                                icon={<StarIcon />}
                                label={`${quiz.total_points} درجة`}
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontFamily: 'Cairo' }}
                            />
                        </Box>
                    </Box>

                    {/* Progress Bar */}
                    <LinearProgress
                        variant="determinate"
                        value={getProgressPercentage()}
                        sx={{
                            mt: 2,
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            '& .MuiLinearProgress-bar': { bgcolor: '#4CAF50', borderRadius: 4 }
                        }}
                    />
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3 }}>{error}</Alert>}

                <Grid container spacing={4}>
                    {/* Question Navigation Sidebar */}
                    <Grid item xs={12} md={3}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', position: 'sticky', top: 140 }}>
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 2, color: '#1a2744' }}>
                                الأسئلة
                            </Typography>
                            <Grid container spacing={1}>
                                {quiz.questions.map((q, idx) => (
                                    <Grid item xs={3} key={q.id}>
                                        <Button
                                            variant={currentQuestion === idx ? 'contained' : 'outlined'}
                                            onClick={() => setCurrentQuestion(idx)}
                                            sx={{
                                                minWidth: 0,
                                                width: '100%',
                                                py: 1,
                                                borderRadius: 2,
                                                fontFamily: 'Cairo',
                                                fontWeight: 'bold',
                                                bgcolor: currentQuestion === idx
                                                    ? '#667eea'
                                                    : isQuestionAnswered(q.id)
                                                        ? '#e8f5e9'
                                                        : 'transparent',
                                                color: currentQuestion === idx
                                                    ? '#fff'
                                                    : isQuestionAnswered(q.id)
                                                        ? '#4CAF50'
                                                        : '#666',
                                                borderColor: isQuestionAnswered(q.id) ? '#4CAF50' : '#ddd',
                                                '&:hover': {
                                                    bgcolor: currentQuestion === idx ? '#5a6fd6' : '#f5f5f5'
                                                }
                                            }}
                                        >
                                            {idx + 1}
                                        </Button>
                                    </Grid>
                                ))}
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            {/* Legend */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 16, height: 16, borderRadius: 1, bgcolor: '#667eea' }} />
                                    <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>السؤال الحالي</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 16, height: 16, borderRadius: 1, bgcolor: '#e8f5e9', border: '1px solid #4CAF50' }} />
                                    <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>تمت الإجابة</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 16, height: 16, borderRadius: 1, border: '1px solid #ddd' }} />
                                    <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>لم تتم الإجابة</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Current Question */}
                    <Grid item xs={12} md={9}>
                        <Fade in={true} key={currentQuestion} timeout={300}>
                            <Card sx={{
                                borderRadius: 4,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                overflow: 'visible'
                            }}>
                                {/* Question Header */}
                                <Box sx={{
                                    p: 3,
                                    background: 'linear-gradient(135deg, #667eea15, #764ba210)',
                                    borderBottom: '1px solid #eee'
                                }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: '#667eea', width: 45, height: 45 }}>
                                                <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                                    {currentQuestion + 1}
                                                </Typography>
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                                    السؤال {currentQuestion + 1} من {quiz.questions.length}
                                                </Typography>
                                                <Chip
                                                    size="small"
                                                    label={currentQ.question_type === 'MCQ' ? 'اختيار من متعدد' : 'إجابة مقالية'}
                                                    sx={{ mt: 0.5, fontFamily: 'Cairo' }}
                                                />
                                            </Box>
                                        </Box>
                                        <Chip
                                            icon={<StarIcon />}
                                            label={`${currentQ.points} درجة`}
                                            sx={{
                                                bgcolor: '#fff3e0',
                                                color: '#FF9800',
                                                fontFamily: 'Cairo',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </Box>
                                </Box>

                                <CardContent sx={{ p: 4 }}>
                                    {/* Question Text */}
                                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744', mb: 3, lineHeight: 1.8 }}>
                                        {currentQ.question_text}
                                    </Typography>

                                    {/* Question Image */}
                                    {currentQ.question_image && (
                                        <Box sx={{ mb: 3, textAlign: 'center' }}>
                                            <img
                                                src={currentQ.question_image ? currentQ.question_image.replace('http://backend:8000', window.location.protocol + '//' + window.location.hostname + ':8000') : ''}
                                                alt="Question"
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: 400,
                                                    borderRadius: 12,
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                        </Box>
                                    )}

                                    {/* MCQ Options */}
                                    {currentQ.question_type === 'MCQ' ? (
                                        <RadioGroup
                                            value={answers[currentQ.id]?.choice_id || ''}
                                            onChange={(e) => handleAnswerChange(currentQ.id, parseInt(e.target.value))}
                                        >
                                            <Grid container spacing={2}>
                                                {currentQ.choices.map((choice, idx) => {
                                                    const isSelected = answers[currentQ.id]?.choice_id === choice.id;
                                                    return (
                                                        <Grid item xs={12} key={choice.id}>
                                                            <Paper
                                                                onClick={() => handleAnswerChange(currentQ.id, choice.id)}
                                                                sx={{
                                                                    p: 2,
                                                                    cursor: 'pointer',
                                                                    borderRadius: 3,
                                                                    border: isSelected ? '2px solid #667eea' : '2px solid #eee',
                                                                    bgcolor: isSelected ? '#667eea10' : '#fff',
                                                                    transition: 'all 0.2s',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 2,
                                                                    '&:hover': {
                                                                        borderColor: '#667eea',
                                                                        bgcolor: '#667eea05'
                                                                    }
                                                                }}
                                                            >
                                                                {isSelected ? (
                                                                    <CheckCircleOutlineIcon sx={{ color: '#667eea', fontSize: 28 }} />
                                                                ) : (
                                                                    <RadioButtonUncheckedIcon sx={{ color: '#ccc', fontSize: 28 }} />
                                                                )}
                                                                <Typography sx={{
                                                                    fontFamily: 'Cairo',
                                                                    fontSize: '1.1rem',
                                                                    color: isSelected ? '#667eea' : '#1a2744',
                                                                    fontWeight: isSelected ? 'bold' : 'normal'
                                                                }}>
                                                                    {choice.choice_text}
                                                                </Typography>
                                                            </Paper>
                                                        </Grid>
                                                    );
                                                })}
                                            </Grid>
                                        </RadioGroup>
                                    ) : (
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={6}
                                            placeholder="اكتب إجابتك هنا..."
                                            value={answers[currentQ.id]?.essay_answer || ''}
                                            onChange={(e) => handleAnswerChange(currentQ.id, e.target.value, true)}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 3,
                                                    fontFamily: 'Cairo',
                                                    fontSize: '1.1rem',
                                                    '&:hover fieldset': { borderColor: '#667eea' },
                                                    '&.Mui-focused fieldset': { borderColor: '#667eea' }
                                                }
                                            }}
                                        />
                                    )}
                                </CardContent>

                                {/* Navigation Footer */}
                                <Box sx={{
                                    p: 3,
                                    bgcolor: '#fafafa',
                                    borderTop: '1px solid #eee',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<ArrowForwardIcon />}
                                        onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                                        disabled={currentQuestion === 0}
                                        sx={{ fontFamily: 'Cairo', borderRadius: 3, px: 3 }}
                                    >
                                        السابق
                                    </Button>

                                    {currentQuestion === quiz.questions.length - 1 ? (
                                        <Button
                                            variant="contained"
                                            size="large"
                                            endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                                            onClick={handleSubmit}
                                            disabled={submitting}
                                            sx={{
                                                fontFamily: 'Cairo',
                                                fontWeight: 'bold',
                                                borderRadius: 3,
                                                px: 5,
                                                py: 1.5,
                                                background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #43A047 0%, #7CB342 100%)',
                                                }
                                            }}
                                        >
                                            {submitting ? 'جاري التسليم...' : 'تسليم الكويز'}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            endIcon={<ArrowBackIcon />}
                                            onClick={() => setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1))}
                                            sx={{
                                                fontFamily: 'Cairo',
                                                borderRadius: 3,
                                                px: 4,
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            }}
                                        >
                                            التالي
                                        </Button>
                                    )}
                                </Box>
                            </Card>
                        </Fade>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
