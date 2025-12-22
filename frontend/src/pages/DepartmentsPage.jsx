import React from 'react';
import { Container, Typography, Box, Paper, Grid, Card, CardContent, CardActionArea, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import EngineeringIcon from '@mui/icons-material/Engineering';
import ConstructionIcon from '@mui/icons-material/Construction';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';

export default function DepartmentsPage() {
    const departments = [
        {
            name: 'قسم الهندسة المدنية',
            nameEn: 'Civil Engineering',
            link: '/departments/civil',
            icon: <ConstructionIcon sx={{ fontSize: 60, color: 'white' }} />,
            color: '#1976d2',
            description: 'يهدف إلى تحقيق التميز والريادة في التعليم الهندسي في مجال الهندسة المدنية محلياً وإقليمياً ودولياً'
        },
        {
            name: 'قسم الهندسة المعمارية',
            nameEn: 'Architecture',
            link: '/departments/arch',
            icon: <ArchitectureIcon sx={{ fontSize: 60, color: 'white' }} />,
            color: '#388e3c',
            description: 'يهدف إلى توفير مستوى تعليمي راق للخريجين من خلال برامج تعليمية وتدريبية وبحثية ذات صلة بالمجتمع'
        },
        {
            name: 'قسم الهندسة الكهربية',
            nameEn: 'Electrical Engineering',
            link: '/departments/electrical',
            icon: <ElectricalServicesIcon sx={{ fontSize: 60, color: 'white' }} />,
            color: '#f57c00',
            description: 'يركز على تخريج مهندسين ذوي كفاءة عالية في هندسة الإلكترونيات والاتصالات وهندسة القوى والآلات الكهربية',
            programs: ['هندسة الإلكترونيات والاتصالات', 'هندسة القوى والآلات الكهربية']
        }
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Hero Section */}
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    mb: 4,
                    background: 'linear-gradient(135deg, #0A2342 0%, #1a4a7a 100%)',
                    color: 'white',
                    borderRadius: 3
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <EngineeringIcon sx={{ fontSize: 50, mr: 2 }} />
                    <Typography variant="h3" component="h1" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                        الأقسام العلمية
                    </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontFamily: 'Cairo', textAlign: 'center', opacity: 0.9 }}>
                    كلية الهندسة - جامعة بني سويف
                </Typography>
            </Paper>

            {/* Departments Grid */}
            <Grid container spacing={4}>
                {departments.map((dept, index) => (
                    <Grid item xs={12} md={4} key={index}>
                        <Card
                            elevation={4}
                            sx={{
                                height: '100%',
                                transition: 'transform 0.3s, box-shadow 0.3s',
                                '&:hover': { transform: 'translateY(-8px)', boxShadow: 10 }
                            }}
                        >
                            <CardActionArea
                                component={Link}
                                to={dept.link}
                                sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                            >
                                <Box sx={{
                                    bgcolor: dept.color,
                                    p: 4,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                }}>
                                    {dept.icon}
                                    <Typography variant="h6" sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold', mt: 2, textAlign: 'center' }}>
                                        {dept.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'Cairo' }}>
                                        {dept.nameEn}
                                    </Typography>
                                </Box>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="body2" sx={{ fontFamily: 'Cairo', lineHeight: 1.8, textAlign: 'justify', mb: 2 }}>
                                        {dept.description}
                                    </Typography>
                                    {dept.programs && (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {dept.programs.map((program, idx) => (
                                                <Chip
                                                    key={idx}
                                                    label={program}
                                                    size="small"
                                                    sx={{ fontFamily: 'Cairo', fontSize: '0.75rem', bgcolor: '#e3f2fd' }}
                                                />
                                            ))}
                                        </Box>
                                    )}
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Info Box */}
            <Paper elevation={2} sx={{ p: 4, mt: 4, borderRight: '4px solid #FFC107' }}>
                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 2 }}>
                    نظام الدراسة
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'Cairo', lineHeight: 1.8 }}>
                    مدة الدراسة لنيل درجة البكالوريوس خمس سنوات تبدأ بسنة إعدادية عامة لجميع الطلاب ويكون التخصص بعد ذلك.
                    يتم تطبيق الدراسة بنظام الفصلين الدراسيين، ولغة الدراسة هي اللغة الإنجليزية.
                </Typography>
            </Paper>
        </Container>
    );
}
