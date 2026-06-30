import React from 'react';
import { Container, Typography, Paper, Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

export default function GraduateReports() {
    const navigate = useNavigate();

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/graduate-affairs/dashboard')} sx={{ mb: 2, fontFamily: 'Cairo' }}>
                عودة للوحة التحكم
            </Button>
            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                التقارير والإحصائيات
            </Typography>
            <Paper sx={{ p: 4, textAlign: 'center', mt: 4, borderRadius: 3 }}>
                <Typography sx={{ fontFamily: 'Cairo', color: '#666' }}>سيتم إضافة التقارير والإحصائيات هنا قريباً...</Typography>
            </Paper>
        </Container>
    );
}
