import React, { useState } from 'react';
import { Box, Container, Typography, Paper, TextField, Button, InputAdornment, IconButton, Alert, CircularProgress } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
            const response = await axios.post('http://localhost:8000/api/auth/login/', {
                username,
                password
            }, { withCredentials: true });

            // Use context login
            login(response.data);

            // Redirect based on role
            const role = response.data.role;
            if (role === 'STUDENT') navigate('/student/dashboard');
            else if (role === 'DOCTOR') navigate('/doctor/dashboard');
            else if (role === 'STAFF') navigate('/student-affairs/dashboard');
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
        <Container maxWidth="sm" sx={{ py: 12 }}>
            <Paper elevation={6} sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
                <img src="/logo.jpg" alt="Logo" style={{ width: 80, height: 80, borderRadius: '50%', marginBottom: 20 }} />
                <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                    تسجيل الدخول
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ fontFamily: 'Cairo', mb: 4 }}>
                    قم بتسجيل الدخول للوصول إلى لوحة التحكم
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo' }}>{error}</Alert>}

                <form onSubmit={handleLogin}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            fullWidth
                            label="اسم المستخدم / الرقم القومي"
                            variant="outlined"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                        />
                        <TextField
                            fullWidth
                            label="كلمة المرور"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                            InputProps={{
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
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon sx={{ ml: 1 }} />}
                        >
                            {loading ? 'جاري الدخول...' : 'دخول'}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
}
