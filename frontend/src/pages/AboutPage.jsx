import React from 'react';
import { Container, Typography, Box, Paper, Grid, Card, CardContent, Divider, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LanguageIcon from '@mui/icons-material/Language';
import EngineeringIcon from '@mui/icons-material/Engineering';
import ConstructionIcon from '@mui/icons-material/Construction';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function AboutPage() {
    const departments = [
        { name: 'قسم الهندسة المدنية', englishName: 'Civil Engineering', color: '#1976d2', link: '/departments/civil', icon: ConstructionIcon },
        { name: 'قسم الهندسة المعمارية', englishName: 'Architecture', color: '#388e3c', link: '/departments/arch', icon: ArchitectureIcon },
        { name: 'قسم الهندسة الكهربية', englishName: 'Electrical Engineering', color: '#f57c00', link: '/departments/electrical', icon: ElectricalServicesIcon }
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Hero Section */}
            <Paper
                elevation={0}
                sx={{
                    p: 5,
                    mb: 4,
                    background: 'linear-gradient(135deg, #0A2342 0%, #1a4a7a 100%)',
                    color: 'white',
                    borderRadius: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'radial-gradient(circle at 20% 80%, rgba(255,193,7,0.1) 0%, transparent 50%)',
                    }
                }}
            >
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center', position: 'relative' }}>
                    نبذة عن الكلية
                </Typography>
                <Typography variant="h6" sx={{ fontFamily: 'Cairo', textAlign: 'center', opacity: 0.9 }}>
                    كلية الهندسة - جامعة بني سويف
                </Typography>
            </Paper>

            {/* History Section */}
            <Paper elevation={3} sx={{ p: 4, mb: 4, borderRight: '5px solid #FFC107', borderRadius: 3, background: 'linear-gradient(to left, #fafafa, white)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ bgcolor: '#FFC107', p: 1.5, borderRadius: 2, mr: 2 }}>
                        <HistoryEduIcon sx={{ fontSize: 35, color: '#0A2342' }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                        نشأة الكلية
                    </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontFamily: 'Cairo', lineHeight: 2.2, textAlign: 'justify', color: '#333' }}>
                    أنشئت كلية الهندسة ببني سويف بقرار جمهوري رقم 267 لسنة 2006 وبدأ العمل بالكلية سنة 2009 قسم الهندسة المدنية ثم قسم الهندسة المعمارية سنة 2012 لتخريج مهندسين متخصصين ذو مهارة عالية، ويكونوا قادرين على استيعاب التكنولوجيا الحديثة في المجالات الهندسية، والتعامل معها بكفاءة ومواكبة تطوراتها العالمية المستمرة.
                </Typography>
            </Paper>

            {/* Info Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Degrees */}
                <Grid item xs={12} md={6}>
                    <Card elevation={4} sx={{ height: '100%', borderTop: '5px solid #FFC107', borderRadius: 3, transition: 'transform 0.3s, box-shadow 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 8 } }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Box sx={{ bgcolor: '#e3f2fd', p: 1.5, borderRadius: 2, mr: 2 }}>
                                    <SchoolIcon sx={{ fontSize: 35, color: '#0A2342' }} />
                                </Box>
                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                                    الدرجات العلمية
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', mb: 3, lineHeight: 1.8, color: '#555' }}>
                                يمنح مجلس جامعة بني سويف بناءً على طلب مجلس كلية الهندسة، درجة البكالوريوس بنظام الفصلين الدراسيين في التخصصات الآتية:
                            </Typography>
                            <Box sx={{ pl: 2 }}>
                                <Box component={Link} to="/departments/civil" sx={{ display: 'block', textDecoration: 'none', color: '#1976d2', fontFamily: 'Cairo', mb: 1, py: 0.5, px: 1, borderRadius: 1, transition: 'background 0.2s', '&:hover': { bgcolor: '#e3f2fd' } }}>
                                    • الهندسة المدنية
                                </Box>
                                <Box component={Link} to="/departments/arch" sx={{ display: 'block', textDecoration: 'none', color: '#388e3c', fontFamily: 'Cairo', mb: 1, py: 0.5, px: 1, borderRadius: 1, transition: 'background 0.2s', '&:hover': { bgcolor: '#e8f5e9' } }}>
                                    • الهندسة المعمارية
                                </Box>
                                <Box component={Link} to="/departments/electrical" sx={{ display: 'block', textDecoration: 'none', color: '#f57c00', fontFamily: 'Cairo', mb: 1, py: 0.5, px: 1, borderRadius: 1, transition: 'background 0.2s', '&:hover': { bgcolor: '#fff3e0' } }}>
                                    • الهندسة الكهربية
                                </Box>
                                <Box sx={{ pl: 3, mt: 1 }}>
                                    <Typography variant="body2" sx={{ fontFamily: 'Cairo', mb: 0.5, color: '#666' }}>- هندسة الإلكترونيات والاتصالات الكهربائية</Typography>
                                    <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>- هندسة القوى والآلات الكهربائية</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Duration & Language */}
                <Grid item xs={12} md={6}>
                    <Card elevation={4} sx={{ height: '100%', borderTop: '5px solid #FFC107', borderRadius: 3, transition: 'transform 0.3s, box-shadow 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 8 } }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Box sx={{ bgcolor: '#e8f5e9', p: 1.5, borderRadius: 2, mr: 2 }}>
                                    <MenuBookIcon sx={{ fontSize: 35, color: '#0A2342' }} />
                                </Box>
                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                                    مدة الدراسة
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', mb: 3, lineHeight: 2, color: '#555' }}>
                                مدة الدراسة لنيل درجة البكالوريوس خمس سنوات تبدأ بسنة إعدادية عامة لجميع الطلاب ويكون التخصص بعد ذلك.
                            </Typography>

                            <Divider sx={{ my: 3 }} />

                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Box sx={{ bgcolor: '#fff3e0', p: 1.5, borderRadius: 2, mr: 2 }}>
                                    <LanguageIcon sx={{ fontSize: 35, color: '#0A2342' }} />
                                </Box>
                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                                    لغة الدراسة
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', lineHeight: 1.8, color: '#555' }}>
                                اللغة الإنجليزية
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Departments */}
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, background: 'linear-gradient(to bottom, #fafafa, white)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Box sx={{ bgcolor: '#0A2342', p: 1.5, borderRadius: 2, mr: 2 }}>
                        <EngineeringIcon sx={{ fontSize: 35, color: '#FFC107' }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                        الأقسام العلمية
                    </Typography>
                </Box>
                <Grid container spacing={3}>
                    {departments.map((dept, index) => (
                        <Grid item xs={12} sm={4} key={index}>
                            <Paper
                                component={Link}
                                to={dept.link}
                                elevation={3}
                                sx={{
                                    p: 3,
                                    textAlign: 'center',
                                    textDecoration: 'none',
                                    display: 'block',
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: 10,
                                        '& .dept-icon': { transform: 'scale(1.2)' }
                                    }
                                }}
                            >
                                <Box sx={{ bgcolor: dept.color, py: 3, mb: 2, mx: -3, mt: -3 }}>
                                    <dept.icon className="dept-icon" sx={{ fontSize: 50, color: 'white', transition: 'transform 0.3s' }} />
                                </Box>
                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 0.5 }}>
                                    {dept.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#888' }}>
                                    {dept.englishName}
                                </Typography>
                                <Button
                                    endIcon={<ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />}
                                    sx={{
                                        mt: 2,
                                        fontFamily: 'Cairo',
                                        color: dept.color,
                                        '&:hover': { bgcolor: `${dept.color}15` }
                                    }}
                                >
                                    المزيد
                                </Button>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Paper>
        </Container>
    );
}
