import React, { useState } from 'react';
import {
    Box, Container, Typography, Paper, TextField, Button, InputAdornment,
    IconButton, Alert, CircularProgress, Fade, Grow, Chip, Avatar
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import SchoolIcon from '@mui/icons-material/School';
import SecurityIcon from '@mui/icons-material/Security';
import HomeIcon from '@mui/icons-material/Home';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('/api/auth/login/', {
                username,
                password
            }, { withCredentials: true });

            // Use context login
            login(response.data);

            // Check if first login - redirect to password change
            if (response.data.first_login_required) {
                navigate('/change-password');
                return;
            }

            // Redirect based on role
            const role = response.data.role;
            if (role === 'STUDENT') navigate('/student/dashboard');
            else if (role === 'DOCTOR') navigate('/doctor/dashboard');
            else if (role === 'STUDENT_AFFAIRS') navigate('/student-affairs/dashboard');
            else if (role === 'STAFF_AFFAIRS') navigate('/staff-affairs/dashboard');
            else if (role === 'STAFF') navigate('/student-affairs/dashboard'); // Legacy support
            else if (role === 'ADMIN') navigate('/admin/dashboard');
            else navigate('/');

        } catch (err) {
            console.error(err);
            setError('فشل تسجيل الدخول. تأكد من اسم المستخدم وكلمة المرور.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4,
                background: (theme) => theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #171923 0%, #232836 100%)'
                    : 'linear-gradient(135deg, #F5F7FA 0%, #E4E8EC 100%)',
            }}
        >
            <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
                {/* Home Button */}
                <Fade in={true} timeout={800}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                        <Button
                            component={Link}
                            to="/"
                            startIcon={<HomeIcon />}
                            sx={{
                                color: 'text.secondary',
                                fontWeight: 600,
                                borderRadius: 2,
                                px: 3,
                                py: 1,
                                border: (theme) => `1px solid ${theme.palette.divider}`,
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                    borderColor: 'primary.main',
                                }
                            }}
                        >
                            الصفحة الرئيسية
                        </Button>
                    </Box>
                </Fade>

                <Grow in={true} timeout={1000}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 4, md: 6 },
                            textAlign: 'center',
                            borderRadius: 4,
                            background: (theme) => theme.palette.background.paper,
                            border: (theme) => `1px solid ${theme.palette.divider}`,
                            boxShadow: (theme) => theme.shadows[2],
                            position: 'relative',
                        }}
                    >
                        {/* Logo */}
                        <Box sx={{ mb: 3 }}>
                            <Avatar
                                src="/logo.jpg"
                                sx={{
                                    width: 100,
                                    height: 100,
                                    mx: 'auto',
                                    border: (theme) => `4px solid ${theme.palette.primary.main}`,
                                    boxShadow: (theme) => `0 4px 20px ${theme.palette.primary.main}40`,
                                }}
                            />
                        </Box>

                        {/* Title Section */}
                        <Chip
                            icon={<SecurityIcon sx={{ fontSize: 16 }} />}
                            label="بوابة آمنة"
                            size="small"
                            sx={{
                                mb: 2,
                                bgcolor: (theme) => `${theme.palette.primary.main}15`,
                                color: 'primary.main',
                                fontWeight: 600,
                            }}
                        />

                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                color: 'text.primary',
                                mb: 1,
                            }}
                        >
                            تسجيل الدخول
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                color: 'text.secondary',
                                mb: 4,
                            }}
                        >
                            قم بتسجيل الدخول للوصول إلى لوحة التحكم
                        </Typography>

                        {/* Error Alert */}
                        {error && (
                            <Fade in={true}>
                                <Alert
                                    severity="error"
                                    sx={{
                                        mb: 3,
                                        borderRadius: 2,
                                        '& .MuiAlert-icon': { alignItems: 'center' }
                                    }}
                                >
                                    {error}
                                </Alert>
                            </Fade>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleLogin}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {/* Username Field */}
                                <TextField
                                    fullWidth
                                    label="اسم المستخدم / الرقم القومي"
                                    variant="outlined"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon sx={{ color: 'primary.main' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                {/* Password Field */}
                                <TextField
                                    fullWidth
                                    label="كلمة المرور"
                                    type={showPassword ? 'text' : 'password'}
                                    variant="outlined"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockIcon sx={{ color: 'primary.main' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleClickShowPassword}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                {/* Login Button */}
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    fullWidth
                                    disabled={loading}
                                    sx={{
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        borderRadius: 2,
                                    }}
                                    startIcon={
                                        loading ? (
                                            <CircularProgress size={24} color="inherit" />
                                        ) : (
                                            <LoginIcon />
                                        )
                                    }
                                >
                                    {loading ? 'جاري الدخول...' : 'دخول'}
                                </Button>
                            </Box>
                        </form>

                        {/* Footer Info */}
                        <Box sx={{ mt: 4, pt: 3, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                <SchoolIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'text.secondary',
                                    }}
                                >
                                    كلية الهندسة - جامعة بني سويف
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grow>

                {/* Bottom Decorative Element */}
                <Fade in={true} timeout={1500}>
                    <Box
                        sx={{
                            mt: 4,
                            textAlign: 'center',
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 2,
                        }}
                    >
                        <Chip
                            label="آمن ومشفر"
                            size="small"
                            icon={<LockIcon sx={{ fontSize: 14 }} />}
                            sx={{
                                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                color: 'text.secondary',
                                border: (theme) => `1px solid ${theme.palette.divider}`,
                            }}
                        />
                        <Chip
                            label="2024-2025"
                            size="small"
                            sx={{
                                bgcolor: (theme) => `${theme.palette.primary.main}15`,
                                color: 'primary.main',
                                border: (theme) => `1px solid ${theme.palette.primary.main}30`,
                            }}
                        />
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
}
