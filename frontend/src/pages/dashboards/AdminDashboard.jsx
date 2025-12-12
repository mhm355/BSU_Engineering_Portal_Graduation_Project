import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, Paper, Typography, Card, CardContent, Button } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DomainIcon from '@mui/icons-material/Domain';
import GroupIcon from '@mui/icons-material/Group';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
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
                        مدير النظام
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                    <Card sx={{ height: '100%', bgcolor: '#e3f2fd' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <DomainIcon sx={{ fontSize: 50, color: '#1976d2', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الهيكل الأكاديمي</Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontFamily: 'Cairo' }}>أقسام، فرق، مواد</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Button variant="contained" size="small" sx={{ fontFamily: 'Cairo' }} onClick={() => navigate('/admin/departments')}>إدارة الأقسام</Button>
                                <Button variant="contained" size="small" sx={{ fontFamily: 'Cairo' }} onClick={() => navigate('/admin/years')}>إدارة السنوات</Button>
                                <Button variant="contained" size="small" sx={{ fontFamily: 'Cairo' }} onClick={() => navigate('/admin/levels')}>إدارة الفرق</Button>
                                <Button variant="contained" size="small" sx={{ fontFamily: 'Cairo' }} onClick={() => navigate('/admin/courses')}>إدارة المقررات</Button>
                                <Button variant="contained" size="small" sx={{ fontFamily: 'Cairo', bgcolor: '#673ab7' }} onClick={() => navigate('/admin/news')}>إدارة الأخبار</Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card sx={{ height: '100%', bgcolor: '#fff3e0' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <GroupIcon sx={{ fontSize: 50, color: '#f57c00', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>المستخدمين</Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontFamily: 'Cairo' }}>طلاب، أعضاء هيئة تدريس</Typography>
                            <Button variant="contained" color="warning" size="small" sx={{ fontFamily: 'Cairo' }} onClick={() => navigate('/admin/users')}>إدارة المستخدمين</Button>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card sx={{ height: '100%', bgcolor: '#e8f5e9' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <AdminPanelSettingsIcon sx={{ fontSize: 50, color: '#388e3c', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الصلاحيات</Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontFamily: 'Cairo' }}>تعيين أدوار</Typography>
                            <Button variant="contained" color="success" size="small" sx={{ fontFamily: 'Cairo' }} onClick={() => navigate('/admin/course-assignment')}>تعيين المواد للدكاترة</Button>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card sx={{ height: '100%', bgcolor: '#ffebee' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <DeleteIcon sx={{ fontSize: 50, color: '#d32f2f', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>طلبات الحذف</Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontFamily: 'Cairo' }}>الموافقة على الحذف</Typography>
                            <Button variant="contained" color="error" size="small" sx={{ fontFamily: 'Cairo' }} onClick={() => navigate('/admin/approvals')}>عرض الطلبات</Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}
