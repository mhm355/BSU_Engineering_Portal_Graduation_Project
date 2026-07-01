import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Paper, Box, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField, MenuItem, CircularProgress,
    Alert, Chip, IconButton, Tooltip, InputAdornment, useTheme
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function GraduateDatabase() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [graduates, setGraduates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const fetchGraduates = async () => {
        setLoading(true);
        setError('');
        try {
            const config = { withCredentials: true };
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (statusFilter) params.append('graduation_status', statusFilter);
            
            const res = await axios.get(`/api/graduate-affairs/graduates/?${params.toString()}`, config);
            setGraduates(Array.isArray(res.data) ? res.data : (res.data?.results || []));
        } catch (err) {
            console.error(err);
            setError('فشل تحميل بيانات الخريجين. تأكد من اتصالك بالخادم.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Adding a slight debounce for search typing
        const delayDebounceFn = setTimeout(() => {
            fetchGraduates();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search, statusFilter]);

    const getGraduationStatusChip = (status) => {
        switch (status) {
            case 'APPROVED': return <Chip label="معتمد" color="success" size="small" icon={<CheckCircleIcon />} sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} />;
            case 'REJECTED': return <Chip label="مرفوض" color="error" size="small" icon={<CancelIcon />} sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} />;
            case 'PENDING': default: return <Chip label="قيد الانتظار" color="warning" size="small" icon={<PendingIcon />} sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} />;
        }
    };

    const getClearanceStatusChip = (status, progress) => {
        switch (status) {
            case 'COMPLETED': return <Chip label={`مكتمل (100%)`} color="success" size="small" sx={{ fontFamily: 'Cairo' }} />;
            case 'IN_PROGRESS': return <Chip label={`جاري العمل (${progress || 0}%)`} color="info" size="small" sx={{ fontFamily: 'Cairo' }} />;
            case 'PENDING': default: return <Chip label="لم يبدأ" color="default" size="small" sx={{ fontFamily: 'Cairo' }} />;
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/graduate-affairs/dashboard')} sx={{ mb: 2, fontFamily: 'Cairo' }}>
                عودة للوحة التحكم
            </Button>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                    قاعدة بيانات الخريجين والفرقة الرابعة
                </Typography>
                <Button 
                    variant="outlined" 
                    startIcon={<RefreshIcon />} 
                    onClick={fetchGraduates}
                    sx={{ fontFamily: 'Cairo' }}
                >
                    تحديث
                </Button>
            </Box>

            <Paper sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: isDark ? 'background.paper' : '#f8f9fa' }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                        label="بحث بالاسم أو الرقم القومي"
                        variant="outlined"
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ flexGrow: 1, minWidth: '300px' }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                            sx: { fontFamily: 'Cairo' }
                        }}
                        InputLabelProps={{ sx: { fontFamily: 'Cairo' } }}
                    />
                    <TextField
                        select
                        label="حالة التخرج"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        size="small"
                        sx={{ minWidth: '200px' }}
                        InputProps={{ sx: { fontFamily: 'Cairo' } }}
                        InputLabelProps={{ sx: { fontFamily: 'Cairo' } }}
                    >
                        <MenuItem value="" sx={{ fontFamily: 'Cairo' }}>الكل</MenuItem>
                        <MenuItem value="APPROVED" sx={{ fontFamily: 'Cairo' }}>معتمد</MenuItem>
                        <MenuItem value="PENDING" sx={{ fontFamily: 'Cairo' }}>قيد الانتظار</MenuItem>
                        <MenuItem value="REJECTED" sx={{ fontFamily: 'Cairo' }}>مرفوض</MenuItem>
                    </TextField>
                </Box>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo' }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: isDark ? 'background.default' : '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الرقم القومي</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الاسم بالكامل</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>القسم</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>حالة التخرج</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>حالة إخلاء الطرف</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الشهادة</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {graduates.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4, fontFamily: 'Cairo' }}>
                                        لا توجد بيانات متاحة
                                    </TableCell>
                                </TableRow>
                            ) : (
                                graduates.map((student) => (
                                    <TableRow key={student.id} hover>
                                        <TableCell sx={{ fontFamily: 'monospace' }}>{student.national_id || '-'}</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{student.full_name}</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo' }}>{student.department || '-'}</TableCell>
                                        <TableCell>{getGraduationStatusChip(student.graduation_status)}</TableCell>
                                        <TableCell>{getClearanceStatusChip(student.clearance_status, student.clearance_progress)}</TableCell>
                                        <TableCell>
                                            {student.has_certificate ? (
                                                <Tooltip title="تم استخراج الشهادة">
                                                    <CheckCircleIcon color="success" />
                                                </Tooltip>
                                            ) : (
                                                <Tooltip title="لم يتم استخراج الشهادة">
                                                    <CancelIcon color="disabled" />
                                                </Tooltip>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
}
