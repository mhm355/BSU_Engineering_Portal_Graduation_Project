import React, { useEffect, useState, useRef } from 'react';
import {
    Box, Container, Typography, Paper, Alert, CircularProgress,
    IconButton, Avatar, Fade, Grow,
    Button, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { keyframes } from '@mui/system';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GradeIcon from '@mui/icons-material/Grade';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

export default function StudentGrades() {
    const navigate = useNavigate();
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const printRef = useRef();

    useEffect(() => {
        fetchGrades();
    }, []);

    const fetchGrades = async () => {
        try {
            const response = await axios.get('/api/academic/exam-grades/my-grades/', { withCredentials: true });
            setGrades(response.data);
        } catch (err) {
            console.error('Error fetching grades:', err);
            if (err.response?.status === 403 && err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else {
                setError('فشل تحميل الدرجات. يرجى المحاولة مرة أخرى.');
            }
        } finally {
            setLoading(false);
        }
    };



    // Export grades as printable PDF
    const handleExportPDF = () => {
        const printContent = printRef.current;
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html dir="rtl">
            <head>
                <title>كشف الدرجات</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
                    body { font-family: 'Cairo', sans-serif; margin: 30px; direction: rtl; color: #333; }
                    h1 { text-align: center; color: #1a2744; margin-bottom: 5px; }
                    h3 { text-align: center; color: #666; margin-top: 0; margin-bottom: 25px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { border: 1px solid #ddd; padding: 10px 12px; text-align: center; font-size: 14px; }
                    th { background: #1a2744; color: #fff; }
                    tr:nth-child(even) { background: #f9f9f9; }
                    .summary { display: flex; justify-content: space-around; margin-bottom: 20px; padding: 15px; background: #f0f4ff; border-radius: 8px; }
                    .summary div { text-align: center; }
                    .summary .value { font-size: 24px; font-weight: bold; color: #1a2744; }
                    .summary .label { font-size: 13px; color: #666; }
                    @media print { body { margin: 15px; } }
                </style>
            </head>
            <body>
                <h1>كشف التقييمات المستمرة</h1>
                <h3>كلية الهندسة - جامعة بني سويف</h3>
                <table>
                    <thead>
                        <tr>
                            <th>المادة</th>
                            <th>الكود</th>
                            <th>الحضور</th>
                            <th>الكويزات</th>
                            <th>أعمال السنة</th>
                            <th>منتصف الترم</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${grades.map(g => {
            return `<tr>
                                <td>${g.course_name || g.subject_name || '-'}</td>
                                <td>${g.course_code || g.subject_code || '-'}</td>
                                <td>${g.attendance_grade ?? '-'}</td>
                                <td>${g.quizzes_grade ?? '-'}</td>
                                <td>${g.coursework_grade ?? '-'}</td>
                                <td>${g.midterm_grade ?? '-'}</td>
                            </tr>`;
        }).join('')}
                    </tbody>
                </table>
                <p style="text-align:center; color:#999; font-size:12px;">تم الطباعة بتاريخ ${new Date().toLocaleDateString('ar-EG')}</p>
            </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress size={60} />
        </Box>
    );

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
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <IconButton onClick={() => navigate('/student/dashboard')} sx={{ color: '#fff' }}>
                                    <ArrowBackIcon />
                                </IconButton>
                                <Button
                                    variant="outlined"
                                    startIcon={<PictureAsPdfIcon />}
                                    onClick={handleExportPDF}
                                    disabled={grades.length === 0}
                                    sx={{
                                        color: '#fff',
                                        borderColor: 'rgba(255,255,255,0.5)',
                                        fontFamily: 'Cairo',
                                        fontWeight: 'bold',
                                        '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' },
                                    }}
                                >
                                    تصدير PDF
                                </Button>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 60, height: 60, bgcolor: 'rgba(255,255,255,0.2)' }}>
                                    <GradeIcon sx={{ fontSize: 35 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                        نتائج الامتحانات والدرجات
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', opacity: 0.9 }}>
                                        متابعة درجاتك في جميع المواد الدراسية
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mt: -3, pb: 6 }} ref={printRef}>


                {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3 }} onClose={() => setError('')}>{error}</Alert>}

                {/* Grades List */}
                {/* Grades List */}
                {grades.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {/* Table for Ongoing Assessments */}
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                            <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744', mb: 3 }}>
                                التقييمات المستمرة
                            </Typography>
                            <TableContainer sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>كود المادة</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>اسم المادة</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center' }}>الحضور</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center' }}>الكويزات</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center' }}>أعمال السنة</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center' }}>الميدترم</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {grades.map((grade, idx) => (
                                            <TableRow key={idx} hover>
                                                <TableCell sx={{ fontFamily: 'Cairo' }}>{grade.course_code || grade.subject_code}</TableCell>
                                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{grade.course_name || grade.subject_name}</TableCell>
                                                <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'center' }}>{grade.attendance_grade ?? '--'} / {grade.attendance_weight || 10}</TableCell>
                                                <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'center' }}>{grade.quizzes_grade ?? '--'} / {grade.quizzes_weight || 10}</TableCell>
                                                <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'center' }}>{grade.coursework_grade ?? '--'} / {grade.coursework_weight || 10}</TableCell>
                                                <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'center' }}>{grade.midterm_grade ?? '--'} / {grade.midterm_weight || 20}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>


                    </Box>
                ) : (
                    <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <GradeIcon sx={{ fontSize: 80, color: '#ddd', mb: 2 }} />
                        <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#666', mb: 1 }}>
                            لا توجد درجات متاحة حالياً
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#999' }}>
                            ستظهر درجاتك هنا بعد أن يقوم الأساتذة برصدها
                        </Typography>
                    </Paper>
                )}
            </Container>
        </Box>
    );
}
