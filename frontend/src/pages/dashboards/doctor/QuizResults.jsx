import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Paper, Button, Grid, Card, CardContent,
    CircularProgress, Alert, Chip, Avatar, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, LinearProgress, Fade, Grow, IconButton,
    Tooltip
} from '@mui/material';
import { keyframes } from '@mui/system';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import QuizIcon from '@mui/icons-material/Quiz';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import PersonIcon from '@mui/icons-material/Person';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export default function QuizResults() {
    const { courseId, quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    useEffect(() => {
        fetchResults();
    }, [quizId]);

    const fetchResults = async () => {
        setLoading(true);
        setError('');
        try {
            // Fetch quiz details
            const quizRes = await axios.get(`/api/academic/quizzes/${quizId}/`, config);
            setQuiz(quizRes.data);

            // Fetch results
            const resultsRes = await axios.get(`/api/academic/quizzes/${quizId}/results/`, config);
            setResults(Array.isArray(resultsRes.data) ? resultsRes.data : []);
        } catch (err) {
            setError('فشل في تحميل النتائج');
        } finally {
            setLoading(false);
        }
    };

    // Calculate statistics
    const stats = {
        totalStudents: results.length,
        graded: results.filter(r => r.is_graded).length,
        pending: results.filter(r => !r.is_graded).length,
        avgScore: results.length > 0 ? (results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length).toFixed(1) : 0,
        highestScore: results.length > 0 ? Math.max(...results.map(r => r.score || 0)) : 0,
        lowestScore: results.length > 0 ? Math.min(...results.filter(r => r.score !== null).map(r => r.score || 0)) : 0,
        passRate: results.length > 0 ? ((results.filter(r => (r.score || 0) >= (r.total_points || 10) * 0.5).length / results.length) * 100).toFixed(0) : 0,
    };

    const getScoreColor = (score, total) => {
        const percentage = (score / total) * 100;
        if (percentage >= 80) return '#4CAF50';
        if (percentage >= 60) return '#2196F3';
        if (percentage >= 50) return '#FF9800';
        return '#f44336';
    };

    const getGradeLabel = (score, total) => {
        const percentage = (score / total) * 100;
        if (percentage >= 90) return 'ممتاز';
        if (percentage >= 80) return 'جيد جداً';
        if (percentage >= 70) return 'جيد';
        if (percentage >= 60) return 'مقبول';
        if (percentage >= 50) return 'ضعيف';
        return 'راسب';
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
                background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',
                pt: 4, pb: 6, mb: 4,
                position: 'relative', overflow: 'hidden'
            }}>
                <Box sx={{
                    position: 'absolute', top: -50, right: -50, width: 200, height: 200,
                    borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
                    animation: `${float} 6s ease-in-out infinite`
                }} />
                <Box sx={{
                    position: 'absolute', bottom: -80, left: -80, width: 300, height: 300,
                    borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
                    animation: `${float} 8s ease-in-out infinite`, animationDelay: '2s'
                }} />
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: 400, height: 400, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)'
                }} />

                <Container maxWidth="xl">
                    <Fade in={true} timeout={800}>
                        <Box>
                            <Button
                                startIcon={<ArrowBackIcon />}
                                onClick={() => navigate(`/doctor/courses/${courseId}`)}
                                sx={{ color: '#fff', mb: 3, fontFamily: 'Cairo', fontSize: '1.1rem', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                            >
                                العودة للمقرر
                            </Button>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Avatar sx={{
                                    width: 100, height: 100,
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(10px)',
                                    animation: `${pulse} 3s ease-in-out infinite`
                                }}>
                                    <QuizIcon sx={{ fontSize: 55, color: '#fff' }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                        نتائج الكويز
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', color: 'rgba(255,255,255,0.9)', mt: 0.5 }}>
                                        {quiz?.title || 'الكويز'}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>
                                        <Chip
                                            icon={<SchoolIcon sx={{ color: '#fff !important' }} />}
                                            label={quiz?.subject_name}
                                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontFamily: 'Cairo', fontWeight: 'bold' }}
                                        />
                                        <Chip
                                            icon={<EmojiEventsIcon sx={{ color: '#fff !important' }} />}
                                            label={`${quiz?.total_points || 0} درجة`}
                                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontFamily: 'Cairo' }}
                                        />
                                        {quiz?.time_limit_minutes && (
                                            <Chip
                                                icon={<AccessTimeIcon sx={{ color: '#fff !important' }} />}
                                                label={`${quiz.time_limit_minutes} دقيقة`}
                                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontFamily: 'Cairo' }}
                                            />
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Container maxWidth="xl">
                {error && (
                    <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem' }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {/* Statistics Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={6} sm={4} md={2}>
                        <Grow in={true} timeout={400}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                                <Avatar sx={{ width: 60, height: 60, background: 'linear-gradient(135deg, #2196F3, #64B5F6)', mx: 'auto', mb: 1.5 }}>
                                    <GroupIcon sx={{ fontSize: 30 }} />
                                </Avatar>
                                <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{stats.totalStudents}</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>إجمالي الطلاب</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                        <Grow in={true} timeout={500}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                                <Avatar sx={{ width: 60, height: 60, background: 'linear-gradient(135deg, #4CAF50, #8BC34A)', mx: 'auto', mb: 1.5 }}>
                                    <CheckCircleIcon sx={{ fontSize: 30 }} />
                                </Avatar>
                                <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{stats.graded}</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>تم التصحيح</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                        <Grow in={true} timeout={600}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                                <Avatar sx={{ width: 60, height: 60, background: 'linear-gradient(135deg, #FF9800, #FFB74D)', mx: 'auto', mb: 1.5 }}>
                                    <TrendingUpIcon sx={{ fontSize: 30 }} />
                                </Avatar>
                                <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{stats.avgScore}</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>متوسط الدرجات</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                        <Grow in={true} timeout={700}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                                <Avatar sx={{ width: 60, height: 60, background: 'linear-gradient(135deg, #9c27b0, #ba68c8)', mx: 'auto', mb: 1.5 }}>
                                    <StarIcon sx={{ fontSize: 30 }} />
                                </Avatar>
                                <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{stats.highestScore}</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>أعلى درجة</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                        <Grow in={true} timeout={800}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                                <Avatar sx={{ width: 60, height: 60, background: 'linear-gradient(135deg, #f44336, #e57373)', mx: 'auto', mb: 1.5 }}>
                                    <CancelIcon sx={{ fontSize: 30 }} />
                                </Avatar>
                                <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{stats.lowestScore}</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>أدنى درجة</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                        <Grow in={true} timeout={900}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                                <Avatar sx={{ width: 60, height: 60, background: 'linear-gradient(135deg, #00bcd4, #4dd0e1)', mx: 'auto', mb: 1.5 }}>
                                    <EmojiEventsIcon sx={{ fontSize: 30 }} />
                                </Avatar>
                                <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{stats.passRate}%</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>نسبة النجاح</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>

                {/* Results Table */}
                <Grow in={true} timeout={500}>
                    <Paper elevation={0} sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                        <Box sx={{
                            background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',
                            p: 3,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                                    <GroupIcon />
                                </Avatar>
                                <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>
                                    نتائج الطلاب ({results.length})
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="تحديث">
                                    <IconButton onClick={fetchResults} sx={{ color: '#fff' }}>
                                        <RefreshIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>

                        {results.length > 0 ? (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1.1rem' }}>#</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1.1rem' }}>الطالب</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center' }}>الدرجة</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center' }}>النسبة</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center' }}>التقدير</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center' }}>الحالة</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1.1rem' }}>تاريخ التسليم</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {results.map((result, idx) => {
                                            const score = result.score || 0;
                                            const total = result.total_points || quiz?.total_points || 10;
                                            const percentage = Math.round((score / total) * 100);
                                            const scoreColor = getScoreColor(score, total);

                                            return (
                                                <TableRow
                                                    key={result.student_id}
                                                    hover
                                                    sx={{
                                                        '&:nth-of-type(odd)': { bgcolor: '#fafafa' },
                                                        transition: 'all 0.2s',
                                                        '&:hover': { bgcolor: '#f0f7ff' }
                                                    }}
                                                >
                                                    <TableCell>
                                                        <Avatar sx={{
                                                            width: 36, height: 36,
                                                            bgcolor: scoreColor,
                                                            fontSize: 14, fontWeight: 'bold'
                                                        }}>
                                                            {idx + 1}
                                                        </Avatar>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            <Avatar sx={{ bgcolor: '#e3f2fd' }}>
                                                                <PersonIcon sx={{ color: '#1976d2' }} />
                                                            </Avatar>
                                                            <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1.05rem' }}>
                                                                {result.student_name}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                            <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1.2rem', color: scoreColor }}>
                                                                {score}
                                                            </Typography>
                                                            <Typography sx={{ fontFamily: 'Cairo', color: '#999' }}>
                                                                / {total}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: 'center', minWidth: 150 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={percentage}
                                                                sx={{
                                                                    flex: 1,
                                                                    height: 10,
                                                                    borderRadius: 5,
                                                                    bgcolor: '#e0e0e0',
                                                                    '& .MuiLinearProgress-bar': {
                                                                        bgcolor: scoreColor,
                                                                        borderRadius: 5
                                                                    }
                                                                }}
                                                            />
                                                            <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', minWidth: 45 }}>
                                                                {percentage}%
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>
                                                        <Chip
                                                            label={getGradeLabel(score, total)}
                                                            size="medium"
                                                            sx={{
                                                                fontFamily: 'Cairo',
                                                                fontWeight: 'bold',
                                                                bgcolor: scoreColor,
                                                                color: '#fff',
                                                                fontSize: '0.95rem',
                                                                px: 1
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>
                                                        {result.is_graded ? (
                                                            <Chip
                                                                icon={<CheckCircleIcon />}
                                                                label="تم التصحيح"
                                                                color="success"
                                                                size="small"
                                                                sx={{ fontFamily: 'Cairo' }}
                                                            />
                                                        ) : (
                                                            <Chip
                                                                icon={<AccessTimeIcon />}
                                                                label="قيد التصحيح"
                                                                color="warning"
                                                                size="small"
                                                                sx={{ fontFamily: 'Cairo' }}
                                                            />
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                                            {result.submitted_at ? new Date(result.submitted_at).toLocaleString('ar-EG', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            }) : '-'}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 10 }}>
                                <QuizIcon sx={{ fontSize: 100, color: '#ddd', mb: 3 }} />
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', color: '#999', mb: 2 }}>
                                    لا توجد نتائج بعد
                                </Typography>
                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: '#bbb' }}>
                                    لم يقم أي طالب بحل هذا الكويز حتى الآن
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grow>
            </Container>
        </Box>
    );
}
