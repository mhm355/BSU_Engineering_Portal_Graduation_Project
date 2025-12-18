import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, DialogContent,
    TextField, DialogActions, Alert, Tabs, Tab, Breadcrumbs, Link,
    List, ListItem, ListItemButton, ListItemText, ListItemIcon, Chip, CircularProgress,
    FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ClassIcon from '@mui/icons-material/Class';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function TabPanel({ children, value, index }) {
    return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

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

    const getRoleLabel = (role) => {
        const labels = {
            'STUDENT_AFFAIRS': 'شئون الطلاب',
            'STAFF_AFFAIRS': 'شئون العاملين',
        };
        return labels[role] || role;
    };

    // Dialog handlers - Admin can create Student Affairs and Staff Affairs
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

    // Validate national ID is exactly 14 digits
    const validateNationalId = (id) => {
        return /^\d{14}$/.test(id);
    };

    const handleSave = async () => {
        // Validate national ID for new users
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

    const renderStudentsHierarchy = () => {
        if (loading) return <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>;

        return (
            <Box>
                {/* Breadcrumbs */}
                <Breadcrumbs sx={{ mb: 2 }}>
                    <Link component="button" onClick={() => { setCurrentView('departments'); setSelectedDept(null); setSelectedYear(null); setSelectedLevel(null); }} sx={{ fontFamily: 'Cairo' }}>
                        الأقسام
                    </Link>
                    {selectedDept && (
                        <Link component="button" onClick={() => { setCurrentView('years'); setSelectedYear(null); setSelectedLevel(null); }} sx={{ fontFamily: 'Cairo' }}>
                            {selectedDept.name}
                        </Link>
                    )}
                    {selectedYear && (
                        <Link component="button" onClick={() => { setCurrentView('levels'); setSelectedLevel(null); }} sx={{ fontFamily: 'Cairo' }}>
                            {selectedYear.name}
                        </Link>
                    )}
                    {selectedLevel && (
                        <Typography sx={{ fontFamily: 'Cairo' }}>{getLevelDisplayName(selectedLevel.name)}</Typography>
                    )}
                </Breadcrumbs>

                {currentView !== 'departments' && (
                    <Button startIcon={<ArrowBackIcon />} onClick={handleBackInHierarchy} sx={{ mb: 2, fontFamily: 'Cairo' }}>
                        رجوع
                    </Button>
                )}

                {currentView === 'departments' && (
                    <List>
                        {departments.map(dept => (
                            <ListItem key={dept.id} disablePadding>
                                <ListItemButton onClick={() => handleSelectDept(dept)}>
                                    <ListItemIcon><FolderIcon color="primary" /></ListItemIcon>
                                    <ListItemText primary={dept.name} primaryTypographyProps={{ fontFamily: 'Cairo' }} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                )}

                {currentView === 'years' && (
                    <List>
                        {years.map(year => (
                            <ListItem key={year.id} disablePadding>
                                <ListItemButton onClick={() => handleSelectYear(year)}>
                                    <ListItemIcon><CalendarMonthIcon color="secondary" /></ListItemIcon>
                                    <ListItemText primary={year.name} primaryTypographyProps={{ fontFamily: 'Cairo' }} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                )}

                {currentView === 'levels' && (
                    <List>
                        {levels.map(level => (
                            <ListItem key={level.id} disablePadding>
                                <ListItemButton onClick={() => handleSelectLevel(level)}>
                                    <ListItemIcon><ClassIcon color="warning" /></ListItemIcon>
                                    <ListItemText primary={getLevelDisplayName(level.name)} primaryTypographyProps={{ fontFamily: 'Cairo' }} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                )}

                {currentView === 'students' && (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead sx={{ bgcolor: '#1976d2' }}>
                                <TableRow>
                                    <TableCell sx={{ color: 'white', fontFamily: 'Cairo' }}>#</TableCell>
                                    <TableCell sx={{ color: 'white', fontFamily: 'Cairo' }}>الاسم</TableCell>
                                    <TableCell sx={{ color: 'white', fontFamily: 'Cairo' }}>الرقم القومي</TableCell>
                                    <TableCell sx={{ color: 'white', fontFamily: 'Cairo' }}>الحالة</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {students.map((s, i) => (
                                    <TableRow key={s.id}>
                                        <TableCell>{i + 1}</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo' }}>{s.full_name}</TableCell>
                                        <TableCell>{s.national_id}</TableCell>
                                        <TableCell>
                                            <Chip label={s.has_account ? 'مفعل' : 'غير مفعل'} size="small" color={s.has_account ? 'success' : 'default'} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        );
    };

    // Read-only table for Doctors (Staff Affairs uploads them)
    const renderDoctorsTable = () => (
        <Box>
            <Alert severity="info" sx={{ mb: 2, fontFamily: 'Cairo' }}>
                <strong>للعرض فقط:</strong> يتم إنشاء حسابات الدكاترة من خلال شئون العاملين (Staff Affairs)
            </Alert>
            {doctorUsers.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography sx={{ fontFamily: 'Cairo', color: 'text.secondary' }}>لا يوجد دكاترة مسجلين</Typography>
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>#</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الاسم</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الرقم القومي</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>البريد</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {doctorUsers.map((user, idx) => (
                                <TableRow key={user.id}>
                                    <TableCell>{idx + 1}</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo' }}>{user.first_name} {user.last_name}</TableCell>
                                    <TableCell>{user.national_id || '-'}</TableCell>
                                    <TableCell>{user.email || '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );

    // Editable table - Admin can create/edit Student Affairs and Staff Affairs
    const renderEditableTable = (users, role) => (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen(null, role)} sx={{ fontFamily: 'Cairo' }}>
                    إضافة موظف {getRoleLabel(role)}
                </Button>
            </Box>
            {users.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography sx={{ fontFamily: 'Cairo', color: 'text.secondary' }}>لا يوجد موظفين</Typography>
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>#</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الاسم</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الرقم القومي</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>البريد</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الإجراءات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user, idx) => (
                                <TableRow key={user.id}>
                                    <TableCell>{idx + 1}</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo' }}>{user.first_name} {user.last_name}</TableCell>
                                    <TableCell>{user.national_id || '-'}</TableCell>
                                    <TableCell>{user.email || '-'}</TableCell>
                                    <TableCell>
                                        <IconButton color="primary" onClick={() => handleOpen(user, role)}><EditIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <IconButton onClick={() => navigate('/admin/dashboard')}><ArrowBackIcon /></IconButton>
                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>إدارة المستخدمين</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Paper sx={{ p: 2 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label="الطلاب" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} />
                    <Tab label={`شئون الطلاب (${studentAffairsUsers.length})`} sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} />
                    <Tab label={`شئون العاملين (${staffAffairsUsers.length})`} sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} />
                    <Tab label={`الدكاترة (${doctorUsers.length})`} sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} icon={<VisibilityIcon fontSize="small" />} iconPosition="start" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                    {renderStudentsHierarchy()}
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                    {renderEditableTable(studentAffairsUsers, 'STUDENT_AFFAIRS')}
                </TabPanel>
                <TabPanel value={tabValue} index={2}>
                    {renderEditableTable(staffAffairsUsers, 'STAFF_AFFAIRS')}
                </TabPanel>
                <TabPanel value={tabValue} index={3}>
                    {renderDoctorsTable()}
                </TabPanel>
            </Paper>

            {/* Add/Edit Staff Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontFamily: 'Cairo' }}>
                    {isEdit ? 'تعديل بيانات' : 'إضافة'} موظف {getRoleLabel(currentUser.role)}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="الاسم الأول"
                            fullWidth
                            required
                            value={currentUser.first_name}
                            onChange={(e) => setCurrentUser({ ...currentUser, first_name: e.target.value })}
                            InputLabelProps={{ sx: { fontFamily: 'Cairo' } }}
                        />
                        <TextField
                            label="اسم العائلة"
                            fullWidth
                            required
                            value={currentUser.last_name}
                            onChange={(e) => setCurrentUser({ ...currentUser, last_name: e.target.value })}
                            InputLabelProps={{ sx: { fontFamily: 'Cairo' } }}
                        />
                        <TextField
                            label="الرقم القومي (14 رقم بالضبط)"
                            fullWidth
                            required
                            value={currentUser.national_id}
                            onChange={(e) => {
                                // Only allow digits and max 14 characters
                                const value = e.target.value.replace(/\D/g, '').slice(0, 14);
                                setCurrentUser({ ...currentUser, national_id: value });
                            }}
                            InputLabelProps={{ sx: { fontFamily: 'Cairo' } }}
                            disabled={isEdit}
                            helperText={`${currentUser.national_id.length}/14 - سيكون هذا هو اسم المستخدم وكلمة المرور الافتراضية`}
                            error={!isEdit && currentUser.national_id.length > 0 && currentUser.national_id.length !== 14}
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                        />
                        <TextField
                            label="البريد الإلكتروني (اختياري)"
                            fullWidth
                            value={currentUser.email}
                            onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                            InputLabelProps={{ sx: { fontFamily: 'Cairo' } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} sx={{ fontFamily: 'Cairo' }}>إلغاء</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        sx={{ fontFamily: 'Cairo' }}
                        disabled={!isEdit && currentUser.national_id.length !== 14}
                    >
                        حفظ
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
