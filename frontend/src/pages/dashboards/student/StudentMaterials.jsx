import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Paper, Card, CardContent, CardActions,
    Button, Alert, CircularProgress, Chip, Tabs, Tab, Avatar, Grid, Fade, Grow, IconButton
} from '@mui/material';
import { keyframes } from '@mui/system';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import DescriptionIcon from '@mui/icons-material/Description';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FolderIcon from '@mui/icons-material/Folder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

export default function StudentMaterials() {
    const navigate = useNavigate();
    const [lectures, setLectures] = useState([]);
    const [courseOfferings, setCourseOfferings] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    useEffect(() => {
        fetchStudentCourses();
    }, []);

    useEffect(() => {
        if (courseOfferings.length > 0) {
            fetchLectures(courseOfferings[selectedCourse]?.id);
        }
    }, [selectedCourse, courseOfferings]);

    const fetchStudentCourses = async () => {
        try {
            const response = await axios.get('/api/academic/lectures/', config);

            const groupedByCourse = {};
            response.data.forEach(lecture => {
                const courseId = lecture.course_offering;
                if (!groupedByCourse[courseId]) {
                    groupedByCourse[courseId] = {
                        id: courseId,
                        subject_name: lecture.subject_name || 'مقرر',
                        lectures: []
                    };
                }
                groupedByCourse[courseId].lectures.push(lecture);
            });

            const courses = Object.values(groupedByCourse);
            setCourseOfferings(courses);
            setLectures(courses[0]?.lectures || []);
        } catch (err) {
            console.error('Error fetching materials:', err);
            setError('فشل تحميل المحاضرات. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    const fetchLectures = (courseOfferingId) => {
        if (!courseOfferingId) return;
        const course = courseOfferings.find(c => c.id === courseOfferingId);
        if (course) {
            setLectures(course.lectures);
        }
    };

    const getFileIcon = (fileType) => {
        const iconStyle = { fontSize: 40 };
        switch (fileType) {
            case 'PDF': return <PictureAsPdfIcon sx={{ ...iconStyle, color: '#d32f2f' }} />;
            case 'SLIDES': return <SlideshowIcon sx={{ ...iconStyle, color: '#ff9800' }} />;
            case 'VIDEO': return <PlayCircleIcon sx={{ ...iconStyle, color: '#1976d2' }} />;
            default: return <InsertDriveFileIcon sx={{ ...iconStyle, color: '#666' }} />;
        }
    };

    const getFileTypeLabel = (fileType) => {
        switch (fileType) {
            case 'PDF': return 'PDF';
            case 'SLIDES': return 'عرض تقديمي';
            case 'VIDEO': return 'فيديو';
            default: return 'ملف';
        }
    };

    const getFileTypeColor = (fileType) => {
        switch (fileType) {
            case 'PDF': return '#d32f2f';
            case 'SLIDES': return '#ff9800';
            case 'VIDEO': return '#1976d2';
            default: return '#666';
        }
    };

    const totalLectures = courseOfferings.reduce((acc, c) => acc + c.lectures.length, 0);

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress size={60} />
        </Box>
    );

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
            {/* Hero Header */}
            <Box sx={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
                                    <MenuBookIcon sx={{ fontSize: 35 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                        المحاضرات والمواد الدراسية
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', opacity: 0.9 }}>
                                        تصفح وتحميل محاضرات المقررات الدراسية
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
                    <Grid item xs={6} md={4}>
                        <Grow in={true} timeout={400}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                                <Avatar sx={{ width: 50, height: 50, bgcolor: '#e3f2fd', mx: 'auto', mb: 1 }}>
                                    <FolderIcon sx={{ color: '#1976d2' }} />
                                </Avatar>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{courseOfferings.length}</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>المقررات</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={6} md={4}>
                        <Grow in={true} timeout={600}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                                <Avatar sx={{ width: 50, height: 50, bgcolor: '#fff3e0', mx: 'auto', mb: 1 }}>
                                    <VideoLibraryIcon sx={{ color: '#FF9800' }} />
                                </Avatar>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{totalLectures}</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>إجمالي المحاضرات</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Grow in={true} timeout={800}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                                <Avatar sx={{ width: 50, height: 50, bgcolor: '#e8f5e9', mx: 'auto', mb: 1 }}>
                                    <DownloadIcon sx={{ color: '#4CAF50' }} />
                                </Avatar>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{lectures.length}</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>محاضرات المقرر الحالي</Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>

                {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3 }} onClose={() => setError('')}>{error}</Alert>}

                {courseOfferings.length > 0 ? (
                    <>
                        {/* Course Tabs */}
                        <Paper elevation={0} sx={{ mb: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                            <Tabs
                                value={selectedCourse}
                                onChange={(_, newValue) => setSelectedCourse(newValue)}
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{
                                    bgcolor: '#fff',
                                    '& .MuiTab-root': {
                                        fontFamily: 'Cairo',
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        py: 2,
                                        px: 3,
                                    },
                                    '& .Mui-selected': {
                                        color: '#f5576c !important',
                                    },
                                    '& .MuiTabs-indicator': {
                                        bgcolor: '#f5576c',
                                        height: 3,
                                    }
                                }}
                            >
                                {courseOfferings.map((course, index) => (
                                    <Tab
                                        key={course.id}
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <FolderIcon sx={{ fontSize: 20 }} />
                                                {course.subject_name}
                                                <Chip label={course.lectures.length} size="small" sx={{ ml: 1, height: 20, fontSize: '0.75rem' }} />
                                            </Box>
                                        }
                                    />
                                ))}
                            </Tabs>
                        </Paper>

                        {/* Lectures Grid */}
                        <Grid container spacing={3}>
                            {lectures.length > 0 ? (
                                lectures.map((lecture, idx) => (
                                    <Grid item xs={12} sm={6} md={4} key={lecture.id}>
                                        <Grow in={true} timeout={300 + idx * 100}>
                                            <Card sx={{
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                borderRadius: 4,
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                                transition: 'all 0.3s',
                                                border: `2px solid ${getFileTypeColor(lecture.file_type)}20`,
                                                '&:hover': {
                                                    transform: 'translateY(-5px)',
                                                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                                                }
                                            }}>
                                                {/* File Type Header */}
                                                <Box sx={{
                                                    p: 2,
                                                    background: `linear-gradient(135deg, ${getFileTypeColor(lecture.file_type)}15, ${getFileTypeColor(lecture.file_type)}05)`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2
                                                }}>
                                                    {getFileIcon(lecture.file_type)}
                                                    <Chip
                                                        label={getFileTypeLabel(lecture.file_type)}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: `${getFileTypeColor(lecture.file_type)}20`,
                                                            color: getFileTypeColor(lecture.file_type),
                                                            fontFamily: 'Cairo',
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                </Box>

                                                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744', mb: 1 }}>
                                                        {lecture.title}
                                                    </Typography>
                                                    {lecture.description && (
                                                        <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666', mb: 2, lineHeight: 1.6 }}>
                                                            {lecture.description}
                                                        </Typography>
                                                    )}
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#999' }}>
                                                        <CalendarTodayIcon sx={{ fontSize: 16 }} />
                                                        <Typography variant="caption" sx={{ fontFamily: 'Cairo' }}>
                                                            {new Date(lecture.uploaded_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </Typography>
                                                    </Box>
                                                </CardContent>

                                                <CardActions sx={{ p: 2, pt: 0 }}>
                                                    <Button
                                                        variant="contained"
                                                        fullWidth
                                                        startIcon={<DownloadIcon />}
                                                        href={lecture.file ? lecture.file.replace('http://backend:8000', window.location.protocol + '//' + window.location.hostname + ':8000') : '#'}
                                                        target="_blank"
                                                        sx={{
                                                            fontFamily: 'Cairo',
                                                            fontWeight: 'bold',
                                                            borderRadius: 3,
                                                            py: 1.5,
                                                            background: `linear-gradient(135deg, ${getFileTypeColor(lecture.file_type)}, ${getFileTypeColor(lecture.file_type)}CC)`,
                                                            '&:hover': {
                                                                background: getFileTypeColor(lecture.file_type),
                                                            }
                                                        }}
                                                    >
                                                        تحميل المحاضرة
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                        </Grow>
                                    </Grid>
                                ))
                            ) : (
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                                        <VideoLibraryIcon sx={{ fontSize: 80, color: '#ddd', mb: 2 }} />
                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                            لا توجد محاضرات لهذا المقرر حتى الآن
                                        </Typography>
                                    </Paper>
                                </Grid>
                            )}
                        </Grid>
                    </>
                ) : (
                    <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <VideoLibraryIcon sx={{ fontSize: 80, color: '#ddd', mb: 2 }} />
                        <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#666', mb: 1 }}>
                            لا توجد محاضرات متاحة حالياً
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#999' }}>
                            سيقوم الأساتذة برفع المحاضرات قريباً
                        </Typography>
                    </Paper>
                )}
            </Container>
        </Box>
    );
}
