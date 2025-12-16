import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Button, TextField, Alert, Grid, Card, CardContent, CardActions, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Chip, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

export default function ManageStaffNews() {
    const { user } = useAuth();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingNews, setEditingNews] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        target_audience: 'ALL',
        status: 'PUBLISHED'
    });

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const response = await axios.get('/api/content/news/', { withCredentials: true });
            // Filter to show only news created by current user or if admin, show all
            const userNews = user?.role === 'ADMIN'
                ? response.data
                : response.data.filter(n => n.created_by === user?.id || n.creator_role === 'STAFF');
            setNews(userNews);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching news:', err);
            setError('فشل تحميل الأخبار');
            setLoading(false);
        }
    };

    const handleOpenDialog = (newsItem = null) => {
        if (newsItem) {
            setEditingNews(newsItem);
            setFormData({
                title: newsItem.title,
                content: newsItem.content,
                target_audience: newsItem.target_audience || 'ALL',
                status: newsItem.status || 'PUBLISHED'
            });
        } else {
            setEditingNews(null);
            setFormData({
                title: '',
                content: '',
                target_audience: 'ALL',
                status: 'PUBLISHED'
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingNews(null);
        setFormData({ title: '', content: '', target_audience: 'ALL', status: 'PUBLISHED' });
    };

    const handleSubmit = async () => {
        try {
            if (editingNews) {
                await axios.put(`/api/content/news/${editingNews.id}/`, formData, { withCredentials: true });
                setSuccess('تم تحديث الخبر بنجاح');
            } else {
                await axios.post('/api/content/news/', formData, { withCredentials: true });
                setSuccess('تم إضافة الخبر بنجاح');
            }
            handleCloseDialog();
            fetchNews();
        } catch (err) {
            console.error('Error saving news:', err);
            setError('فشل حفظ الخبر');
        }
    };

    const handleDelete = async (newsId) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الخبر؟')) return;
        try {
            await axios.delete(`/api/content/news/${newsId}/`, { withCredentials: true });
            setSuccess('تم حذف الخبر بنجاح');
            fetchNews();
        } catch (err) {
            console.error('Error deleting news:', err);
            setError('فشل حذف الخبر');
        }
    };

    const getAudienceLabel = (audience) => {
        const labels = { 'ALL': 'الجميع', 'STUDENTS': 'الطلاب', 'DOCTORS': 'الأساتذة' };
        return labels[audience] || audience;
    };

    const getStatusLabel = (status) => {
        const labels = { 'DRAFT': 'مسودة', 'PUBLISHED': 'منشور' };
        return labels[status] || status;
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button onClick={() => window.history.back()} sx={{ mb: 2, fontFamily: 'Cairo' }}>← عودة</Button>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                    إدارة الأخبار والإعلانات
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{ fontFamily: 'Cairo' }}
                >
                    إضافة خبر جديد
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2, fontFamily: 'Cairo' }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2, fontFamily: 'Cairo' }} onClose={() => setSuccess('')}>{success}</Alert>}

            {loading ? (
                <Typography sx={{ fontFamily: 'Cairo' }}>جاري التحميل...</Typography>
            ) : news.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography sx={{ fontFamily: 'Cairo' }}>لا توجد أخبار. اضغط على "إضافة خبر جديد" لإنشاء خبر.</Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {news.map((item) => (
                        <Grid item xs={12} md={6} key={item.id}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                            {item.title}
                                        </Typography>
                                        <Box>
                                            <Chip
                                                label={getAudienceLabel(item.target_audience)}
                                                size="small"
                                                color="primary"
                                                sx={{ mr: 1, fontFamily: 'Cairo' }}
                                            />
                                            <Chip
                                                label={getStatusLabel(item.status)}
                                                size="small"
                                                color={item.status === 'PUBLISHED' ? 'success' : 'default'}
                                                sx={{ fontFamily: 'Cairo' }}
                                            />
                                        </Box>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontFamily: 'Cairo', mb: 2 }}>
                                        {item.content.length > 150 ? item.content.substring(0, 150) + '...' : item.content}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary" sx={{ fontFamily: 'Cairo' }}>
                                        المصدر: {item.creator_role === 'STAFF' ? 'شؤون الطلاب' : 'الإدارة'}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <IconButton color="primary" onClick={() => handleOpenDialog(item)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(item.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontFamily: 'Cairo' }}>
                    {editingNews ? 'تعديل الخبر' : 'إضافة خبر جديد'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="العنوان"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        sx={{ mt: 2, mb: 2 }}
                        InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                    />
                    <TextField
                        fullWidth
                        label="المحتوى"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        multiline
                        rows={4}
                        sx={{ mb: 2 }}
                        InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                    />
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel sx={{ fontFamily: 'Cairo' }}>الجمهور المستهدف</InputLabel>
                                <Select
                                    value={formData.target_audience}
                                    label="الجمهور المستهدف"
                                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                                >
                                    <MenuItem value="ALL" sx={{ fontFamily: 'Cairo' }}>الجميع</MenuItem>
                                    <MenuItem value="STUDENTS" sx={{ fontFamily: 'Cairo' }}>الطلاب فقط</MenuItem>
                                    <MenuItem value="DOCTORS" sx={{ fontFamily: 'Cairo' }}>الأساتذة فقط</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel sx={{ fontFamily: 'Cairo' }}>الحالة</InputLabel>
                                <Select
                                    value={formData.status}
                                    label="الحالة"
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <MenuItem value="DRAFT" sx={{ fontFamily: 'Cairo' }}>مسودة</MenuItem>
                                    <MenuItem value="PUBLISHED" sx={{ fontFamily: 'Cairo' }}>منشور</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} sx={{ fontFamily: 'Cairo' }}>إلغاء</Button>
                    <Button variant="contained" onClick={handleSubmit} sx={{ fontFamily: 'Cairo' }}>
                        {editingNews ? 'تحديث' : 'إضافة'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
