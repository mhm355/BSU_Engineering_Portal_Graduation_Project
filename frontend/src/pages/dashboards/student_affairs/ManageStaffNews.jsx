import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Paper, Button, TextField, Alert, Grid, Card, CardContent,
    CardActions, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, Select,
    MenuItem, Chip, IconButton, Avatar, CircularProgress, Fade, Grow
} from '@mui/material';
import { keyframes } from '@mui/system';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import CampaignIcon from '@mui/icons-material/Campaign';
import GroupsIcon from '@mui/icons-material/Groups';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import PublishIcon from '@mui/icons-material/Publish';
import DraftsIcon from '@mui/icons-material/Drafts';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

export default function ManageStaffNews() {
    const navigate = useNavigate();
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
        status: 'PUBLISHED',
        image: null
    });

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const response = await axios.get('/api/content/news/', { withCredentials: true });
            const userNews = user?.role === 'ADMIN'
                ? response.data
                : response.data.filter(n => n.created_by === user?.id || ['STAFF', 'STUDENT_AFFAIRS', 'STAFF_AFFAIRS'].includes(n.creator_role));
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
                status: newsItem.status || 'PUBLISHED',
                image: null
            });
        } else {
            setEditingNews(null);
            setFormData({
                title: '',
                content: '',
                target_audience: 'ALL',
                status: 'PUBLISHED',
                image: null
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingNews(null);
        setFormData({ title: '', content: '', target_audience: 'ALL', status: 'PUBLISHED', image: null });
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, image: e.target.files[0] });
        }
    };

    const handleSubmit = async () => {
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('content', formData.content);
            data.append('target_audience', formData.target_audience);
            data.append('status', formData.status);
            if (formData.image) {
                data.append('image', formData.image);
            }

            const config = {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            };

            if (editingNews) {
                await axios.put(`/api/content/news/${editingNews.id}/`, data, config);
                setSuccess('تم تحديث الخبر بنجاح');
            } else {
                await axios.post('/api/content/news/', data, config);
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

    const getAudienceIcon = (audience) => {
        if (audience === 'STUDENTS') return <SchoolIcon sx={{ fontSize: 18 }} />;
        if (audience === 'DOCTORS') return <PersonIcon sx={{ fontSize: 18 }} />;
        return <GroupsIcon sx={{ fontSize: 18 }} />;
    };

    const getAudienceColor = (audience) => {
        if (audience === 'STUDENTS') return '#2196F3';
        if (audience === 'DOCTORS') return '#9C27B0';
        return '#4CAF50';
    };

    const getStatusLabel = (status) => {
        const labels = { 'DRAFT': 'مسودة', 'PUBLISHED': 'منشور' };
        return labels[status] || status;
    };

    // Stats
    const publishedCount = news.filter(n => n.status === 'PUBLISHED').length;
    const draftCount = news.filter(n => n.status === 'DRAFT').length;

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', pb: 6 }}>
            {/* Hero Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)',
                    pt: 4,
                    pb: 6,
                    mb: 4,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', animation: `${float} 6s ease-in-out infinite` }} />
                <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', animation: `${float} 8s ease-in-out infinite`, animationDelay: '2s' }} />

                <Container maxWidth="lg">
                    <Fade in={true} timeout={800}>
                        <Box>
                            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/student-affairs/dashboard')} sx={{ color: '#fff', mb: 2, fontFamily: 'Cairo', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                                العودة للوحة التحكم
                            </Button>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                                        <NewspaperIcon sx={{ fontSize: 45, color: '#fff' }} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                            إدارة الأخبار والإعلانات
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: 'rgba(255,255,255,0.9)' }}>
                                            إنشاء وتعديل وحذف الأخبار والإعلانات
                                        </Typography>
                                    </Box>
                                </Box>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<AddIcon />}
                                    onClick={() => handleOpenDialog()}
                                    sx={{
                                        fontFamily: 'Cairo',
                                        fontWeight: 'bold',
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        bgcolor: '#fff',
                                        color: '#E91E63',
                                        borderRadius: 3,
                                        boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                                        '&:hover': { bgcolor: '#f5f5f5', animation: `${pulse} 0.3s ease-in-out` }
                                    }}
                                >
                                    إضافة خبر جديد
                                </Button>
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Container maxWidth="lg">
                {/* Stats Row */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={4}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 60, height: 60, background: 'linear-gradient(135deg, #E91E63, #F06292)' }}>
                                <CampaignIcon sx={{ fontSize: 30 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{news.length}</Typography>
                                <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>إجمالي الأخبار</Typography>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 60, height: 60, background: 'linear-gradient(135deg, #4CAF50, #8BC34A)' }}>
                                <PublishIcon sx={{ fontSize: 30 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{publishedCount}</Typography>
                                <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>منشور</Typography>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 60, height: 60, background: 'linear-gradient(135deg, #FF9800, #FFB74D)' }}>
                                <DraftsIcon sx={{ fontSize: 30 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{draftCount}</Typography>
                                <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>مسودة</Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem' }} onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem' }} onClose={() => setSuccess('')}>{success}</Alert>}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={50} /></Box>
                ) : news.length === 0 ? (
                    <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 4, boxShadow: '0 4px 25px rgba(0,0,0,0.1)' }}>
                        <Avatar sx={{ width: 100, height: 100, mx: 'auto', mb: 3, bgcolor: '#f5f5f5' }}>
                            <NewspaperIcon sx={{ fontSize: 50, color: '#bbb' }} />
                        </Avatar>
                        <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#666', mb: 2 }}>
                            لا توجد أخبار بعد
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#999', mb: 3 }}>
                            اضغط على "إضافة خبر جديد" لإنشاء أول خبر
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                            sx={{
                                fontFamily: 'Cairo',
                                fontWeight: 'bold',
                                px: 4,
                                py: 1.5,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #E91E63, #F06292)'
                            }}
                        >
                            إضافة خبر جديد
                        </Button>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {news.map((item, index) => (
                            <Grid item xs={12} md={6} key={item.id}>
                                <Grow in={true} timeout={400 + index * 100}>
                                    <Card elevation={0} sx={{
                                        borderRadius: 4,
                                        boxShadow: '0 4px 25px rgba(0,0,0,0.1)',
                                        transition: 'all 0.3s ease',
                                        border: '2px solid transparent',
                                        '&:hover': {
                                            transform: 'translateY(-5px)',
                                            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                                            borderColor: '#E91E63'
                                        }
                                    }}>
                                        <CardContent sx={{ p: 4 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar sx={{ width: 50, height: 50, background: `linear-gradient(135deg, ${getAudienceColor(item.target_audience)}, ${getAudienceColor(item.target_audience)}88)` }}>
                                                        {getAudienceIcon(item.target_audience)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                                            {item.title}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                            <AccessTimeIcon sx={{ fontSize: 16, color: '#999' }} />
                                                            <Typography variant="caption" sx={{ fontFamily: 'Cairo', color: '#999' }}>
                                                                {['STAFF', 'STUDENT_AFFAIRS', 'STAFF_AFFAIRS'].includes(item.creator_role) ? 'شؤون الطلاب' : 'الإدارة'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Chip
                                                        icon={getAudienceIcon(item.target_audience)}
                                                        label={getAudienceLabel(item.target_audience)}
                                                        size="small"
                                                        sx={{
                                                            fontFamily: 'Cairo',
                                                            fontWeight: 'bold',
                                                            bgcolor: `${getAudienceColor(item.target_audience)}20`,
                                                            color: getAudienceColor(item.target_audience),
                                                            '& .MuiChip-icon': { color: getAudienceColor(item.target_audience) }
                                                        }}
                                                    />
                                                    <Chip
                                                        icon={item.status === 'PUBLISHED' ? <PublishIcon sx={{ fontSize: 16 }} /> : <DraftsIcon sx={{ fontSize: 16 }} />}
                                                        label={getStatusLabel(item.status)}
                                                        size="small"
                                                        sx={{
                                                            fontFamily: 'Cairo',
                                                            fontWeight: 'bold',
                                                            bgcolor: item.status === 'PUBLISHED' ? '#e8f5e9' : '#fff3e0',
                                                            color: item.status === 'PUBLISHED' ? '#4CAF50' : '#FF9800',
                                                            '& .MuiChip-icon': { color: item.status === 'PUBLISHED' ? '#4CAF50' : '#FF9800' }
                                                        }}
                                                    />
                                                </Box>
                                            </Box>

                                            {item.image && (
                                                <Box sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
                                                    <img
                                                        src={item.image}
                                                        alt={item.title}
                                                        style={{ width: '100%', height: 200, objectFit: 'cover' }}
                                                    />
                                                </Box>
                                            )}

                                            <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: '#fafafa', mb: 2 }}>
                                                <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#555', lineHeight: 1.8 }}>
                                                    {item.content.length > 200 ? item.content.substring(0, 200) + '...' : item.content}
                                                </Typography>
                                            </Paper>
                                        </CardContent>
                                        <CardActions sx={{ px: 4, pb: 3, justifyContent: 'flex-end' }}>
                                            <Button
                                                variant="outlined"
                                                startIcon={<EditIcon />}
                                                onClick={() => handleOpenDialog(item)}
                                                sx={{
                                                    fontFamily: 'Cairo',
                                                    borderRadius: 2,
                                                    borderColor: '#2196F3',
                                                    color: '#2196F3',
                                                    '&:hover': { bgcolor: '#e3f2fd', borderColor: '#1976D2' }
                                                }}
                                            >
                                                تعديل
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => handleDelete(item.id)}
                                                sx={{
                                                    fontFamily: 'Cairo',
                                                    borderRadius: 2,
                                                    borderColor: '#f44336',
                                                    color: '#f44336',
                                                    '&:hover': { bgcolor: '#ffebee', borderColor: '#d32f2f' }
                                                }}
                                            >
                                                حذف
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grow>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Add/Edit Dialog */}
                <Dialog
                    open={dialogOpen}
                    onClose={handleCloseDialog}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: 4 } }}
                >
                    <DialogTitle sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee', pb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: '#E91E63' }}>
                                {editingNews ? <EditIcon /> : <AddIcon />}
                            </Avatar>
                            {editingNews ? 'تعديل الخبر' : 'إضافة خبر جديد'}
                        </Box>
                        <IconButton onClick={handleCloseDialog}><CloseIcon /></IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ pt: 4 }}>
                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1.5, color: '#1a2744' }}>
                            العنوان
                        </Typography>
                        <TextField
                            fullWidth
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="اكتب عنوان الخبر..."
                            sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '1.2rem', bgcolor: '#fafafa' } }}
                        />

                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1.5, color: '#1a2744' }}>
                            المحتوى
                        </Typography>
                        <TextField
                            fullWidth
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="اكتب محتوى الخبر..."
                            multiline
                            rows={5}
                        />

                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1.5, color: '#1a2744' }}>
                            صورة الخبر (اختياري)
                        </Typography>
                        <TextField
                            type="file"
                            fullWidth
                            onChange={handleImageChange}
                            InputProps={{
                                inputProps: { accept: 'image/*' }
                            }}
                            sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fafafa' } }}
                        />

                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1.5, color: '#1a2744' }}>
                                    الجمهور المستهدف
                                </Typography>
                                <FormControl fullWidth variant="outlined">
                                    <Select
                                        value={formData.target_audience}
                                        onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                                        sx={{ borderRadius: 2, fontSize: '1.1rem', bgcolor: '#fafafa' }}
                                    >
                                        <MenuItem value="ALL" sx={{ fontSize: '1.1rem', py: 1.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><GroupsIcon /> الجميع</Box>
                                        </MenuItem>
                                        <MenuItem value="STUDENTS" sx={{ fontSize: '1.1rem', py: 1.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><SchoolIcon /> الطلاب فقط</Box>
                                        </MenuItem>
                                        <MenuItem value="DOCTORS" sx={{ fontSize: '1.1rem', py: 1.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><PersonIcon /> الأساتذة فقط</Box>
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1.5, color: '#1a2744' }}>
                                    الحالة
                                </Typography>
                                <FormControl fullWidth variant="outlined">
                                    <Select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        sx={{ borderRadius: 2, fontSize: '1.1rem', bgcolor: '#fafafa' }}
                                    >
                                        <MenuItem value="DRAFT" sx={{ fontSize: '1.1rem', py: 1.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><DraftsIcon /> مسودة</Box>
                                        </MenuItem>
                                        <MenuItem value="PUBLISHED" sx={{ fontSize: '1.1rem', py: 1.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><PublishIcon /> منشور</Box>
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ px: 4, py: 3, borderTop: '1px solid #eee' }}>
                        <Button
                            onClick={handleCloseDialog}
                            variant="outlined"
                            size="large"
                            sx={{ fontFamily: 'Cairo', borderRadius: 2, px: 4 }}
                        >
                            إلغاء
                        </Button>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleSubmit}
                            disabled={!formData.title || !formData.content}
                            sx={{
                                fontFamily: 'Cairo',
                                fontWeight: 'bold',
                                borderRadius: 2,
                                px: 4,
                                background: 'linear-gradient(135deg, #E91E63, #F06292)',
                                '&:disabled': { background: '#ccc' }
                            }}
                        >
                            {editingNews ? 'تحديث الخبر' : 'إضافة الخبر'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}
