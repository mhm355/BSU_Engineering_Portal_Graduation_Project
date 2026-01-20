import React, { useState } from 'react';
import { Box, Container, Typography, Paper, TextField, Button, InputAdornment, IconButton, Alert, CircularProgress } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockResetIcon from '@mui/icons-material/LockReset';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ChangePassword() {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Client-side validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('جميع الحقول مطلوبة');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('كلمة المرور الجديدة غير متطابقة');
            return;
        }

        if (newPassword.length < 6) {
            setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        // Check if new password is same as national_id
        if (user?.national_id && newPassword === user.national_id) {
            setError('كلمة المرور الجديدة لا يمكن أن تكون نفس الرقم القومي');
            return;
        }

        setLoading(true);

        try {
            await axios.post('/api/auth/change-password/', {
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword
            }, { withCredentials: true });

            // Update user context to remove first_login_required
            if (user) {
                login({ ...user, first_login_required: false });
            }

            // Redirect to appropriate dashboard
            const role = user?.role;
            if (role === 'STUDENT') navigate('/student/dashboard');
            else if (role === 'DOCTOR') navigate('/doctor/dashboard');
            else if (role === 'STAFF') navigate('/student-affairs/dashboard');
            else if (role === 'ADMIN') navigate('/admin/dashboard');
            else navigate('/');

        } catch (err) {
            const errorMsg = err.response?.data?.error || 'فشل تغيير كلمة المرور';
            setError(errorMsg);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 12 }}>
            <Paper elevation={6} sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
                <LockResetIcon sx={{ fontSize: 60, color: '#0A2342', mb: 2 }} />
                <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                    تغيير كلمة المرور
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ fontFamily: 'Cairo', mb: 4 }}>
                    يجب تغيير كلمة المرور الخاصة بك قبل المتابعة
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo' }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            fullWidth
                            label="كلمة المرور الحالية"
                            type={showCurrentPassword ? 'text' : 'password'}
                            variant="outlined"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            edge="end"
                                        >
                                            {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            label="كلمة المرور الجديدة"
                            type={showNewPassword ? 'text' : 'password'}
                            variant="outlined"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                            helperText="يجب أن تكون 6 أحرف على الأقل ومختلفة عن الرقم القومي"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            edge="end"
                                        >
                                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            label="تأكيد كلمة المرور الجديدة"
                            type={showConfirmPassword ? 'text' : 'password'}
                            variant="outlined"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            edge="end"
                                        >
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            fullWidth
                            disabled={loading}
                            sx={{
                                bgcolor: '#0A2342',
                                fontFamily: 'Cairo',
                                fontWeight: 'bold',
                                py: 1.5,
                                fontSize: '1.1rem',
                                '&:hover': { bgcolor: '#06152a' }
                            }}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LockResetIcon sx={{ ml: 1 }} />}
                        >
                            {loading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
}
