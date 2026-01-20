import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Paper, Grid, Card, CardContent, Button, Breadcrumbs, Link,
    CircularProgress, Chip, IconButton, Tooltip, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Avatar, Fade, Grow
} from '@mui/material';
import { keyframes } from '@mui/system';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import FolderIcon from '@mui/icons-material/Folder';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SchoolIcon from '@mui/icons-material/School';
import LockResetIcon from '@mui/icons-material/LockReset';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PeopleIcon from '@mui/icons-material/People';
import CategoryIcon from '@mui/icons-material/Category';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

// Navigation Card Component
const NavCard = ({ icon: Icon, title, subtitle, chip, chipColor, onClick, color, delay = 0, special = false }) => (
    <Grow in={true} timeout={600 + delay}>
        <Card
            onClick={onClick}
            sx={{
                borderRadius: 3,
                background: '#fff',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                border: special ? `2px solid ${color}` : '1px solid rgba(0,0,0,0.06)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.12)',
                    borderColor: color,
                }
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    <Avatar
                        sx={{
                            width: 60,
                            height: 60,
                            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                            boxShadow: `0 8px 20px ${color}40`,
                        }}
                    >
                        <Icon sx={{ fontSize: 30 }} />
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
                    <ArrowForwardIcon sx={{ color: '#ccc', fontSize: 28 }} />
                </Box>
            </CardContent>
        </Card>
    </Grow>
);

// Stats Card Component
const StatCard = ({ icon: Icon, value, label, color }) => (
    <Paper
        elevation={0}
        sx={{
            p: 2.5,
            borderRadius: 3,
            background: '#fff',
            boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
            textAlign: 'center',
        }}
    >
        <Box
            sx={{
                width: 45,
                height: 45,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 1,
            }}
        >
            <Icon sx={{ fontSize: 24, color: '#fff' }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a2744', fontFamily: 'Cairo' }}>
            {value}
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Cairo' }}>
            {label}
        </Typography>
    </Paper>
);

export default function HierarchyView() {
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [levels, setLevels] = useState([]);
    const [students, setStudents] = useState([]);

    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [specializations, setSpecializations] = useState([]);
    const [selectedSpecialization, setSelectedSpecialization] = useState(null);

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

    const fetchStudents = async (levelId, deptId, yearId, specializationId = null) => {
        setLoading(true);
        try {
            let url = '/api/academic/student-affairs/students/';
            const params = new URLSearchParams();
            if (levelId) params.append('level', levelId);
            if (deptId) params.append('department', deptId);
            if (yearId) params.append('academic_year', yearId);
            if (specializationId) params.append('specialization', specializationId);

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
        if (selectedDept?.isPreparatory) {
            const prepLevel = { id: 'PREP', name: 'PREPARATORY' };
            setSelectedLevel(prepLevel);
            fetchPrepStudents(year.id);
        } else {
            fetchLevels(selectedDept.id, year.id);
            setSelectedLevel(null);
            setStudents([]);
        }
    };

    const fetchPrepStudents = async (yearId) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `/api/academic/student-affairs/students/?level_name=PREPARATORY&academic_year=${yearId}`,
                { withCredentials: true }
            );
            setStudents(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching prep students:', err);
            setStudents([]);
            setLoading(false);
        }
    };

    const handleLevelClick = (level) => {
        setSelectedLevel(level);
        const isElectrical = selectedDept?.name?.includes('كهرب');
        const needsSpecialization = isElectrical && level.name !== 'FIRST';

        if (needsSpecialization) {
            fetchSpecializations(selectedDept.id);
            setSelectedSpecialization(null);
            setStudents([]);
        } else {
            fetchStudents(level.id, selectedDept?.id, selectedYear?.id);
        }
    };

    const fetchSpecializations = async (deptId) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/academic/specializations/?department=${deptId}`, { withCredentials: true });
            setSpecializations(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching specializations:', err);
            setLoading(false);
        }
    };

    const handleSpecializationClick = (spec) => {
        setSelectedSpecialization(spec);
        fetchStudents(selectedLevel?.id, selectedDept?.id, selectedYear?.id, spec.id);
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
        setSpecializations([]);
        setSelectedSpecialization(null);
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

    const getLevelColor = (name) => {
        const colors = { 'PREPARATORY': '#FF9800', 'FIRST': '#2196F3', 'SECOND': '#00BCD4', 'THIRD': '#9C27B0', 'FOURTH': '#4CAF50' };
        return colors[name] || '#607D8B';
    };

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', pb: 6 }}>
            {/* Hero Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #00BCD4 0%, #00ACC1 100%)',
                    pt: 4,
                    pb: 6,
                    mb: 4,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', animation: `${float} 6s ease-in-out infinite` }} />
                <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', animation: `${float} 8s ease-in-out infinite`, animationDelay: '2s' }} />

                <Container maxWidth="xl">
                    <Fade in={true} timeout={800}>
                        <Box>
                            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/student-affairs/dashboard')} sx={{ color: '#fff', mb: 2, fontFamily: 'Cairo', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                                العودة للوحة التحكم
                            </Button>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                                    <AccountTreeIcon sx={{ fontSize: 45, color: '#fff' }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                        الهيكل الأكاديمي
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: 'rgba(255,255,255,0.9)' }}>
                                        إدارة الطلاب حسب القسم والسنة والفرقة
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Container maxWidth="xl">
                {/* Stats Row */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={6} sm={3}><StatCard icon={FolderIcon} value={departments.length} label="الأقسام" color="#2196F3" /></Grid>
                    <Grid item xs={6} sm={3}><StatCard icon={CalendarMonthIcon} value={academicYears.length || '-'} label="السنوات" color="#4CAF50" /></Grid>
                    <Grid item xs={6} sm={3}><StatCard icon={SchoolIcon} value={levels.length || '-'} label="الفرق" color="#FF9800" /></Grid>
                    <Grid item xs={6} sm={3}><StatCard icon={PeopleIcon} value={students.length || '-'} label="الطلاب" color="#E91E63" /></Grid>
                </Grid>

                {/* Breadcrumbs */}
                <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" sx={{ color: '#ccc' }} />}>
                        <Link component="button" onClick={resetView} sx={{ display: 'flex', alignItems: 'center', fontFamily: 'Cairo', fontWeight: !selectedDept ? 'bold' : 'normal', color: !selectedDept ? 'primary.main' : 'inherit' }}>
                            <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} /> الأقسام
                        </Link>
                        {selectedDept && <Link component="button" onClick={() => { setSelectedYear(null); setSelectedLevel(null); setStudents([]); setSpecializations([]); fetchAcademicYears(); }} sx={{ fontFamily: 'Cairo', fontWeight: selectedDept && !selectedYear ? 'bold' : 'normal', color: selectedDept && !selectedYear ? 'primary.main' : 'inherit' }}>{selectedDept.name}</Link>}
                        {selectedYear && <Link component="button" onClick={() => { setSelectedLevel(null); setStudents([]); setSpecializations([]); }} sx={{ fontFamily: 'Cairo', fontWeight: selectedYear && !selectedLevel ? 'bold' : 'normal', color: selectedYear && !selectedLevel ? 'primary.main' : 'inherit' }}>{selectedYear.name}</Link>}
                        {selectedLevel && <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: 'primary.main' }}>{getLevelDisplayName(selectedLevel.name)}</Typography>}
                        {selectedSpecialization && <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: 'secondary.main' }}>{selectedSpecialization.name}</Typography>}
                    </Breadcrumbs>
                </Paper>

                {loading && <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress size={50} /><Typography sx={{ mt: 2, fontFamily: 'Cairo', color: '#666' }}>جاري التحميل...</Typography></Box>}

                {/* Step 1: Departments */}
                {!loading && !selectedDept && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <NavCard icon={SchoolIcon} title="الفرقة الإعدادية" subtitle="جميع طلاب السنة التحضيرية" onClick={() => handleDeptClick({ id: null, name: 'الفرقة الإعدادية', code: 'PREP', isPreparatory: true })} color="#FF9800" delay={0} special={true} />
                        {departments.filter(dept => dept.code !== 'PREP').map((dept, idx) => (
                            <NavCard key={dept.id} icon={FolderIcon} title={dept.name} subtitle={dept.code} onClick={() => handleDeptClick(dept)} color="#2196F3" delay={(idx + 1) * 50} />
                        ))}
                        {departments.length === 0 && <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, bgcolor: '#fafafa' }}><Typography sx={{ fontFamily: 'Cairo', color: '#999' }}>لا توجد أقسام مسجلة.</Typography></Paper>}
                    </Box>
                )}

                {/* Step 2: Academic Years */}
                {!loading && selectedDept && !selectedYear && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {academicYears.length > 0 ? academicYears.map((year, idx) => (
                            <NavCard key={year.id} icon={CalendarMonthIcon} title={year.name} chip={year.is_current ? 'الحالي' : null} chipColor="#4CAF50" onClick={() => handleYearClick(year)} color="#4CAF50" delay={idx * 50} />
                        )) : <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, bgcolor: '#fafafa' }}><Typography sx={{ fontFamily: 'Cairo', color: '#999' }}>لا توجد سنوات أكاديمية مسجلة.</Typography></Paper>}
                    </Box>
                )}

                {/* Step 3: Levels */}
                {!loading && selectedDept && selectedYear && !selectedLevel && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {levels.length > 0 ? levels.map((level, idx) => (
                            <NavCard key={level.id} icon={SchoolIcon} title={getLevelDisplayName(level.name)} onClick={() => handleLevelClick(level)} color={getLevelColor(level.name)} delay={idx * 50} />
                        )) : <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, bgcolor: '#fafafa' }}><Typography sx={{ fontFamily: 'Cairo', color: '#999' }}>لا توجد فرق دراسية مسجلة لهذا القسم في هذه السنة.</Typography></Paper>}
                    </Box>
                )}

                {/* Step 3b: Specializations */}
                {!loading && selectedLevel && specializations.length > 0 && !selectedSpecialization && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {specializations.map((spec, idx) => (
                            <NavCard key={spec.id} icon={CategoryIcon} title={spec.name} onClick={() => handleSpecializationClick(spec)} color="#9C27B0" delay={idx * 50} special={true} />
                        ))}
                    </Box>
                )}

                {/* Step 4: Students Table */}
                {!loading && selectedLevel && (specializations.length === 0 || selectedSpecialization) && (
                    <Fade in={true} timeout={600}>
                        <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                            <Box sx={{ p: 3, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                    الطلاب المسجلين
                                </Typography>
                                <Chip label={`${students.length} طالب`} sx={{ fontFamily: 'Cairo', fontWeight: 'bold', bgcolor: '#e3f2fd', color: '#1976d2' }} />
                            </Box>

                            {students.length > 0 ? (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ background: 'linear-gradient(135deg, #00BCD4, #00ACC1)' }}>
                                                <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>#</TableCell>
                                                <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>الاسم</TableCell>
                                                <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>اسم المستخدم</TableCell>
                                                <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>الرقم القومي</TableCell>
                                                <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>المستوى</TableCell>
                                                <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>الحالة</TableCell>
                                                <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>إجراءات</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {students.map((student, idx) => (
                                                <TableRow key={student.id} hover sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                                                    <TableCell>{idx + 1}</TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            <Avatar sx={{ width: 36, height: 36, bgcolor: '#00BCD4', fontSize: 14 }}>{student.full_name?.charAt(0)}</Avatar>
                                                            <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{student.full_name}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ fontFamily: 'monospace' }}>{student.username}</TableCell>
                                                    <TableCell sx={{ fontFamily: 'monospace' }}>{student.national_id}</TableCell>
                                                    <TableCell sx={{ fontFamily: 'Cairo' }}>{getLevelDisplayName(student.level_name)}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            icon={student.first_login_required ? <PendingIcon sx={{ fontSize: 16 }} /> : <CheckCircleIcon sx={{ fontSize: 16 }} />}
                                                            label={student.first_login_required ? 'أول دخول' : 'فعّال'}
                                                            size="small"
                                                            sx={{ fontFamily: 'Cairo', fontWeight: 'bold', bgcolor: student.first_login_required ? '#fff3e0' : '#e8f5e9', color: student.first_login_required ? '#e65100' : '#2e7d32' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Tooltip title="إعادة تعيين كلمة المرور">
                                                            <IconButton onClick={() => setResetDialog({ open: true, student })} sx={{ bgcolor: '#e3f2fd', color: '#1976d2', '&:hover': { bgcolor: '#bbdefb' } }}>
                                                                <LockResetIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Box sx={{ p: 6, textAlign: 'center' }}>
                                    <PeopleIcon sx={{ fontSize: 60, color: '#ddd', mb: 2 }} />
                                    <Typography sx={{ fontFamily: 'Cairo', color: '#999' }}>لا يوجد طلاب مسجلين في هذا المستوى.</Typography>
                                </Box>
                            )}
                        </Paper>
                    </Fade>
                )}
            </Container>

            {/* Reset Password Dialog */}
            <Dialog open={resetDialog.open} onClose={() => setResetDialog({ open: false, student: null })} PaperProps={{ sx: { borderRadius: 4, p: 1, minWidth: 400 } }}>
                <DialogTitle sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1.3rem', textAlign: 'center' }}>
                    إعادة تعيين كلمة المرور
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Avatar sx={{ width: 70, height: 70, background: 'linear-gradient(135deg, #FF9800, #FFD93D)', mx: 'auto', mb: 2 }}>
                            <LockResetIcon sx={{ fontSize: 40 }} />
                        </Avatar>
                        {resetResult ? (
                            <Alert severity={resetResult.success ? 'success' : 'error'} sx={{ fontFamily: 'Cairo' }}>
                                {resetResult.message}
                            </Alert>
                        ) : (
                            <>
                                <Typography sx={{ fontFamily: 'Cairo', fontSize: '1rem', mb: 1 }}>
                                    هل تريد إعادة تعيين كلمة المرور للطالب
                                </Typography>
                                <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1.2rem', color: '#1a2744' }}>
                                    "{resetDialog.student?.full_name}"
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666', mt: 2 }}>
                                    سيتم تعيين كلمة المرور إلى الرقم القومي
                                </Typography>
                            </>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'center', gap: 2 }}>
                    <Button onClick={() => { setResetDialog({ open: false, student: null }); setResetResult(null); }} sx={{ fontFamily: 'Cairo', px: 4, borderRadius: 2 }}>
                        إغلاق
                    </Button>
                    {!resetResult && (
                        <Button variant="contained" onClick={handleResetPassword} sx={{ fontFamily: 'Cairo', px: 4, borderRadius: 2, background: 'linear-gradient(135deg, #FF9800, #FFD93D)', color: '#fff', '&:hover': { background: 'linear-gradient(135deg, #F57C00, #FFB74D)' } }}>
                            تأكيد
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
}
