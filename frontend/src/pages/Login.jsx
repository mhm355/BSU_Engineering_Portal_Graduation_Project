import React, { useState } from 'react';
import {
    Box, Container, Typography, Paper, TextField, Button, InputAdornment,
    IconButton, Alert, CircularProgress, Fade, Grow, Chip, Avatar
} from '@mui/material';
import { keyframes } from '@mui/system';
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

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,193,7,0.4); }
  50% { transform: scale(1.02); box-shadow: 0 0 30px 10px rgba(255,193,7,0.2); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const slideUp = keyframes`
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

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
            setError('فشل تسجيل الدخول. تأكد من اسم المستخدم وكلمة المرور.');
            console.error(err);
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
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #0A2342 0%, #1a3a5c 50%, #0A2342 100%)',
                backgroundSize: '200% 200%',
                animation: `${gradientMove} 15s ease infinite`,
                py: 4,
            }}
        >
            {/* Animated Background Elements */}
            <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,193,7,0.15) 0%, transparent 70%)', animation: `${float} 8s ease-in-out infinite` }} />
            <Box sx={{ position: 'absolute', bottom: -150, left: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)', animation: `${float} 10s ease-in-out infinite`, animationDelay: '2s' }} />
            <Box sx={{ position: 'absolute', top: '20%', left: '5%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,193,7,0.1) 0%, transparent 70%)', animation: `${float} 6s ease-in-out infinite`, animationDelay: '1s' }} />
            <Box sx={{ position: 'absolute', bottom: '20%', right: '10%', width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', animation: `${float} 7s ease-in-out infinite`, animationDelay: '3s' }} />

            {/* Grid Pattern Overlay */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
                    backgroundSize: '40px 40px',
                }}
            />

            {/* Rotating Security Ring */}
            <Box
                sx={{
                    position: 'absolute',
                    width: 600,
                    height: 600,
                    borderRadius: '50%',
                    border: '1px dashed rgba(255,193,7,0.15)',
                    animation: `${rotate} 60s linear infinite`,
                }}
            />

            <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
                {/* Home Button */}
                <Fade in={true} timeout={800}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                        <Button
                            component={Link}
                            to="/"
                            startIcon={<HomeIcon />}
                            sx={{
                                color: 'rgba(255,255,255,0.8)',
                                fontFamily: 'Cairo',
                                fontWeight: 'bold',
                                borderRadius: 3,
                                px: 3,
                                py: 1,
                                border: '1px solid rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(10px)',
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    borderColor: 'rgba(255,255,255,0.4)',
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
                            borderRadius: 5,
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Top Shimmer Bar */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: 5,
                                background: 'linear-gradient(90deg, transparent, #FFC107, #0A2342, #FFC107, transparent)',
                                backgroundSize: '200% 100%',
                                animation: `${shimmer} 3s linear infinite`,
                            }}
                        />

                        {/* Logo with Glow Effect */}
                        <Box
                            sx={{
                                position: 'relative',
                                display: 'inline-block',
                                mb: 3,
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    inset: -15,
                                    borderRadius: '50%',
                                    background: 'radial-gradient(circle, rgba(255,193,7,0.3), transparent 70%)',
                                    animation: `${pulse} 3s ease-in-out infinite`,
                                }
                            }}
                        >
                            <Avatar
                                src="/logo.jpg"
                                sx={{
                                    width: 100,
                                    height: 100,
                                    border: '4px solid #FFC107',
                                    boxShadow: '0 10px 40px rgba(255,193,7,0.3)',
                                    animation: `${float} 4s ease-in-out infinite`,
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
                                bgcolor: 'rgba(10,35,66,0.08)',
                                color: '#0A2342',
                                fontFamily: 'Cairo',
                                fontWeight: 'bold',
                            }}
                        />

                        <Typography
                            variant="h4"
                            sx={{
                                fontFamily: 'Cairo',
                                fontWeight: 'bold',
                                color: '#0A2342',
                                mb: 1,
                            }}
                        >
                            تسجيل الدخول
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                fontFamily: 'Cairo',
                                color: '#666',
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
                                        fontFamily: 'Cairo',
                                        borderRadius: 3,
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
                                                <PersonIcon sx={{ color: '#0A2342' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            fontFamily: 'Cairo',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#FFC107',
                                                }
                                            },
                                            '&.Mui-focused': {
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#0A2342',
                                                    borderWidth: 2,
                                                }
                                            }
                                        }
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
                                                <LockIcon sx={{ color: '#0A2342' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleClickShowPassword}
                                                    edge="end"
                                                    sx={{
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            bgcolor: 'rgba(255,193,7,0.1)',
                                                            color: '#0A2342',
                                                        }
                                                    }}
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            fontFamily: 'Cairo',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#FFC107',
                                                }
                                            },
                                            '&.Mui-focused': {
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#0A2342',
                                                    borderWidth: 2,
                                                }
                                            }
                                        }
                                    }}
                                />

                                {/* Login Button */}
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
                                        py: 2,
                                        fontSize: '1.1rem',
                                        borderRadius: 3,
                                        boxShadow: '0 10px 30px rgba(10,35,66,0.3)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            bgcolor: '#1a4a7a',
                                            transform: 'translateY(-3px)',
                                            boxShadow: '0 15px 40px rgba(10,35,66,0.4)',
                                        },
                                        '&:active': {
                                            transform: 'translateY(0)',
                                        },
                                        '&.Mui-disabled': {
                                            bgcolor: 'rgba(10,35,66,0.5)',
                                            color: '#fff',
                                        }
                                    }}
                                    startIcon={
                                        loading ? (
                                            <CircularProgress size={24} color="inherit" />
                                        ) : (
                                            <LoginIcon sx={{ ml: 1 }} />
                                        )
                                    }
                                >
                                    {loading ? 'جاري الدخول...' : 'دخول'}
                                </Button>
                            </Box>
                        </form>

                        {/* Footer Info */}
                        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #eee' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                <SchoolIcon sx={{ color: '#FFC107', fontSize: 20 }} />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontFamily: 'Cairo',
                                        color: '#999',
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
                                bgcolor: 'rgba(255,255,255,0.1)',
                                color: 'rgba(255,255,255,0.8)',
                                fontFamily: 'Cairo',
                                border: '1px solid rgba(255,255,255,0.2)',
                            }}
                        />
                        <Chip
                            label="2024-2025"
                            size="small"
                            sx={{
                                bgcolor: 'rgba(255,193,7,0.2)',
                                color: '#FFC107',
                                fontFamily: 'Cairo',
                                border: '1px solid rgba(255,193,7,0.3)',
                            }}
                        />
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
}
