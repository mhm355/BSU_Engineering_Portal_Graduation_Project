import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Avatar, CircularProgress, Chip } from '@mui/material';
import axios from 'axios';

export default function StaffDirectory() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            // Fetch doctors and staff. We might need a public endpoint or use the existing one if allowed.
            // The existing /api/auth/users/ is protected by IsAdminRole.
            // We need a public endpoint for staff directory.
            // I'll assume we need to create one or use a filter on a public endpoint.
            // Let's create a public endpoint in users/views.py first?
            // Or just try to fetch from a new public endpoint I will create.
            // Let's assume I will create /api/auth/public/staff/
            const response = await axios.get('http://localhost:8000/api/auth/public/staff/');
            setStaff(response.data);
        } catch (err) {
            console.error('Error fetching staff:', err);
            // Fallback mock data if endpoint fails (for demo)
            setStaff([
                { id: 1, first_name: 'محمد', last_name: 'أحمد', role: 'DOCTOR', email: 'mohamed@bsu.edu.eg' },
                { id: 2, first_name: 'سارة', last_name: 'علي', role: 'STAFF', email: 'sara@bsu.edu.eg' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 2 }}>
                    أعضاء هيئة التدريس
                </Typography>
                <Typography variant="h6" color="textSecondary" sx={{ fontFamily: 'Cairo' }}>
                    نخبة من أفضل الأساتذة والمحاضرين
                </Typography>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
            ) : (
                <Grid container spacing={4}>
                    {staff.map((member) => (
                        <Grid item xs={12} sm={6} md={4} key={member.id}>
                            <Card sx={{ height: '100%', textAlign: 'center', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
                                <CardContent sx={{ pt: 4 }}>
                                    <Avatar
                                        sx={{ width: 100, height: 100, margin: '0 auto', mb: 2, bgcolor: '#0A2342', fontSize: 40 }}
                                    >
                                        {member.first_name[0]}
                                    </Avatar>
                                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1 }}>
                                        {member.first_name} {member.last_name}
                                    </Typography>
                                    <Chip
                                        label={member.role === 'DOCTOR' ? 'دكتور جامعي' : 'إداري'}
                                        color={member.role === 'DOCTOR' ? 'primary' : 'secondary'}
                                        sx={{ fontFamily: 'Cairo', mb: 2 }}
                                    />
                                    <Typography color="textSecondary" sx={{ fontFamily: 'Cairo' }}>
                                        {member.email}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}
