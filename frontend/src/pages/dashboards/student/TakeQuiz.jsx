import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Paper, Button, RadioGroup,
    FormControlLabel, Radio, TextField, Alert, CircularProgress,
    LinearProgress, Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function TakeQuiz() {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    useEffect(() => {
        fetchQuiz();
    }, [quizId]);

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

        // Format answers for API
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

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2, fontFamily: 'Cairo' }}>جاري تحميل الكويز...</Typography>
            </Container>
        );
    }

    if (result) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#2e7d32', mb: 2 }}>
                        تم تسليم الكويز بنجاح! ✓
                    </Typography>

                    {result.score !== null && (
                        <Box sx={{ my: 4 }}>
                            <Typography variant="h2" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1976d2' }}>
                                {result.score} / {result.total_points}
                            </Typography>
                            <Typography variant="h6" color="textSecondary" sx={{ fontFamily: 'Cairo' }}>
                                درجتك
                            </Typography>
                        </Box>
                    )}

                    {result.score === null && (
                        <Alert severity="info" sx={{ mt: 2, fontFamily: 'Cairo' }}>
                            سيتم مراجعة إجاباتك من قبل الدكتور
                        </Alert>
                    )}

                    <Button
                        variant="contained"
                        onClick={() => navigate('/student/quizzes')}
                        sx={{ mt: 3, fontFamily: 'Cairo' }}
                    >
                        العودة للكويزات
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/student/quizzes')}
                sx={{ mb: 2, fontFamily: 'Cairo' }}
            >
                إلغاء
            </Button>

            {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo' }}>{error}</Alert>}

            {quiz && (
                <>
                    <Paper sx={{ p: 3, mb: 3, bgcolor: '#e3f2fd' }}>
                        <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1 }}>
                            {quiz.title}
                        </Typography>
                        {quiz.description && (
                            <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Cairo' }}>
                                {quiz.description}
                            </Typography>
                        )}
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <Typography variant="body2" sx={{ fontFamily: 'Cairo' }}>
                                الدرجة الكلية: <strong>{quiz.total_points}</strong>
                            </Typography>
                            {quiz.time_limit_minutes && (
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo' }}>
                                    الوقت: <strong>{quiz.time_limit_minutes} دقيقة</strong>
                                </Typography>
                            )}
                        </Box>
                    </Paper>

                    {/* Image-based quiz */}
                    {quiz.image && (
                        <Paper sx={{ p: 2, mb: 3, textAlign: 'center' }}>
                            <img
                                src={quiz.image}
                                alt="Quiz"
                                style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8 }}
                            />
                        </Paper>
                    )}

                    {/* Questions */}
                    {quiz.questions.map((question, index) => (
                        <Paper key={question.id} sx={{ p: 3, mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 2 }}>
                                {index + 1}. {question.question_text}
                                <Typography component="span" color="textSecondary" sx={{ ml: 1, fontSize: '0.85rem' }}>
                                    ({question.points} درجة)
                                </Typography>
                            </Typography>

                            {question.question_type === 'MCQ' ? (
                                <RadioGroup
                                    value={answers[question.id]?.choice_id || ''}
                                    onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value))}
                                >
                                    {question.choices.map((choice) => (
                                        <FormControlLabel
                                            key={choice.id}
                                            value={choice.id}
                                            control={<Radio />}
                                            label={choice.choice_text}
                                            sx={{ fontFamily: 'Cairo' }}
                                        />
                                    ))}
                                </RadioGroup>
                            ) : (
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    placeholder="اكتب إجابتك هنا..."
                                    value={answers[question.id]?.essay_answer || ''}
                                    onChange={(e) => handleAnswerChange(question.id, e.target.value, true)}
                                />
                            )}
                        </Paper>
                    ))}

                    {/* Submit */}
                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Button
                            variant="contained"
                            color="success"
                            size="large"
                            onClick={handleSubmit}
                            disabled={submitting}
                            sx={{ fontFamily: 'Cairo', px: 5 }}
                        >
                            {submitting ? <CircularProgress size={24} color="inherit" /> : 'تسليم الكويز'}
                        </Button>
                    </Box>
                </>
            )}
        </Container>
    );
}
