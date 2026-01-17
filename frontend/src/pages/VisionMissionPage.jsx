import React from 'react';
import { Container, Typography, Box, Paper, Grid, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import FlagIcon from '@mui/icons-material/Flag';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function VisionMissionPage() {
    const strategicObjectives = [
        'دعم منظومة التعليم وإعداد خريج قادر على المنافسة في سوق العمل.',
        'دعم منظومة البحث العلمي والارتقاء بالوضع التنافسي للمؤسسة.',
        'تعزيز التعاون مع الخريجين والمؤسسات الخارجية والارتقاء بالمجتمع.',
        'تنمية الموارد المالية للكلية.',
        'تنمية وتطوير مهارات وكفاءة الموارد البشرية.',
        'دعم وتطوير نظم ضمان جودة التعليم وتحقيق التحسين المستمر.'
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
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center' }}>
                    الرؤية والرسالة
                </Typography>
                <Typography variant="h6" sx={{ fontFamily: 'Cairo', textAlign: 'center', opacity: 0.9 }}>
                    كلية الهندسة - جامعة بني سويف
                </Typography>
            </Paper>

            <Grid container spacing={4}>
                {/* Vision */}
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 4,
                            height: '100%',
                            borderTop: '5px solid #FFC107',
                            borderRadius: 2,
                            transition: 'box-shadow 0.3s',
                            '&:hover': { boxShadow: 8 }
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <VisibilityIcon sx={{ fontSize: 50, color: '#0A2342', mr: 2 }} />
                            <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                                رؤية الكلية
                            </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontFamily: 'Cairo', lineHeight: 2.2, textAlign: 'justify' }}>
                            أن تكون واحدة من الكليات المشهود لها بالريادة محلياً وإقليمياً في التعليم الهندسي والبحث العلمي من خلال تخصصات وبرامج أكاديمية تلبي احتياجات المجتمع وتساهم في التنمية المستدامة طبقاً للمعايير الدولية.
                        </Typography>
                    </Paper>
                </Grid>

                {/* Mission */}
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 4,
                            height: '100%',
                            borderTop: '5px solid #FFC107',
                            borderRadius: 2,
                            transition: 'box-shadow 0.3s',
                            '&:hover': { boxShadow: 8 }
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <TrackChangesIcon sx={{ fontSize: 50, color: '#0A2342', mr: 2 }} />
                            <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                                رسالة الكلية
                            </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontFamily: 'Cairo', lineHeight: 2.2, textAlign: 'justify' }}>
                            تخريج مهندسين مؤهلين لتلبية احتياجات سوق العمل في القطاعات الهندسية والتكنولوجية والجهات الخدمية والمشروعات الوطنية من خلال برامج تعليمية تتوافق مع المعايير القومية الأكاديمية، وتمكنهم من إجراء أبحاث علمية وتطبيقية وذلك بتهيئة الظروف المناسبة لأعضاء هيئة التدريس ومعاونيهم والطلاب، وتوفير برامج تعليمية متقدمة في مرحلتي البكالوريوس والدراسات العليا.
                        </Typography>
                    </Paper>
                </Grid>

                {/* Strategic Objectives */}
                <Grid item xs={12}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 4,
                            borderTop: '5px solid #0A2342',
                            borderRadius: 2
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <FlagIcon sx={{ fontSize: 50, color: '#FFC107', mr: 2 }} />
                            <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                                الأهداف الاستراتيجية
                            </Typography>
                        </Box>
                        <List>
                            {strategicObjectives.map((objective, index) => (
                                <ListItem key={index} sx={{ py: 1 }}>
                                    <ListItemIcon>
                                        <CheckCircleIcon sx={{ color: '#4caf50' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={objective}
                                        primaryTypographyProps={{
                                            fontFamily: 'Cairo',
                                            fontSize: '1.1rem',
                                            lineHeight: 1.8
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}
