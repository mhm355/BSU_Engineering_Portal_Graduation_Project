import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Paper, Button, IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    CircularProgress, Alert, Chip, Select, MenuItem, FormControl, InputLabel, useTheme
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ManageJobs() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    
    const [formData, setFormData] = useState({
        id: null,
        title: '',
        company: '',
        description: '',
        requirements: '',
        job_type: 'FULL_TIME',
        location: '',
        deadline: '',
        external_link: '',
        is_active: true
    });

    const fetchData = async () => {
        try {
            const config = { withCredentials: true };
            const [jobsRes, companiesRes] = await Promise.all([
                axios.get('/api/graduate-affairs/jobs/', config),
                axios.get('/api/graduate-affairs/companies/', config)
            ]);
            setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : (jobsRes.data?.results || []));
            setCompanies(Array.isArray(companiesRes.data) ? companiesRes.data : (companiesRes.data?.results || []));
            setError('');
        } catch (err) {
            setError('فشل تحميل بيانات الوظائف');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenDialog = (job = null) => {
        if (job) {
            setFormData({
                ...job,
                company: job.company || ''
            });
            setIsEdit(true);
        } else {
            setFormData({
                id: null,
                title: '',
                company: companies.length > 0 ? companies[0].id : '',
                description: '',
                requirements: '',
                job_type: 'FULL_TIME',
                location: '',
                deadline: '',
                external_link: '',
                is_active: true
            });
            setIsEdit(false);
        }
        setOpenDialog(true);
    };

    const handleSave = async () => {
        if (!formData.company) {
            setError('يرجى اختيار الشركة');
            return;
        }

        try {
            const config = { withCredentials: true };
            const payload = { ...formData };
            if (!payload.deadline) delete payload.deadline;

            if (isEdit) {
                await axios.put(`/api/graduate-affairs/jobs/${formData.id}/`, payload, config);
            } else {
                await axios.post('/api/graduate-affairs/jobs/', payload, config);
            }
            setOpenDialog(false);
            fetchData();
        } catch (err) {
            setError('حدث خطأ أثناء حفظ البيانات');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الوظيفة؟')) {
            try {
                const config = { withCredentials: true };
                await axios.delete(`/api/graduate-affairs/jobs/${id}/`, config);
                fetchData();
            } catch (err) {
                setError('فشل الحذف');
            }
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/graduate-affairs/dashboard')}
                sx={{ mb: 2, fontFamily: 'Cairo' }}
            >
                عودة للوحة التحكم
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                    إدارة الوظائف والتدريب
                </Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={() => handleOpenDialog()}
                    sx={{ fontFamily: 'Cairo' }}
                    disabled={companies.length === 0}
                >
                    نشر وظيفة
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {companies.length === 0 && !loading && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    يجب إضافة شركات أولاً قبل التمكن من نشر الوظائف.
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: isDark ? 'background.default' : '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الوظيفة</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الشركة</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>النوع</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الحالة</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>إجراءات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {jobs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4, fontFamily: 'Cairo' }}>لا توجد وظائف معروضة</TableCell>
                                </TableRow>
                            ) : (
                                jobs.map((job) => (
                                    <TableRow key={job.id} hover>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{job.title}</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo' }}>{job.company_name}</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo' }}>{job.job_type_display}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={job.is_active ? 'نشط' : 'مغلق'} 
                                                color={job.is_active ? 'success' : 'default'} 
                                                size="small" 
                                                sx={{ fontFamily: 'Cairo' }} 
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton color="primary" onClick={() => handleOpenDialog(job)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton color="error" onClick={() => handleDelete(job.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                    {isEdit ? 'تعديل بيانات وظيفة' : 'نشر وظيفة جديدة'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="المسمى الوظيفي"
                                fullWidth
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                InputProps={{ sx: { fontFamily: 'Cairo' } }}
                                InputLabelProps={{ sx: { fontFamily: 'Cairo' } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth required>
                                <InputLabel sx={{ fontFamily: 'Cairo' }}>الشركة</InputLabel>
                                <Select
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    label="الشركة"
                                    sx={{ fontFamily: 'Cairo' }}
                                >
                                    {companies.map(c => (
                                        <MenuItem key={c.id} value={c.id} sx={{ fontFamily: 'Cairo' }}>{c.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel sx={{ fontFamily: 'Cairo' }}>نوع الوظيفة</InputLabel>
                                <Select
                                    value={formData.job_type}
                                    onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                                    label="نوع الوظيفة"
                                    sx={{ fontFamily: 'Cairo' }}
                                >
                                    <MenuItem value="FULL_TIME" sx={{ fontFamily: 'Cairo' }}>دوام كامل</MenuItem>
                                    <MenuItem value="PART_TIME" sx={{ fontFamily: 'Cairo' }}>دوام جزئي</MenuItem>
                                    <MenuItem value="INTERNSHIP" sx={{ fontFamily: 'Cairo' }}>تدريب / Internship</MenuItem>
                                    <MenuItem value="FREELANCE" sx={{ fontFamily: 'Cairo' }}>عمل حر / مستقل</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="مقر العمل"
                                fullWidth
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                InputProps={{ sx: { fontFamily: 'Cairo' } }}
                                InputLabelProps={{ sx: { fontFamily: 'Cairo' } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="الوصف الوظيفي"
                                multiline
                                rows={3}
                                fullWidth
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                InputProps={{ sx: { fontFamily: 'Cairo' } }}
                                InputLabelProps={{ sx: { fontFamily: 'Cairo' } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="متطلبات الوظيفة"
                                multiline
                                rows={3}
                                fullWidth
                                required
                                value={formData.requirements}
                                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                InputProps={{ sx: { fontFamily: 'Cairo' } }}
                                InputLabelProps={{ sx: { fontFamily: 'Cairo' } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="رابط التقديم الخارجي (اختياري)"
                                type="url"
                                fullWidth
                                value={formData.external_link}
                                onChange={(e) => setFormData({ ...formData, external_link: e.target.value })}
                                helperText="إذا وجد، سيتم تحويل الطالب إلى هذا الرابط بدلاً من التقديم داخل المنصة"
                                InputProps={{ sx: { fontFamily: 'Cairo' } }}
                                InputLabelProps={{ sx: { fontFamily: 'Cairo' } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="آخر موعد للتقديم"
                                type="date"
                                fullWidth
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                InputLabelProps={{ shrink: true, sx: { fontFamily: 'Cairo' } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel sx={{ fontFamily: 'Cairo' }}>الحالة</InputLabel>
                                <Select
                                    value={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value })}
                                    label="الحالة"
                                    sx={{ fontFamily: 'Cairo' }}
                                >
                                    <MenuItem value={true} sx={{ fontFamily: 'Cairo' }}>نشط - متاح للتقديم</MenuItem>
                                    <MenuItem value={false} sx={{ fontFamily: 'Cairo' }}>مغلق - تم الاكتفاء</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ fontFamily: 'Cairo' }}>إلغاء</Button>
                    <Button onClick={handleSave} variant="contained" sx={{ fontFamily: 'Cairo' }}>
                        {isEdit ? 'تحديث' : 'حفظ'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
