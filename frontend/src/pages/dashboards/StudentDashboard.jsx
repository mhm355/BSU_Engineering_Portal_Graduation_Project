import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, Paper, Typography, Card, CardContent, Button } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    if (!user) return null;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <img src={user.profile_picture || "https://via.placeholder.com/100"} alt="Profile" style={{ width: 80, height: 80, borderRadius: '50%' }} />
                <Box>
                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                        مرحباً، {user.first_name} {user.last_name}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary" sx={{ fontFamily: 'Cairo' }}>
                        {user.role === 'STUDENT' ? 'طالب' : user.role}
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {/* Quick Actions */}
                <Grid item xs={12} md={3}>
                    <Card sx={{ height: '100%', bgcolor: '#e3f2fd' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <SchoolIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>نتائج الامتحانات</Typography>
                            <Button variant="contained" sx={{ mt: 2, fontFamily: 'Cairo' }} onClick={() => navigate('/student/grades')}>عرض النتائج</Button>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card sx={{ height: '100%', bgcolor: '#fff3e0' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <AssignmentIcon sx={{ fontSize: 60, color: '#f57c00', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>المواد الدراسية</Typography>
                            <Button variant="contained" color="warning" sx={{ mt: 2, fontFamily: 'Cairo' }} onClick={() => navigate('/student/materials')}>عرض المواد</Button>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card sx={{ height: '100%', bgcolor: '#e8f5e9' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <EventIcon sx={{ fontSize: 60, color: '#388e3c', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>جدول الامتحانات</Typography>
                            <Button variant="contained" color="success" sx={{ mt: 2, fontFamily: 'Cairo' }} onClick={() => navigate('/student/exams')}>عرض الجدول</Button>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card sx={{ height: '100%', bgcolor: '#ffebee' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <EventIcon sx={{ fontSize: 60, color: '#d32f2f', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الغياب</Typography>
                            <Button variant="contained" color="error" sx={{ mt: 2, fontFamily: 'Cairo' }} onClick={() => navigate('/student/attendance')}>عرض الغياب</Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Activity / Notifications */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                            آخر الإشعارات
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: 'Cairo' }}>
                            لا توجد إشعارات جديدة حالياً.
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}
