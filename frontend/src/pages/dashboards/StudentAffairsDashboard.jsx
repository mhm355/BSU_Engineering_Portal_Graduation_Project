import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button, Alert } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import { useNavigate } from 'react-router-dom';

export default function StudentAffairsDashboard() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            if (parsedUser.role !== 'STAFF') { // Assuming role is still STAFF in backend for now, or we should update it?
                // Let's keep role as STAFF in backend for simplicity, but display "Student Affairs"
                navigate('/');
            }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    if (!user) return null;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                    مرحباً، {user.first_name} {user.last_name}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary" sx={{ fontFamily: 'Cairo' }}>
                    لوحة تحكم شؤون الطلاب
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', bgcolor: '#e3f2fd' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <PeopleIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الهيكل الأكاديمي</Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontFamily: 'Cairo' }}>تصفح الطلاب حسب القسم والفرقة</Typography>
                            <Button variant="contained" sx={{ mt: 2, fontFamily: 'Cairo' }} onClick={() => navigate('/student-affairs/hierarchy')}>تصفح</Button>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', bgcolor: '#fff3e0' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <UploadFileIcon sx={{ fontSize: 60, color: '#f57c00', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>رفع بيانات الطلاب</Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontFamily: 'Cairo' }}>رفع ملفات Excel/CSV</Typography>
                            <Button variant="contained" color="warning" sx={{ mt: 2, fontFamily: 'Cairo' }} onClick={() => navigate('/student-affairs/upload-students')}>رفع ملف</Button>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', bgcolor: '#e8f5e9' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <CardMembershipIcon sx={{ fontSize: 60, color: '#388e3c', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الشهادات</Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontFamily: 'Cairo' }}>رفع وإدارة شهادات التخرج</Typography>
                            <Button variant="contained" color="success" sx={{ mt: 2, fontFamily: 'Cairo' }} onClick={() => navigate('/student-affairs/certificates')}>إدارة الشهادات</Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}
