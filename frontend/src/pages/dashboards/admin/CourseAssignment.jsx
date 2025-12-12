import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Alert, MenuItem } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

export default function CourseAssignment() {
    const [assignments, setAssignments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [courses, setCourses] = useState([]);
    const [years, setYears] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentAssignment, setCurrentAssignment] = useState({ doctor: '', course: '', academic_year: '' });
    const [isEdit, setIsEdit] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAssignments();
        fetchDoctors();
        fetchCourses();
        fetchYears();
    }, []);

    const fetchAssignments = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/academic/assignments/');
            setAssignments(response.data);
        } catch (err) {
            console.error('Error fetching assignments:', err);
        }
    };

    const fetchDoctors = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/auth/users/?role=DOCTOR');
            setDoctors(response.data);
        } catch (err) {
            console.error('Error fetching doctors:', err);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/academic/courses/');
            setCourses(response.data);
        } catch (err) {
            console.error('Error fetching courses:', err);
        }
    };

    const fetchYears = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/academic/years/');
            setYears(response.data);
        } catch (err) {
            console.error('Error fetching years:', err);
        }
    };

    const handleOpen = (assignment = { doctor: '', course: '', academic_year: '' }) => {
        setCurrentAssignment(assignment);
        setIsEdit(!!assignment.id);
        setOpen(true);
        setError('');
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSave = async () => {
        try {
            if (isEdit) {
                await axios.put(`http://localhost:8000/api/academic/assignments/${currentAssignment.id}/`, currentAssignment);
            } else {
                await axios.post('http://localhost:8000/api/academic/assignments/', currentAssignment);
            }
            fetchAssignments();
            handleClose();
        } catch (err) {
            setError('حدث خطأ أثناء الحفظ. تأكد من صحة البيانات.');
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا التعيين؟')) {
            try {
                await axios.delete(`http://localhost:8000/api/academic/assignments/${id}/`);
                fetchAssignments();
            } catch (err) {
                console.error('Error deleting assignment:', err);
            }
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                    تعيين المواد للدكاترة
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon sx={{ ml: 1 }} />}
                    onClick={() => handleOpen()}
                    sx={{ fontFamily: 'Cairo', fontWeight: 'bold', bgcolor: '#0A2342' }}
                >
                    إضافة تعيين جديد
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'right' }}>الدكتور</TableCell>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'right' }}>المادة</TableCell>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'right' }}>العام الدراسي</TableCell>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center' }}>الإجراءات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assignments.map((assignment) => (
                            <TableRow key={assignment.id}>
                                <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>{assignment.doctor_name}</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>{assignment.course_name}</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>{assignment.academic_year_name}</TableCell>
                                <TableCell sx={{ textAlign: 'center' }}>
                                    <IconButton color="primary" onClick={() => handleOpen(assignment)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(assignment.id)}>
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
                    {isEdit ? 'تعديل تعيين' : 'إضافة تعيين جديد'}
                </DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2, fontFamily: 'Cairo' }}>{error}</Alert>}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            select
                            label="الدكتور"
                            fullWidth
                            value={currentAssignment.doctor}
                            onChange={(e) => setCurrentAssignment({ ...currentAssignment, doctor: e.target.value })}
                            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                            SelectProps={{ style: { fontFamily: 'Cairo' } }}
                        >
                            {doctors.map((doc) => (
                                <MenuItem key={doc.id} value={doc.id} sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>
                                    {doc.first_name} {doc.last_name} ({doc.username})
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select
                            label="المادة"
                            fullWidth
                            value={currentAssignment.course}
                            onChange={(e) => setCurrentAssignment({ ...currentAssignment, course: e.target.value })}
                            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                            SelectProps={{ style: { fontFamily: 'Cairo' } }}
                        >
                            {courses.map((course) => (
                                <MenuItem key={course.id} value={course.id} sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>
                                    {course.name} ({course.code})
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select
                            label="العام الدراسي"
                            fullWidth
                            value={currentAssignment.academic_year}
                            onChange={(e) => setCurrentAssignment({ ...currentAssignment, academic_year: e.target.value })}
                            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                            SelectProps={{ style: { fontFamily: 'Cairo' } }}
                        >
                            {years.map((year) => (
                                <MenuItem key={year.id} value={year.id} sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>
                                    {year.name}
                                </MenuItem>
                            ))}
                        </TextField>
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
