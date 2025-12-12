import React, { useState } from 'react';
import { Box, Container, Typography, Paper, TextField, Button, Avatar, Grid, Alert, CircularProgress } from '@mui/material';
import { useAuth } from "../context/AuthContext";
import axios from 'axios';

export default function UserProfile() {
    const { user, login } = useAuth();
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone_number: user?.phone_number || '',
        address: user?.address || '',
        password: '',
        confirm_password: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (formData.password && formData.password !== formData.confirm_password) {
            setError('كلمات المرور غير متطابقة');
            setLoading(false);
            return;
        }

        try {
            const dataToSend = { ...formData };
            if (!dataToSend.password) delete dataToSend.password;
            delete dataToSend.confirm_password;

            // Assuming we have an endpoint to update profile. 
            // UserViewSet supports update, but we need to check permissions.
            // Usually users can update their own profile via /api/auth/profile/ (if implemented) or /api/auth/users/{id}/
            // Let's check urls.py. /api/auth/profile/ maps to UserProfileView.

            const response = await axios.patch('http://localhost:8000/api/auth/profile/', dataToSend, { withCredentials: true });

            // Update context
            login(response.data);
            setSuccess('تم تحديث البيانات بنجاح');
            setFormData(prev => ({ ...prev, password: '', confirm_password: '' }));
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('فشل تحديث البيانات. تأكد من صحة المدخلات.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Avatar sx={{ width: 80, height: 80, bgcolor: '#0A2342', fontSize: 32, mr: 2 }}>
                        {user?.first_name?.[0]}
                    </Avatar>
                    <Box>
                        <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                            {user?.first_name} {user?.last_name}
                        </Typography>
                        <Typography color="textSecondary" sx={{ fontFamily: 'Cairo' }}>
                            {user?.role} | {user?.username}
                        </Typography>
                    </Box>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo' }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3, fontFamily: 'Cairo' }}>{success}</Alert>}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="الاسم الأول"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="الاسم الأخير"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="البريد الإلكتروني"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="رقم الهاتف"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="العنوان"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', mt: 2, mb: 2 }}>تغيير كلمة المرور</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="كلمة المرور الجديدة"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="تأكيد كلمة المرور"
                                name="confirm_password"
                                type="password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{ bgcolor: '#0A2342', fontFamily: 'Cairo', mt: 2 }}
                            >
                                {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
}
