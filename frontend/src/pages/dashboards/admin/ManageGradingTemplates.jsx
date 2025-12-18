import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, Box, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Alert, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ManageGradingTemplates() {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [open, setOpen] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState({
        name: '',
        attendance_weight: 10,
        attendance_slots: 14,
        quizzes_weight: 10,
        quiz_count: 2,
        coursework_weight: 10,
        midterm_weight: 20,
        final_weight: 50,
        is_default: false
    });
    const [isEdit, setIsEdit] = useState(false);

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await axios.get('/api/academic/grading-templates/', config);
            setTemplates(response.data);
        } catch (err) {
            setError('فشل في تحميل قوالب التقييم');
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = (template = null) => {
        if (template) {
            setCurrentTemplate(template);
            setIsEdit(true);
        } else {
            setCurrentTemplate({
                name: '',
                attendance_weight: 10,
                attendance_slots: 14,
                quizzes_weight: 10,
                quiz_count: 2,
                coursework_weight: 10,
                midterm_weight: 20,
                final_weight: 50,
                is_default: false
            });
            setIsEdit(false);
        }
        setOpen(true);
        setError('');
    };

    const handleClose = () => {
        setOpen(false);
    };

    const getTotalWeight = () => {
        return (
            parseInt(currentTemplate.attendance_weight || 0) +
            parseInt(currentTemplate.quizzes_weight || 0) +
            parseInt(currentTemplate.coursework_weight || 0) +
            parseInt(currentTemplate.midterm_weight || 0) +
            parseInt(currentTemplate.final_weight || 0)
        );
    };

    const handleSave = async () => {
        if (!currentTemplate.name.trim()) {
            setError('يرجى إدخال اسم القالب');
            return;
        }

        if (getTotalWeight() !== 100) {
            setError(`مجموع الدرجات يجب أن يساوي 100 (الحالي: ${getTotalWeight()})`);
            return;
        }

        try {
            if (isEdit) {
                await axios.put(`/api/academic/grading-templates/${currentTemplate.id}/`, currentTemplate, config);
                setSuccess('تم تحديث القالب بنجاح');
            } else {
                await axios.post('/api/academic/grading-templates/', currentTemplate, config);
                setSuccess('تم إنشاء القالب بنجاح');
            }
            fetchTemplates();
            handleClose();
        } catch (err) {
            setError('حدث خطأ أثناء الحفظ');
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <IconButton onClick={() => navigate('/admin/dashboard')}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                    قوالب التقييم (Grading Templates)
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontFamily: 'Cairo' }}>
                        القوالب ({templates.length})
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpen()}
                        sx={{ fontFamily: 'Cairo' }}
                    >
                        إضافة قالب
                    </Button>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الاسم</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الحضور</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الكويزات</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الأعمال</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الميدتيرم</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الفاينال</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>المجموع</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الإجراءات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {templates.map((template) => (
                                <TableRow key={template.id}>
                                    <TableCell sx={{ fontFamily: 'Cairo' }}>
                                        {template.name}
                                        {template.is_default && (
                                            <Chip label="افتراضي" size="small" color="primary" sx={{ ml: 1 }} icon={<StarIcon />} />
                                        )}
                                    </TableCell>
                                    <TableCell>{template.attendance_weight}% ({template.attendance_slots} حصة)</TableCell>
                                    <TableCell>{template.quizzes_weight}% ({template.quiz_count} كويز)</TableCell>
                                    <TableCell>{template.coursework_weight}%</TableCell>
                                    <TableCell>{template.midterm_weight}%</TableCell>
                                    <TableCell>{template.final_weight}%</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={`${template.total_weight}%`}
                                            color={template.total_weight === 100 ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton color="primary" onClick={() => handleOpen(template)}>
                                            <EditIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {templates.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                        <Typography sx={{ fontFamily: 'Cairo', color: 'text.secondary' }}>
                                            لا توجد قوالب - قم بإضافة قالب جديد
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
                    {isEdit ? 'تعديل القالب' : 'إضافة قالب جديد'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            label="اسم القالب"
                            fullWidth
                            required
                            value={currentTemplate.name}
                            onChange={(e) => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
                            InputLabelProps={{ sx: { fontFamily: 'Cairo' } }}
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="الحضور %"
                                type="number"
                                value={currentTemplate.attendance_weight}
                                onChange={(e) => setCurrentTemplate({ ...currentTemplate, attendance_weight: parseInt(e.target.value) || 0 })}
                                fullWidth
                            />
                            <TextField
                                label="عدد الحصص"
                                type="number"
                                value={currentTemplate.attendance_slots}
                                onChange={(e) => setCurrentTemplate({ ...currentTemplate, attendance_slots: parseInt(e.target.value) || 0 })}
                                fullWidth
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="الكويزات %"
                                type="number"
                                value={currentTemplate.quizzes_weight}
                                onChange={(e) => setCurrentTemplate({ ...currentTemplate, quizzes_weight: parseInt(e.target.value) || 0 })}
                                fullWidth
                            />
                            <TextField
                                label="عدد الكويزات"
                                type="number"
                                value={currentTemplate.quiz_count}
                                onChange={(e) => setCurrentTemplate({ ...currentTemplate, quiz_count: parseInt(e.target.value) || 0 })}
                                fullWidth
                            />
                        </Box>
                        <TextField
                            label="أعمال السنة %"
                            type="number"
                            value={currentTemplate.coursework_weight}
                            onChange={(e) => setCurrentTemplate({ ...currentTemplate, coursework_weight: parseInt(e.target.value) || 0 })}
                        />
                        <TextField
                            label="الميدتيرم %"
                            type="number"
                            value={currentTemplate.midterm_weight}
                            onChange={(e) => setCurrentTemplate({ ...currentTemplate, midterm_weight: parseInt(e.target.value) || 0 })}
                        />
                        <TextField
                            label="الفاينال %"
                            type="number"
                            value={currentTemplate.final_weight}
                            onChange={(e) => setCurrentTemplate({ ...currentTemplate, final_weight: parseInt(e.target.value) || 0 })}
                        />
                        <Alert severity={getTotalWeight() === 100 ? 'success' : 'warning'}>
                            المجموع: {getTotalWeight()}% {getTotalWeight() !== 100 && '(يجب أن يكون 100%)'}
                        </Alert>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} sx={{ fontFamily: 'Cairo' }}>إلغاء</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        sx={{ fontFamily: 'Cairo' }}
                        disabled={getTotalWeight() !== 100}
                    >
                        حفظ
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
