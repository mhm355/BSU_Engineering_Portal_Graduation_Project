import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Paper, Button, TextField, Alert,
    CircularProgress, FormControl, InputLabel, Select, MenuItem,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
    Checkbox, FormControlLabel, FormGroup
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CampaignIcon from '@mui/icons-material/Campaign';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ROLE_OPTIONS = [
    { value: 'ALL', label: 'الجميع' },
    { value: 'STUDENT', label: 'الطلاب' },
    { value: 'DOCTOR', label: 'الدكاترة' },
    { value: 'STUDENT_AFFAIRS', label: 'شئون الطلاب' },
    { value: 'STAFF_AFFAIRS', label: 'شئون العاملين' },
];

const PRIORITY_OPTIONS = [
    { value: 'LOW', label: 'منخفضة', color: '#4caf50' },
    { value: 'NORMAL', label: 'عادية', color: '#2196f3' },
    { value: 'HIGH', label: 'مرتفعة', color: '#ff9800' },
    { value: 'URGENT', label: 'عاجلة', color: '#f44336' },
];

export default function Announcements() {
    const navigate = useNavigate();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        title: '',
        content: '',
        target_roles: ['ALL'],
        priority: 'NORMAL',
        is_active: true,
    });

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/academic/announcements/', config);
            setAnnouncements(res.data);
        } catch (err) {
            setError('فشل في تحميل الإعلانات');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!form.title || !form.content) {
            setError('يرجى ملء العنوان والمحتوى');
            return;
        }

        setSaving(true);
        setError('');
        try {
            await axios.post('/api/academic/announcements/', {
                ...form,
                target_roles: form.target_roles.join(','),
            }, config);
            setSuccess('تم إنشاء الإعلان بنجاح');
            setOpenDialog(false);
            setForm({ title: '', content: '', target_roles: ['ALL'], priority: 'NORMAL', is_active: true });
            fetchAnnouncements();
        } catch (err) {
            setError(err.response?.data?.error || 'فشل في إنشاء الإعلان');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
        try {
            await axios.delete(`/api/academic/announcements/?id=${id}`, config);
            setSuccess('تم حذف الإعلان');
            fetchAnnouncements();
        } catch (err) {
            setError('فشل في حذف الإعلان');
        }
    };

    const handleRoleToggle = (role) => {
        setForm(prev => {
            const roles = prev.target_roles.includes(role)
                ? prev.target_roles.filter(r => r !== role)
                : [...prev.target_roles.filter(r => r !== 'ALL'), role];
            if (role === 'ALL') return { ...prev, target_roles: ['ALL'] };
            if (roles.length === 0) return { ...prev, target_roles: ['ALL'] };
            return { ...prev, target_roles: roles };
        });
    };

    const getPriorityChip = (priority) => {
        const opt = PRIORITY_OPTIONS.find(p => p.value === priority) || PRIORITY_OPTIONS[1];
        return <Chip label={opt.label} size="small" sx={{ bgcolor: opt.color, color: '#fff', fontFamily: 'Cairo' }} />;
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/admin/dashboard')}
                sx={{ mb: 2, fontFamily: 'Cairo' }}
            >
                عودة للوحة التحكم
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                    <CampaignIcon sx={{ mr: 1, verticalAlign: 'bottom', fontSize: 36 }} />
                    إدارة الإعلانات
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                    sx={{ fontFamily: 'Cairo' }}
                >
                    إعلان جديد
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2, fontFamily: 'Cairo' }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2, fontFamily: 'Cairo' }} onClose={() => setSuccess('')}>{success}</Alert>}

            {loading ? (
                <Box sx={{ textAlign: 'center', py: 5 }}><CircularProgress /></Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#0A2342' }}>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>العنوان</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>الأولوية</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>الفئة المستهدفة</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>التاريخ</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>الحالة</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>إجراء</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {announcements.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} sx={{ textAlign: 'center', fontFamily: 'Cairo', py: 4 }}>
                                        لا توجد إعلانات
                                    </TableCell>
                                </TableRow>
                            ) : announcements.map(ann => (
                                <TableRow key={ann.id} hover>
                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{ann.title}</TableCell>
                                    <TableCell>{getPriorityChip(ann.priority)}</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo' }}>
                                        {ann.target_roles === 'ALL' ? 'الجميع' :
                                            ann.target_roles.split(',').map(r =>
                                                ROLE_OPTIONS.find(o => o.value === r)?.label || r
                                            ).join(', ')
                                        }
                                    </TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', direction: 'ltr' }}>
                                        {new Date(ann.created_at).toLocaleDateString('ar-EG')}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={ann.is_active ? 'نشط' : 'غير نشط'}
                                            size="small"
                                            color={ann.is_active ? 'success' : 'default'}
                                            sx={{ fontFamily: 'Cairo' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton color="error" onClick={() => handleDelete(ann.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Create Announcement Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>إنشاء إعلان جديد</DialogTitle>
                <DialogContent>
                    <TextField
                        label="عنوان الإعلان"
                        value={form.title}
                        onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                        fullWidth
                        sx={{ mt: 1, mb: 2 }}
                        InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                    />
                    <TextField
                        label="محتوى الإعلان"
                        value={form.content}
                        onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                        fullWidth
                        multiline
                        rows={4}
                        sx={{ mb: 2 }}
                        InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                    />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel sx={{ fontFamily: 'Cairo' }}>الأولوية</InputLabel>
                        <Select
                            value={form.priority}
                            onChange={(e) => setForm(prev => ({ ...prev, priority: e.target.value }))}
                            label="الأولوية"
                        >
                            {PRIORITY_OPTIONS.map(p => (
                                <MenuItem key={p.value} value={p.value} sx={{ fontFamily: 'Cairo' }}>
                                    {p.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1 }}>الفئة المستهدفة:</Typography>
                    <FormGroup row>
                        {ROLE_OPTIONS.map(role => (
                            <FormControlLabel
                                key={role.value}
                                control={
                                    <Checkbox
                                        checked={form.target_roles.includes(role.value)}
                                        onChange={() => handleRoleToggle(role.value)}
                                    />
                                }
                                label={role.label}
                                sx={{ '& .MuiFormControlLabel-label': { fontFamily: 'Cairo' } }}
                            />
                        ))}
                    </FormGroup>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} sx={{ fontFamily: 'Cairo' }}>إلغاء</Button>
                    <Button
                        variant="contained"
                        onClick={handleCreate}
                        disabled={saving}
                        sx={{ fontFamily: 'Cairo' }}
                    >
                        {saving ? <CircularProgress size={20} /> : 'إنشاء'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
