import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, CircularProgress, Alert,
    Select, MenuItem, FormControl, InputLabel, Fade, Avatar, IconButton,
    TextField, InputAdornment, Grid, Grow, Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import GradingIcon from '@mui/icons-material/Grading';
import LockResetIcon from '@mui/icons-material/LockReset';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ACTION_CONFIG = {
    STUDENT_BATCH_UPLOAD: { label: 'رفع طلاب', color: 'primary', icon: <UploadFileIcon fontSize="small" /> },
    DOCTOR_BATCH_UPLOAD: { label: 'رفع دكاترة', color: 'secondary', icon: <UploadFileIcon fontSize="small" /> },
    STAFF_BATCH_UPLOAD: { label: 'رفع موظفين', color: 'info', icon: <UploadFileIcon fontSize="small" /> },
    GRADE_UPLOAD: { label: 'رفع درجات', color: 'warning', icon: <GradingIcon fontSize="small" /> },
    STUDENT_PASSWORD_RESET: { label: 'إعادة تعيين كلمة مرور', color: 'error', icon: <LockResetIcon fontSize="small" /> },
    DOCTOR_ASSIGNMENT: { label: 'تعيين دكتور', color: 'success', icon: <AssignmentIndIcon fontSize="small" /> },
    DOCTOR_UNASSIGNMENT: { label: 'إلغاء تعيين دكتور', color: 'default', icon: <AssignmentIndIcon fontSize="small" /> },
    // U9: New action types
    STUDENT_CREATED: { label: 'إنشاء طالب', color: 'primary', icon: <PersonAddIcon fontSize="small" /> },
    STUDENT_DELETED: { label: 'حذف طالب', color: 'error', icon: <PersonRemoveIcon fontSize="small" /> },
    DOCTOR_CREATED: { label: 'إنشاء دكتور', color: 'secondary', icon: <PersonAddIcon fontSize="small" /> },
    DOCTOR_DELETED: { label: 'حذف دكتور', color: 'error', icon: <PersonRemoveIcon fontSize="small" /> },
    GRADE_APPROVED: { label: 'موافقة على درجات', color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
    GRADE_REJECTED: { label: 'رفض طلب', color: 'error', icon: <CancelIcon fontSize="small" /> },
    CERTIFICATE_GENERATED: { label: 'إصدار شهادة', color: 'info', icon: <CardMembershipIcon fontSize="small" /> },
    NEWS_CREATED: { label: 'إنشاء خبر', color: 'warning', icon: <NewspaperIcon fontSize="small" /> },
};

export default function AuditLogViewer() {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchLogs();
    }, [actionFilter]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = actionFilter ? `?action=${actionFilter}` : '';
            const res = await axios.get(`/api/academic/admin/audit-logs/${params}`, { withCredentials: true });
            setLogs(res.data);
        } catch (err) {
            setError('فشل تحميل سجل التدقيق');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const formatDetails = (details) => {
        if (!details) return '—';
        const parts = [];
        if (details.title) parts.push(details.title);
        if (details.doctor_name) parts.push(`دكتور: ${details.doctor_name}`);
        if (details.level_name) parts.push(`فرقة: ${details.level_name}`);
        if (details.department) parts.push(`قسم: ${details.department}`);
        if (details.approved_count) parts.push(`عدد: ${details.approved_count}`);
        if (details.target_audience) parts.push(`الجمهور: ${details.target_audience}`);
        if (details.national_id) parts.push(`ر.ق: ${details.national_id}`);
        if (details.file_name) parts.push(`ملف: ${details.file_name}`);
        if (details.total_rows) parts.push(`صفوف: ${details.total_rows}`);
        if (details.created) parts.push(`إنشاء: ${details.created}`);
        if (parts.length > 0) return parts.join(' | ');
        return JSON.stringify(details).substring(0, 80);
    };

    // Filter logs by search text
    const filteredLogs = logs.filter(log => {
        if (!search) return true;
        const s = search.toLowerCase();
        const cfg = ACTION_CONFIG[log.action];
        return (
            (cfg?.label || '').toLowerCase().includes(s) ||
            (log.performed_by_name || '').toLowerCase().includes(s) ||
            (log.entity_type || '').toLowerCase().includes(s) ||
            formatDetails(log.details).toLowerCase().includes(s)
        );
    });

    // Stats
    const statItems = [
        { label: 'إجمالي السجلات', value: logs.length, color: '#1a237e' },
        { label: 'رفع بيانات', value: logs.filter(l => l.action?.includes('UPLOAD')).length, color: '#2196F3' },
        { label: 'موافقات / رفض', value: logs.filter(l => l.action?.includes('APPROVED') || l.action?.includes('REJECTED')).length, color: '#4CAF50' },
        { label: 'حذف', value: logs.filter(l => l.action?.includes('DELETED')).length, color: '#E53935' },
    ];

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', pb: 6 }}>
            {/* Header */}
            <Box sx={{ background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)', pt: 4, pb: 5, mb: 4 }}>
                <Container maxWidth="xl">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <IconButton onClick={() => navigate('/admin/dashboard')} sx={{ color: '#fff' }}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Avatar sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.15)' }}>
                            <HistoryIcon sx={{ fontSize: 28 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>
                                سجل التدقيق
                            </Typography>
                            <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: 'rgba(255,255,255,0.8)' }}>
                                تتبع جميع العمليات الإدارية في النظام
                            </Typography>
                        </Box>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="xl">
                {/* Stats */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {statItems.map((s, i) => (
                        <Grid item xs={6} sm={3} key={i}>
                            <Grow in timeout={400 + i * 100}>
                                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: s.color, fontFamily: 'Cairo' }}>{s.value}</Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>{s.label}</Typography>
                                </Paper>
                            </Grow>
                        </Grid>
                    ))}
                </Grid>

                {/* Filters */}
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, mb: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <TextField
                        size="small" placeholder="بحث في السجلات..." value={search}
                        onChange={e => setSearch(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#aaa' }} /></InputAdornment> }}
                        sx={{ minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                    <FormControl size="small" sx={{ minWidth: 250 }}>
                        <InputLabel sx={{ fontFamily: 'Cairo' }}>تصفية حسب النوع</InputLabel>
                        <Select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            label="تصفية حسب النوع"
                            sx={{ fontFamily: 'Cairo', borderRadius: 3 }}
                        >
                            <MenuItem value="">الكل</MenuItem>
                            {Object.entries(ACTION_CONFIG).map(([key, cfg]) => (
                                <MenuItem key={key} value={key} sx={{ fontFamily: 'Cairo', display: 'flex', gap: 1 }}>
                                    {cfg.icon} {cfg.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Paper>

                {/* Content */}
                {loading ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ fontFamily: 'Cairo' }}>{error}</Alert>
                ) : filteredLogs.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                        <HistoryIcon sx={{ fontSize: 60, color: '#ddd', mb: 1 }} />
                        <Typography sx={{ fontFamily: 'Cairo', color: '#999' }}>لا توجد سجلات</Typography>
                    </Paper>
                ) : (
                    <Fade in={true}>
                        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#1a237e' }}>
                                        {['النوع', 'بواسطة', 'الكيان', 'التفاصيل', 'التاريخ'].map(h => (
                                            <TableCell key={h} sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>{h}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredLogs.map((log) => {
                                        const cfg = ACTION_CONFIG[log.action] || { label: log.action_display || log.action, color: 'default' };
                                        return (
                                            <TableRow key={log.id} hover sx={{ '&:hover': { bgcolor: '#f8f9ff' } }}>
                                                <TableCell>
                                                    <Chip label={cfg.label} color={cfg.color} size="small" icon={cfg.icon}
                                                        sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} />
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Avatar sx={{ width: 28, height: 28, bgcolor: '#e3f2fd' }}>
                                                            <PersonIcon sx={{ fontSize: 16, color: '#1976d2' }} />
                                                        </Avatar>
                                                        <Typography variant="body2" sx={{ fontFamily: 'Cairo' }}>
                                                            {log.performed_by_name}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontFamily: 'Cairo' }}>
                                                        {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Tooltip title={log.details ? JSON.stringify(log.details, null, 2) : ''} arrow>
                                                        <Typography variant="body2" sx={{ fontFamily: 'Cairo', maxWidth: 350, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                                                            {formatDetails(log.details)}
                                                        </Typography>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                                        {formatDate(log.created_at)}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Fade>
                )}
            </Container>
        </Box>
    );
}
