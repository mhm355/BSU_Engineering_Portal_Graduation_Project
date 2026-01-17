import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Alert, Avatar } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

export default function ManageNews() {
    const [newsList, setNewsList] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentNews, setCurrentNews] = useState({ title: '', content: '', image: null });
    const [isEdit, setIsEdit] = useState(false);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const response = await axios.get('/api/content/news/');
            setNewsList(response.data);
        } catch (err) {
            console.error('Error fetching news:', err);
        }
    };

    const handleOpen = (news = { title: '', content: '', image: null }) => {
        setCurrentNews(news);
        setIsEdit(!!news.id);
        setOpen(true);
        setError('');
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSave = async () => {
        if (!currentNews.title || !currentNews.content) {
            setError('يرجى ملء العنوان والمحتوى.');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('title', currentNews.title);
        formData.append('content', currentNews.content);
        if (currentNews.image instanceof File) {
            formData.append('image', currentNews.image);
        }
        if (currentNews.attachment instanceof File) {
            formData.append('attachment', currentNews.attachment);
        }

        try {
            if (isEdit) {
                await axios.patch(`/api/content/news/${currentNews.id}/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true
                });
            } else {
                await axios.post('/api/content/news/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true
                });
            }
            fetchNews();
            handleClose();
        } catch (err) {
            setError('حدث خطأ أثناء الحفظ.');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الخبر؟')) {
            try {
                await axios.delete(`/api/content/news/${id}/`, { withCredentials: true });
                fetchNews();
            } catch (err) {
                console.error('Error deleting news:', err);
            }
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                    إدارة الأخبار
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon sx={{ ml: 1 }} />}
                    onClick={() => handleOpen()}
                    sx={{ fontFamily: 'Cairo', fontWeight: 'bold', bgcolor: '#0A2342' }}
                >
                    إضافة خبر جديد
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'right' }}>الصورة</TableCell>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'right' }}>العنوان</TableCell>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'right' }}>تاريخ النشر</TableCell>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center' }}>الإجراءات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {newsList.map((news) => (
                            <TableRow key={news.id}>
                                <TableCell>
                                    {news.image && <Avatar src={news.image} variant="rounded" sx={{ width: 50, height: 50 }} />}
                                </TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>{news.title}</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>
                                    {new Date(news.created_at).toLocaleDateString('ar-EG')}
                                </TableCell>
                                <TableCell sx={{ textAlign: 'center' }}>
                                    <IconButton color="primary" onClick={() => handleOpen(news)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(news.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add/Edit Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>
                    {isEdit ? 'تعديل خبر' : 'إضافة خبر جديد'}
                </DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2, fontFamily: 'Cairo' }}>{error}</Alert>}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="عنوان الخبر"
                            fullWidth
                            value={currentNews.title}
                            onChange={(e) => setCurrentNews({ ...currentNews, title: e.target.value })}
                            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                        />
                        <TextField
                            label="محتوى الخبر"
                            fullWidth
                            multiline
                            rows={4}
                            value={currentNews.content}
                            onChange={(e) => setCurrentNews({ ...currentNews, content: e.target.value })}
                            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                        />
                        <Button
                            variant="outlined"
                            component="label"
                            sx={{ fontFamily: 'Cairo' }}
                        >
                            {currentNews.image instanceof File ? currentNews.image.name : 'رفع صورة'}
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={(e) => setCurrentNews({ ...currentNews, image: e.target.files[0] })}
                            />
                        </Button>
                        <Button
                            variant="outlined"
                            component="label"
                            sx={{ fontFamily: 'Cairo' }}
                        >
                            {currentNews.attachment instanceof File ? currentNews.attachment.name : 'رفع ملف مرفق (PDF, Excel, Word)'}
                            <input
                                type="file"
                                hidden
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                                onChange={(e) => setCurrentNews({ ...currentNews, attachment: e.target.files[0] })}
                            />
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'flex-start', p: 2 }}>
                    <Button onClick={handleClose} sx={{ fontFamily: 'Cairo' }}>إلغاء</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={uploading}
                        sx={{ fontFamily: 'Cairo', bgcolor: '#0A2342' }}
                    >
                        {uploading ? 'جاري الحفظ...' : 'حفظ'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
