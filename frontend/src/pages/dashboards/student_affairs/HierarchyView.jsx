import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Grid, Card, CardContent, Button, Breadcrumbs, Link, CircularProgress, Chip, IconButton, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import FolderIcon from '@mui/icons-material/Folder';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SchoolIcon from '@mui/icons-material/School';
import LockResetIcon from '@mui/icons-material/LockReset';
import axios from 'axios';

export default function HierarchyView() {
    const [departments, setDepartments] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [levels, setLevels] = useState([]);
    const [students, setStudents] = useState([]);

    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);

    const [loading, setLoading] = useState(true);
    const [resetDialog, setResetDialog] = useState({ open: false, student: null });
    const [resetResult, setResetResult] = useState(null);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await axios.get('/api/academic/departments/', { withCredentials: true });
            setDepartments(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching departments:', err);
            setLoading(false);
        }
    };

    const fetchAcademicYears = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/academic/years/', { withCredentials: true });
            setAcademicYears(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching academic years:', err);
            setLoading(false);
        }
    };

    const fetchLevels = async (deptId, yearId) => {
        setLoading(true);
        try {
            const response = await axios.get('/api/academic/levels/', { withCredentials: true });
            // Filter levels by department and academic year
            const filteredLevels = response.data.filter(l =>
                l.department === deptId && l.academic_year === yearId
            );
            setLevels(filteredLevels);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching levels:', err);
            setLoading(false);
        }
    };

    const fetchStudents = async (levelId, deptId, yearId) => {
        setLoading(true);
        try {
            let url = '/api/academic/student-affairs/students/';
            const params = new URLSearchParams();
            if (levelId) params.append('level', levelId);
            if (deptId) params.append('department', deptId);
            if (yearId) params.append('academic_year', yearId);

            const response = await axios.get(`${url}?${params.toString()}`, { withCredentials: true });
            setStudents(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching students:', err);
            setStudents([]);
            setLoading(false);
        }
    };

    const handleDeptClick = (dept) => {
        setSelectedDept(dept);
        fetchAcademicYears();
        setSelectedYear(null);
        setSelectedLevel(null);
        setStudents([]);
    };

    const handleYearClick = (year) => {
        setSelectedYear(year);
        fetchLevels(selectedDept.id, year.id);
        setSelectedLevel(null);
        setStudents([]);
    };

    const handleLevelClick = (level) => {
        setSelectedLevel(level);
        fetchStudents(level.id, selectedDept?.id, selectedYear?.id);
    };

    const handleResetPassword = async () => {
        if (!resetDialog.student) return;
        try {
            await axios.post(
                `/api/academic/student-affairs/students/${resetDialog.student.id}/reset-password/`,
                {},
                { withCredentials: true }
            );
            setResetResult({ success: true, message: 'تم إعادة تعيين كلمة المرور بنجاح' });
            // Refresh students list
            fetchStudents(selectedLevel?.id, selectedDept?.id, selectedYear?.id);
        } catch (err) {
            setResetResult({ success: false, message: 'فشل إعادة تعيين كلمة المرور' });
        }
    };

    const resetView = () => {
        setSelectedDept(null);
        setSelectedYear(null);
        setSelectedLevel(null);
        setStudents([]);
        fetchDepartments();
    };

    const getLevelDisplayName = (levelName) => {
        const names = {
            'PREPARATORY': 'السنة التحضيرية',
            'FIRST': 'السنة الأولى',
            'SECOND': 'السنة الثانية',
            'THIRD': 'السنة الثالثة',
            'FOURTH': 'السنة الرابعة'
        };
        return names[levelName] || levelName;
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 4 }}>
                الهيكل الأكاديمي - إدارة الطلاب
            </Typography>

            {/* Breadcrumbs: Department → Academic Year → Level → Students */}
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 3, fontFamily: 'Cairo' }}>
                <Link underline="hover" color="inherit" onClick={resetView} sx={{ cursor: 'pointer' }}>
                    الأقسام
                </Link>
                {selectedDept && (
                    <Link
                        underline="hover"
                        color="inherit"
                        onClick={() => { setSelectedYear(null); setSelectedLevel(null); setStudents([]); fetchAcademicYears(); }}
                        sx={{ cursor: 'pointer' }}
                    >
                        {selectedDept.name}
                    </Link>
                )}
                {selectedYear && (
                    <Link
                        underline="hover"
                        color="inherit"
                        onClick={() => { setSelectedLevel(null); setStudents([]); }}
                        sx={{ cursor: 'pointer' }}
                    >
                        {selectedYear.name}
                    </Link>
                )}
                {selectedLevel && (
                    <Typography color="text.primary" sx={{ fontFamily: 'Cairo' }}>{getLevelDisplayName(selectedLevel.name)}</Typography>
                )}
            </Breadcrumbs>

            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}

            {/* Step 1: Departments */}
            {!loading && !selectedDept && (
                <Grid container spacing={3}>
                    {departments.map((dept) => (
                        <Grid item xs={12} md={4} key={dept.id}>
                            <Card sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }} onClick={() => handleDeptClick(dept)}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <FolderIcon sx={{ fontSize: 50, color: '#1976d2', mb: 2 }} />
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{dept.name}</Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Cairo' }}>{dept.code}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                    {departments.length === 0 && (
                        <Typography sx={{ p: 3, fontFamily: 'Cairo' }}>لا توجد أقسام مسجلة.</Typography>
                    )}
                </Grid>
            )}

            {/* Step 2: Academic Years */}
            {!loading && selectedDept && !selectedYear && (
                <Grid container spacing={3}>
                    {academicYears.length > 0 ? academicYears.map((year) => (
                        <Grid item xs={12} md={4} key={year.id}>
                            <Card sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }} onClick={() => handleYearClick(year)}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <CalendarMonthIcon sx={{ fontSize: 50, color: '#4caf50', mb: 2 }} />
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{year.name}</Typography>
                                    {year.is_current && (
                                        <Chip label="الحالي" color="success" size="small" sx={{ mt: 1, fontFamily: 'Cairo' }} />
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    )) : (
                        <Typography sx={{ p: 3, fontFamily: 'Cairo' }}>لا توجد سنوات أكاديمية مسجلة.</Typography>
                    )}
                </Grid>
            )}

            {/* Step 3: Levels */}
            {!loading && selectedDept && selectedYear && !selectedLevel && (
                <Grid container spacing={3}>
                    {levels.length > 0 ? levels.map((level) => (
                        <Grid item xs={12} md={4} key={level.id}>
                            <Card sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }} onClick={() => handleLevelClick(level)}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <SchoolIcon sx={{ fontSize: 50, color: '#f57c00', mb: 2 }} />
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{getLevelDisplayName(level.name)}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    )) : (
                        <Typography sx={{ p: 3, fontFamily: 'Cairo' }}>لا توجد فرق دراسية مسجلة لهذا القسم في هذه السنة.</Typography>
                    )}
                </Grid>
            )}

            {/* Step 4: Students */}
            {!loading && selectedLevel && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                        الطلاب المسجلين ({students.length})
                    </Typography>

                    {students.length > 0 ? (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الاسم</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>اسم المستخدم</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الرقم القومي</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>المستوى</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>حالة الحساب</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>إجراءات</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {students.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell sx={{ fontFamily: 'Cairo' }}>{student.full_name}</TableCell>
                                            <TableCell sx={{ fontFamily: 'monospace' }}>{student.username}</TableCell>
                                            <TableCell sx={{ fontFamily: 'monospace' }}>{student.national_id}</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo' }}>{getLevelDisplayName(student.level_name)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={student.first_login_required ? 'أول دخول مطلوب' : 'فعّال'}
                                                    color={student.first_login_required ? 'warning' : 'success'}
                                                    size="small"
                                                    sx={{ fontFamily: 'Cairo' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title="إعادة تعيين كلمة المرور">
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => setResetDialog({ open: true, student })}
                                                    >
                                                        <LockResetIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography sx={{ fontFamily: 'Cairo', p: 2 }}>لا يوجد طلاب مسجلين في هذا المستوى.</Typography>
                    )}
                </Paper>
            )}

            {/* Reset Password Dialog */}
            <Dialog open={resetDialog.open} onClose={() => setResetDialog({ open: false, student: null })}>
                <DialogTitle sx={{ fontFamily: 'Cairo' }}>إعادة تعيين كلمة المرور</DialogTitle>
                <DialogContent>
                    {resetResult ? (
                        <Alert severity={resetResult.success ? 'success' : 'error'} sx={{ fontFamily: 'Cairo' }}>
                            {resetResult.message}
                        </Alert>
                    ) : (
                        <Typography sx={{ fontFamily: 'Cairo' }}>
                            هل تريد إعادة تعيين كلمة المرور للطالب "{resetDialog.student?.full_name}"؟
                            <br />
                            سيتم تعيين كلمة المرور إلى الرقم القومي وسيُطلب من الطالب تغييرها عند تسجيل الدخول.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setResetDialog({ open: false, student: null }); setResetResult(null); }} sx={{ fontFamily: 'Cairo' }}>
                        إغلاق
                    </Button>
                    {!resetResult && (
                        <Button variant="contained" color="primary" onClick={handleResetPassword} sx={{ fontFamily: 'Cairo' }}>
                            تأكيد
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Container>
    );
}
