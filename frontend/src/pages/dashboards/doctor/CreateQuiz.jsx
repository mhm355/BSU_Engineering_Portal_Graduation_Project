import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Paper, Button, TextField, FormControl,
    InputLabel, Select, MenuItem, IconButton, Alert, Chip, Divider,
    FormControlLabel, Checkbox, CircularProgress, Card, CardMedia
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function CreateQuiz() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Quiz data
    const [quizData, setQuizData] = useState({
        title: '',
        description: '',
        quiz_type: 'MCQ',
        total_points: 10,
        time_limit_minutes: null,
        is_active: true,
        questions: []
    });

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            const res = await axios.get(`/api/academic/course-offerings/${courseId}/`, config);
            setCourse(res.data);
        } catch (err) {
            setError('فشل في تحميل بيانات المادة');
        }
    };

    const addQuestion = () => {
        setQuizData(prev => ({
            ...prev,
            questions: [...prev.questions, {
                question_text: '',
                question_image: null,
                question_image_preview: null,
                question_type: 'MCQ',
                points: 1,
                choices: [
                    { choice_text: '', is_correct: false },
                    { choice_text: '', is_correct: false },
                    { choice_text: '', is_correct: false },
                    { choice_text: '', is_correct: false },
                ]
            }]
        }));
    };

    const removeQuestion = (index) => {
        setQuizData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const updateQuestion = (index, field, value) => {
        setQuizData(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) =>
                i === index ? { ...q, [field]: value } : q
            )
        }));
    };

    const handleQuestionImageChange = (index, file) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setQuizData(prev => ({
                    ...prev,
                    questions: prev.questions.map((q, i) =>
                        i === index ? {
                            ...q,
                            question_image: file,
                            question_image_preview: reader.result
                        } : q
                    )
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeQuestionImage = (index) => {
        setQuizData(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) =>
                i === index ? {
                    ...q,
                    question_image: null,
                    question_image_preview: null
                } : q
            )
        }));
    };

    const updateChoice = (qIndex, cIndex, field, value) => {
        setQuizData(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) => {
                if (i !== qIndex) return q;
                return {
                    ...q,
                    choices: q.choices.map((c, j) => {
                        if (j !== cIndex) {
                            // If setting is_correct to true, unset others
                            if (field === 'is_correct' && value) {
                                return { ...c, is_correct: false };
                            }
                            return c;
                        }
                        return { ...c, [field]: value };
                    })
                };
            })
        }));
    };

    const handleSubmit = async () => {
        if (!quizData.title) {
            setError('يرجى إدخال عنوان الكويز');
            return;
        }
        if (quizData.questions.length === 0) {
            setError('يرجى إضافة سؤال واحد على الأقل');
            return;
        }

        // Validate each question has text or image
        for (let i = 0; i < quizData.questions.length; i++) {
            const q = quizData.questions[i];
            if (!q.question_text && !q.question_image) {
                setError(`السؤال ${i + 1}: يرجى إدخال نص السؤال أو رفع صورة`);
                return;
            }
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            // Use FormData to support file uploads
            const formData = new FormData();
            formData.append('course_offering_id', courseId);
            formData.append('title', quizData.title);
            formData.append('description', quizData.description);
            formData.append('quiz_type', quizData.quiz_type);
            formData.append('total_points', quizData.total_points);
            if (quizData.time_limit_minutes) {
                formData.append('time_limit_minutes', quizData.time_limit_minutes);
            }
            formData.append('is_active', quizData.is_active);

            // Prepare questions data (without image files)
            const questionsData = quizData.questions.map((q, i) => ({
                question_text: q.question_text,
                question_type: q.question_type,
                points: q.points,
                choices: q.choices,
                has_image: !!q.question_image
            }));
            formData.append('questions', JSON.stringify(questionsData));

            // Append question images
            quizData.questions.forEach((q, i) => {
                if (q.question_image) {
                    formData.append(`question_image_${i}`, q.question_image);
                }
            });

            await axios.post('/api/academic/quizzes/', formData, {
                ...config,
                headers: {
                    ...config.headers,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess('تم إنشاء الكويز بنجاح!');
            setTimeout(() => navigate(`/doctor/courses/${courseId}`), 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'فشل في إنشاء الكويز');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ mb: 2, fontFamily: 'Cairo' }}
            >
                عودة
            </Button>

            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                إنشاء كويز جديد
            </Typography>

            {course && (
                <Chip
                    label={`المادة: ${course.subject_name}`}
                    color="primary"
                    sx={{ mb: 3, fontFamily: 'Cairo' }}
                />
            )}

            {error && <Alert severity="error" sx={{ mb: 2, fontFamily: 'Cairo' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2, fontFamily: 'Cairo' }}>{success}</Alert>}

            {/* Quiz Info */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                    معلومات الكويز
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                        label="عنوان الكويز"
                        value={quizData.title}
                        onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
                        sx={{ flex: 2, minWidth: 200 }}
                        InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                    />

                    <FormControl sx={{ minWidth: 150 }}>
                        <InputLabel>نوع الكويز</InputLabel>
                        <Select
                            value={quizData.quiz_type}
                            onChange={(e) => setQuizData(prev => ({ ...prev, quiz_type: e.target.value }))}
                            label="نوع الكويز"
                        >
                            <MenuItem value="MCQ">اختيار من متعدد</MenuItem>
                            <MenuItem value="ESSAY">مقالي</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="الدرجة الكلية"
                        type="number"
                        value={quizData.total_points}
                        onChange={(e) => setQuizData(prev => ({ ...prev, total_points: parseFloat(e.target.value) }))}
                        sx={{ minWidth: 120 }}
                    />

                    <TextField
                        label="الوقت (دقائق)"
                        type="number"
                        value={quizData.time_limit_minutes || ''}
                        onChange={(e) => setQuizData(prev => ({ ...prev, time_limit_minutes: e.target.value ? parseInt(e.target.value) : null }))}
                        sx={{ minWidth: 120 }}
                        placeholder="اختياري"
                    />
                </Box>

                <TextField
                    label="وصف الكويز"
                    value={quizData.description}
                    onChange={(e) => setQuizData(prev => ({ ...prev, description: e.target.value }))}
                    fullWidth
                    multiline
                    rows={2}
                    sx={{ mt: 2 }}
                    InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                />
            </Paper>

            {/* Questions */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                        الأسئلة ({quizData.questions.length})
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={addQuestion}
                        sx={{ fontFamily: 'Cairo' }}
                    >
                        إضافة سؤال
                    </Button>
                </Box>

                {quizData.questions.map((question, qIndex) => (
                    <Box key={qIndex} sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                السؤال {qIndex + 1}
                            </Typography>
                            <IconButton color="error" onClick={() => removeQuestion(qIndex)}>
                                <DeleteIcon />
                            </IconButton>
                        </Box>

                        <TextField
                            label="نص السؤال"
                            value={question.question_text}
                            onChange={(e) => updateQuestion(qIndex, 'question_text', e.target.value)}
                            fullWidth
                            multiline
                            rows={2}
                            sx={{ mb: 2 }}
                            placeholder="أدخل نص السؤال أو ارفع صورة أدناه"
                        />

                        {/* Question Image Upload */}
                        <Box sx={{ mb: 2 }}>
                            {question.question_image_preview ? (
                                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                    <Card sx={{ maxWidth: 400, borderRadius: 2 }}>
                                        <CardMedia
                                            component="img"
                                            image={question.question_image_preview}
                                            alt="صورة السؤال"
                                            sx={{ maxHeight: 250, objectFit: 'contain', bgcolor: '#fff' }}
                                        />
                                    </Card>
                                    <IconButton
                                        onClick={() => removeQuestionImage(qIndex)}
                                        sx={{
                                            position: 'absolute',
                                            top: -10,
                                            right: -10,
                                            bgcolor: '#f44336',
                                            color: '#fff',
                                            '&:hover': { bgcolor: '#d32f2f' }
                                        }}
                                        size="small"
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ) : (
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<CloudUploadIcon />}
                                    sx={{
                                        fontFamily: 'Cairo',
                                        borderStyle: 'dashed',
                                        py: 1.5,
                                        px: 3,
                                        borderColor: '#9c27b0',
                                        color: '#9c27b0',
                                        '&:hover': {
                                            borderColor: '#7b1fa2',
                                            bgcolor: 'rgba(156, 39, 176, 0.04)'
                                        }
                                    }}
                                >
                                    رفع صورة للسؤال
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={(e) => handleQuestionImageChange(qIndex, e.target.files[0])}
                                    />
                                </Button>
                            )}
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <FormControl sx={{ minWidth: 150 }}>
                                <InputLabel>نوع السؤال</InputLabel>
                                <Select
                                    value={question.question_type}
                                    onChange={(e) => updateQuestion(qIndex, 'question_type', e.target.value)}
                                    label="نوع السؤال"
                                    size="small"
                                >
                                    <MenuItem value="MCQ">اختيار</MenuItem>
                                    <MenuItem value="ESSAY">مقالي</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                label="الدرجة"
                                type="number"
                                value={question.points}
                                onChange={(e) => updateQuestion(qIndex, 'points', parseFloat(e.target.value))}
                                size="small"
                                sx={{ width: 100 }}
                            />
                        </Box>

                        {question.question_type === 'MCQ' && (
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontFamily: 'Cairo', mb: 1 }}>
                                    الاختيارات (حدد الإجابة الصحيحة):
                                </Typography>
                                {question.choices.map((choice, cIndex) => (
                                    <Box key={cIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Checkbox
                                            checked={choice.is_correct}
                                            onChange={(e) => updateChoice(qIndex, cIndex, 'is_correct', e.target.checked)}
                                            size="small"
                                        />
                                        <TextField
                                            value={choice.choice_text}
                                            onChange={(e) => updateChoice(qIndex, cIndex, 'choice_text', e.target.value)}
                                            placeholder={`الاختيار ${cIndex + 1}`}
                                            size="small"
                                            fullWidth
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    backgroundColor: choice.is_correct ? '#e8f5e9' : 'white'
                                                }
                                            }}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                ))}

                {quizData.questions.length === 0 && (
                    <Alert severity="info" sx={{ fontFamily: 'Cairo' }}>
                        لم تتم إضافة أي أسئلة بعد. اضغط "إضافة سؤال" للبدء.
                    </Alert>
                )}
            </Paper>

            {/* Submit */}
            <Box sx={{ textAlign: 'center' }}>
                <Button
                    variant="contained"
                    color="success"
                    size="large"
                    onClick={handleSubmit}
                    disabled={saving}
                    sx={{ fontFamily: 'Cairo', px: 5 }}
                >
                    {saving ? <CircularProgress size={24} color="inherit" /> : 'حفظ الكويز'}
                </Button>
            </Box>
        </Container>
    );
}
