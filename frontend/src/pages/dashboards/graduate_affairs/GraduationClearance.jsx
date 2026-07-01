import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    CircularProgress, Alert, Chip, Switch, FormControlLabel, useTheme, Avatar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function GraduationClearance() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    
    const [clearances, setClearances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [selectedClearance, setSelectedClearance] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    
    // Form state for selected clearance
    const [formData, setFormData] = useState({
        library_cleared: false, library_notes: '',
        finance_cleared: false, finance_notes: '',
        labs_cleared: false, labs_notes: '',
        department_cleared: false, department_notes: '',
        housing_cleared: false, housing_notes: '',
        other_cleared: false, other_notes: '',
    });

    const fetchClearances = async () => {
        try {
            const config = { withCredentials: true };
            const res = await axios.get('/api/graduate-affairs/clearances/', config);
            setClearances(Array.isArray(res.data) ? res.data : (res.data?.results || []));
            setError('');
        } catch (err) {
            setError('فشل تحميل بيانات إخلاء الطرف');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClearances();
    }, []);

    const handleOpenEdit = (clearance) => {
        setSelectedClearance(clearance);
        setFormData({
            library_cleared: clearance.library_cleared, library_notes: clearance.library_notes || '',
            finance_cleared: clearance.finance_cleared, finance_notes: clearance.finance_notes || '',
            labs_cleared: clearance.labs_cleared, labs_notes: clearance.labs_notes || '',
            department_cleared: clearance.department_cleared, department_notes: clearance.department_notes || '',
            housing_cleared: clearance.housing_cleared, housing_notes: clearance.housing_notes || '',
            other_cleared: clearance.other_cleared, other_notes: clearance.other_notes || '',
        });
        setOpenDialog(true);
    };

    const handleSave = async () => {
        try {
            const config = { withCredentials: true };
            await axios.patch(`/api/graduate-affairs/clearances/${selectedClearance.id}/`, formData, config);
            setOpenDialog(false);
            fetchClearances();
        } catch (err) {
            setError('حدث خطأ أثناء حفظ البيانات');
        }
    };

    const getStatusChip = (status, display) => {
        if (status === 'COMPLETED') return <Chip icon={<CheckCircleIcon />} label={display} color="success" size="small" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} />;
        if (status === 'IN_PROGRESS') return <Chip icon={<PendingIcon />} label={display} color="info" size="small" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} />;
        return <Chip label={display} color="warning" size="small" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} />;
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

            <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 3 }}>
                إدارة إخلاء الطرف
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo' }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: isDark ? 'background.default' : '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الطالب / الخريج</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>نسبة الإنجاز</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الحالة العامة</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>تاريخ البدء</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>تعديل</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {clearances.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4, fontFamily: 'Cairo' }}>
                                        لا توجد سجلات إخلاء طرف حالياً
                                    </TableCell>
                                </TableRow>
                            ) : (
                                clearances.map((c) => (
                                    <TableRow key={c.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                                                    <PersonIcon fontSize="small" />
                                                </Avatar>
                                                <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                                    {c.graduate_name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CircularProgress variant="determinate" value={c.progress} size={24} color={c.progress === 100 ? 'success' : 'primary'} />
                                                <Typography variant="body2">{c.progress}%</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusChip(c.overall_status, c.overall_status_display)}
                                        </TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo' }}>
                                            {new Date(c.created_at).toLocaleDateString('ar-EG')}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton color="primary" onClick={() => handleOpenEdit(c)}>
                                                <EditIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Edit Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                    تحديث إخلاء طرف: {selectedClearance?.graduate_name}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                        {/* Clearances Grid */}
                        {[
                            { key: 'library', label: 'المكتبة المركزية' },
                            { key: 'finance', label: 'الشؤون المالية' },
                            { key: 'labs', label: 'المعامل والورش' },
                            { key: 'department', label: 'القسم العلمي' },
                            { key: 'housing', label: 'المدينة الجامعية' },
                            { key: 'other', label: 'جهات أخرى' },
                        ].map((dept) => (
                            <Paper key={dept.key} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData[`${dept.key}_cleared`]}
                                            onChange={(e) => setFormData({ ...formData, [`${dept.key}_cleared`]: e.target.checked })}
                                            color="success"
                                        />
                                    }
                                    label={<Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{dept.label}</Typography>}
                                />
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder={`ملاحظات ${dept.label}...`}
                                    value={formData[`${dept.key}_notes`]}
                                    onChange={(e) => setFormData({ ...formData, [`${dept.key}_notes`]: e.target.value })}
                                    sx={{ mt: 1 }}
                                    InputProps={{ sx: { fontFamily: 'Cairo', fontSize: '0.9rem' } }}
                                />
                            </Paper>
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ fontFamily: 'Cairo' }}>إلغاء</Button>
                    <Button onClick={handleSave} variant="contained" sx={{ fontFamily: 'Cairo' }}>
                        حفظ التحديثات
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
