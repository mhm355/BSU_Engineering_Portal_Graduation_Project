import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, IconButton, Button, TextField, MenuItem,
    Dialog, DialogTitle, DialogContent, DialogActions, Alert, Avatar,
    Fade, Grow, CircularProgress, Tooltip
} from '@mui/material';
import MailIcon from '@mui/icons-material/Mail';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FilterListIcon from '@mui/icons-material/FilterList';
import InboxIcon from '@mui/icons-material/Inbox';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const INQUIRY_LABELS = {
    general: 'استفسار عام',
    admission: 'القبول والتسجيل',
    academic: 'الشؤون الأكاديمية',
    technical: 'الدعم التقني',
    complaint: 'شكوى أو اقتراح',
    other: 'أخرى',
};

const INQUIRY_COLORS = {
    general: '#2196F3',
    admission: '#4CAF50',
    academic: '#FF9800',
    technical: '#9C27B0',
    complaint: '#F44336',
    other: '#607D8B',
};

export default function ComplaintsDashboard() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [readFilter, setReadFilter] = useState('');
    const [selectedMsg, setSelectedMsg] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const config = { withCredentials: true };

    useEffect(() => {
        fetchMessages();
    }, [filter, readFilter]);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            let url = '/api/academic/contact/';
            const params = [];
            if (filter) params.push(`inquiry_type=${filter}`);
            if (readFilter !== '') params.push(`is_read=${readFilter}`);
            if (params.length) url += '?' + params.join('&');

            const res = await axios.get(url, config);
            setMessages(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setError('فشل في تحميل الرسائل');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id, isRead) => {
        try {
            await axios.patch('/api/academic/contact/', { id, is_read: isRead }, config);
            setSuccess(isRead ? 'تم تعليم الرسالة كمقروءة' : 'تم إلغاء تعليم الرسالة');
            fetchMessages();
            if (selectedMsg?.id === id) setSelectedMsg({ ...selectedMsg, is_read: isRead });
        } catch (err) {
            setError('فشل في تحديث حالة الرسالة');
        }
    };

    const unreadCount = messages.filter(m => !m.is_read).length;

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', pb: 6 }}>
            {/* Header */}
            <Box sx={{ background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)', pt: 4, pb: 6, mb: 4 }}>
                <Container maxWidth="xl">
                    <Fade in={true} timeout={800}>
                        <Box>
                            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/dashboard')}
                                sx={{ color: '#fff', mb: 2, fontFamily: 'Cairo', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                                العودة للوحة التحكم
                            </Button>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Avatar sx={{ width: 70, height: 70, bgcolor: 'rgba(255,255,255,0.2)' }}>
                                    <MailIcon sx={{ fontSize: 40, color: '#fff' }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>
                                        الرسائل والشكاوى
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
                                        <Chip label={`الكل: ${messages.length}`} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontFamily: 'Cairo' }} />
                                        <Chip label={`غير مقروءة: ${unreadCount}`} sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: '#fff', fontFamily: 'Cairo', fontWeight: 'bold' }} />
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Container maxWidth="xl">
                {error && <Alert severity="error" sx={{ mb: 2, fontFamily: 'Cairo' }} onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2, fontFamily: 'Cairo' }} onClose={() => setSuccess('')}>{success}</Alert>}

                {/* Filters */}
                <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <FilterListIcon sx={{ color: '#666' }} />
                    <TextField
                        select size="small" label="نوع الرسالة" value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        sx={{ minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    >
                        <MenuItem value="">الكل</MenuItem>
                        {Object.entries(INQUIRY_LABELS).map(([k, v]) => (
                            <MenuItem key={k} value={k}>{v}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select size="small" label="الحالة" value={readFilter}
                        onChange={(e) => setReadFilter(e.target.value)}
                        sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    >
                        <MenuItem value="">الكل</MenuItem>
                        <MenuItem value="false">غير مقروءة</MenuItem>
                        <MenuItem value="true">مقروءة</MenuItem>
                    </TextField>
                </Paper>

                {/* Table */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress size={50} />
                    </Box>
                ) : messages.length === 0 ? (
                    <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
                        <InboxIcon sx={{ fontSize: 80, color: '#ddd', mb: 2 }} />
                        <Typography variant="h5" sx={{ fontFamily: 'Cairo', color: '#999' }}>
                            لا توجد رسائل
                        </Typography>
                    </Paper>
                ) : (
                    <Grow in={true} timeout={400}>
                        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#d32f2f' }}>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>#</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>الاسم</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>البريد</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>النوع</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>الموضوع</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>التاريخ</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>الحالة</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>إجراءات</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {messages.map((msg, idx) => (
                                        <TableRow key={msg.id} hover
                                            sx={{ bgcolor: msg.is_read ? 'inherit' : 'rgba(244,67,54,0.04)', cursor: 'pointer' }}
                                            onClick={() => setSelectedMsg(msg)}
                                        >
                                            <TableCell>{idx + 1}</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: msg.is_read ? 400 : 'bold' }}>{msg.name}</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontSize: '0.85rem' }}>{msg.email}</TableCell>
                                            <TableCell>
                                                <Chip label={INQUIRY_LABELS[msg.inquiry_type] || msg.inquiry_type}
                                                    size="small"
                                                    sx={{ bgcolor: INQUIRY_COLORS[msg.inquiry_type] + '20', color: INQUIRY_COLORS[msg.inquiry_type], fontFamily: 'Cairo', fontWeight: 'bold' }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {msg.subject}
                                            </TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontSize: '0.85rem' }}>
                                                {new Date(msg.created_at).toLocaleDateString('ar-EG')}
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={msg.is_read ? 'مقروءة' : 'جديدة'}
                                                    size="small"
                                                    color={msg.is_read ? 'default' : 'error'}
                                                    sx={{ fontFamily: 'Cairo' }}
                                                />
                                            </TableCell>
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <Tooltip title="عرض التفاصيل">
                                                    <IconButton size="small" onClick={() => setSelectedMsg(msg)}>
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={msg.is_read ? 'تعليم كغير مقروءة' : 'تعليم كمقروءة'}>
                                                    <IconButton size="small" onClick={() => handleMarkRead(msg.id, !msg.is_read)}
                                                        color={msg.is_read ? 'default' : 'primary'}>
                                                        <MarkEmailReadIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grow>
                )}
            </Container>

            {/* Detail Dialog */}
            <Dialog open={!!selectedMsg} onClose={() => setSelectedMsg(null)} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}>
                {selectedMsg && (
                    <>
                        <DialogTitle sx={{ fontFamily: 'Cairo', fontWeight: 'bold', bgcolor: '#fafafa', borderBottom: '1px solid #eee' }}>
                            تفاصيل الرسالة
                        </DialogTitle>
                        <DialogContent sx={{ pt: 3, mt: 1 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', minWidth: 100 }}>الاسم:</Typography>
                                    <Typography sx={{ fontFamily: 'Cairo' }}>{selectedMsg.name}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', minWidth: 100 }}>البريد:</Typography>
                                    <Typography sx={{ fontFamily: 'Cairo' }}>{selectedMsg.email}</Typography>
                                </Box>
                                {selectedMsg.phone && (
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', minWidth: 100 }}>الهاتف:</Typography>
                                        <Typography sx={{ fontFamily: 'Cairo' }}>{selectedMsg.phone}</Typography>
                                    </Box>
                                )}
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', minWidth: 100 }}>النوع:</Typography>
                                    <Chip label={INQUIRY_LABELS[selectedMsg.inquiry_type]} size="small"
                                        sx={{ bgcolor: INQUIRY_COLORS[selectedMsg.inquiry_type] + '20', color: INQUIRY_COLORS[selectedMsg.inquiry_type], fontFamily: 'Cairo' }} />
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', minWidth: 100 }}>الموضوع:</Typography>
                                    <Typography sx={{ fontFamily: 'Cairo' }}>{selectedMsg.subject}</Typography>
                                </Box>
                                <Box>
                                    <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1 }}>الرسالة:</Typography>
                                    <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                                        <Typography sx={{ fontFamily: 'Cairo', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                                            {selectedMsg.message}
                                        </Typography>
                                    </Paper>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', minWidth: 100 }}>التاريخ:</Typography>
                                    <Typography sx={{ fontFamily: 'Cairo' }}>
                                        {new Date(selectedMsg.created_at).toLocaleString('ar-EG')}
                                    </Typography>
                                </Box>
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
                            <Button onClick={() => handleMarkRead(selectedMsg.id, !selectedMsg.is_read)}
                                startIcon={<MarkEmailReadIcon />}
                                sx={{ fontFamily: 'Cairo' }}>
                                {selectedMsg.is_read ? 'تعليم كغير مقروءة' : 'تعليم كمقروءة'}
                            </Button>
                            <Button onClick={() => setSelectedMsg(null)} variant="contained"
                                sx={{ fontFamily: 'Cairo', borderRadius: 2 }}>
                                إغلاق
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
}
