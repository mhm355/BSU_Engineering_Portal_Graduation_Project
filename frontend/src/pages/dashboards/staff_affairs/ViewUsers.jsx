import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, Box, Table, TableBody, TableCell, TableHead,
    TableRow, TableContainer, CircularProgress, Alert, Button, Avatar, Grid,
    Fade, Grow, Chip, TextField, InputAdornment
} from '@mui/material';
import { keyframes } from '@mui/system';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const ViewUsers = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const doctorRes = await axios.get('/api/academic/staff-affairs/doctors/', config);
            setDoctors(doctorRes.data);
        } catch (err) {
            setError('خطأ في تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    const filteredDoctors = doctors.filter(doc =>
        doc.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.national_id.includes(searchQuery) ||
        (doc.email && doc.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const withEmailCount = doctors.filter(d => d.email).length;

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', pb: 6 }}>
            {/* Hero Header */}
            <Box sx={{ background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)', pt: 4, pb: 6, mb: 4, position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', animation: `${float} 6s ease-in-out infinite` }} />
                <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', animation: `${float} 8s ease-in-out infinite`, animationDelay: '2s' }} />

                <Container maxWidth="lg">
                    <Fade in={true} timeout={800}>
                        <Box>
                            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/staff-affairs/dashboard')} sx={{ color: '#fff', mb: 2, fontFamily: 'Cairo', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                                العودة للوحة التحكم
                            </Button>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                                    <PeopleIcon sx={{ fontSize: 45, color: '#fff' }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                        عرض الدكاترة
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: 'rgba(255,255,255,0.9)' }}>
                                        قائمة بجميع أعضاء هيئة التدريس المسجلين في النظام
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Container maxWidth="lg">
                {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem' }} onClose={() => setError(null)}>{error}</Alert>}

                {/* Stats Row */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={4}>
                        <Grow in={true} timeout={400}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 55, height: 55, background: 'linear-gradient(135deg, #9c27b0, #ba68c8)' }}>
                                    <PersonIcon sx={{ fontSize: 28 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{doctors.length}</Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>إجمالي الدكاترة</Typography>
                                </Box>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Grow in={true} timeout={500}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 55, height: 55, background: 'linear-gradient(135deg, #4CAF50, #8BC34A)' }}>
                                    <EmailIcon sx={{ fontSize: 28 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{withEmailCount}</Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>لديهم بريد إلكتروني</Typography>
                                </Box>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Grow in={true} timeout={600}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 55, height: 55, background: 'linear-gradient(135deg, #2196F3, #64B5F6)' }}>
                                    <BadgeIcon sx={{ fontSize: 28 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{filteredDoctors.length}</Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>نتائج البحث</Typography>
                                </Box>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={50} /></Box>
                ) : (
                    <Grow in={true} timeout={700}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 25px rgba(0,0,0,0.1)' }}>
                            {/* Search Bar */}
                            <Box sx={{ mb: 4 }}>
                                <TextField
                                    fullWidth
                                    placeholder="ابحث بالاسم، الرقم القومي، أو البريد الإلكتروني..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ color: '#9c27b0' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            bgcolor: '#fafafa',
                                            fontSize: '1.1rem',
                                            '&:hover fieldset': { borderColor: '#9c27b0' },
                                            '&.Mui-focused fieldset': { borderColor: '#9c27b0' }
                                        }
                                    }}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Avatar sx={{ width: 50, height: 50, background: 'linear-gradient(135deg, #9c27b0, #ba68c8)' }}>
                                    <PeopleIcon />
                                </Avatar>
                                <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                    قائمة الدكاترة ({filteredDoctors.length})
                                </Typography>
                            </Box>

                            {filteredDoctors.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 6 }}>
                                    <PeopleIcon sx={{ fontSize: 80, color: '#ddd', mb: 2 }} />
                                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', color: '#999', mb: 1 }}>
                                        {searchQuery ? 'لا توجد نتائج للبحث' : 'لا يوجد دكاترة'}
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#bbb' }}>
                                        {searchQuery ? 'جرب البحث بكلمات مختلفة' : 'قم برفع قائمة الدكاترة أولاً'}
                                    </Typography>
                                </Box>
                            ) : (
                                <TableContainer sx={{ borderRadius: 3, border: '1px solid #eee' }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: '#9c27b0' }}>
                                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>#</TableCell>
                                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>الاسم</TableCell>
                                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>الرقم القومي</TableCell>
                                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>البريد الإلكتروني</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredDoctors.map((doc, index) => (
                                                <TableRow key={doc.id} hover sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                                                    <TableCell>
                                                        <Avatar sx={{ width: 35, height: 35, bgcolor: '#9c27b0', fontSize: 14 }}>{index + 1}</Avatar>
                                                    </TableCell>
                                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1rem' }}>{doc.full_name}</TableCell>
                                                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '1rem' }}>{doc.national_id}</TableCell>
                                                    <TableCell>
                                                        {doc.email ? (
                                                            <Chip icon={<EmailIcon />} label={doc.email} size="small" sx={{ fontFamily: 'Cairo' }} />
                                                        ) : (
                                                            <Typography color="text.secondary">-</Typography>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Paper>
                    </Grow>
                )}
            </Container>
        </Box>
    );
};

export default ViewUsers;
