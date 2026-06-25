import React, { useState, useRef } from 'react';
import { Box, Container, Typography, Paper, TextField, Button, Avatar, Grid, Alert, CircularProgress, IconButton } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useAuth } from "../context/AuthContext";
import axios from 'axios';

export default function UserProfile() {
    const { user, login } = useAuth();
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone_number: user?.phone_number || '',
        address: user?.address || '',
        password: '',
        confirm_password: ''
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(user?.profile_picture || null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت');
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                setError('صيغة الملف غير مدعومة. يرجى رفع صورة JPG أو PNG');
                return;
            }
            setProfilePicture(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current.click();
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
            const dataToSend = new FormData();
            
            Object.keys(formData).forEach(key => {
                if (key !== 'confirm_password' && key !== 'password') {
                    dataToSend.append(key, formData[key]);
                }
            });
            
            if (formData.password) {
                dataToSend.append('password', formData.password);
            }
            
            if (profilePicture) {
                dataToSend.append('profile_picture', profilePicture);
            }

            const response = await axios.patch('/api/auth/profile/', dataToSend, { 
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

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
                    <Box sx={{ position: 'relative', mr: 2 }}>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg"
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <Avatar 
                            src={previewUrl}
                            sx={{ 
                                width: 80, 
                                height: 80, 
                                bgcolor: '#4F46E5', 
                                fontSize: 32,
                                border: '3px solid #e0e7ff',
                                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                                cursor: 'pointer'
                            }}
                            onClick={handleAvatarClick}
                        >
                            {user?.first_name?.[0]}{user?.last_name?.[0]}
                        </Avatar>
                        <IconButton
                            onClick={handleAvatarClick}
                            sx={{
                                position: 'absolute',
                                bottom: -4,
                                right: -4,
                                bgcolor: '#fff',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                '&:hover': { bgcolor: '#f8fafc' },
                                width: 32,
                                height: 32
                            }}
                        >
                            <PhotoCamera sx={{ fontSize: 18, color: '#4F46E5' }} />
                        </IconButton>
                    </Box>
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
                                sx={{ bgcolor: '#4F46E5', fontFamily: 'Cairo', mt: 2 }}
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
