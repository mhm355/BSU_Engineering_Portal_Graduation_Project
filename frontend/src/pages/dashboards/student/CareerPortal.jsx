import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Paper, Button, Grid,
    Card, CardContent, CardActions, Chip, Avatar,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    CircularProgress, Alert, Tab, Tabs, Divider, useTheme
} from '@mui/material';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function CareerPortal() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [jobs, setJobs] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    // Application Dialog State
    const [openAppDialog, setOpenAppDialog] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [resumeFile, setResumeFile] = useState(null);
    const [coverLetter, setCoverLetter] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const fetchData = async () => {
        try {
            const config = { withCredentials: true };
            const [jobsRes, eventsRes] = await Promise.all([
                axios.get('/api/graduate-affairs/jobs/', config),
                axios.get('/api/graduate-affairs/events/', config)
            ]);
            
            // Filter only active postings
            const activeJobs = (Array.isArray(jobsRes.data) ? jobsRes.data : (jobsRes.data?.results || [])).filter(j => j.is_active);
            const activeEvents = (Array.isArray(eventsRes.data) ? eventsRes.data : (eventsRes.data?.results || [])).filter(e => e.is_active);
            
            setJobs(activeJobs);
            setEvents(activeEvents);
            setError('');
        } catch (err) {
            setError('فشل تحميل البيانات من الخادم');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApplyClick = (job) => {
        if (job.external_link) {
            window.open(job.external_link, '_blank');
            return;
        }
        setSelectedJob(job);
        setResumeFile(null);
        setCoverLetter('');
        setOpenAppDialog(true);
    };

    const submitApplication = async () => {
        if (!resumeFile) {
            setError('يجب إرفاق السيرة الذاتية');
            return;
        }
        setSubmitting(true);
        setError('');
        
        try {
            const formData = new FormData();
            formData.append('job', selectedJob.id);
            formData.append('resume', resumeFile);
            formData.append('cover_letter', coverLetter);
            
            await axios.post('/api/graduate-affairs/applications/', formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setSuccessMessage('تم تقديم طلبك بنجاح!');
            setOpenAppDialog(false);
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err) {
            setError(err.response?.data?.error || 'حدث خطأ أثناء التقديم. قد تكون قدمت مسبقاً.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRegisterEvent = async (eventId) => {
        try {
            await axios.post('/api/graduate-affairs/event-registrations/', { event: eventId }, { withCredentials: true });
            setSuccessMessage('تم تسجيلك في الفعالية بنجاح!');
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err) {
            setError('فشل التسجيل. قد تكون مسجلاً بالفعل.');
        }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}><CircularProgress /></Box>;
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4, minHeight: '80vh' }}>
            <Box sx={{ mb: 2 }}>
                <Button 
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => navigate('/student/dashboard')}
                    sx={{ fontFamily: 'Cairo', mb: 2 }}
                >
                    العودة للوحة التحكم
                </Button>
            </Box>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: isDark ? 'text.primary' : '#1a2744', mb: 2 }}>
                    بوابة التوظيف والتدريب
                </Typography>
                <Typography variant="subtitle1" sx={{ fontFamily: 'Cairo', color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
                    اكتشف أحدث فرص العمل والتدريب والفعاليات المهنية المصممة خصيصاً لطلاب وخريجي كلية الهندسة.
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo' }}>{error}</Alert>}
            {successMessage && <Alert severity="success" sx={{ mb: 3, fontFamily: 'Cairo' }}>{successMessage}</Alert>}

            <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Tabs 
                    value={tabValue} 
                    onChange={(e, v) => setTabValue(v)} 
                    centered 
                    sx={{ bgcolor: isDark ? 'background.paper' : '#f8f9fa', borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab icon={<BusinessCenterIcon />} iconPosition="start" label="الوظائف والتدريب" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1.1rem', py: 2 }} />
                    <Tab icon={<EventIcon />} iconPosition="start" label="الفعاليات والورش" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1.1rem', py: 2 }} />
                </Tabs>

                <Box sx={{ p: 3, bgcolor: isDark ? 'background.default' : '#fafafa', minHeight: 400 }}>
                    <TabPanel value={tabValue} index={0}>
                        {jobs.length === 0 ? (
                            <Typography textAlign="center" sx={{ fontFamily: 'Cairo', color: '#888', mt: 5 }}>لا توجد وظائف متاحة حالياً.</Typography>
                        ) : (
                            <Grid container spacing={3}>
                                {jobs.map(job => (
                                    <Grid item xs={12} md={6} key={job.id}>
                                        <Card sx={{ borderRadius: 3, transition: 'all 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
                                            <CardContent>
                                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                                    <Avatar src={job.company_logo} sx={{ width: 56, height: 56, bgcolor: isDark ? 'rgba(25,118,210,0.1)' : '#e3f2fd', color: '#1976d2' }}>
                                                        <BusinessCenterIcon />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{job.title}</Typography>
                                                        <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: 'text.secondary' }}>{job.company_name}</Typography>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                                    <Chip size="small" label={job.job_type_display} color="primary" variant="outlined" sx={{ fontFamily: 'Cairo' }} />
                                                    <Chip size="small" icon={<LocationOnIcon />} label={job.location} variant="outlined" sx={{ fontFamily: 'Cairo' }} />
                                                </Box>
                                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: 'text.primary', mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {job.description}
                                                </Typography>
                                            </CardContent>
                                            <Divider />
                                            <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                                                <Typography variant="caption" sx={{ fontFamily: 'Cairo', color: '#888' }}>
                                                    {job.deadline ? `أخر موعد: ${job.deadline}` : 'مفتوح للتقديم'}
                                                </Typography>
                                                <Button variant="contained" endIcon={<SendIcon />} onClick={() => handleApplyClick(job)} sx={{ fontFamily: 'Cairo', borderRadius: 2 }}>
                                                    قدم الآن
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        {events.length === 0 ? (
                            <Typography textAlign="center" sx={{ fontFamily: 'Cairo', color: '#888', mt: 5 }}>لا توجد فعاليات مجدولة حالياً.</Typography>
                        ) : (
                            <Grid container spacing={3}>
                                {events.map(event => (
                                    <Grid item xs={12} md={6} key={event.id}>
                                        <Card sx={{ borderRadius: 3, transition: 'all 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
                                            <CardContent>
                                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                                    <Avatar sx={{ width: 56, height: 56, bgcolor: isDark ? 'rgba(46,125,50,0.1)' : '#e8f5e9', color: '#2e7d32' }}>
                                                        <EventIcon />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{event.title}</Typography>
                                                        <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: 'text.secondary' }}>{event.provider_name || 'كلية الهندسة - جامعة بني سويف'}</Typography>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                                    <Chip size="small" label={event.event_type_display} color="success" variant="outlined" sx={{ fontFamily: 'Cairo' }} />
                                                    <Chip size="small" icon={<LocationOnIcon />} label={event.location} variant="outlined" sx={{ fontFamily: 'Cairo' }} />
                                                    <Chip size="small" icon={<AccessTimeIcon />} label={new Date(event.date).toLocaleDateString('ar-EG')} variant="outlined" sx={{ fontFamily: 'Cairo' }} />
                                                </Box>
                                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: 'text.primary', mb: 2 }}>
                                                    {event.description}
                                                </Typography>
                                            </CardContent>
                                            <Divider />
                                            <CardActions sx={{ p: 2, justifyContent: 'flex-end' }}>
                                                <Button variant="outlined" color="success" onClick={() => handleRegisterEvent(event.id)} sx={{ fontFamily: 'Cairo', borderRadius: 2, fontWeight: 'bold' }}>
                                                    التسجيل للحضور
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </TabPanel>
                </Box>
            </Paper>

            {/* Application Dialog */}
            <Dialog open={openAppDialog} onClose={() => !submitting && setOpenAppDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>التقديم على: {selectedJob?.title}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box sx={{ p: 2, bgcolor: isDark ? 'rgba(25,118,210,0.1)' : '#e3f2fd', borderRadius: 2, color: isDark ? '#90caf9' : '#1976d2' }}>
                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>سيتم إرسال بياناتك الشخصية المسجلة بالمنصة تلقائياً (الاسم، البريد الإلكتروني، القسم).</Typography>
                        </Box>
                        
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontFamily: 'Cairo', mb: 1, fontWeight: 'bold' }}>السيرة الذاتية (PDF, Word) *</Typography>
                            <Button variant="outlined" component="label" fullWidth sx={{ p: 2, borderStyle: 'dashed', borderWidth: 2, fontFamily: 'Cairo' }}>
                                {resumeFile ? resumeFile.name : 'اختر ملف السيرة الذاتية'}
                                <input type="file" hidden accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files[0])} />
                            </Button>
                        </Box>

                        <TextField
                            label="خطاب التغطية (اختياري)"
                            multiline
                            rows={4}
                            fullWidth
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            placeholder="اكتب بضعة أسطر توضح لماذا أنت مناسب لهذه الوظيفة..."
                            InputProps={{ sx: { fontFamily: 'Cairo' } }}
                            InputLabelProps={{ sx: { fontFamily: 'Cairo' } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenAppDialog(false)} disabled={submitting} sx={{ fontFamily: 'Cairo' }}>إلغاء</Button>
                    <Button onClick={submitApplication} variant="contained" disabled={submitting} startIcon={submitting ? <CircularProgress size={20} /> : <SendIcon />} sx={{ fontFamily: 'Cairo' }}>
                        إرسال الطلب
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
