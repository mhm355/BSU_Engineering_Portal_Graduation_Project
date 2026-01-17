import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Paper, List, ListItem, ListItemButton, ListItemText,
    ListItemIcon, Breadcrumbs, Link, CircularProgress, Alert, Chip, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import SchoolIcon from '@mui/icons-material/School';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ClassIcon from '@mui/icons-material/Class';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminAcademicStructure() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Navigation state
    const [currentView, setCurrentView] = useState('departments'); // departments, years, levels, students
    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);

    // Data
    const [departments, setDepartments] = useState([]);
    const [years, setYears] = useState([]);
    const [levels, setLevels] = useState([]);
    const [students, setStudents] = useState([]);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/academic/departments/', { withCredentials: true });
            setDepartments(response.data);
        } catch (err) {
            setError('فشل تحميل الأقسام');
        }
        setLoading(false);
    };

    const fetchYears = async (deptId) => {
        setLoading(true);
        try {
            const response = await axios.get('/api/academic/years/', { withCredentials: true });
            // Filter years that have levels in this department
            const levelsRes = await axios.get(`/api/academic/levels/?department=${deptId}`, { withCredentials: true });
            const yearIds = [...new Set(levelsRes.data.map(l => l.academic_year))];
            const filteredYears = response.data.filter(y => yearIds.includes(y.id));
            setYears(filteredYears);
        } catch (err) {
            setError('فشل تحميل السنوات');
        }
        setLoading(false);
    };

    const fetchLevels = async (deptId, yearId) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/academic/levels/?department=${deptId}&academic_year=${yearId}`, { withCredentials: true });
            setLevels(response.data);
        } catch (err) {
            setError('فشل تحميل الفرق');
        }
        setLoading(false);
    };

    const fetchStudents = async (levelId) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/academic/student-affairs/students/?level=${levelId}`, { withCredentials: true });
            setStudents(response.data);
        } catch (err) {
            setError('فشل تحميل الطلاب');
        }
        setLoading(false);
    };

    const handleSelectDept = (dept) => {
        setSelectedDept(dept);
        setCurrentView('years');
        fetchYears(dept.id);
    };

    const handleSelectYear = (year) => {
        setSelectedYear(year);
        setCurrentView('levels');
        fetchLevels(selectedDept.id, year.id);
    };

    const handleSelectLevel = (level) => {
        setSelectedLevel(level);
        setCurrentView('students');
        fetchStudents(level.id);
    };

    const handleBack = () => {
        if (currentView === 'students') {
            setCurrentView('levels');
            setSelectedLevel(null);
        } else if (currentView === 'levels') {
            setCurrentView('years');
            setSelectedYear(null);
        } else if (currentView === 'years') {
            setCurrentView('departments');
            setSelectedDept(null);
        }
    };

    const getLevelDisplayName = (name) => {
        const names = {
            'PREPARATORY': 'الفرقة الإعدادية',
            'FIRST': 'الفرقة الأولى',
            'SECOND': 'الفرقة الثانية',
            'THIRD': 'الفرقة الثالثة',
            'FOURTH': 'الفرقة الرابعة',
        };
        return names[name] || name;
    };

    const renderBreadcrumbs = () => (
        <Breadcrumbs sx={{ mb: 2, fontFamily: 'Cairo' }}>
            <Link
                component="button"
                underline="hover"
                color={currentView === 'departments' ? 'text.primary' : 'inherit'}
                onClick={() => { setCurrentView('departments'); setSelectedDept(null); setSelectedYear(null); setSelectedLevel(null); }}
                sx={{ display: 'flex', alignItems: 'center', fontFamily: 'Cairo' }}
            >
                <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                الأقسام
            </Link>
            {selectedDept && (
                <Link
                    component="button"
                    underline="hover"
                    color={currentView === 'years' ? 'text.primary' : 'inherit'}
                    onClick={() => { setCurrentView('years'); setSelectedYear(null); setSelectedLevel(null); fetchYears(selectedDept.id); }}
                    sx={{ fontFamily: 'Cairo' }}
                >
                    {selectedDept.name}
                </Link>
            )}
            {selectedYear && (
                <Link
                    component="button"
                    underline="hover"
                    color={currentView === 'levels' ? 'text.primary' : 'inherit'}
                    onClick={() => { setCurrentView('levels'); setSelectedLevel(null); fetchLevels(selectedDept.id, selectedYear.id); }}
                    sx={{ fontFamily: 'Cairo' }}
                >
                    {selectedYear.name}
                </Link>
            )}
            {selectedLevel && (
                <Typography color="text.primary" sx={{ fontFamily: 'Cairo' }}>
                    {getLevelDisplayName(selectedLevel.name)}
                </Typography>
            )}
        </Breadcrumbs>
    );

    const renderContent = () => {
        if (loading) {
            return <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>;
        }

        switch (currentView) {
            case 'departments':
                return (
                    <List>
                        {departments.length === 0 ? (
                            <Typography sx={{ p: 2, fontFamily: 'Cairo' }}>لا توجد أقسام</Typography>
                        ) : departments.map((dept) => (
                            <ListItem key={dept.id} disablePadding>
                                <ListItemButton onClick={() => handleSelectDept(dept)}>
                                    <ListItemIcon>
                                        <FolderIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={dept.name}
                                        secondary={dept.code}
                                        primaryTypographyProps={{ fontFamily: 'Cairo', fontWeight: 'bold' }}
                                    />
                                    {!dept.is_approved && <Chip label="معلق" size="small" color="warning" />}
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                );

            case 'years':
                return (
                    <List>
                        {years.length === 0 ? (
                            <Typography sx={{ p: 2, fontFamily: 'Cairo' }}>لا توجد سنوات أكاديمية</Typography>
                        ) : years.map((year) => (
                            <ListItem key={year.id} disablePadding>
                                <ListItemButton onClick={() => handleSelectYear(year)}>
                                    <ListItemIcon>
                                        <CalendarMonthIcon color="secondary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={year.name}
                                        primaryTypographyProps={{ fontFamily: 'Cairo', fontWeight: 'bold' }}
                                    />
                                    {year.is_current && <Chip label="الحالية" size="small" color="success" />}
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                );

            case 'levels':
                return (
                    <List>
                        {levels.length === 0 ? (
                            <Typography sx={{ p: 2, fontFamily: 'Cairo' }}>لا توجد فرق</Typography>
                        ) : levels.map((level) => (
                            <ListItem key={level.id} disablePadding>
                                <ListItemButton onClick={() => handleSelectLevel(level)}>
                                    <ListItemIcon>
                                        <ClassIcon color="warning" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={getLevelDisplayName(level.name)}
                                        primaryTypographyProps={{ fontFamily: 'Cairo', fontWeight: 'bold' }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                );

            case 'students':
                return (
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: '#1976d2' }}>
                                <TableRow>
                                    <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>#</TableCell>
                                    <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>الاسم</TableCell>
                                    <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>الرقم القومي</TableCell>
                                    <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>الحالة</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {students.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} sx={{ textAlign: 'center', fontFamily: 'Cairo' }}>
                                            لا يوجد طلاب
                                        </TableCell>
                                    </TableRow>
                                ) : students.map((student, index) => (
                                    <TableRow key={student.id} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo' }}>{student.full_name}</TableCell>
                                        <TableCell>{student.national_id}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={student.has_account ? 'مفعل' : 'غير مفعل'}
                                                size="small"
                                                color={student.has_account ? 'success' : 'default'}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                );
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                {currentView !== 'departments' && (
                    <IconButton onClick={handleBack}>
                        <ArrowBackIcon />
                    </IconButton>
                )}
                <IconButton onClick={() => navigate('/admin/dashboard')}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                    الهيكل الأكاديمي
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            <Paper sx={{ p: 2 }}>
                {renderBreadcrumbs()}
                <Divider sx={{ mb: 2 }} />
                {renderContent()}
            </Paper>
        </Container>
    );
}
