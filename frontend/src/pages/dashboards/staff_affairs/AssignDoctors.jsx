import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, Box, Button, Alert, CircularProgress,
    FormControl, InputLabel, Select, MenuItem, Autocomplete, TextField,
    Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
    Chip, Avatar, Grid, Fade, Grow
} from '@mui/material';
import { keyframes } from '@mui/system';
import {
    Assignment as AssignmentIcon,
    ArrowBack as ArrowBackIcon,
    Person as PersonIcon,
    School as SchoolIcon,
    Book as BookIcon,
    CalendarMonth as CalendarIcon,
    CheckCircle as CheckCircleIcon,
    Category as CategoryIcon,
    Grade as GradeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const AssignDoctors = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Data
    const [departments, setDepartments] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [terms, setTerms] = useState([]);
    const [levels, setLevels] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [gradingTemplates, setGradingTemplates] = useState([]);

    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [specializations, setSpecializations] = useState([]);
    const [selectedSpecialization, setSelectedSpecialization] = useState('');
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState('');

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedYear) {
            fetchTerms();
        }
    }, [selectedYear]);

    useEffect(() => {
        if (selectedDepartment && selectedYear) {
            fetchLevels();
        }
    }, [selectedDepartment, selectedYear]);

    useEffect(() => {
        if (selectedLevel && selectedTerm && terms.length > 0) {
            const level = levels.find(l => l.id === parseInt(selectedLevel));
            const dept = departments.find(d => d.id === selectedDepartment);
            const isElectrical = dept && dept.name.includes('كهرب');
            const needsSpec = isElectrical && level && level.name !== 'FIRST';

            if (needsSpec && !selectedSpecialization) {
                fetchSpecializations();
                setSubjects([]);
            } else {
                fetchSubjects();
            }
        } else {
            setSubjects([]);
        }
    }, [selectedLevel, selectedTerm, terms, selectedSpecialization]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [deptRes, yearRes, doctorRes, assignRes, templateRes] = await Promise.all([
                axios.get('/api/academic/departments/', config),
                axios.get('/api/academic/years/', config),
                axios.get('/api/academic/staff-affairs/doctors/', config),
                axios.get('/api/academic/staff-affairs/assignments/', config),
                axios.get('/api/academic/staff-affairs/grading-templates/', config),
            ]);
            setDepartments(deptRes.data);
            setAcademicYears(yearRes.data);
            setDoctors(doctorRes.data);
            setAssignments(assignRes.data);
            setGradingTemplates(templateRes.data);
            const defaultTemplate = templateRes.data.find(t => t.is_default);
            if (defaultTemplate) {
                setSelectedTemplate(defaultTemplate.id);
            }
        } catch (err) {
            setError('خطأ في تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    const fetchTerms = async () => {
        try {
            const res = await axios.get(`/api/academic/staff-affairs/terms/?academic_year=${selectedYear}`, config);
            setTerms(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchLevels = async () => {
        try {
            const res = await axios.get(`/api/academic/levels/?department=${selectedDepartment}&academic_year=${selectedYear}`, config);
            setLevels(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSubjects = async () => {
        try {
            const level = levels.find((l) => l.id === parseInt(selectedLevel));
            if (!level) return;

            const term = terms.find(t => t.id === parseInt(selectedTerm));
            if (!term) return;

            const semester = term.name === 'FIRST' ? 1 : 2;

            const res = await axios.get(
                `/api/academic/subjects/?department=${selectedDepartment}&level=${level.name}&semester=${semester}${selectedSpecialization ? `&specialization=${selectedSpecialization}` : ''}`,
                config
            );
            setSubjects(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSpecializations = async () => {
        try {
            const res = await axios.get(`/api/academic/specializations/?department=${selectedDepartment}`, config);
            setSpecializations(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const selectedLevelData = levels.find(l => l.id === parseInt(selectedLevel));
    const selectedDeptData = departments.find(d => d.id === selectedDepartment);
    const isElectricalDept = selectedDeptData && selectedDeptData.name.includes('كهرب');
    const needsSpecialization = isElectricalDept && selectedLevelData && selectedLevelData.name !== 'FIRST';

    const handleAssign = async () => {
        if (!selectedDoctor || !selectedSubject || !selectedLevel || !selectedTerm) {
            setError('يرجى تحديد جميع الحقول');
            return;
        }

        if (needsSpecialization && !selectedSpecialization) {
            setError('يرجى اختيار التخصص (ECE/EPM)');
            return;
        }

        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            await axios.post(
                '/api/academic/staff-affairs/assign-doctor/',
                {
                    doctor_id: selectedDoctor.id,
                    subject_id: selectedSubject.id,
                    level_id: selectedLevel,
                    term_id: selectedTerm,
                    grading_template_id: selectedTemplate || null,
                    specialization_id: needsSpecialization ? selectedSpecialization : null,
                },
                config
            );
            setSuccess('تم تعيين الدكتور بنجاح');
            const res = await axios.get('/api/academic/staff-affairs/assignments/', config);
            setAssignments(res.data);
            setSelectedSubject(null);
            setSelectedDoctor(null);
            setSelectedSpecialization('');
        } catch (err) {
            setError(err.response?.data?.error || 'حدث خطأ');
        } finally {
            setSubmitting(false);
        }
    };

    const inputStyle = {
        '& .MuiOutlinedInput-root': {
            borderRadius: 3,
            bgcolor: '#fafafa',
            fontSize: '1.2rem',
            py: 0.5,
            '&:hover fieldset': { borderColor: '#ed6c02' },
            '&.Mui-focused fieldset': { borderColor: '#ed6c02' }
        },
        '& .MuiInputLabel-root': { fontFamily: 'Cairo', fontSize: '1.1rem' },
        '& .MuiAutocomplete-input': { fontFamily: 'Cairo', fontSize: '1.2rem' }
    };

    const autocompleteProps = {
        componentsProps: {
            paper: {
                sx: {
                    width: '100%',
                    minWidth: 350,
                    '& .MuiAutocomplete-option': {
                        fontFamily: 'Cairo',
                        fontSize: '1.1rem',
                        py: 1.5,
                        px: 2
                    }
                }
            }
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', pb: 6 }}>
            {/* Hero Header */}
            <Box sx={{ background: 'linear-gradient(135deg, #ed6c02 0%, #ff9800 100%)', pt: 4, pb: 6, mb: 4, position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', animation: `${float} 6s ease-in-out infinite` }} />
                <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', animation: `${float} 8s ease-in-out infinite`, animationDelay: '2s' }} />

                <Container maxWidth="lg">
                    <Fade in={true} timeout={800}>
                        <Box>
                            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/staff-affairs/dashboard')} sx={{ color: '#fff', mb: 2, fontFamily: 'Cairo', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                                العودة للوحة التحكم
                            </Button>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                                    <AssignmentIcon sx={{ fontSize: 45, color: '#fff' }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                        تعيين الدكاترة للمواد
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: 'rgba(255,255,255,0.9)' }}>
                                        تعيين أعضاء هيئة التدريس على المواد الدراسية
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Container maxWidth="xl">
                {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem' }} onClose={() => setError(null)}>{error}</Alert>}
                {success && <Alert icon={<CheckCircleIcon />} severity="success" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem' }} onClose={() => setSuccess(null)}>{success}</Alert>}

                {/* Stats Row */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={4}>
                        <Grow in={true} timeout={400}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 55, height: 55, background: 'linear-gradient(135deg, #ed6c02, #ff9800)' }}>
                                    <AssignmentIcon sx={{ fontSize: 28 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{assignments.length}</Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>التعيينات الحالية</Typography>
                                </Box>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Grow in={true} timeout={500}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 55, height: 55, background: 'linear-gradient(135deg, #9c27b0, #ba68c8)' }}>
                                    <PersonIcon sx={{ fontSize: 28 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{doctors.length}</Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>الدكاترة المتاحين</Typography>
                                </Box>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Grow in={true} timeout={600}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 55, height: 55, background: 'linear-gradient(135deg, #2196F3, #64B5F6)' }}>
                                    <BookIcon sx={{ fontSize: 28 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{subjects.length}</Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>المواد المتاحة</Typography>
                                </Box>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={50} /></Box>
                ) : (
                    <>
                        {/* Assignment Form */}
                        <Grow in={true} timeout={700}>
                            <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, boxShadow: '0 4px 25px rgba(0,0,0,0.1)' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                                    <Avatar sx={{ width: 50, height: 50, background: 'linear-gradient(135deg, #ed6c02, #ff9800)' }}>
                                        <AssignmentIcon />
                                    </Avatar>
                                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                        إضافة تعيين جديد
                                    </Typography>
                                </Box>

                                {/* Step 1: Academic Info */}
                                <Box sx={{ mb: 4 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <Avatar sx={{ width: 28, height: 28, bgcolor: '#ed6c02', fontSize: 14 }}>1</Avatar>
                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#ed6c02' }}>
                                            تحديد الفترة الأكاديمية
                                        </Typography>
                                    </Box>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Typography variant="body1" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1 }}>العام الدراسي</Typography>
                                            <FormControl fullWidth>
                                                <Select
                                                    value={selectedYear}
                                                    onChange={(e) => { setSelectedYear(e.target.value); setSelectedTerm(''); setSelectedLevel(''); setSubjects([]); }}
                                                    displayEmpty
                                                    sx={inputStyle}
                                                >
                                                    <MenuItem value="" disabled><em>اختر العام</em></MenuItem>
                                                    {academicYears.map((year) => (
                                                        <MenuItem key={year.id} value={year.id}>
                                                            {year.name}
                                                            {year.status === 'CLOSED' && <Chip label="مغلق" size="small" color="error" sx={{ ml: 1 }} />}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Typography variant="body1" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1 }}>الترم</Typography>
                                            <FormControl fullWidth disabled={!selectedYear}>
                                                <Select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} displayEmpty sx={inputStyle}>
                                                    <MenuItem value="" disabled><em>اختر الترم</em></MenuItem>
                                                    {terms.map((term) => (<MenuItem key={term.id} value={term.id}>{term.name_display}</MenuItem>))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Typography variant="body1" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1 }}>القسم</Typography>
                                            <FormControl fullWidth>
                                                <Select value={selectedDepartment} onChange={(e) => { setSelectedDepartment(e.target.value); setSelectedLevel(''); setSubjects([]); }} displayEmpty sx={inputStyle}>
                                                    <MenuItem value="" disabled><em>اختر القسم</em></MenuItem>
                                                    {departments.map((dept) => (<MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Typography variant="body1" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1 }}>الفرقة</Typography>
                                            <FormControl fullWidth disabled={!selectedDepartment || !selectedYear}>
                                                <Select value={selectedLevel} onChange={(e) => { setSelectedLevel(e.target.value); setSelectedSpecialization(''); setSubjects([]); }} displayEmpty sx={inputStyle}>
                                                    <MenuItem value="" disabled><em>اختر الفرقة</em></MenuItem>
                                                    {levels.map((level) => (<MenuItem key={level.id} value={level.id}>{level.display_name}</MenuItem>))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </Box>

                                {/* Specialization (if needed) */}
                                {needsSpecialization && (
                                    <Box sx={{ mb: 4 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                            <CategoryIcon sx={{ color: '#9c27b0' }} />
                                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#9c27b0' }}>
                                                التخصص (مطلوب للهندسة الكهربية)
                                            </Typography>
                                        </Box>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <FormControl fullWidth>
                                                    <Select value={selectedSpecialization} onChange={(e) => setSelectedSpecialization(e.target.value)} displayEmpty sx={inputStyle}>
                                                        <MenuItem value="" disabled><em>اختر التخصص</em></MenuItem>
                                                        {specializations.map((spec) => (<MenuItem key={spec.id} value={spec.id}>{spec.name}</MenuItem>))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                )}

                                {/* Step 2: Assignment Details */}
                                <Box sx={{ mb: 4 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <Avatar sx={{ width: 28, height: 28, bgcolor: '#4CAF50', fontSize: 14 }}>2</Avatar>
                                        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#4CAF50' }}>
                                            تحديد المادة والدكتور
                                        </Typography>
                                    </Box>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={4}>
                                            <Typography variant="body1" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1 }}>المادة</Typography>
                                            <Autocomplete
                                                options={subjects}
                                                getOptionLabel={(option) => `${option.code} - ${option.name}`}
                                                value={selectedSubject}
                                                onChange={(_, value) => setSelectedSubject(value)}
                                                disabled={!selectedLevel || !selectedTerm}
                                                {...autocompleteProps}
                                                renderInput={(params) => <TextField {...params} placeholder="ابحث عن المادة..." sx={inputStyle} />}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <Typography variant="body1" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1 }}>الدكتور</Typography>
                                            <Autocomplete
                                                options={doctors}
                                                getOptionLabel={(option) => option.full_name}
                                                value={selectedDoctor}
                                                onChange={(_, value) => setSelectedDoctor(value)}
                                                {...autocompleteProps}
                                                renderInput={(params) => <TextField {...params} placeholder="ابحث عن الدكتور..." sx={inputStyle} />}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <Typography variant="body1" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1 }}>قالب التقييم</Typography>
                                            <FormControl fullWidth>
                                                <Select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)} displayEmpty sx={inputStyle}>
                                                    {gradingTemplates.map((t) => (
                                                        <MenuItem key={t.id} value={t.id}>
                                                            {t.name} {t.is_default && <Chip label="افتراضي" size="small" color="primary" sx={{ ml: 1 }} />}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={handleAssign}
                                        disabled={submitting || !selectedDoctor || !selectedSubject || !selectedTerm}
                                        startIcon={submitting ? <CircularProgress size={24} color="inherit" /> : <CheckCircleIcon />}
                                        sx={{
                                            fontFamily: 'Cairo',
                                            fontWeight: 'bold',
                                            px: 8,
                                            py: 2,
                                            fontSize: '1.2rem',
                                            borderRadius: 3,
                                            background: 'linear-gradient(135deg, #ed6c02, #ff9800)',
                                            boxShadow: '0 10px 30px rgba(237, 108, 2, 0.4)',
                                            '&:hover': { background: 'linear-gradient(135deg, #e65100, #ed6c02)' },
                                            '&:disabled': { background: '#ccc' }
                                        }}
                                    >
                                        {submitting ? 'جاري التعيين...' : 'تعيين الدكتور'}
                                    </Button>
                                </Box>
                            </Paper>
                        </Grow>

                        {/* Assignments Table */}
                        <Grow in={true} timeout={900}>
                            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 25px rgba(0,0,0,0.1)' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <Avatar sx={{ width: 50, height: 50, background: 'linear-gradient(135deg, #4CAF50, #8BC34A)' }}>
                                        <GradeIcon />
                                    </Avatar>
                                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                        التعيينات الحالية ({assignments.length})
                                    </Typography>
                                </Box>

                                {assignments.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 6 }}>
                                        <AssignmentIcon sx={{ fontSize: 80, color: '#ddd', mb: 2 }} />
                                        <Typography variant="h5" sx={{ fontFamily: 'Cairo', color: '#999', mb: 1 }}>
                                            لا توجد تعيينات حالياً
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#bbb' }}>
                                            ابدأ بإضافة تعيين جديد من النموذج أعلاه
                                        </Typography>
                                    </Box>
                                ) : (
                                    <TableContainer sx={{ borderRadius: 3, border: '1px solid #eee' }}>
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: '#4CAF50' }}>
                                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>#</TableCell>
                                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>الدكتور</TableCell>
                                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>المادة</TableCell>
                                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>القسم</TableCell>
                                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>الفرقة</TableCell>
                                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>الترم</TableCell>
                                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>العام</TableCell>
                                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>قالب التقييم</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {assignments.map((a, index) => (
                                                    <TableRow key={a.id} hover sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                                                        <TableCell>
                                                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#4CAF50', fontSize: 13 }}>{index + 1}</Avatar>
                                                        </TableCell>
                                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{a.doctor_name}</TableCell>
                                                        <TableCell>
                                                            <Box>
                                                                <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '0.95rem' }}>{a.subject_name}</Typography>
                                                                <Typography variant="caption" sx={{ color: '#666' }}>{a.subject_code}</Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell sx={{ fontFamily: 'Cairo' }}>{a.department}</TableCell>
                                                        <TableCell><Chip label={a.level_name} size="small" sx={{ fontFamily: 'Cairo' }} /></TableCell>
                                                        <TableCell><Chip label={a.term} size="small" color="primary" sx={{ fontFamily: 'Cairo' }} /></TableCell>
                                                        <TableCell sx={{ fontFamily: 'Cairo' }}>{a.academic_year}</TableCell>
                                                        <TableCell>{a.grading_template ? <Chip label={a.grading_template} size="small" color="secondary" sx={{ fontFamily: 'Cairo' }} /> : '-'}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </Paper>
                        </Grow>
                    </>
                )}
            </Container>
        </Box>
    );
};

export default AssignDoctors;
