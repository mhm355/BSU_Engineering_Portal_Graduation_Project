import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Alert, MenuItem } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

export default function ManageCourses() {
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [levels, setLevels] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentCourse, setCurrentCourse] = useState({ name: '', code: '', department: '', level: '', semester: '1', credit_hours: 3 });
    const [isEdit, setIsEdit] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCourses();
        fetchDepartments();
        fetchLevels();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await axios.get('/api/academic/courses/');
            setCourses(response.data);
        } catch (err) {
            console.error('Error fetching courses:', err);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await axios.get('/api/academic/departments/');
            setDepartments(response.data);
        } catch (err) {
            console.error('Error fetching departments:', err);
        }
    };

    const fetchLevels = async () => {
        try {
            const response = await axios.get('/api/academic/levels/');
            setLevels(response.data);
        } catch (err) {
            console.error('Error fetching levels:', err);
        }
    };

    const handleOpen = (course = { name: '', code: '', department: '', level: '', semester: '1', credit_hours: 3 }) => {
        setCurrentCourse(course);
        setIsEdit(!!course.id);
        setOpen(true);
        setError('');
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSave = async () => {
        try {
            if (isEdit) {
                await axios.put(`/api/academic/courses/${currentCourse.id}/`, currentCourse);
            } else {
                await axios.post('/api/academic/courses/', currentCourse);
            }
            fetchCourses();
            handleClose();
        } catch (err) {
            setError('حدث خطأ أثناء الحفظ. تأكد من صحة البيانات.');
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المقرر؟')) {
            try {
                await axios.delete(`/api/academic/courses/${id}/`);
                fetchCourses();
            } catch (err) {
                console.error('Error deleting course:', err);
            }
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                    إدارة المقررات الدراسية
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon sx={{ ml: 1 }} />}
                    onClick={() => handleOpen()}
                    sx={{ fontFamily: 'Cairo', fontWeight: 'bold', bgcolor: '#0A2342' }}
                >
                    إضافة مقرر جديد
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'right' }}>الكود</TableCell>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'right' }}>اسم المقرر</TableCell>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'right' }}>القسم</TableCell>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'right' }}>الفرقة</TableCell>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'right' }}>الساعات</TableCell>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center' }}>الإجراءات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {courses.map((course) => (
                            <TableRow key={course.id}>
                                <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>{course.code}</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>{course.name}</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>{course.department_name}</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>{course.level_name}</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>{course.credit_hours}</TableCell>
                                <TableCell sx={{ textAlign: 'center' }}>
                                    <IconButton color="primary" onClick={() => handleOpen(course)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(course.id)}>
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
                    {isEdit ? 'تعديل مقرر' : 'إضافة مقرر جديد'}
                </DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2, fontFamily: 'Cairo' }}>{error}</Alert>}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="اسم المقرر"
                            fullWidth
                            value={currentCourse.name}
                            onChange={(e) => setCurrentCourse({ ...currentCourse, name: e.target.value })}
                            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                        />
                        <TextField
                            label="كود المقرر"
                            fullWidth
                            value={currentCourse.code}
                            onChange={(e) => setCurrentCourse({ ...currentCourse, code: e.target.value })}
                            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                        />
                        <TextField
                            select
                            label="القسم"
                            fullWidth
                            value={currentCourse.department}
                            onChange={(e) => setCurrentCourse({ ...currentCourse, department: e.target.value })}
                            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                        >
                            {departments.map((dept) => (
                                <MenuItem key={dept.id} value={dept.id} sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>
                                    {dept.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select
                            label="الفرقة الدراسية"
                            fullWidth
                            value={currentCourse.level}
                            onChange={(e) => setCurrentCourse({ ...currentCourse, level: e.target.value })}
                            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                        >
                            {levels.map((level) => (
                                <MenuItem key={level.id} value={level.id} sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>
                                    {level.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="الساعات المعتمدة"
                            type="number"
                            fullWidth
                            value={currentCourse.credit_hours}
                            onChange={(e) => setCurrentCourse({ ...currentCourse, credit_hours: e.target.value })}
                            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'flex-start', p: 2 }}>
                    <Button onClick={handleClose} sx={{ fontFamily: 'Cairo' }}>إلغاء</Button>
                    <Button onClick={handleSave} variant="contained" sx={{ fontFamily: 'Cairo', bgcolor: '#0A2342' }}>
                        حفظ
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
