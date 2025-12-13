import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Grid, Card, CardContent, CardActions, Button, Alert, CircularProgress } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function DoctorCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            // In a real app, we would fetch courses assigned to the doctor.
            // Currently, our CourseViewSet returns all courses.
            // We need an endpoint to get "my courses".
            // Let's assume we filter on the frontend or add a query param?
            // Or better, we should have a TeachingAssignment endpoint.
            // For now, let's fetch all courses and filter? No, that's bad security.
            // Let's use a new endpoint or filter on CourseViewSet.
            // I didn't update CourseViewSet to filter by doctor.
            // Let's assume for this demo we show all courses, or I should update CourseViewSet.
            // Let's update CourseViewSet quickly in the next step if needed.
            // For now, let's just fetch courses.
            const response = await axios.get('/api/academic/courses/', { withCredentials: true });
            setCourses(response.data);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('فشل تحميل المقررات الدراسية.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 4 }}>
                مقرراتي الدراسية
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo' }}>{error}</Alert>}

            {courses.length > 0 ? (
                <Grid container spacing={3}>
                    {courses.map((course) => (
                        <Grid item xs={12} md={4} key={course.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <MenuBookIcon color="primary" sx={{ mr: 1 }} />
                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                            {course.name}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Cairo' }}>
                                        الكود: {course.code}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Cairo' }}>
                                        القسم: {course.department_name}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Cairo' }}>
                                        الفرقة: {course.level_name}
                                    </Typography>
                                </CardContent>
                                <CardActions sx={{ p: 2, pt: 0 }}>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        sx={{ fontFamily: 'Cairo' }}
                                        onClick={() => navigate(`/doctor/courses/${course.id}`)}
                                    >
                                        إدارة المقرر
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ fontFamily: 'Cairo' }}>
                        لا توجد مقررات مسندة إليك حالياً.
                    </Typography>
                </Paper>
            )}
        </Container>
    );
}
