import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, Box, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Alert, Chip, Switch, FormControlLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ManageAcademicYears() {
    const navigate = useNavigate();
    const [years, setYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [open, setOpen] = useState(false);
    const [currentYear, setCurrentYear] = useState({ name: '', is_current: false });
    const [isEdit, setIsEdit] = useState(false);

    const token = localStorage.getItem('access_token');
    const config = {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    };

    useEffect(() => {
        fetchYears();
    }, []);

    const fetchYears = async () => {
        try {
            const response = await axios.get('/api/academic/years/', config);
            setYears(response.data);
        } catch (err) {
            setError('فشل في تحميل الأعوام الدراسية');
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = (year = null) => {
        if (year) {
            setCurrentYear(year);
            setIsEdit(true);
        } else {
            setCurrentYear({ name: '', is_current: false });
            setIsEdit(false);
        }
        setOpen(true);
        setError('');
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentYear({ name: '', is_current: false });
    };

    const handleSave = async () => {
        if (!currentYear.name.trim()) {
            setError('يرجى إدخال اسم العام الدراسي');
            return;
        }

        try {
            if (isEdit) {
                await axios.put(`/api/academic/years/${currentYear.id}/`, currentYear, config);
                setSuccess('تم تحديث العام الدراسي بنجاح');
            } else {
                await axios.post('/api/academic/years/', currentYear, config);
                setSuccess('تم إنشاء العام الدراسي بنجاح');
            }
            fetchYears();
            handleClose();
        } catch (err) {
            console.error('Save error:', err.response);
            if (err.response?.status === 403) {
                setError('ليس لديك صلاحية لإضافة الأعوام الدراسية. تأكد من تسجيل الدخول كأدمن.');
            } else {
                setError(err.response?.data?.name?.[0] || err.response?.data?.detail || 'حدث خطأ أثناء الحفظ');
            }
        }
    };

    const handleToggleStatus = async (year) => {
        try {
            const response = await axios.post(`/api/academic/years/${year.id}/toggle_status/`, {}, config);
            setSuccess(`تم ${response.data.status === 'OPEN' ? 'فتح' : 'إغلاق'} العام الدراسي`);
            fetchYears();
        } catch (err) {
            setError('فشل في تغيير حالة العام الدراسي');
        }
    };

    const handleSetCurrent = async (year) => {
        try {
            await axios.post(`/api/academic/years/${year.id}/set_current/`, {}, config);
            setSuccess('تم تعيين العام الدراسي كحالي');
            fetchYears();
        } catch (err) {
            setError('فشل في تعيين العام الدراسي كحالي');
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <IconButton onClick={() => navigate('/admin/dashboard')}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                    إدارة الأعوام الدراسية
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontFamily: 'Cairo' }}>
                        الأعوام الدراسية ({years.length})
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpen()}
                        sx={{ fontFamily: 'Cairo' }}
                    >
                        إضافة عام دراسي
                    </Button>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>#</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>العام الدراسي</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الحالة</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الحالي</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الإجراءات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {years.map((year, idx) => (
                                <TableRow key={year.id}>
                                    <TableCell>{idx + 1}</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                        {year.name}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={year.status === 'OPEN' ? 'مفتوح' : 'مغلق'}
                                            color={year.status === 'OPEN' ? 'success' : 'error'}
                                            size="small"
                                            icon={year.status === 'OPEN' ? <LockOpenIcon /> : <LockIcon />}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {year.is_current && (
                                            <Chip
                                                label="العام الحالي"
                                                color="primary"
                                                size="small"
                                                icon={<StarIcon />}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleOpen(year)}
                                            title="تعديل"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color={year.status === 'OPEN' ? 'error' : 'success'}
                                            onClick={() => handleToggleStatus(year)}
                                            title={year.status === 'OPEN' ? 'إغلاق' : 'فتح'}
                                        >
                                            {year.status === 'OPEN' ? <LockIcon /> : <LockOpenIcon />}
                                        </IconButton>
                                        {!year.is_current && (
                                            <IconButton
                                                color="warning"
                                                onClick={() => handleSetCurrent(year)}
                                                title="تعيين كحالي"
                                            >
                                                <StarIcon />
                                            </IconButton>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {years.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        <Typography sx={{ fontFamily: 'Cairo', color: 'text.secondary' }}>
                                            لا توجد أعوام دراسية - قم بإضافة عام جديد
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Add/Edit Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontFamily: 'Cairo' }}>
                    {isEdit ? 'تعديل العام الدراسي' : 'إضافة عام دراسي جديد'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            label="اسم العام الدراسي"
                            placeholder="مثال: 2024-2025"
                            fullWidth
                            required
                            value={currentYear.name}
                            onChange={(e) => setCurrentYear({ ...currentYear, name: e.target.value })}
                            InputLabelProps={{ sx: { fontFamily: 'Cairo' } }}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={currentYear.is_current}
                                    onChange={(e) => setCurrentYear({ ...currentYear, is_current: e.target.checked })}
                                />
                            }
                            label="تعيين كالعام الحالي"
                            sx={{ fontFamily: 'Cairo' }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} sx={{ fontFamily: 'Cairo' }}>إلغاء</Button>
                    <Button onClick={handleSave} variant="contained" sx={{ fontFamily: 'Cairo' }}>
                        حفظ
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
