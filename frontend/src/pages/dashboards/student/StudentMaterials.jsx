import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Grid, Card, CardContent, CardActions, Button, Alert, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';

export default function StudentMaterials() {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const response = await axios.get('/api/academic/materials/', { withCredentials: true });
            setMaterials(response.data);
        } catch (err) {
            console.error('Error fetching materials:', err);
            setError('فشل تحميل المواد الدراسية. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 4 }}>
                المواد الدراسية
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo' }}>{error}</Alert>}

            {materials.length > 0 ? (
                <Grid container spacing={3}>
                    {materials.map((material) => (
                        <Grid item xs={12} md={4} key={material.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                        {material.title}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Cairo' }}>
                                        {material.course_name}
                                    </Typography>
                                    <Typography variant="caption" display="block" sx={{ mt: 1, fontFamily: 'Cairo' }}>
                                        تاريخ الرفع: {new Date(material.uploaded_at).toLocaleDateString('ar-EG')}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        size="small"
                                        startIcon={<DownloadIcon />}
                                        href={material.file}
                                        target="_blank"
                                        sx={{ fontFamily: 'Cairo' }}
                                    >
                                        تحميل
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ fontFamily: 'Cairo' }}>
                        لا توجد مواد دراسية متاحة حالياً.
                    </Typography>
                </Paper>
            )}
        </Container>
    );
}
