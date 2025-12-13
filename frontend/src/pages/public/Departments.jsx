import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button, CircularProgress } from '@mui/material';
import axios from 'axios';
import SchoolIcon from '@mui/icons-material/School';

export default function Departments() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await axios.get('/api/academic/departments/');
            setDepartments(response.data);
        } catch (err) {
            console.error('Error fetching departments:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 2 }}>
                    الأقسام الأكاديمية
                </Typography>
                <Typography variant="h6" color="textSecondary" sx={{ fontFamily: 'Cairo' }}>
                    تضم كليتنا مجموعة من الأقسام المتميزة
                </Typography>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
            ) : (
                <Grid container spacing={4}>
                    {departments.map((dept) => (
                        <Grid item xs={12} md={6} key={dept.id}>
                            <Card sx={{ display: 'flex', height: '100%', transition: '0.3s', '&:hover': { boxShadow: 6 } }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <CardContent sx={{ flex: '1 0 auto' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <SchoolIcon sx={{ color: '#0A2342', fontSize: 30, ml: 1 }} />
                                            <Typography component="h5" variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                                {dept.name}
                                            </Typography>
                                        </Box>
                                        <Typography variant="subtitle1" color="text.secondary" component="div" sx={{ fontFamily: 'Cairo', mb: 2 }}>
                                            {dept.description || 'وصف القسم غير متاح حالياً.'}
                                        </Typography>
                                    </CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1, p: 2 }}>
                                        {/* Future: Add link to detailed department page if needed */}
                                        {/* <Button size="small" sx={{ fontFamily: 'Cairo' }}>المزيد من التفاصيل</Button> */}
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}
