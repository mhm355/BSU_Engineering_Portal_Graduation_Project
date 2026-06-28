import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Alert, Avatar, FormControl, Select, MenuItem } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { sanitizeFileUrl } from '../../../utils/urlHelper';
export default function ManageNews() {
    const [newsList, setNewsList] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentNews, setCurrentNews] = useState({ title: '', content: '', image: null, target_audience: 'ALL', new_images: [], new_attachments: [], additional_images: [], additional_attachments: [] });
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

    const handleOpen = (news = { title: '', content: '', image: null, additional_images: [], additional_attachments: [] }) => {
        setCurrentNews({ ...news, new_images: [], new_attachments: [] });
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
        formData.append('target_audience', currentNews.target_audience || 'ALL');
        if (currentNews.image instanceof File) {
            formData.append('image', currentNews.image);
        }
        if (currentNews.attachment instanceof File) {
            formData.append('attachment', currentNews.attachment);
        }
        if (currentNews.new_images) {
            Array.from(currentNews.new_images).forEach(file => formData.append('new_images', file));
        }
        if (currentNews.new_attachments) {
            Array.from(currentNews.new_attachments).forEach(file => formData.append('new_attachments', file));
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

    const handleDeleteMedia = async (mediaType, mediaId) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المرفق؟')) {
            try {
                await axios.delete(`/api/content/news/${currentNews.id}/delete_media/${mediaType}/${mediaId}/`, { withCredentials: true });
                // Update local state
                if (mediaType === 'image') {
                    setCurrentNews({ ...currentNews, additional_images: currentNews.additional_images.filter(img => img.id !== mediaId) });
                } else {
                    setCurrentNews({ ...currentNews, additional_attachments: currentNews.additional_attachments.filter(att => att.id !== mediaId) });
                }
                fetchNews(); // Refresh list to get updated data
            } catch (err) {
                console.error('Error deleting media:', err);
                setError('فشل في حذف المرفق.');
            }
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
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1E293B' }}>
                    الأخبار العامة
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon sx={{ ml: 1 }} />}
                    onClick={() => handleOpen()}
                    sx={{ bgcolor: '#4F46E5', fontFamily: 'Cairo', fontWeight: 'bold', borderRadius: 3 }}
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
                                    {news.image && <Avatar src={sanitizeFileUrl(news.image)} variant="rounded" sx={{ width: 50, height: 50 }} />}
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
                        {/* Primary Image Upload */}
                        <Button variant="outlined" component="label" sx={{ fontFamily: 'Cairo' }}>
                            {currentNews.image instanceof File ? currentNews.image.name : 'رفع صورة رئيسية'}
                            <input type="file" hidden accept="image/*" onChange={(e) => setCurrentNews({ ...currentNews, image: e.target.files[0] })} />
                        </Button>
                        
                        {/* Multiple Additional Images Upload */}
                        <Button variant="outlined" component="label" sx={{ fontFamily: 'Cairo' }}>
                            {currentNews.new_images?.length ? `تم اختيار ${currentNews.new_images.length} صور إضافية` : 'رفع صور إضافية'}
                            <input type="file" hidden multiple accept="image/*" onChange={(e) => setCurrentNews({ ...currentNews, new_images: e.target.files })} />
                        </Button>
                        {/* Display existing additional images */}
                        {isEdit && currentNews.additional_images?.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                {currentNews.additional_images.map(img => (
                                    <Box key={img.id} sx={{ position: 'relative' }}>
                                        <Avatar src={sanitizeFileUrl(img.image)} variant="rounded" sx={{ width: 60, height: 60 }} />
                                        <IconButton size="small" color="error" sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'white' }} onClick={() => handleDeleteMedia('image', img.id)}>
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                        )}

                        {/* Primary Attachment Upload */}
                        <Button variant="outlined" component="label" sx={{ fontFamily: 'Cairo' }}>
                            {currentNews.attachment instanceof File ? currentNews.attachment.name : 'رفع ملف مرفق رئيسي (PDF, Excel, Word)'}
                            <input type="file" hidden accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" onChange={(e) => setCurrentNews({ ...currentNews, attachment: e.target.files[0] })} />
                        </Button>

                        {/* Multiple Additional Attachments Upload */}
                        <Button variant="outlined" component="label" sx={{ fontFamily: 'Cairo' }}>
                            {currentNews.new_attachments?.length ? `تم اختيار ${currentNews.new_attachments.length} ملفات إضافية` : 'رفع ملفات مرفقة إضافية'}
                            <input type="file" hidden multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" onChange={(e) => setCurrentNews({ ...currentNews, new_attachments: e.target.files })} />
                        </Button>
                        {/* Display existing additional attachments */}
                        {isEdit && currentNews.additional_attachments?.length > 0 && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                                {currentNews.additional_attachments.map(att => (
                                    <Box key={att.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" sx={{ fontFamily: 'Cairo', flexGrow: 1 }}>{att.file.split('/').pop()}</Typography>
                                        <IconButton size="small" color="error" onClick={() => handleDeleteMedia('attachment', att.id)}>
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                        )}
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', mb: 1 }}>الجمهور المستهدف</Typography>
                            <Select
                                value={currentNews.target_audience || 'ALL'}
                                onChange={(e) => setCurrentNews({ ...currentNews, target_audience: e.target.value })}
                                sx={{ fontFamily: 'Cairo' }}
                            >
                                <MenuItem value="ALL">الجميع</MenuItem>
                                <MenuItem value="STUDENTS">الطلاب فقط</MenuItem>
                                <MenuItem value="DOCTORS">الأساتذة فقط</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'flex-start', p: 2 }}>
                    <Button onClick={handleClose} sx={{ fontFamily: 'Cairo' }}>إلغاء</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={uploading}
                        sx={{ fontFamily: 'Cairo', bgcolor: '#4F46E5' }}
                    >
                        {uploading ? 'جاري الحفظ...' : 'حفظ'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
