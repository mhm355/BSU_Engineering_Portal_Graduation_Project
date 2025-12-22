import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, Paper, Typography, Card, CardContent, Button, Badge } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DomainIcon from '@mui/icons-material/Domain';
import GroupIcon from '@mui/icons-material/Group';
import DeleteIcon from '@mui/icons-material/Delete';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GradingIcon from '@mui/icons-material/Grading';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [pendingCount, setPendingCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            // Fetch pending count
            axios.get('/api/academic/approval/count/', { withCredentials: true })
                .then(res => setPendingCount(res.data.pending_count || 0))
                .catch(() => { });
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
                {/* Academic Years - NEW */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', bgcolor: '#e8f5e9' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <CalendarMonthIcon sx={{ fontSize: 50, color: '#388e3c', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الأعوام الدراسية</Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontFamily: 'Cairo' }}>إنشاء وإدارة الأعوام الدراسية</Typography>
                            <Button variant="contained" color="success" size="small" sx={{ fontFamily: 'Cairo' }} onClick={() => navigate('/admin/academic-years')}>إدارة الأعوام</Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Grading Templates - NEW */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', bgcolor: '#f3e5f5' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <GradingIcon sx={{ fontSize: 50, color: '#7b1fa2', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>قوالب التقييم</Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontFamily: 'Cairo' }}>تعريف توزيع الدرجات</Typography>
                            <Button variant="contained" color="secondary" size="small" sx={{ fontFamily: 'Cairo' }} onClick={() => navigate('/admin/grading-templates')}>إدارة القوالب</Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Academic Structure */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', bgcolor: '#e3f2fd' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <DomainIcon sx={{ fontSize: 50, color: '#1976d2', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الهيكل الأكاديمي</Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontFamily: 'Cairo' }}>أقسام ← سنوات ← فرق ← طلاب</Typography>
                            <Button variant="contained" size="small" sx={{ fontFamily: 'Cairo' }} onClick={() => navigate('/admin/academic-structure')}>استعراض الهيكل</Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Users */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', bgcolor: '#fff3e0' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <GroupIcon sx={{ fontSize: 50, color: '#f57c00', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>المستخدمين</Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontFamily: 'Cairo' }}>شئون طلاب | شئون عاملين | دكاترة</Typography>
                            <Button variant="contained" color="warning" size="small" sx={{ fontFamily: 'Cairo' }} onClick={() => navigate('/admin/users')}>إدارة المستخدمين</Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Pending Approvals */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', bgcolor: '#fff8e1' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Badge badgeContent={pendingCount} color="error" max={99}>
                                <PendingActionsIcon sx={{ fontSize: 50, color: '#ff9800', mb: 2 }} />
                            </Badge>
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الموافقات المعلقة</Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontFamily: 'Cairo' }}>موافقة على الدرجات</Typography>
                            <Button variant="contained" color="warning" size="small" sx={{ fontFamily: 'Cairo' }} onClick={() => navigate('/admin/pending-approvals')}>عرض الطلبات</Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Delete Requests */}
                <Grid item xs={12} md={4}>
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
