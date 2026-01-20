import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, DialogContent,
    TextField, DialogActions, Alert, Tabs, Tab, Breadcrumbs, Link,
    List, ListItem, ListItemButton, ListItemText, ListItemIcon, Chip, CircularProgress,
    Grid, Card, CardContent, Avatar, Tooltip, Fade, Grow
} from '@mui/material';
import { keyframes } from '@mui/system';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LockResetIcon from '@mui/icons-material/LockReset';
import FolderIcon from '@mui/icons-material/Folder';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ClassIcon from '@mui/icons-material/Class';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import BadgeIcon from '@mui/icons-material/Badge';
import PersonIcon from '@mui/icons-material/Person';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

function TabPanel({ children, value, index }) {
    return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

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
                }
            }}
        >
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 50, height: 50, background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 6px 16px ${color}40` }}>
                    <Icon sx={{ fontSize: 26 }} />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744', lineHeight: 1.2 }}>
                        {title}
                    </Typography>
                    {subtitle && <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>{subtitle}</Typography>}
                </Box>
                {chip && <Chip label={chip} size="small" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', bgcolor: `${chipColor}20`, color: chipColor }} />}
                <NavigateNextIcon sx={{ color: '#ccc', fontSize: 28 }} />
            </CardContent>
        </Card>
    </Grow>
);

export default function ManageUsers() {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // User types
    const [studentAffairsUsers, setStudentAffairsUsers] = useState([]);
    const [staffAffairsUsers, setStaffAffairsUsers] = useState([]);
    const [doctorUsers, setDoctorUsers] = useState([]);

    // Students hierarchy
    const [departments, setDepartments] = useState([]);
    const [years, setYears] = useState([]);
    const [levels, setLevels] = useState([]);
    const [students, setStudents] = useState([]);
    const [currentView, setCurrentView] = useState('departments');
    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);

    // Dialog for user creation
    const [open, setOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState({ first_name: '', last_name: '', email: '', role: 'STUDENT_AFFAIRS', national_id: '' });
    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        fetchAllUsers();
        fetchDepartments();
    }, []);

    const fetchAllUsers = async () => {
        try {
            const response = await axios.get('/api/auth/users/', { withCredentials: true });
            setStudentAffairsUsers(response.data.filter(u => u.role === 'STUDENT_AFFAIRS'));
            setStaffAffairsUsers(response.data.filter(u => u.role === 'STAFF_AFFAIRS'));
            setDoctorUsers(response.data.filter(u => u.role === 'DOCTOR'));
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await axios.get('/api/academic/departments/', { withCredentials: true });
            setDepartments(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchYears = async (deptId) => {
        setLoading(true);
        try {
            const levelsRes = await axios.get(`/api/academic/levels/?department=${deptId}`, { withCredentials: true });
            const yearsRes = await axios.get('/api/academic/years/', { withCredentials: true });
            const yearIds = [...new Set(levelsRes.data.map(l => l.academic_year))];
            setYears(yearsRes.data.filter(y => yearIds.includes(y.id)));
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

    const handleBackInHierarchy = () => {
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

    const getLevelColor = (name) => {
        const colors = { 'PREPARATORY': '#9C27B0', 'FIRST': '#2196F3', 'SECOND': '#00BCD4', 'THIRD': '#FF9800', 'FOURTH': '#4CAF50' };
        return colors[name] || '#607D8B';
    };

    const getRoleLabel = (role) => {
        const labels = { 'STUDENT_AFFAIRS': 'شئون الطلاب', 'STAFF_AFFAIRS': 'شئون العاملين', 'DOCTOR': 'دكتور' };
        return labels[role] || role;
    };

    const handleOpen = (user = null, role = 'STUDENT_AFFAIRS') => {
        if (user && user.id) {
            setCurrentUser(user);
            setIsEdit(true);
        } else {
            setCurrentUser({ first_name: '', last_name: '', email: '', role, national_id: '' });
            setIsEdit(false);
        }
        setOpen(true);
        setError('');
    };

    const handleClose = () => setOpen(false);

    const validateNationalId = (id) => /^\d{14}$/.test(id);

    const handleSave = async () => {
        if (!isEdit && !validateNationalId(currentUser.national_id)) {
            setError('الرقم القومي يجب أن يكون 14 رقم فقط');
            return;
        }
        try {
            if (isEdit) {
                const updateData = { ...currentUser };
                if (!updateData.password) delete updateData.password;
                await axios.put(`/api/auth/users/${currentUser.id}/`, updateData, { withCredentials: true });
                setSuccess('تم تحديث البيانات بنجاح');
            } else {
                await axios.post('/api/auth/users/', {
                    ...currentUser,
                    username: currentUser.national_id,
                    password: currentUser.national_id
                }, { withCredentials: true });
                setSuccess('تم إنشاء الحساب بنجاح');
            }
            fetchAllUsers();
            handleClose();
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.national_id?.[0] || 'حدث خطأ أثناء الحفظ');
        }
    };

    const handleResetPassword = async (user) => {
        if (!window.confirm(`هل أنت متأكد من إعادة تعيين كلمة مرور ${user.first_name} ${user.last_name} إلى الرقم القومي؟`)) return;
        try {
            await axios.post(`/api/auth/users/${user.id}/reset-password/`, {}, { withCredentials: true });
            setSuccess('تم إعادة تعيين كلمة المرور بنجاح');
        } catch (err) {
            setError('فشل في إعادة تعيين كلمة المرور');
        }
    };

    const handleDeleteUser = async (user) => {
        if (!window.confirm(`هل أنت متأكد من حذف المستخدم ${user.first_name} ${user.last_name}؟ هذا الإجراء لا يمكن التراجع عنه!`)) return;
        try {
            await axios.delete(`/api/auth/users/${user.id}/`, { withCredentials: true });
            setSuccess('تم حذف المستخدم بنجاح');
            fetchAllUsers();
        } catch (err) {
            setError('فشل في حذف المستخدم');
        }
    };

    const renderStudentsHierarchy = () => {
        if (loading) return <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress size={50} /><Typography sx={{ mt: 2, fontFamily: 'Cairo', color: '#666' }}>جاري التحميل...</Typography></Box>;

        return (
            <Box>
                {/* Breadcrumbs */}
                <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" sx={{ color: '#ccc' }} />}>
                        <Link component="button" onClick={() => { setCurrentView('departments'); setSelectedDept(null); setSelectedYear(null); setSelectedLevel(null); }} sx={{ display: 'flex', alignItems: 'center', fontFamily: 'Cairo', fontWeight: currentView === 'departments' ? 'bold' : 'normal', color: currentView === 'departments' ? 'primary.main' : 'inherit' }}>
                            <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} /> الأقسام
                        </Link>
                        {selectedDept && <Link component="button" onClick={() => { setCurrentView('years'); setSelectedYear(null); setSelectedLevel(null); }} sx={{ fontFamily: 'Cairo', fontWeight: currentView === 'years' ? 'bold' : 'normal', color: currentView === 'years' ? 'primary.main' : 'inherit' }}>{selectedDept.name}</Link>}
                        {selectedYear && <Link component="button" onClick={() => { setCurrentView('levels'); setSelectedLevel(null); }} sx={{ fontFamily: 'Cairo', fontWeight: currentView === 'levels' ? 'bold' : 'normal', color: currentView === 'levels' ? 'primary.main' : 'inherit' }}>{selectedYear.name}</Link>}
                        {selectedLevel && <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: 'primary.main' }}>{getLevelDisplayName(selectedLevel.name)}</Typography>}
                    </Breadcrumbs>
                </Paper>

                {currentView !== 'departments' && (
                    <Button startIcon={<ArrowBackIcon />} onClick={handleBackInHierarchy} sx={{ mb: 2, fontFamily: 'Cairo', borderRadius: 2 }}>رجوع</Button>
                )}

                {currentView === 'departments' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {departments.length === 0 ? (
                            <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, bgcolor: '#fafafa' }}>
                                <FolderIcon sx={{ fontSize: 60, color: '#ddd', mb: 2 }} />
                                <Typography sx={{ fontFamily: 'Cairo', color: '#999' }}>لا توجد أقسام</Typography>
                            </Paper>
                        ) : departments.map((dept, idx) => (
                            <NavItemCard key={dept.id} icon={FolderIcon} title={dept.name} subtitle={dept.code} onClick={() => handleSelectDept(dept)} color="#2196F3" delay={idx * 50} />
                        ))}
                    </Box>
                )}

                {currentView === 'years' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {years.length === 0 ? (
                            <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, bgcolor: '#fafafa' }}>
                                <CalendarMonthIcon sx={{ fontSize: 60, color: '#ddd', mb: 2 }} />
                                <Typography sx={{ fontFamily: 'Cairo', color: '#999' }}>لا توجد سنوات</Typography>
                            </Paper>
                        ) : years.map((year, idx) => (
                            <NavItemCard key={year.id} icon={CalendarMonthIcon} title={year.name} chip={year.is_current ? 'الحالية' : null} chipColor="#4CAF50" onClick={() => handleSelectYear(year)} color="#9C27B0" delay={idx * 50} />
                        ))}
                    </Box>
                )}

                {currentView === 'levels' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {levels.length === 0 ? (
                            <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, bgcolor: '#fafafa' }}>
                                <ClassIcon sx={{ fontSize: 60, color: '#ddd', mb: 2 }} />
                                <Typography sx={{ fontFamily: 'Cairo', color: '#999' }}>لا توجد فرق</Typography>
                            </Paper>
                        ) : levels.map((level, idx) => (
                            <NavItemCard key={level.id} icon={ClassIcon} title={getLevelDisplayName(level.name)} onClick={() => handleSelectLevel(level)} color={getLevelColor(level.name)} delay={idx * 50} />
                        ))}
                    </Box>
                )}

                {currentView === 'students' && (
                    <Fade in={true} timeout={600}>
                        <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ background: 'linear-gradient(135deg, #FF6B35, #F7931E)' }}>
                                            <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>#</TableCell>
                                            <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>الاسم</TableCell>
                                            <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>الرقم القومي</TableCell>
                                            <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>الحالة</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {students.length === 0 ? (
                                            <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center', py: 6 }}><PersonIcon sx={{ fontSize: 50, color: '#ddd', mb: 1 }} /><Typography sx={{ fontFamily: 'Cairo', color: '#999' }}>لا يوجد طلاب</Typography></TableCell></TableRow>
                                        ) : students.map((s, i) => (
                                            <TableRow key={s.id} hover sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                                                <TableCell>{i + 1}</TableCell>
                                                <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><Avatar sx={{ width: 36, height: 36, bgcolor: '#FF6B35', fontSize: 14 }}>{s.full_name?.charAt(0)}</Avatar><Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{s.full_name}</Typography></Box></TableCell>
                                                <TableCell sx={{ fontFamily: 'monospace' }}>{s.national_id}</TableCell>
                                                <TableCell><Chip icon={s.has_account ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <PendingIcon sx={{ fontSize: 16 }} />} label={s.has_account ? 'مفعل' : 'غير مفعل'} size="small" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', bgcolor: s.has_account ? '#e8f5e9' : '#fafafa', color: s.has_account ? '#2e7d32' : '#999' }} /></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {students.length > 0 && <Box sx={{ p: 2, bgcolor: '#fafafa', borderTop: '1px solid #eee' }}><Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>إجمالي الطلاب: <strong>{students.length}</strong></Typography></Box>}
                        </Paper>
                    </Fade>
                )}
            </Box>
        );
    };

    const renderEditableTable = (users, role, gradient) => (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen(null, role)}
                    sx={{
                        fontFamily: 'Cairo',
                        fontWeight: 'bold',
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        background: gradient,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        '&:hover': { background: gradient, boxShadow: '0 12px 32px rgba(0,0,0,0.2)' }
                    }}
                >
                    إضافة موظف {getRoleLabel(role)}
                </Button>
            </Box>
            {users.length === 0 ? (
                <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: 3, bgcolor: '#fafafa' }}>
                    <PersonIcon sx={{ fontSize: 60, color: '#ddd', mb: 2 }} />
                    <Typography sx={{ fontFamily: 'Cairo', color: '#999' }}>لا يوجد موظفين</Typography>
                </Paper>
            ) : (
                <Fade in={true} timeout={600}>
                    <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ background: gradient }}>
                                        <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>#</TableCell>
                                        <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>الاسم</TableCell>
                                        <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>الرقم القومي</TableCell>
                                        <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>البريد</TableCell>
                                        <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>الإجراءات</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((user, idx) => (
                                        <TableRow key={user.id} hover sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                                            <TableCell>{idx + 1}</TableCell>
                                            <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><Avatar sx={{ width: 36, height: 36, background: gradient, fontSize: 14 }}>{user.first_name?.charAt(0)}</Avatar><Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{user.first_name} {user.last_name}</Typography></Box></TableCell>
                                            <TableCell sx={{ fontFamily: 'monospace' }}>{user.national_id || '-'}</TableCell>
                                            <TableCell>{user.email || '-'}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    <Tooltip title="تعديل"><IconButton onClick={() => handleOpen(user, role)} sx={{ bgcolor: '#e3f2fd', color: '#1976d2', '&:hover': { bgcolor: '#bbdefb' } }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                                    <Tooltip title="إعادة تعيين كلمة المرور"><IconButton onClick={() => handleResetPassword(user)} sx={{ bgcolor: '#fff8e1', color: '#f9a825', '&:hover': { bgcolor: '#ffecb3' } }}><LockResetIcon fontSize="small" /></IconButton></Tooltip>
                                                    <Tooltip title="حذف"><IconButton onClick={() => handleDeleteUser(user)} sx={{ bgcolor: '#ffebee', color: '#c62828', '&:hover': { bgcolor: '#ffcdd2' } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Fade>
            )}
        </Box>
    );

    const tabColors = ['linear-gradient(135deg, #FF6B35, #F7931E)', 'linear-gradient(135deg, #2196F3, #21CBF3)', 'linear-gradient(135deg, #9C27B0, #E040FB)', 'linear-gradient(135deg, #4CAF50, #8BC34A)'];

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', pb: 6 }}>
            {/* Hero Header */}
            <Box sx={{ background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)', pt: 4, pb: 6, mb: 4, position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', animation: `${float} 6s ease-in-out infinite` }} />
                <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', animation: `${float} 8s ease-in-out infinite`, animationDelay: '2s' }} />

                <Container maxWidth="xl">
                    <Fade in={true} timeout={800}>
                        <Box>
                            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/dashboard')} sx={{ color: '#fff', mb: 2, fontFamily: 'Cairo', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>العودة للوحة التحكم</Button>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}><GroupIcon sx={{ fontSize: 45, color: '#fff' }} /></Avatar>
                                <Box>
                                    <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>إدارة المستخدمين</Typography>
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: 'rgba(255,255,255,0.9)' }}>إدارة جميع حسابات المستخدمين في النظام</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Container maxWidth="xl">
                {error && <Fade in={true}><Alert severity="error" sx={{ mb: 3, borderRadius: 3, fontFamily: 'Cairo' }} onClose={() => setError('')}>{error}</Alert></Fade>}
                {success && <Fade in={true}><Alert severity="success" sx={{ mb: 3, borderRadius: 3, fontFamily: 'Cairo' }} onClose={() => setSuccess('')}>{success}</Alert></Fade>}

                {/* Stats Row */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}><StatCard icon={SchoolIcon} value={students.length || '-'} label="الطلاب" color="#FF6B35" delay={0} /></Grid>
                    <Grid item xs={12} sm={6} md={3}><StatCard icon={BadgeIcon} value={studentAffairsUsers.length} label="شئون الطلاب" color="#2196F3" delay={100} /></Grid>
                    <Grid item xs={12} sm={6} md={3}><StatCard icon={SupervisorAccountIcon} value={staffAffairsUsers.length} label="شئون العاملين" color="#9C27B0" delay={200} /></Grid>
                    <Grid item xs={12} sm={6} md={3}><StatCard icon={PersonIcon} value={doctorUsers.length} label="الدكاترة" color="#4CAF50" delay={300} /></Grid>
                </Grid>

                {/* Tabs */}
                <Paper elevation={0} sx={{ borderRadius: 4, background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 2 }}>
                        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ '& .MuiTab-root': { fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1rem', minHeight: 56 } }}>
                            <Tab icon={<SchoolIcon />} iconPosition="start" label="الطلاب" />
                            <Tab icon={<BadgeIcon />} iconPosition="start" label={`شئون الطلاب (${studentAffairsUsers.length})`} />
                            <Tab icon={<SupervisorAccountIcon />} iconPosition="start" label={`شئون العاملين (${staffAffairsUsers.length})`} />
                            <Tab icon={<PersonIcon />} iconPosition="start" label={`الدكاترة (${doctorUsers.length})`} />
                        </Tabs>
                    </Box>

                    <Box sx={{ p: 3 }}>
                        <TabPanel value={tabValue} index={0}>{renderStudentsHierarchy()}</TabPanel>
                        <TabPanel value={tabValue} index={1}>{renderEditableTable(studentAffairsUsers, 'STUDENT_AFFAIRS', tabColors[1])}</TabPanel>
                        <TabPanel value={tabValue} index={2}>{renderEditableTable(staffAffairsUsers, 'STAFF_AFFAIRS', tabColors[2])}</TabPanel>
                        <TabPanel value={tabValue} index={3}>{renderEditableTable(doctorUsers, 'DOCTOR', tabColors[3])}</TabPanel>
                    </Box>
                </Paper>
            </Container>

            {/* Add/Edit Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
                <DialogTitle sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1.5rem' }}>{isEdit ? 'تعديل بيانات' : 'إضافة'} موظف {getRoleLabel(currentUser.role)}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField label="الاسم الأول" fullWidth required value={currentUser.first_name} onChange={(e) => setCurrentUser({ ...currentUser, first_name: e.target.value })} InputLabelProps={{ sx: { fontFamily: 'Cairo' } }} InputProps={{ sx: { borderRadius: 2 } }} />
                        <TextField label="اسم العائلة" fullWidth required value={currentUser.last_name} onChange={(e) => setCurrentUser({ ...currentUser, last_name: e.target.value })} InputLabelProps={{ sx: { fontFamily: 'Cairo' } }} InputProps={{ sx: { borderRadius: 2 } }} />
                        <TextField label="الرقم القومي (14 رقم)" fullWidth required value={currentUser.national_id} onChange={(e) => { const value = e.target.value.replace(/\D/g, '').slice(0, 14); setCurrentUser({ ...currentUser, national_id: value }); }} InputLabelProps={{ sx: { fontFamily: 'Cairo' } }} InputProps={{ sx: { borderRadius: 2 } }} disabled={isEdit} helperText={`${currentUser.national_id.length}/14 - سيكون اسم المستخدم وكلمة المرور`} error={!isEdit && currentUser.national_id.length > 0 && currentUser.national_id.length !== 14} />
                        <TextField label="البريد الإلكتروني (اختياري)" fullWidth value={currentUser.email} onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })} InputLabelProps={{ sx: { fontFamily: 'Cairo' } }} InputProps={{ sx: { borderRadius: 2 } }} />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={handleClose} sx={{ fontFamily: 'Cairo', px: 3, borderRadius: 2 }}>إلغاء</Button>
                    <Button onClick={handleSave} variant="contained" disabled={!isEdit && currentUser.national_id.length !== 14} sx={{ fontFamily: 'Cairo', px: 4, borderRadius: 2, background: 'linear-gradient(135deg, #FF6B35, #F7931E)', '&:hover': { background: 'linear-gradient(135deg, #e55a2b, #e08519)' } }}>حفظ</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
