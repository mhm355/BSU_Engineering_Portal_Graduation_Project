import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Paper, Card, CardContent, CardActions,
    Button, Alert, CircularProgress, Chip, Tabs, Tab
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import DescriptionIcon from '@mui/icons-material/Description';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import axios from 'axios';

export default function StudentMaterials() {
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
            // Get student's enrolled courses (based on their level)
            const response = await axios.get('/api/academic/lectures/', config);

            // Group lectures by course offering
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
        switch (fileType) {
            case 'PDF': return <PictureAsPdfIcon color="error" />;
            case 'SLIDES': return <SlideshowIcon color="warning" />;
            case 'VIDEO': return <VideoLibraryIcon color="primary" />;
            default: return <DescriptionIcon />;
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

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 4 }}>
                المحاضرات والمواد الدراسية
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo' }} onClose={() => setError('')}>{error}</Alert>}

            {courseOfferings.length > 0 ? (
                <>
                    {/* Course Tabs */}
                    <Paper sx={{ mb: 3 }}>
                        <Tabs
                            value={selectedCourse}
                            onChange={(_, newValue) => setSelectedCourse(newValue)}
                            variant="scrollable"
                            scrollButtons="auto"
                        >
                            {courseOfferings.map((course, index) => (
                                <Tab
                                    key={course.id}
                                    label={course.subject_name}
                                    sx={{ fontFamily: 'Cairo' }}
                                />
                            ))}
                        </Tabs>
                    </Paper>

                    {/* Lectures Grid */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                        {lectures.length > 0 ? (
                            lectures.map((lecture) => (
                                <Card
                                    key={lecture.id}
                                    sx={{
                                        width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.33% - 16px)' },
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                >
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            {getFileIcon(lecture.file_type)}
                                            <Chip
                                                label={getFileTypeLabel(lecture.file_type)}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </Box>
                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                            {lecture.title}
                                        </Typography>
                                        {lecture.description && (
                                            <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Cairo', mt: 1 }}>
                                                {lecture.description}
                                            </Typography>
                                        )}
                                        <Typography variant="caption" display="block" sx={{ mt: 1, fontFamily: 'Cairo', color: 'text.secondary' }}>
                                            تاريخ الرفع: {new Date(lecture.uploaded_at).toLocaleDateString('ar-EG')}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            startIcon={<DownloadIcon />}
                                            href={lecture.file}
                                            target="_blank"
                                            sx={{ fontFamily: 'Cairo' }}
                                        >
                                            تحميل
                                        </Button>
                                    </CardActions>
                                </Card>
                            ))
                        ) : (
                            <Paper sx={{ p: 3, textAlign: 'center', width: '100%' }}>
                                <Typography variant="body1" sx={{ fontFamily: 'Cairo' }}>
                                    لا توجد محاضرات لهذا المقرر حتى الآن.
                                </Typography>
                            </Paper>
                        )}
                    </Box>
                </>
            ) : (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <VideoLibraryIcon sx={{ fontSize: 60, color: '#999', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                        لا توجد محاضرات متاحة حالياً
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Cairo' }}>
                        سيقوم الأساتذة برفع المحاضرات قريباً
                    </Typography>
                </Paper>
            )}
        </Container>
    );
}
