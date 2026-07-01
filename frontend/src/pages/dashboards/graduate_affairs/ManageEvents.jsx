import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Paper, Button, IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    CircularProgress, Alert, Chip, Select, MenuItem, FormControl, InputLabel, Grid, useTheme
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ManageEvents() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
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
        provider: '',
        description: '',
        event_type: 'WORKSHOP',
        date: '',
        location: '',
        max_attendees: '',
        is_active: true
    });

    const fetchData = async () => {
        try {
            const config = { withCredentials: true };
            const [eventsRes, companiesRes] = await Promise.all([
                axios.get('/api/graduate-affairs/events/', config),
                axios.get('/api/graduate-affairs/companies/', config)
            ]);
            setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : (eventsRes.data?.results || []));
            setCompanies(Array.isArray(companiesRes.data) ? companiesRes.data : (companiesRes.data?.results || []));
            setError('');
        } catch (err) {
            setError('فشل تحميل بيانات الفعاليات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenDialog = (event = null) => {
        if (event) {
            // Format datetime-local
            let formattedDate = '';
            if (event.date) {
                const dateObj = new Date(event.date);
                dateObj.setMinutes(dateObj.getMinutes() - dateObj.getTimezoneOffset());
                formattedDate = dateObj.toISOString().slice(0, 16);
            }

            setFormData({
                ...event,
                provider: event.provider || '',
                date: formattedDate,
                max_attendees: event.max_attendees || ''
            });
            setIsEdit(true);
        } else {
            setFormData({
                id: null,
                title: '',
                provider: '',
                description: '',
                event_type: 'WORKSHOP',
                date: '',
                location: '',
                max_attendees: '',
                is_active: true
            });
            setIsEdit(false);
        }
        setOpenDialog(true);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.date || !formData.location) {
            setError('يرجى تعبئة جميع الحقول المطلوبة');
            return;
        }

        try {
            const config = { withCredentials: true };
            const payload = { ...formData };
            if (!payload.provider) payload.provider = null;
            if (!payload.max_attendees) payload.max_attendees = null;

            if (isEdit) {
                await axios.put(`/api/graduate-affairs/events/${formData.id}/`, payload, config);
            } else {
                await axios.post('/api/graduate-affairs/events/', payload, config);
            }
            setOpenDialog(false);
            fetchData();
        } catch (err) {
            setError('حدث خطأ أثناء حفظ البيانات');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الفعالية؟')) {
            try {
                const config = { withCredentials: true };
                await axios.delete(`/api/graduate-affairs/events/${id}/`, config);
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
                    إدارة التدريب والفعاليات
                </Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={() => handleOpenDialog()}
                    sx={{ fontFamily: 'Cairo' }}
                >
                    إنشاء فعالية
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: isDark ? 'background.default' : '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>عنوان الفعالية</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الجهة المنظمة</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>النوع</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>التاريخ والوقت</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الحالة</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>إجراءات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {events.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4, fontFamily: 'Cairo' }}>لا توجد فعاليات</TableCell>
                                </TableRow>
                            ) : (
                                events.map((event) => (
                                    <TableRow key={event.id} hover>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{event.title}</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo' }}>{event.provider_name || 'الكلية'}</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo' }}>{event.event_type_display}</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo' }}>
                                            {new Date(event.date).toLocaleString('ar-EG')}
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={event.is_active ? 'متاح' : 'مغلق'} 
                                                color={event.is_active ? 'success' : 'default'} 
                                                size="small" 
                                                sx={{ fontFamily: 'Cairo' }} 
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton color="primary" onClick={() => handleOpenDialog(event)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton color="error" onClick={() => handleDelete(event.id)}>
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
                    {isEdit ? 'تعديل بيانات الفعالية' : 'إنشاء فعالية جديدة'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={8}>
                            <TextField
                                label="عنوان الفعالية"
                                fullWidth
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                InputProps={{ sx: { fontFamily: 'Cairo' } }}
                                InputLabelProps={{ sx: { fontFamily: 'Cairo' } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel sx={{ fontFamily: 'Cairo' }}>النوع</InputLabel>
                                <Select
                                    value={formData.event_type}
                                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                                    label="النوع"
                                    sx={{ fontFamily: 'Cairo' }}
                                >
                                    <MenuItem value="WORKSHOP" sx={{ fontFamily: 'Cairo' }}>ورشة عمل</MenuItem>
                                    <MenuItem value="SEMINAR" sx={{ fontFamily: 'Cairo' }}>ندوة تعريفية</MenuItem>
                                    <MenuItem value="CAREER_FAIR" sx={{ fontFamily: 'Cairo' }}>ملتقى توظيفي</MenuItem>
                                    <MenuItem value="TRAINING_COURSE" sx={{ fontFamily: 'Cairo' }}>دورة تدريبية</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel sx={{ fontFamily: 'Cairo' }}>الجهة المنظمة (اختياري)</InputLabel>
                                <Select
                                    value={formData.provider}
                                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                                    label="الجهة المنظمة (اختياري)"
                                    sx={{ fontFamily: 'Cairo' }}
                                >
                                    <MenuItem value="" sx={{ fontFamily: 'Cairo', color: '#888' }}>-- الكلية (افتراضي) --</MenuItem>
                                    {companies.map(c => (
                                        <MenuItem key={c.id} value={c.id} sx={{ fontFamily: 'Cairo' }}>{c.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="التاريخ والوقت"
                                type="datetime-local"
                                fullWidth
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                InputLabelProps={{ shrink: true, sx: { fontFamily: 'Cairo' } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="مقر التنفيذ (أو رابط أونلاين)"
                                fullWidth
                                required
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                InputProps={{ sx: { fontFamily: 'Cairo' } }}
                                InputLabelProps={{ sx: { fontFamily: 'Cairo' } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="وصف الفعالية وتفاصيلها"
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
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="الحد الأقصى للحضور (اختياري)"
                                type="number"
                                fullWidth
                                value={formData.max_attendees}
                                onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                                helperText="اتركه فارغاً إذا كان مفتوحاً للجميع"
                                InputProps={{ sx: { fontFamily: 'Cairo' } }}
                                InputLabelProps={{ sx: { fontFamily: 'Cairo' } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel sx={{ fontFamily: 'Cairo' }}>حالة التسجيل</InputLabel>
                                <Select
                                    value={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value })}
                                    label="حالة التسجيل"
                                    sx={{ fontFamily: 'Cairo' }}
                                >
                                    <MenuItem value={true} sx={{ fontFamily: 'Cairo' }}>متاح للتسجيل</MenuItem>
                                    <MenuItem value={false} sx={{ fontFamily: 'Cairo' }}>مغلق</MenuItem>
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
