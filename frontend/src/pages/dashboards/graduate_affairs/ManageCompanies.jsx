import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Paper, Button, IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    CircularProgress, Alert, Avatar, useTheme
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ManageCompanies() {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        industry: '',
        website: '',
        contact_email: '',
        description: '',
    });

    const fetchCompanies = async () => {
        try {
            const config = { withCredentials: true };
            const res = await axios.get('/api/graduate-affairs/companies/', config);
            setCompanies(Array.isArray(res.data) ? res.data : (res.data?.results || []));
            setError('');
        } catch (err) {
            setError('فشل تحميل بيانات الشركات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const handleOpenDialog = (company = null) => {
        if (company) {
            setFormData(company);
            setIsEdit(true);
        } else {
            setFormData({
                id: null,
                name: '',
                industry: '',
                website: '',
                contact_email: '',
                description: '',
            });
            setIsEdit(false);
        }
        setOpenDialog(true);
    };

    const handleSave = async () => {
        try {
            const config = { withCredentials: true };
            const payload = { ...formData };
            if (!isEdit) {
                delete payload.id;
            }
            if (isEdit) {
                await axios.put(`/api/graduate-affairs/companies/${formData.id}/`, payload, config);
            } else {
                await axios.post('/api/graduate-affairs/companies/', payload, config);
            }
            setOpenDialog(false);
            fetchCompanies();
        } catch (err) {
            console.error('Save error:', err.response?.data);
            const errorMsg = err.response?.data ? Object.values(err.response.data).flat().join(', ') : 'حدث خطأ أثناء حفظ البيانات';
            setError(errorMsg);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الشركة؟ ستتأثر الوظائف المرتبطة بها.')) {
            try {
                const config = { withCredentials: true };
                await axios.delete(`/api/graduate-affairs/companies/${id}/`, config);
                fetchCompanies();
            } catch (err) {
                setError('فشل حذف الشركة');
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
                    إدارة الشركات الشريكة
                </Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={() => handleOpenDialog()}
                    sx={{ fontFamily: 'Cairo' }}
                >
                    إضافة شركة
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
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الشركة</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>المجال</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>البريد الإلكتروني</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>إجراءات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {companies.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4, fontFamily: 'Cairo' }}>لا توجد شركات مسجلة</TableCell>
                                </TableRow>
                            ) : (
                                companies.map((company) => (
                                    <TableRow key={company.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                    <BusinessIcon />
                                                </Avatar>
                                                <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{company.name}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo' }}>{company.industry}</TableCell>
                                        <TableCell sx={{ fontFamily: 'monospace' }}>{company.contact_email || '-'}</TableCell>
                                        <TableCell>
                                            <IconButton color="primary" onClick={() => handleOpenDialog(company)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton color="error" onClick={() => handleDelete(company.id)}>
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

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                    {isEdit ? 'تعديل بيانات شركة' : 'إضافة شركة جديدة'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="اسم الشركة"
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            InputProps={{ sx: { fontFamily: 'Cairo' } }}
                            InputLabelProps={{ sx: { fontFamily: 'Cairo' } }}
                        />
                        <TextField
                            label="مجال العمل / الصناعة"
                            fullWidth
                            value={formData.industry}
                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                            InputProps={{ sx: { fontFamily: 'Cairo' } }}
                            InputLabelProps={{ sx: { fontFamily: 'Cairo' } }}
                        />
                        <TextField
                            label="البريد الإلكتروني"
                            type="email"
                            fullWidth
                            value={formData.contact_email}
                            onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                            InputProps={{ sx: { fontFamily: 'Cairo' } }}
                            InputLabelProps={{ sx: { fontFamily: 'Cairo' } }}
                        />
                        <TextField
                            label="الموقع الإلكتروني"
                            type="url"
                            fullWidth
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            InputProps={{ sx: { fontFamily: 'Cairo' } }}
                            InputLabelProps={{ sx: { fontFamily: 'Cairo' } }}
                        />
                        <TextField
                            label="وصف الشركة"
                            multiline
                            rows={3}
                            fullWidth
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            InputProps={{ sx: { fontFamily: 'Cairo' } }}
                            InputLabelProps={{ sx: { fontFamily: 'Cairo' } }}
                        />
                    </Box>
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
