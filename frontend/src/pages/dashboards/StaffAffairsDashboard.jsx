import React from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    CardActionArea,
} from '@mui/material';
import {
    Person as DoctorIcon,
    People as PeopleIcon,
    Assignment as AssignmentIcon,
    School as SchoolIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const StaffAffairsDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const dashboardCards = [
        {
            title: 'رفع الدكاترة',
            description: 'رفع ملف Excel للدكاترة الجدد',
            icon: <DoctorIcon sx={{ fontSize: 60 }} />,
            color: '#1976d2',
            path: '/staff-affairs/upload-doctors',
        },
        {
            title: 'تعيين الدكاترة',
            description: 'تعيين دكتور لمادة معينة',
            icon: <AssignmentIcon sx={{ fontSize: 60 }} />,
            color: '#ed6c02',
            path: '/staff-affairs/assign-doctors',
        },
        {
            title: 'عرض الدكاترة',
            description: 'عرض قائمة الدكاترة المسجلين',
            icon: <PeopleIcon sx={{ fontSize: 60 }} />,
            color: '#9c27b0',
            path: '/staff-affairs/view-users',
        },
        {
            title: 'الهيكل الأكاديمي',
            description: 'عرض الأقسام والفرق والمواد',
            icon: <SchoolIcon sx={{ fontSize: 60 }} />,
            color: '#0288d1',
            path: '/staff-affairs/academic-structure',
        },
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper
                elevation={3}
                sx={{
                    p: 3,
                    mb: 4,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: 2,
                }}
            >
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontFamily: 'Cairo' }}>
                    مرحباً، {user.first_name || 'شئون العاملين'}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontFamily: 'Cairo' }}>
                    لوحة تحكم شئون العاملين - إدارة الدكاترة
                </Typography>
            </Paper>

            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 3,
                justifyContent: 'center'
            }}>
                {dashboardCards.map((card, index) => (
                    <Box
                        key={index}
                        sx={{
                            width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' },
                            minWidth: 220
                        }}
                    >
                        <Card
                            elevation={4}
                            sx={{
                                height: '100%',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 8,
                                },
                            }}
                        >
                            <CardActionArea
                                onClick={() => navigate(card.path)}
                                sx={{ height: '100%' }}
                            >
                                <CardContent
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        py: 4,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            color: card.color,
                                            mb: 2,
                                        }}
                                    >
                                        {card.icon}
                                    </Box>
                                    <Typography
                                        variant="h6"
                                        component="div"
                                        gutterBottom
                                        sx={{ fontWeight: 'bold', fontFamily: 'Cairo' }}
                                    >
                                        {card.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Cairo' }}>
                                        {card.description}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Box>
                ))}
            </Box>
        </Container>
    );
};

export default StaffAffairsDashboard;
