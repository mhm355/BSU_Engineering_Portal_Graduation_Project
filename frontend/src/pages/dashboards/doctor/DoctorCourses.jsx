import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Grid, Card, CardContent, CardActions, Button, Alert, CircularProgress, Chip } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GroupIcon from '@mui/icons-material/Group';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function DoctorCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            // Fetch doctor's assigned courses
            const response = await axios.get('/api/academic/course-offerings/my_courses/', config);
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
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                                        <MenuBookIcon color="primary" sx={{ mr: 1 }} />
                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', flex: 1 }}>
                                            {course.subject_name}
                                        </Typography>
                                    </Box>
                                    
                                    {/* Specialization badge for ECE/EPM */}
                                    {course.specialization_code && (
                                        <Chip 
                                            label={course.specialization_name}
                                            color={course.specialization_code === 'ECE' ? 'primary' : 'secondary'}
                                            size="small"
                                            sx={{ mb: 2, fontFamily: 'Cairo' }}
                                        />
                                    )}
                                    
                                    <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Cairo' }}>
                                        الكود: {course.subject_code}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Cairo' }}>
                                        القسم: {course.department_name}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Cairo' }}>
                                        الفرقة: {course.level_name}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Cairo' }}>
                                        الترم: {course.term}
                                    </Typography>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                        <GroupIcon color="action" sx={{ mr: 1 }} />
                                        <Typography variant="body2" sx={{ fontFamily: 'Cairo' }}>
                                            عدد الطلاب: {course.student_count}
                                        </Typography>
                                    </Box>
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
