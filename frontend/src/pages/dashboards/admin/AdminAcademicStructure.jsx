import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Paper, List, ListItem, ListItemButton, ListItemText,
    ListItemIcon, Breadcrumbs, Link, CircularProgress, Alert, Chip, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
    Grid, Card, CardContent, Avatar, Fade, Grow, Button, Tooltip
} from '@mui/material';
import { keyframes } from '@mui/system';
import FolderIcon from '@mui/icons-material/Folder';
import SchoolIcon from '@mui/icons-material/School';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ClassIcon from '@mui/icons-material/Class';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import GroupsIcon from '@mui/icons-material/Groups';
import DomainIcon from '@mui/icons-material/Domain';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

// Stats Card Component
const StatCard = ({ icon: Icon, value, label, color, delay = 0 }) => (
    <Grow in={true} timeout={800 + delay}>
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 4,
                background: '#fff',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.06)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 20px 40px ${color}25`,
                }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 8px 24px ${color}40`,
                    }}
                >
                    <Icon sx={{ fontSize: 28, color: '#fff' }} />
                </Box>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a2744', fontFamily: 'Cairo', lineHeight: 1 }}>
                        {value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Cairo' }}>
                        {label}
                    </Typography>
                </Box>
            </Box>
        </Paper>
    </Grow>
);

// Navigation Item Card
const NavItemCard = ({ icon: Icon, title, subtitle, chip, chipColor, onClick, color, delay = 0 }) => (
    <Grow in={true} timeout={600 + delay}>
        <Card
            onClick={onClick}
            sx={{
                borderRadius: 3,
                background: '#fff',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.06)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateX(-8px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                    borderColor: color,
                    '& .nav-arrow': {
                        opacity: 1,
                        transform: 'translateX(-5px)',
                    }
                }
            }}
        >
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                    sx={{
                        width: 50,
                        height: 50,
                        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                        boxShadow: `0 6px 16px ${color}40`,
                    }}
                >
                    <Icon sx={{ fontSize: 26 }} />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744', lineHeight: 1.2 }}>
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                {chip && (
                    <Chip
                        label={chip}
                        size="small"
                        sx={{
                            fontFamily: 'Cairo',
                            fontWeight: 'bold',
                            bgcolor: `${chipColor}20`,
                            color: chipColor,
                        }}
                    />
                )}
                <NavigateNextIcon
                    className="nav-arrow"
                    sx={{
                        color: '#ccc',
                        fontSize: 28,
                        opacity: 0.5,
                        transition: 'all 0.3s ease',
                    }}
                />
            </CardContent>
        </Card>
    </Grow>
);

export default function AdminAcademicStructure() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Navigation state
    const [currentView, setCurrentView] = useState('departments');
    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [selectedSpecialization, setSelectedSpecialization] = useState(null);

    // Data
    const [departments, setDepartments] = useState([]);
    const [years, setYears] = useState([]);
    const [levels, setLevels] = useState([]);
    const [specializations, setSpecializations] = useState([]);
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

    const fetchStudents = async (levelId, specializationId = null) => {
        setLoading(true);
        try {
            let url = `/api/academic/student-affairs/students/?level=${levelId}`;
            if (specializationId) {
                url += `&specialization=${specializationId}`;
            }
            const response = await axios.get(url, { withCredentials: true });
            const data = Array.isArray(response.data) ? response.data : (response.data?.results || []);
            setStudents(data);
        } catch (err) {
            setError('فشل تحميل الطلاب');
        }
        setLoading(false);
    };

    const fetchSpecializations = async (deptId) => {
        try {
            const response = await axios.get(`/api/academic/specializations/?department=${deptId}`, { withCredentials: true });
            return Array.isArray(response.data) ? response.data : (response.data?.results || []);
        } catch (err) {
            console.error('Error fetching specializations:', err);
            return [];
        }
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

    const handleSelectLevel = async (level) => {
        setSelectedLevel(level);
        // Check if department has specializations AND level is not FIRST (first year is general in Electrical)
        const specs = await fetchSpecializations(selectedDept.id);
        // Skip specializations for FIRST level - first year is general without specializations
        if (specs && specs.length > 0 && level.name !== 'FIRST') {
            setSpecializations(specs);
            setCurrentView('specializations');
        } else {
            setSpecializations([]);
            setCurrentView('students');
            fetchStudents(level.id);
        }
    };

    const handleSelectSpecialization = (spec) => {
        setSelectedSpecialization(spec);
        setCurrentView('students');
        fetchStudents(selectedLevel.id, spec.id);
    };

    const handleBack = () => {
        if (currentView === 'students') {
            if (selectedSpecialization) {
                setCurrentView('specializations');
                setSelectedSpecialization(null);
            } else if (specializations.length > 0) {
                setCurrentView('specializations');
            } else {
                setCurrentView('levels');
                setSelectedLevel(null);
            }
        } else if (currentView === 'specializations') {
            setCurrentView('levels');
            setSelectedLevel(null);
            setSpecializations([]);
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

    const getLevelColor = (name) => {
        const colors = {
            'PREPARATORY': '#9C27B0',
            'FIRST': '#2196F3',
            'SECOND': '#00BCD4',
            'THIRD': '#FF9800',
            'FOURTH': '#4CAF50',
        };
        return colors[name] || '#607D8B';
    };

    const getViewTitle = () => {
        switch (currentView) {
            case 'departments': return 'الأقسام الأكاديمية';
            case 'years': return `السنوات الدراسية - ${selectedDept?.name}`;
            case 'levels': return `الفرق الدراسية - ${selectedYear?.name}`;
            case 'specializations': return `التخصصات - ${getLevelDisplayName(selectedLevel?.name)}`;
            case 'students': return `الطلاب - ${selectedSpecialization ? selectedSpecialization.name : getLevelDisplayName(selectedLevel?.name)}`;
            default: return 'الهيكل الأكاديمي';
        }
    };

    const renderBreadcrumbs = () => (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                mb: 3,
                borderRadius: 3,
                background: '#fff',
                boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            }}
        >
            <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" sx={{ color: '#ccc' }} />}
                sx={{ fontFamily: 'Cairo' }}
            >
                <Link
                    component="button"
                    underline="hover"
                    color={currentView === 'departments' ? 'primary' : 'inherit'}
                    onClick={() => { setCurrentView('departments'); setSelectedDept(null); setSelectedYear(null); setSelectedLevel(null); setSelectedSpecialization(null); setSpecializations([]); }}
                    sx={{ display: 'flex', alignItems: 'center', fontFamily: 'Cairo', fontWeight: currentView === 'departments' ? 'bold' : 'normal' }}
                >
                    <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
                    الأقسام
                </Link>
                {selectedDept && (
                    <Link
                        component="button"
                        underline="hover"
                        color={currentView === 'years' ? 'primary' : 'inherit'}
                        onClick={() => { setCurrentView('years'); setSelectedYear(null); setSelectedLevel(null); setSelectedSpecialization(null); setSpecializations([]); fetchYears(selectedDept.id); }}
                        sx={{ fontFamily: 'Cairo', fontWeight: currentView === 'years' ? 'bold' : 'normal' }}
                    >
                        {selectedDept.name}
                    </Link>
                )}
                {selectedYear && (
                    <Link
                        component="button"
                        underline="hover"
                        color={currentView === 'levels' ? 'primary' : 'inherit'}
                        onClick={() => { setCurrentView('levels'); setSelectedLevel(null); setSelectedSpecialization(null); setSpecializations([]); fetchLevels(selectedDept.id, selectedYear.id); }}
                        sx={{ fontFamily: 'Cairo', fontWeight: currentView === 'levels' ? 'bold' : 'normal' }}
                    >
                        {selectedYear.name}
                    </Link>
                )}
                {selectedLevel && (
                    <Link
                        component="button"
                        underline="hover"
                        color={currentView === 'specializations' ? 'primary' : 'inherit'}
                        onClick={() => { if (specializations.length > 0) { setCurrentView('specializations'); setSelectedSpecialization(null); } }}
                        sx={{ fontFamily: 'Cairo', fontWeight: (currentView === 'specializations' || currentView === 'levels') ? 'bold' : 'normal' }}
                    >
                        {getLevelDisplayName(selectedLevel.name)}
                    </Link>
                )}
                {selectedSpecialization && (
                    <Typography color="primary" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                        {selectedSpecialization.name}
                    </Typography>
                )}
            </Breadcrumbs>
        </Paper>
    );

    const renderContent = () => {
        if (loading) {
            return (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <CircularProgress size={50} />
                    <Typography sx={{ mt: 2, fontFamily: 'Cairo', color: '#666' }}>جاري التحميل...</Typography>
                </Box>
            );
        }

        switch (currentView) {
            case 'departments':
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {departments.length === 0 ? (
                            <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, bgcolor: '#fafafa' }}>
                                <DomainIcon sx={{ fontSize: 60, color: '#ddd', mb: 2 }} />
                                <Typography sx={{ fontFamily: 'Cairo', color: '#999' }}>لا توجد أقسام</Typography>
                            </Paper>
                        ) : departments.map((dept, idx) => (
                            <NavItemCard
                                key={dept.id}
                                icon={FolderIcon}
                                title={dept.name}
                                subtitle={dept.code}
                                chip={!dept.is_approved ? 'معلق' : null}
                                chipColor="#FF9800"
                                onClick={() => handleSelectDept(dept)}
                                color="#2196F3"
                                delay={idx * 50}
                            />
                        ))}
                    </Box>
                );

            case 'years':
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {years.length === 0 ? (
                            <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, bgcolor: '#fafafa' }}>
                                <EventIcon sx={{ fontSize: 60, color: '#ddd', mb: 2 }} />
                                <Typography sx={{ fontFamily: 'Cairo', color: '#999' }}>لا توجد سنوات أكاديمية</Typography>
                            </Paper>
                        ) : years.map((year, idx) => (
                            <NavItemCard
                                key={year.id}
                                icon={CalendarMonthIcon}
                                title={year.name}
                                chip={year.is_current ? 'الحالية' : null}
                                chipColor="#4CAF50"
                                onClick={() => handleSelectYear(year)}
                                color="#9C27B0"
                                delay={idx * 50}
                            />
                        ))}
                    </Box>
                );

            case 'levels':
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {levels.length === 0 ? (
                            <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, bgcolor: '#fafafa' }}>
                                <ClassIcon sx={{ fontSize: 60, color: '#ddd', mb: 2 }} />
                                <Typography sx={{ fontFamily: 'Cairo', color: '#999' }}>لا توجد فرق</Typography>
                            </Paper>
                        ) : levels.map((level, idx) => (
                            <NavItemCard
                                key={level.id}
                                icon={ClassIcon}
                                title={getLevelDisplayName(level.name)}
                                onClick={() => handleSelectLevel(level)}
                                color={getLevelColor(level.name)}
                                delay={idx * 50}
                            />
                        ))}
                    </Box>
                );

            case 'specializations':
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {specializations.length === 0 ? (
                            <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, bgcolor: '#fafafa' }}>
                                <AccountTreeIcon sx={{ fontSize: 60, color: '#ddd', mb: 2 }} />
                                <Typography sx={{ fontFamily: 'Cairo', color: '#999' }}>لا توجد تخصصات</Typography>
                            </Paper>
                        ) : specializations.map((spec, idx) => (
                            <NavItemCard
                                key={spec.id}
                                icon={AccountTreeIcon}
                                title={spec.name}
                                subtitle={spec.code}
                                onClick={() => handleSelectSpecialization(spec)}
                                color="#FF9800"
                                delay={idx * 50}
                            />
                        ))}
                    </Box>
                );

            case 'students':
                return (
                    <Fade in={true} timeout={600}>
                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: 3,
                                overflow: 'hidden',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            }}
                        >
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ background: 'linear-gradient(135deg, #2196F3, #21CBF3)' }}>
                                            <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1rem' }}>#</TableCell>
                                            <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1rem' }}>الاسم</TableCell>
                                            <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1rem' }}>الرقم القومي</TableCell>
                                            <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1rem' }}>الحالة</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {students.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} sx={{ textAlign: 'center', py: 6 }}>
                                                    <PersonIcon sx={{ fontSize: 50, color: '#ddd', mb: 1 }} />
                                                    <Typography sx={{ fontFamily: 'Cairo', color: '#999' }}>لا يوجد طلاب</Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : students.map((student, index) => (
                                            <TableRow
                                                key={student.id}
                                                hover
                                                sx={{
                                                    '&:nth-of-type(odd)': { bgcolor: '#fafafa' },
                                                    transition: 'background 0.2s',
                                                }}
                                            >
                                                <TableCell sx={{ fontFamily: 'Cairo' }}>{index + 1}</TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Avatar sx={{ width: 36, height: 36, bgcolor: '#2196F3', fontSize: 14 }}>
                                                            {student.full_name?.charAt(0)}
                                                        </Avatar>
                                                        <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                                            {student.full_name}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                                    {student.national_id}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        icon={student.has_account ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <PendingIcon sx={{ fontSize: 16 }} />}
                                                        label={student.has_account ? 'مفعل' : 'غير مفعل'}
                                                        size="small"
                                                        sx={{
                                                            fontFamily: 'Cairo',
                                                            fontWeight: 'bold',
                                                            bgcolor: student.has_account ? '#e8f5e9' : '#fafafa',
                                                            color: student.has_account ? '#2e7d32' : '#999',
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {students.length > 0 && (
                                <Box sx={{ p: 2, bgcolor: '#fafafa', borderTop: '1px solid #eee' }}>
                                    <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                        إجمالي الطلاب: <strong>{students.length}</strong>
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Fade>
                );
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', pb: 6 }}>
            {/* Hero Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
                    pt: 4,
                    pb: 6,
                    mb: 4,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Floating Elements */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                        animation: `${float} 6s ease-in-out infinite`,
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -80,
                        left: -80,
                        width: 300,
                        height: 300,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.08)',
                        animation: `${float} 8s ease-in-out infinite`,
                        animationDelay: '2s',
                    }}
                />

                <Container maxWidth="xl">
                    <Fade in={true} timeout={800}>
                        <Box>
                            <Button
                                startIcon={<ArrowBackIcon />}
                                onClick={() => navigate('/admin/dashboard')}
                                sx={{
                                    color: '#fff',
                                    mb: 2,
                                    fontFamily: 'Cairo',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                                }}
                            >
                                العودة للوحة التحكم
                            </Button>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Avatar
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        backdropFilter: 'blur(10px)',
                                    }}
                                >
                                    <AccountTreeIcon sx={{ fontSize: 45, color: '#fff' }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                        الهيكل الأكاديمي
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: 'rgba(255,255,255,0.9)' }}>
                                        استعراض الأقسام والسنوات والفرق والطلاب
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Container maxWidth="xl">
                {/* Alerts */}
                {error && (
                    <Fade in={true}>
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 3, fontFamily: 'Cairo' }} onClose={() => setError('')}>
                            {error}
                        </Alert>
                    </Fade>
                )}

                {/* Stats Row */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={DomainIcon}
                            value={departments.length}
                            label="الأقسام"
                            color="#2196F3"
                            delay={0}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={EventIcon}
                            value={years.length || '-'}
                            label="السنوات الدراسية"
                            color="#9C27B0"
                            delay={100}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={ClassIcon}
                            value={levels.length || '-'}
                            label="الفرق"
                            color="#FF9800"
                            delay={200}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={GroupsIcon}
                            value={students.length || '-'}
                            label="الطلاب"
                            color="#4CAF50"
                            delay={300}
                        />
                    </Grid>
                </Grid>

                {/* Breadcrumbs */}
                {renderBreadcrumbs()}

                {/* Current View Title */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: 3,
                        background: '#fff',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {currentView !== 'departments' && (
                            <IconButton onClick={handleBack} sx={{ bgcolor: '#f5f5f5' }}>
                                <ArrowBackIcon />
                            </IconButton>
                        )}
                        <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                            {getViewTitle()}
                        </Typography>
                    </Box>
                </Paper>

                {/* Content */}
                {renderContent()}
            </Container>
        </Box>
    );
}
