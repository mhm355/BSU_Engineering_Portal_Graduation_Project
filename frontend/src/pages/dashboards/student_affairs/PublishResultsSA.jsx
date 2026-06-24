import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Switch, CircularProgress, Alert, Chip, Fade,
    Grid, Card, CardContent, FormControl, InputLabel, Select, MenuItem,
    Container, Avatar, Button, Tooltip
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import FilterListIcon from '@mui/icons-material/FilterList';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

const LEVELS = [
    { value: 'PREPARATORY', label: 'الفرقة الإعدادية' },
    { value: 'FIRST', label: 'الفرقة الأولى' },
    { value: 'SECOND', label: 'الفرقة الثانية' },
    { value: 'THIRD', label: 'الفرقة الثالثة' },
    { value: 'FOURTH', label: 'الفرقة الرابعة' }
];
const TERMS = [
    { value: 'FIRST', label: 'الترم الأول' },
    { value: 'SECOND', label: 'الترم الثاني' }
];

export default function PublishResultsSA() {
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const [isSearched, setIsSearched] = useState(false);

    // Filter states
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedSpecialization, setSelectedSpecialization] = useState('');
    
    // Dynamic lists
    const [academicYears, setAcademicYears] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [specializations, setSpecializations] = useState([]);
    
    // Object references
    const [selectedDepartmentObj, setSelectedDepartmentObj] = useState(null);

    // Fetch dynamic academic years & departments
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [yearsRes, deptsRes] = await Promise.all([
                    axios.get('/api/academic/years/', { withCredentials: true }),
                    axios.get('/api/academic/departments/', { withCredentials: true })
                ]);
                
                const yearsList = yearsRes.data.results || yearsRes.data;
                if (Array.isArray(yearsList)) {
                    setAcademicYears(yearsList.map(y => y.name).sort().reverse());
                }
                
                const deptsList = deptsRes.data.results || deptsRes.data;
                if (Array.isArray(deptsList)) {
                    setDepartments(deptsList);
                }
            } catch (err) {
                console.error("Failed to fetch initial data", err);
            }
        };
        fetchInitialData();
    }, []);

    // Handle specializations fetching based on dept and level
    useEffect(() => {
        if (selectedDepartmentObj && selectedLevel && selectedLevel !== 'PREPARATORY' && selectedLevel !== 'FIRST') {
            const fetchSpecs = async () => {
                try {
                    const response = await axios.get(`/api/academic/specializations/?department=${selectedDepartmentObj.id}`, { withCredentials: true });
                    const specsList = Array.isArray(response.data) ? response.data : (response.data.results || []);
                    setSpecializations(specsList);
                    if (specsList.length === 0) setSelectedSpecialization('');
                } catch(err) {
                    console.error("Failed to fetch specializations", err);
                }
            };
            fetchSpecs();
        } else {
            setSpecializations([]);
            setSelectedSpecialization('');
        }
    }, [selectedDepartmentObj, selectedLevel]);

    const handleSearch = async () => {
        if (!selectedYear || !selectedLevel || !selectedTerm) {
            setError('يجب تحديد العام الأكاديمي، الفرقة، والفصل الدراسي للبحث.');
            return;
        }

        if (selectedLevel !== 'PREPARATORY' && !selectedDepartment) {
            setError('يجب تحديد التخصص/القسم للفرق الأعلى من الإعدادية.');
            return;
        }

        if (specializations.length > 0 && !selectedSpecialization) {
            setError('يجب تحديد التخصص الدقيق (لائحة القسم).');
            return;
        }

        setLoading(true);
        setError('');
        setIsSearched(true);
        
        try {
            const params = {
                year: selectedYear,
                level: selectedLevel,
                term: selectedTerm,
                department: selectedDepartment
            };
            if (selectedSpecialization) {
                params.specialization = selectedSpecialization;
            }

            const response = await axios.get('/api/academic/results/publish-status/', { 
                params,
                withCredentials: true 
            });
            setStatuses(response.data);
            
            if (response.data.length === 0) {
                setError('لم يتم العثور على سجل لهذه التصفية في قاعدة البيانات.');
            }
        } catch (err) {
            setError('فشل في تحميل حالة إعلان النتائج');
        } finally {
            setLoading(false);
        }
    };

    // Handle preparatory year logic
    useEffect(() => {
        if (selectedLevel === 'PREPARATORY') {
            setSelectedDepartment('الفرقة الإعدادية');
            const prepDept = departments.find(d => d.is_preparatory || d.name === 'الفرقة الإعدادية');
            if (prepDept) setSelectedDepartmentObj(prepDept);
        } else if (selectedDepartment === 'الفرقة الإعدادية' || selectedDepartment === 'عام') {
            setSelectedDepartment('');
            setSelectedDepartmentObj(null);
        }
    }, [selectedLevel, departments]);

    const handleToggle = async (id, currentStatus) => {
        setUpdatingId(id);
        try {
            const response = await axios.post('/api/academic/results/publish-status/', { 
                id,
                department: selectedDepartment
            }, { withCredentials: true });
            
            // Update local state
            setStatuses(statuses.map(s => {
                if (s.id === id) {
                    return {
                        ...s,
                        student_affairs_approved: !currentStatus,
                        is_published: response.data.is_published
                    };
                }
                return s;
            }));
            setError('');
        } catch (err) {
            setError('فشل في تحديث حالة الإعلان');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleClearFilters = () => {
        setSelectedYear('');
        setSelectedLevel('');
        setSelectedTerm('');
        setSelectedDepartment('');
        setSelectedDepartmentObj(null);
        setSelectedSpecialization('');
        setStatuses([]);
        setIsSearched(false);
        setError('');
    };

    const isFiltersActive = selectedYear || selectedLevel || selectedTerm || selectedDepartment;

    return (
        <Fade in={true}>
            <Container maxWidth="xl" sx={{ pb: 6, pt: 2 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 56, height: 56, bgcolor: '#e8f5e9' }}>
                            <AssessmentIcon sx={{ fontSize: 32, color: '#2e7d32' }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                إدارة إعلان النتائج (شئون الطلاب)
                            </Typography>
                            <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                التحكم في نشر نتائج الطلاب للفصول الدراسية المختلفة والتخصصات
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 2 }}>{error}</Alert>}

                {/* Filters Card */}
                <Card elevation={0} sx={{ mb: 4, borderRadius: 4, border: '1px solid #e0e0e0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                            <FilterListIcon color="action" />
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#333' }}>
                                تصفية النتائج
                            </Typography>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={2.4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel sx={{ fontFamily: 'Cairo' }}>العام الأكاديمي</InputLabel>
                                    <Select
                                        value={selectedYear}
                                        label="العام الأكاديمي"
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        sx={{ fontFamily: 'Cairo', borderRadius: 2 }}
                                    >
                                        <MenuItem value="" sx={{ fontFamily: 'Cairo' }}><em>اختر العام</em></MenuItem>
                                        {academicYears.map(year => (
                                            <MenuItem key={year} value={year} sx={{ fontFamily: 'Cairo' }}>{year}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2.4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel sx={{ fontFamily: 'Cairo' }}>الفرقة الدراسية</InputLabel>
                                    <Select
                                        value={selectedLevel}
                                        label="الفرقة الدراسية"
                                        onChange={(e) => setSelectedLevel(e.target.value)}
                                        sx={{ fontFamily: 'Cairo', borderRadius: 2 }}
                                    >
                                        <MenuItem value="" sx={{ fontFamily: 'Cairo' }}><em>اختر الفرقة</em></MenuItem>
                                        {LEVELS.map(lvl => (
                                            <MenuItem key={lvl.value} value={lvl.value} sx={{ fontFamily: 'Cairo' }}>{lvl.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2.4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel sx={{ fontFamily: 'Cairo' }}>الفصل الدراسي</InputLabel>
                                    <Select
                                        value={selectedTerm}
                                        label="الفصل الدراسي"
                                        onChange={(e) => setSelectedTerm(e.target.value)}
                                        sx={{ fontFamily: 'Cairo', borderRadius: 2 }}
                                    >
                                        <MenuItem value="" sx={{ fontFamily: 'Cairo' }}><em>اختر الفصل</em></MenuItem>
                                        {TERMS.map(term => (
                                            <MenuItem key={term.value} value={term.value} sx={{ fontFamily: 'Cairo' }}>{term.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2.4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel sx={{ fontFamily: 'Cairo' }}>القسم</InputLabel>
                                    <Select
                                        value={selectedDepartment}
                                        label="القسم"
                                        onChange={(e) => {
                                            const deptName = e.target.value;
                                            setSelectedDepartment(deptName);
                                            setSelectedDepartmentObj(departments.find(d => d.name === deptName) || null);
                                        }}
                                        disabled={selectedLevel === 'PREPARATORY'}
                                        sx={{ fontFamily: 'Cairo', borderRadius: 2 }}
                                    >
                                        <MenuItem value="" sx={{ fontFamily: 'Cairo' }}><em>اختر القسم</em></MenuItem>
                                        {departments.filter(d => !d.is_preparatory).map(dept => (
                                            <MenuItem key={dept.id} value={dept.name} sx={{ fontFamily: 'Cairo' }}>{dept.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2.4}>
                                <FormControl fullWidth size="small" disabled={specializations.length === 0}>
                                    <InputLabel sx={{ fontFamily: 'Cairo' }}>التخصص</InputLabel>
                                    <Select
                                        value={selectedSpecialization}
                                        label="التخصص"
                                        onChange={(e) => setSelectedSpecialization(e.target.value)}
                                        sx={{ fontFamily: 'Cairo', borderRadius: 2 }}
                                    >
                                        <MenuItem value="" sx={{ fontFamily: 'Cairo' }}><em>{specializations.length > 0 ? 'اختر التخصص' : 'لا يوجد تخصصات'}</em></MenuItem>
                                        {specializations.map(spec => (
                                            <MenuItem key={spec.id} value={spec.id} sx={{ fontFamily: 'Cairo' }}>{spec.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                        
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            {isFiltersActive && (
                                <Button variant="outlined" color="error" onClick={handleClearFilters} sx={{ fontFamily: 'Cairo', borderRadius: 2 }}>
                                    مسح التصفية
                                </Button>
                            )}
                            <Button 
                                variant="contained" 
                                color="success" 
                                onClick={handleSearch} 
                                disabled={loading}
                                startIcon={<SearchIcon />}
                                sx={{ fontFamily: 'Cairo', fontWeight: 'bold', borderRadius: 2, px: 4, bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
                            >
                                بحث
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                {/* Data Table */}
                <Paper elevation={0} sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden', border: '1px solid #eee' }}>
                    {!isSearched && !loading ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 8 }}>
                            <SearchIcon sx={{ fontSize: 60, color: '#e2e8f0', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: '#64748b' }}>
                                الرجاء تحديد خيارات التصفية والضغط على بحث
                            </Typography>
                        </Box>
                    ) : loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 8 }}>
                            <CircularProgress sx={{ color: '#2e7d32' }} />
                        </Box>
                    ) : statuses.length > 0 ? (
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', py: 2.5, color: '#475569' }}>العام الأكاديمي</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', py: 2.5, color: '#475569' }}>الفرقة</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', py: 2.5, color: '#475569' }}>القسم</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', py: 2.5, color: '#475569' }}>التخصص</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', py: 2.5, color: '#475569' }}>الفصل الدراسي</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', py: 2.5, textAlign: 'center', color: '#475569' }}>شئون الطلاب (أنت)</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', py: 2.5, textAlign: 'center', color: '#475569' }}>موافقة الأدمن</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', py: 2.5, textAlign: 'center', color: '#475569' }}>حالة النشر</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {statuses.map((status) => (
                                        <TableRow key={status.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell sx={{ fontFamily: 'Cairo', color: '#333' }}>{status.academic_year}</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{status.level}</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', color: '#1976d2', fontWeight: 'bold' }}>{status.department}</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', color: '#ed6c02', fontWeight: 'bold' }}>{status.specialization || '-'}</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', color: '#333' }}>{status.term}</TableCell>
                                            
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                {updatingId === status.id ? (
                                                    <CircularProgress size={24} sx={{ color: '#2e7d32' }} />
                                                ) : (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                        <Switch 
                                                            checked={status.student_affairs_approved} 
                                                            onChange={() => handleToggle(status.id, status.student_affairs_approved)}
                                                            color="success"
                                                            sx={{
                                                                '& .MuiSwitch-switchBase.Mui-checked': { color: '#2e7d32' },
                                                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#2e7d32' },
                                                            }}
                                                        />
                                                    </Box>
                                                )}
                                            </TableCell>
                                            
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                {status.admin_approved ? 
                                                    <Chip icon={<CheckCircleIcon />} label="موافق" color="success" size="small" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', px: 1, bgcolor: '#e8f5e9', color: '#2e7d32', border: 'none' }} variant="outlined"/> : 
                                                    <Chip icon={<CancelIcon />} label="قيد الانتظار" color="warning" size="small" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', px: 1, bgcolor: '#fff8e1', color: '#f57f17', border: 'none' }} variant="outlined"/>
                                                }
                                            </TableCell>
                                            
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                {status.is_published ? 
                                                    <Chip icon={<PublicIcon sx={{ fontSize: 16 }} />} label="تم النشر" color="primary" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', px: 1, borderRadius: 2 }} /> : 
                                                    <Chip icon={<LockIcon sx={{ fontSize: 16 }} />} label="مغلق" sx={{ fontFamily: 'Cairo', color: '#666', bgcolor: '#f1f5f9', fontWeight: 'bold', px: 1, borderRadius: 2 }} />
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 8 }}>
                            <AssessmentIcon sx={{ fontSize: 60, color: '#e2e8f0', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: '#64748b' }}>
                                لا توجد بيانات مطابقة
                            </Typography>
                        </Box>
                    )}
                </Paper>
            </Container>
        </Fade>
    );
}
