import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Alert, MenuItem, Grid } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

export default function ManageLevels() {
    const [levels, setLevels] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [years, setYears] = useState([]);
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedYear, setSelectedYear] = useState('');

    const [open, setOpen] = useState(false);
    const [currentLevel, setCurrentLevel] = useState({ name: '', department: '', academic_year: '' });
    const [isEdit, setIsEdit] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDepartments();
        fetchYears();
    }, []);

    useEffect(() => {
        if (selectedDept && selectedYear) {
            fetchLevels();
        } else {
            setLevels([]);
        }
    }, [selectedDept, selectedYear]);

    const fetchLevels = async () => {
        try {
            const response = await axios.get(`/api/academic/levels/?department=${selectedDept}&academic_year=${selectedYear}`);
            setLevels(response.data);
        } catch (err) {
            console.error('Error fetching levels:', err);
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

    const fetchYears = async () => {
        try {
            const response = await axios.get('/api/academic/years/');
            setYears(response.data);
        } catch (err) {
            console.error('Error fetching years:', err);
        }
    };

    const handleOpen = (level = { name: '', department: selectedDept, academic_year: selectedYear }) => {
        setCurrentLevel(level);
        setIsEdit(!!level.id);
        setOpen(true);
        setError('');
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSave = async () => {
        try {
            if (isEdit) {
                await axios.put(`/api/academic/levels/${currentLevel.id}/`, currentLevel);
            } else {
                await axios.post('/api/academic/levels/', currentLevel);
            }
            fetchLevels();
            handleClose();
        } catch (err) {
            setError('حدث خطأ أثناء الحفظ. تأكد من صحة البيانات.');
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المستوى؟')) {
            try {
                await axios.delete(`/api/academic/levels/${id}/`);
                fetchLevels();
            } catch (err) {
                console.error('Error deleting level:', err);
                alert('لا يمكن حذف هذا المستوى لأنه مرتبط ببيانات أخرى.');
            }
        }
    };

    const getDeptName = (id) => departments.find(d => d.id === id)?.name || id;
    const getYearName = (id) => years.find(y => y.id === id)?.name || id;

    const [studentsOpen, setStudentsOpen] = useState(false);
    const [levelStudents, setLevelStudents] = useState([]);
    const [selectedLevelName, setSelectedLevelName] = useState('');

    const handleViewStudents = async (level) => {
        setSelectedLevelName(level.name);
        try {
            const response = await axios.get(`/api/academic/levels/${level.id}/students/`);
            setLevelStudents(response.data);
            setStudentsOpen(true);
        } catch (err) {
            console.error('Error fetching students:', err);
            alert('فشل تحميل قائمة الطلاب.');
        }
    };

    const handleCloseStudents = () => {
        setStudentsOpen(false);
        setLevelStudents([]);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 4 }}>
                إدارة الفرق الدراسية
            </Typography>

            <Paper sx={{ p: 3, mb: 4 }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={5}>
                        <TextField
                            select
                            label="اختر القسم"
                            fullWidth
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                            SelectProps={{ style: { fontFamily: 'Cairo' } }}
                        >
                            {departments.map((dept) => (
                                <MenuItem key={dept.id} value={dept.id} sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>
                                    {dept.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <TextField
                            select
                            label="اختر العام الدراسي"
                            fullWidth
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                            SelectProps={{ style: { fontFamily: 'Cairo' } }}
                        >
                            {years.map((year) => (
                                <MenuItem key={year.id} value={year.id} sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>
                                    {year.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon sx={{ ml: 1 }} />}
                            onClick={() => handleOpen()}
                            disabled={!selectedDept || !selectedYear}
                            fullWidth
                            sx={{ fontFamily: 'Cairo', fontWeight: 'bold', bgcolor: '#0A2342', height: '56px' }}
                        >
                            إضافة فرقة
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {selectedDept && selectedYear ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'right' }}>اسم الفرقة</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'right' }}>القسم</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'right' }}>العام الدراسي</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center' }}>الإجراءات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {levels.length > 0 ? (
                                levels.map((level) => (
                                    <TableRow key={level.id}>
                                        <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>{level.name}</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>{getDeptName(level.department)}</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>{getYearName(level.academic_year)}</TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => handleViewStudents(level)}
                                                sx={{ fontFamily: 'Cairo', mr: 1 }}
                                            >
                                                عرض الطلاب
                                            </Button>
                                            <IconButton color="primary" onClick={() => handleOpen(level)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton color="error" onClick={() => handleDelete(level.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} sx={{ textAlign: 'center', fontFamily: 'Cairo', py: 3 }}>
                                        لا توجد فرق دراسية مسجلة لهذا القسم والعام الدراسي.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Alert severity="info" sx={{ fontFamily: 'Cairo' }}>
                    يرجى اختيار القسم والعام الدراسي لعرض الفرق الدراسية.
                </Alert>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>
                    {isEdit ? 'تعديل فرقة' : 'إضافة فرقة جديدة'}
                </DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2, fontFamily: 'Cairo' }}>{error}</Alert>}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="اسم الفرقة (مثال: الفرقة الأولى)"
                            fullWidth
                            value={currentLevel.name}
                            onChange={(e) => setCurrentLevel({ ...currentLevel, name: e.target.value })}
                            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                        />
                        <TextField
                            select
                            label="القسم"
                            fullWidth
                            value={currentLevel.department}
                            onChange={(e) => setCurrentLevel({ ...currentLevel, department: e.target.value })}
                            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                            SelectProps={{ style: { fontFamily: 'Cairo' } }}
                            disabled // Locked to selection
                        >
                            {departments.map((dept) => (
                                <MenuItem key={dept.id} value={dept.id} sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>
                                    {dept.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select
                            label="العام الدراسي"
                            fullWidth
                            value={currentLevel.academic_year}
                            onChange={(e) => setCurrentLevel({ ...currentLevel, academic_year: e.target.value })}
                            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                            SelectProps={{ style: { fontFamily: 'Cairo' } }}
                            disabled // Locked to selection
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

            {/* View Students Dialog */}
            <Dialog open={studentsOpen} onClose={handleCloseStudents} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>
                    الطلاب المسجلين - {selectedLevelName}
                </DialogTitle>
                <DialogContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>الاسم</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>اسم المستخدم (الرقم القومي)</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>الرقم القومي</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {levelStudents.length > 0 ? (
                                    levelStudents.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>{student.first_name} {student.last_name}</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>{student.username}</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>{student.national_id}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} sx={{ textAlign: 'center', fontFamily: 'Cairo', py: 3 }}>
                                            لا يوجد طلاب مسجلين في هذه الفرقة.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseStudents} sx={{ fontFamily: 'Cairo' }}>إغلاق</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
