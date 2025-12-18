import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Paper, Button, FormControl, InputLabel,
    Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, CircularProgress, Alert, Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';

export default function StudentGradesView() {
    const [departments, setDepartments] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [levels, setLevels] = useState([]);

    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');
    const [gradesData, setGradesData] = useState(null);

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedDepartment && selectedYear) {
            fetchLevels();
        }
    }, [selectedDepartment, selectedYear]);

    const fetchInitialData = async () => {
        try {
            const [deptRes, yearRes] = await Promise.all([
                axios.get('/api/academic/departments/', config),
                axios.get('/api/academic/years/', config)
            ]);
            setDepartments(deptRes.data);
            setAcademicYears(yearRes.data);

            const currentYear = yearRes.data.find(y => y.is_current);
            if (currentYear) setSelectedYear(currentYear.id);
        } catch (err) {
            setError('فشل في تحميل البيانات');
        } finally {
            setLoadingData(false);
        }
    };

    const fetchLevels = async () => {
        try {
            const res = await axios.get(
                `/api/academic/levels/?department=${selectedDepartment}&academic_year=${selectedYear}`,
                config
            );
            setLevels(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchGrades = async () => {
        if (!selectedDepartment || !selectedYear || !selectedLevel) {
            setError('يرجى اختيار جميع الخيارات');
            return;
        }

        setLoading(true);
        setError('');
        setGradesData(null);

        try {
            const res = await axios.get(
                `/api/academic/student-affairs/grades/?department=${selectedDepartment}&academic_year=${selectedYear}&level=${selectedLevel}`,
                config
            );
            setGradesData(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'فشل في تحميل الدرجات');
        } finally {
            setLoading(false);
        }
    };

    const isSelectionComplete = selectedDepartment && selectedYear && selectedLevel;

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => window.history.back()}
                sx={{ mb: 2, fontFamily: 'Cairo' }}
            >
                عودة
            </Button>

            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 4 }}>
                عرض درجات الطلاب
            </Typography>

            {/* Selection Filters */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                    اختر القسم والعام والفرقة
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2, alignItems: 'flex-end' }}>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>القسم</InputLabel>
                        <Select
                            value={selectedDepartment}
                            onChange={(e) => {
                                setSelectedDepartment(e.target.value);
                                setSelectedLevel('');
                                setGradesData(null);
                            }}
                            label="القسم"
                        >
                            {departments.map((dept) => (
                                <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>العام الدراسي</InputLabel>
                        <Select
                            value={selectedYear}
                            onChange={(e) => {
                                setSelectedYear(e.target.value);
                                setSelectedLevel('');
                                setGradesData(null);
                            }}
                            label="العام الدراسي"
                        >
                            {academicYears.map((year) => (
                                <MenuItem key={year.id} value={year.id}>
                                    {year.name}
                                    {year.is_current && <Chip label="الحالي" size="small" color="success" sx={{ ml: 1 }} />}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>الفرقة</InputLabel>
                        <Select
                            value={selectedLevel}
                            onChange={(e) => {
                                setSelectedLevel(e.target.value);
                                setGradesData(null);
                            }}
                            label="الفرقة"
                            disabled={!selectedDepartment || !selectedYear}
                        >
                            {levels.map((level) => (
                                <MenuItem key={level.id} value={level.id}>{level.name_display}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        onClick={fetchGrades}
                        disabled={!isSelectionComplete || loading}
                        sx={{ fontFamily: 'Cairo', height: 56 }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'عرض الدرجات'}
                    </Button>
                </Box>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo' }}>{error}</Alert>}

            {/* Grades Table */}
            {gradesData && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 3 }}>
                        جدول الدرجات ({gradesData.students.length} طالب)
                    </Typography>

                    {gradesData.students.length > 0 ? (
                        <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', bgcolor: '#f5f5f5', minWidth: 150 }}>
                                            اسم الطالب
                                        </TableCell>
                                        {gradesData.subjects.map((subject) => (
                                            <TableCell
                                                key={subject.id}
                                                colSpan={3}
                                                align="center"
                                                sx={{ fontFamily: 'Cairo', fontWeight: 'bold', bgcolor: '#e3f2fd', minWidth: 180 }}
                                            >
                                                {subject.name}
                                                <br />
                                                <small style={{ color: '#666' }}>{subject.code}</small>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: '#f5f5f5' }}></TableCell>
                                        {gradesData.subjects.map((subject) => (
                                            <React.Fragment key={`header-${subject.id}`}>
                                                <TableCell align="center" sx={{ fontFamily: 'Cairo', fontSize: '0.75rem', bgcolor: '#fafafa' }}>
                                                    منتصف
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontFamily: 'Cairo', fontSize: '0.75rem', bgcolor: '#fafafa' }}>
                                                    أعمال
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontFamily: 'Cairo', fontSize: '0.75rem', bgcolor: '#fafafa' }}>
                                                    نهائي
                                                </TableCell>
                                            </React.Fragment>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {gradesData.students.map((student) => (
                                        <TableRow key={student.id} hover>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                                {student.full_name}
                                            </TableCell>
                                            {student.subjects.map((subjectGrade) => (
                                                <React.Fragment key={`${student.id}-${subjectGrade.subject_id}`}>
                                                    <TableCell align="center">
                                                        {subjectGrade.midterm !== null ? subjectGrade.midterm : '-'}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {subjectGrade.coursework !== null ? subjectGrade.coursework : '-'}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {subjectGrade.final !== null ? subjectGrade.final : '-'}
                                                    </TableCell>
                                                </React.Fragment>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Alert severity="info" sx={{ fontFamily: 'Cairo' }}>
                            لا يوجد طلاب في هذه الفرقة
                        </Alert>
                    )}

                    <Alert severity="info" sx={{ mt: 2, fontFamily: 'Cairo' }}>
                        <strong>ملاحظة:</strong> الدرجات للقراءة فقط - يتم إدخالها من قبل الدكاترة
                    </Alert>
                </Paper>
            )}
        </Container>
    );
}
