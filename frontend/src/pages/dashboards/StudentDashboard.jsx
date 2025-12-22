import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, Paper, Typography, Card, CardContent, Button, Chip, Alert, Divider, CircularProgress } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DownloadIcon from '@mui/icons-material/Download';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export default function StudentDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [studentInfo, setStudentInfo] = useState(null);
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [certificateLoading, setCertificateLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Fetch student academic info from API
        const fetchStudentInfo = async () => {
            try {
                const response = await axios.get('/api/academic/student/profile/', { withCredentials: true });
                setStudentInfo({
                    level: response.data.level,
                    levelDisplay: response.data.level_display,
                    department: response.data.department,
                    departmentCode: response.data.department_code,
                    academicYear: response.data.academic_year,
                    graduationStatus: response.data.graduation_status,
                    fullName: response.data.full_name,
                });
            } catch (err) {
                console.error('Error fetching student info:', err);
                // Fallback to user data
                setStudentInfo({
                    level: null,
                    levelDisplay: 'غير محدد',
                    department: null,
                    departmentCode: null,
                    academicYear: null,
                    graduationStatus: user.graduation_status || 'PENDING',
                    fullName: `${user.first_name} ${user.last_name}`,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStudentInfo();
    }, [user, navigate]);

    // Fetch certificate for fourth-year students
    useEffect(() => {
        if (studentInfo?.level === 'FOURTH') {
            setCertificateLoading(true);
            axios.get('/api/academic/certificates/', { withCredentials: true })
                .then(response => {
                    if (response.data && response.data.length > 0) {
                        setCertificate(response.data[0]); // Get the first/latest certificate
                    }
                })
                .catch(err => console.error('Error fetching certificate:', err))
                .finally(() => setCertificateLoading(false));
        }
    }, [studentInfo]);

    if (!user) return null;

    const isPreparatory = studentInfo?.level === 'PREPARATORY';
    const isFourthYear = studentInfo?.level === 'FOURTH';
    const hasCertificate = certificate !== null;

    const getLevelDisplay = (level) => {
        const levels = {
            'PREPARATORY': 'السنة التحضيرية',
            'FIRST': 'السنة الأولى',
            'SECOND': 'السنة الثانية',
            'THIRD': 'السنة الثالثة',
            'FOURTH': 'السنة الرابعة'
        };
        return levels[level] || level;
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header with student info */}
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <img src={user.profile_picture || "https://via.placeholder.com/100"} alt="Profile" style={{ width: 80, height: 80, borderRadius: '50%' }} />
                <Box>
                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                        مرحباً، {user.first_name} {user.last_name}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary" sx={{ fontFamily: 'Cairo' }}>
                        طالب
                    </Typography>
                </Box>
            </Box>

            {/* Academic Info Bar */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarTodayIcon color="primary" />
                            <Typography sx={{ fontFamily: 'Cairo' }}>
                                <strong>السنة الأكاديمية:</strong> {studentInfo?.academicYear || 'غير محدد'}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SchoolIcon color="primary" />
                            <Typography sx={{ fontFamily: 'Cairo' }}>
                                <strong>المستوى:</strong> {studentInfo?.levelDisplay || 'غير محدد'}
                            </Typography>
                        </Box>
                    </Grid>
                    {!isPreparatory && studentInfo?.department && (
                        <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <BusinessIcon color="primary" />
                                <Typography sx={{ fontFamily: 'Cairo' }}>
                                    <strong>القسم:</strong> {studentInfo.department}
                                </Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </Paper>

            {/* Graduation Certificate Section - Only for Fourth Year */}
            {isFourthYear && (
                <Paper sx={{ p: 3, mb: 3, bgcolor: hasCertificate ? '#e8f5e9' : '#fff3e0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CardMembershipIcon sx={{ fontSize: 40, color: hasCertificate ? '#4caf50' : '#ff9800' }} />
                            <Box>
                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                    شهادة التخرج
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo' }}>
                                    {certificateLoading
                                        ? 'جاري التحميل...'
                                        : hasCertificate
                                            ? `شهادتك جاهزة للتحميل${certificate.description ? ` - ${certificate.description}` : ''}`
                                            : 'لم يتم رفع شهادة التخرج بعد. سيتم إشعارك عند رفعها.'}
                                </Typography>
                            </Box>
                        </Box>
                        {certificateLoading ? (
                            <CircularProgress size={30} />
                        ) : hasCertificate ? (
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<DownloadIcon />}
                                sx={{ fontFamily: 'Cairo' }}
                                onClick={() => window.open(certificate.file, '_blank')}
                            >
                                تحميل الشهادة
                            </Button>
                        ) : (
                            <Chip
                                label="في الانتظار"
                                color="warning"
                                sx={{ fontFamily: 'Cairo' }}
                            />
                        )}
                    </Box>
                </Paper>
            )}

            <Grid container spacing={3}>
                {/* Quick Actions */}
                <Grid item xs={12} md={3}>
                    <Card sx={{ height: '100%', bgcolor: '#e3f2fd' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <SchoolIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>نتائج الامتحانات</Typography>
                            <Button variant="contained" sx={{ mt: 2, fontFamily: 'Cairo' }} onClick={() => navigate('/student/grades')}>عرض النتائج</Button>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card sx={{ height: '100%', bgcolor: '#fff3e0' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <AssignmentIcon sx={{ fontSize: 60, color: '#f57c00', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                {isPreparatory ? 'المواد العامة' : 'مواد القسم'}
                            </Typography>
                            <Button variant="contained" color="warning" sx={{ mt: 2, fontFamily: 'Cairo' }} onClick={() => navigate('/student/materials')}>عرض المواد</Button>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card sx={{ height: '100%', bgcolor: '#e8f5e9' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <EventIcon sx={{ fontSize: 60, color: '#388e3c', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>جدول الامتحانات</Typography>
                            <Button variant="contained" color="success" sx={{ mt: 2, fontFamily: 'Cairo' }} onClick={() => navigate('/student/exams')}>عرض الجدول</Button>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card sx={{ height: '100%', bgcolor: '#ffebee' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <EventIcon sx={{ fontSize: 60, color: '#d32f2f', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الغياب</Typography>
                            <Button variant="contained" color="error" sx={{ mt: 2, fontFamily: 'Cairo' }} onClick={() => navigate('/student/attendance')}>عرض الغياب</Button>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card sx={{ height: '100%', bgcolor: '#f3e5f5' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <AssignmentIcon sx={{ fontSize: 60, color: '#7b1fa2', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الكويزات</Typography>
                            <Button variant="contained" sx={{ mt: 2, fontFamily: 'Cairo', bgcolor: '#7b1fa2' }} onClick={() => navigate('/student/quizzes')}>عرض الكويزات</Button>
                        </CardContent>
                    </Card>
                </Grid>


                {/* Recent Activity / Notifications */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                            آخر الإشعارات
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: 'Cairo' }}>
                            لا توجد إشعارات جديدة حالياً.
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}

