import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Departments() {
    const departments = [
        {
            id: 'civil',
            name: 'هندسة مدنية',
            description: 'يهتم بتصميم وتنفيذ المنشآت الخرسانية والمعدنية، والطرق، والكباري، وشبكات المياه والصرف الصحي.',
            image: 'https://via.placeholder.com/400x250?text=Civil+Engineering'
        },
        {
            id: 'arch',
            name: 'هندسة معمارية',
            description: 'يركز على التصميم المعماري للمباني، والتخطيط العمراني، والتصميم الداخلي، مع مراعاة الجوانب الجمالية والوظيفية.',
            image: 'https://via.placeholder.com/400x250?text=Architecture'
        },
        {
            id: 'electrical',
            name: 'هندسة كهربية',
            description: 'يشمل دراسة نظم القوى الكهربية، والآلات، والتحكم الآلي، والاتصالات، والإلكترونيات.',
            image: 'https://via.placeholder.com/400x250?text=Electrical+Engineering'
        }
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Typography variant="h3" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', textAlign: 'center', mb: 6 }}>
                الأقسام العلمية
            </Typography>

            <Grid container spacing={4}>
                {departments.map((dept) => (
                    <Grid item xs={12} md={4} key={dept.id}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
                            <CardMedia
                                component="img"
                                height="200"
                                image={dept.image}
                                alt={dept.name}
                            />
                            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                                <Typography variant="h5" component="h2" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                                    {dept.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Cairo', mb: 3 }}>
                                    {dept.description}
                                </Typography>
                                <Button
                                    component={Link}
                                    to={`/departments/${dept.id}`}
                                    variant="outlined"
                                    sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}
                                >
                                    عرض التفاصيل
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}
