import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, Paper, Typography, Card, CardContent, Button } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EditIcon from '@mui/icons-material/Edit';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useNavigate } from 'react-router-dom';

export default function DoctorDashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
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
            مرحباً، د. {user.first_name} {user.last_name}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" sx={{ fontFamily: 'Cairo' }}>
            عضو هيئة تدريس
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', bgcolor: '#e3f2fd' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <MenuBookIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
              <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>مقرراتي الدراسية</Typography>
              <Button variant="contained" sx={{ mt: 2, fontFamily: 'Cairo' }} onClick={() => navigate('/doctor/courses')}>إدارة المقررات</Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', bgcolor: '#fff3e0' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <EditIcon sx={{ fontSize: 60, color: '#f57c00', mb: 2 }} />
              <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>رصد الدرجات</Typography>
              <Button variant="contained" color="warning" sx={{ mt: 2, fontFamily: 'Cairo' }}>رصد الآن</Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', bgcolor: '#e8f5e9' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssessmentIcon sx={{ fontSize: 60, color: '#388e3c', mb: 2 }} />
              <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>تقارير الغياب</Typography>
              <Button variant="contained" color="success" sx={{ mt: 2, fontFamily: 'Cairo' }}>عرض التقارير</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
