import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Paper, Button, Grid, Card, CardContent,
    CircularProgress, Alert, Chip, Avatar, TextField, Fade, Grow,
    Divider, List, ListItem, ListItemText
} from '@mui/material';
import { keyframes } from '@mui/system';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import QuizIcon from '@mui/icons-material/Quiz';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import SchoolIcon from '@mui/icons-material/School';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

export default function GradeQuizAttempt() {
    const { courseId, quizId, attemptId } = useParams();
    const navigate = useNavigate();
    const [attempt, setAttempt] = useState(null);
    const [grades, setGrades] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    useEffect(() => {
        fetchAttemptDetail();
    }, [quizId, attemptId]);

    const fetchAttemptDetail = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get(`/api/academic/quizzes/${quizId}/attempts/${attemptId}/`, config);
            setAttempt(res.data);
            // Initialize grades state with current points_earned
            const initialGrades = {};
            res.data.answers.forEach(ans => {
                if (ans.question_type === 'ESSAY') {
                    initialGrades[ans.answer_id] = ans.points_earned !== null ? ans.points_earned : '';
                }
            });
            setGrades(initialGrades);
        } catch (err) {
            setError('فشل في تحميل تفاصيل المحاولة');
        } finally {
            setLoading(false);
        }
    };

    const handleGradeChange = (answerId, value) => {
        setGrades(prev => ({
            ...prev,
            [answerId]: value
        }));
    };

    const handleSaveGrades = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const gradesPayload = Object.entries(grades)
                .filter(([_, points]) => points !== '' && points !== null)
                .map(([answer_id, points_earned]) => ({
                    answer_id: parseInt(answer_id),
                    points_earned: parseFloat(points_earned)
                }));

            if (gradesPayload.length === 0) {
                setError('يرجى إدخال درجات للأسئلة المقالية');
                setSaving(false);
                return;
            }

            await axios.post(
                `/api/academic/quizzes/${quizId}/attempts/${attemptId}/grade/`,
                { grades: gradesPayload },
                config
            );

            setSuccess('تم حفظ الدرجات بنجاح');
            fetchAttemptDetail();
        } catch (err) {
            setError(err.response?.data?.error || 'فشل في حفظ الدرجات');
        } finally {
            setSaving(false);
        }
    };

    const calculateCurrentScore = () => {
        if (!attempt) return 0;
        let score = 0;
        attempt.answers.forEach(ans => {
            if (ans.question_type === 'MCQ') {
                score += ans.points_earned || 0;
            } else {
                const essayPoints = grades[ans.answer_id];
                score += essayPoints !== '' && essayPoints !== null ? parseFloat(essayPoints) || 0 : 0;
            }
        });
        return score;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', pb: 6 }}>
            {/* Hero Header */}
            <Box sx={{
                background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
                pt: 3, pb: 4, mb: 3,
                position: 'relative', overflow: 'hidden'
            }}>
                {/* Decorative circles - REMOVED */}
                {/* <Box sx={{
                    position: 'absolute', top: -50, right: -50, width: 200, height: 200,
                    borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
                    animation: `${float} 6s ease-in-out infinite`
                }} /> */}

                <Container maxWidth="xl">
                    <Fade in={true} timeout={800}>
                        <Box>
                            <Button
                                startIcon={<ArrowBackIcon />}
                                onClick={() => navigate(`/doctor/courses/${courseId}/quiz/${quizId}/results`)}
                                sx={{ color: '#fff', mb: 3, fontFamily: 'Cairo', fontSize: '1.1rem' }}
                            >
                                العودة للنتائج
                            </Button>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Avatar sx={{
                                    width: 55, height: 55,
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(10px)'
                                }}>
                                    <EditIcon sx={{ fontSize: 30, color: '#fff' }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>
                                        تصحيح إجابات الطالب
                                    </Typography>
                                    <Typography variant="subtitle1" sx={{ fontFamily: 'Cairo', color: 'rgba(255,255,255,0.9)', mt: 0.5 }}>
                                        {attempt?.student_name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
                                        <Chip
                                            icon={<QuizIcon sx={{ color: '#fff !important' }} />}
                                            label={attempt?.quiz_title}
                                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontFamily: 'Cairo' }}
                                        />
                                        <Chip
                                            icon={<SchoolIcon sx={{ color: '#fff !important' }} />}
                                            label={`${calculateCurrentScore()} / ${attempt?.total_points} درجة`}
                                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontFamily: 'Cairo', fontWeight: 'bold' }}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Container maxWidth="lg">
                {error && (
                    <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem' }}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert icon={<CheckCircleIcon />} severity="success" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem' }}>
                        {success}
                    </Alert>
                )}

                <Grow in={true} timeout={400}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 3, color: '#1a2744' }}>
                            إجابات الطالب
                        </Typography>

                        {attempt?.answers.map((answer, index) => (
                            <Card key={answer.answer_id} sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: answer.question_type === 'MCQ' ? '#2196F3' : '#ff9800', fontWeight: 'bold' }}>
                                                {index + 1}
                                            </Avatar>
                                            <Box>
                                                <Chip
                                                    label={answer.question_type === 'MCQ' ? 'اختيار من متعدد' : 'سؤال مقالي'}
                                                    size="small"
                                                    color={answer.question_type === 'MCQ' ? 'primary' : 'warning'}
                                                    sx={{ fontFamily: 'Cairo', mb: 1 }}
                                                />
                                                <Typography variant="body1" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                                    {answer.question_text}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#666' }}>
                                                    الدرجة القصوى: {answer.points} درجة
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    {answer.question_type === 'MCQ' ? (
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontFamily: 'Cairo', mb: 1, color: answer.is_correct ? '#4caf50' : '#f44336' }}>
                                                {answer.is_correct ? '✓ إجابة صحيحة' : '✗ إجابة خاطئة'}
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontFamily: 'Cairo' }}>
                                                إجابة الطالب: {answer.selected_choice?.text || 'لم يتم الإجابة'}
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#4caf50' }}>
                                                الإجابة الصحيحة: {answer.correct_choice?.text}
                                            </Typography>
                                            <Chip
                                                label={`${answer.points_earned || 0} / ${answer.points}`}
                                                color={answer.is_correct ? 'success' : 'error'}
                                                sx={{ mt: 1, fontFamily: 'Cairo' }}
                                            />
                                        </Box>
                                    ) : (
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontFamily: 'Cairo', mb: 1 }}>
                                                إجابة الطالب:
                                            </Typography>
                                            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#fafafa', borderRadius: 2 }}>
                                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', whiteSpace: 'pre-wrap' }}>
                                                    {answer.essay_answer || 'لم يتم الإجابة'}
                                                </Typography>
                                            </Paper>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Typography variant="subtitle2" sx={{ fontFamily: 'Cairo' }}>
                                                    درجة الإجابة:
                                                </Typography>
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    value={grades[answer.answer_id] || ''}
                                                    onChange={(e) => handleGradeChange(answer.answer_id, e.target.value)}
                                                    inputProps={{ min: 0, max: answer.points, step: 0.5 }}
                                                    sx={{ width: 100, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                                />
                                                <Typography variant="body2" sx={{ color: '#666' }}>
                                                    من {answer.points} درجة
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        ))}

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, pt: 3, borderTop: '1px solid #eee' }}>
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                الدرجة الحالية: {calculateCurrentScore()} / {attempt?.total_points}
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                onClick={handleSaveGrades}
                                disabled={saving}
                                sx={{
                                    fontFamily: 'Cairo',
                                    fontWeight: 'bold',
                                    borderRadius: 3,
                                    px: 4,
                                    background: 'linear-gradient(135deg, #ff9800, #ffb74d)'
                                }}
                            >
                                {saving ? 'جاري الحفظ...' : 'حفظ الدرجات'}
                            </Button>
                        </Box>
                    </Paper>
                </Grow>
            </Container>
        </Box>
    );
}
