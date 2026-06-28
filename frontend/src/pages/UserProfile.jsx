import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Paper, TextField, Button, Avatar, Grid, Alert, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from "../context/AuthContext";
import axios from 'axios';

export default function UserProfile() {
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const fileInputRef = useRef(null);
    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const [resetReason, setResetReason] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(user?.profile_picture || null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const isAdmin = user?.role === 'ADMIN';

    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone_number: user?.phone_number || '',
        address: user?.address || '',
        username: user?.username || '',
        password: ''
    });

    React.useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone_number: user.phone_number || '',
                address: user.address || '',
                username: user.username || '',
                password: ''
            });
        }
    }, [user]);

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

        try {
            const dataToSend = new FormData();
            
            if (profilePicture) {
                dataToSend.append('profile_picture', profilePicture);
            }

            let hasChanges = !!profilePicture;

            if (isAdmin) {
                // Check if any text field changed
                if (
                    formData.first_name !== user?.first_name ||
                    formData.last_name !== user?.last_name ||
                    formData.email !== user?.email ||
                    formData.phone_number !== user?.phone_number ||
                    formData.address !== user?.address ||
                    formData.username !== user?.username ||
                    (formData.password && formData.password.trim() !== '')
                ) {
                    hasChanges = true;
                    dataToSend.append('first_name', formData.first_name);
                    dataToSend.append('last_name', formData.last_name);
                    dataToSend.append('email', formData.email);
                    dataToSend.append('phone_number', formData.phone_number);
                    dataToSend.append('address', formData.address);
                    
                    if (formData.username !== user?.username) {
                        dataToSend.append('username', formData.username);
                    }
                    if (formData.password && formData.password.trim() !== '') {
                        dataToSend.append('password', formData.password);
                    }
                }
            }

            if (!hasChanges) {
                setSuccess('لم يتم إجراء أي تغييرات');
                setLoading(false);
                return;
            }

            const response = await axios.patch('/api/auth/profile/', dataToSend, { 
                withCredentials: true
            });

            // Update context
            login(response.data);
            setSuccess('تم تحديث البيانات بنجاح');
            setProfilePicture(null);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('فشل تحديث البيانات. تأكد من صحة المدخلات.');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestReset = async () => {
        setResetLoading(true);
        setError('');
        setSuccess('');
        try {
            await axios.post('/api/auth/password-reset/request/', { reason: resetReason }, { withCredentials: true });
            setSuccess('تم إرسال طلب إعادة تعيين كلمة المرور إلى الإدارة بنجاح. سيتم مراجعة طلبك وإعادة تعيين كلمة المرور إلى الرقم القومي الخاص بك.');
            setResetDialogOpen(false);
            setResetReason('');
        } catch (err) {
            setError(err.response?.data?.error || 'حدث خطأ أثناء إرسال الطلب');
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{
                    mb: 2,
                    fontFamily: 'Cairo',
                    fontWeight: 'bold',
                    color: '#4F46E5',
                    '&:hover': {
                        bgcolor: 'rgba(79, 70, 229, 0.08)',
                    },
                }}
            >
                رجوع
            </Button>
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
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                disabled={!isAdmin}
                                InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="الاسم الأخير"
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                disabled={!isAdmin}
                                InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="البريد الإلكتروني"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                disabled={!isAdmin}
                                InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="رقم الهاتف"
                                value={formData.phone_number}
                                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                disabled={!isAdmin}
                                InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="العنوان"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                disabled={!isAdmin}
                                InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                            />
                        </Grid>
                        
                        {isAdmin && (
                            <>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="اسم المستخدم"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="كلمة المرور الجديدة (اختياري)"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                                    />
                                </Grid>
                            </>
                        )}

                        <Grid item xs={12} sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{ bgcolor: '#4F46E5', fontFamily: 'Cairo' }}
                            >
                                {loading ? 'جاري الحفظ...' : (isAdmin ? 'حفظ التغييرات' : 'حفظ الصورة الجديدة')}
                            </Button>

                            {!isAdmin && (
                                <Button
                                    variant="outlined"
                                    color="warning"
                                    size="large"
                                    onClick={() => setResetDialogOpen(true)}
                                    sx={{ fontFamily: 'Cairo' }}
                                >
                                    طلب إعادة تعيين كلمة المرور
                                </Button>
                            )}
                        </Grid>
                    </Grid>
                </form>

                {/* Password Reset Dialog */}
                <Dialog open={resetDialogOpen} onClose={() => !resetLoading && setResetDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>طلب إعادة تعيين كلمة المرور</DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ fontFamily: 'Cairo', mb: 2 }}>
                            سيتم إرسال طلب إلى الإدارة لإعادة تعيين كلمة المرور الخاصة بك. في حال الموافقة، سيتم إعادة تعيين كلمة المرور إلى رقمك القومي.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="السبب (اختياري)"
                            type="text"
                            fullWidth
                            multiline
                            rows={3}
                            value={resetReason}
                            onChange={(e) => setResetReason(e.target.value)}
                            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setResetDialogOpen(false)} disabled={resetLoading} sx={{ fontFamily: 'Cairo' }}>إلغاء</Button>
                        <Button 
                            onClick={handleRequestReset} 
                            variant="contained" 
                            color="primary"
                            disabled={resetLoading}
                            sx={{ fontFamily: 'Cairo' }}
                            startIcon={resetLoading ? <CircularProgress size={20} color="inherit" /> : null}
                        >
                            إرسال الطلب
                        </Button>
                    </DialogActions>
                </Dialog>
            </Paper>
        </Container>
    );
}
