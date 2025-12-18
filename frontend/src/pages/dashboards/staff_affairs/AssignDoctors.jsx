import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableContainer,
    Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

    // Selection
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
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
        if (selectedLevel) {
            fetchSubjects();
        }
    }, [selectedLevel]);

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
            // Set default template
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
            const res = await axios.get(
                `/api/academic/staff-affairs/terms/?academic_year=${selectedYear}`,
                config
            );
            setTerms(res.data);
        } catch (err) {
            console.error(err);
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

    const fetchSubjects = async () => {
        try {
            const level = levels.find((l) => l.id === parseInt(selectedLevel));
            if (!level) return;

            // Filter by semester based on term
            const term = terms.find(t => t.id === parseInt(selectedTerm));
            const semester = term?.name === 'FIRST' ? 1 : 2;

            const res = await axios.get(
                `/api/academic/subjects/?department=${selectedDepartment}&level=${level.name}&semester=${semester}`,
                config
            );
            setSubjects(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    // Refetch subjects when term changes
    useEffect(() => {
        if (selectedLevel && selectedTerm) {
            fetchSubjects();
        }
    }, [selectedTerm]);

    const handleAssign = async () => {
        if (!selectedDoctor || !selectedSubject || !selectedLevel || !selectedTerm) {
            setError('يرجى تحديد جميع الحقول');
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
                },
                config
            );
            setSuccess('تم تعيين الدكتور بنجاح');
            // Refresh assignments
            const res = await axios.get('/api/academic/staff-affairs/assignments/', config);
            setAssignments(res.data);
            // Reset selection
            setSelectedSubject(null);
            setSelectedDoctor(null);
        } catch (err) {
            setError(err.response?.data?.error || 'حدث خطأ');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                    تعيين الدكاترة للمواد
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                        {success}
                    </Alert>
                )}

                {/* Row 1: Year, Term, Department */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                    <FormControl sx={{ minWidth: 180 }}>
                        <InputLabel>العام الدراسي</InputLabel>
                        <Select
                            value={selectedYear}
                            onChange={(e) => {
                                setSelectedYear(e.target.value);
                                setSelectedTerm('');
                                setSelectedLevel('');
                                setSubjects([]);
                            }}
                            label="العام الدراسي"
                        >
                            {academicYears.map((year) => (
                                <MenuItem key={year.id} value={year.id}>
                                    {year.name}
                                    {year.status === 'CLOSED' && (
                                        <Chip label="مغلق" size="small" color="error" sx={{ ml: 1 }} />
                                    )}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 150 }}>
                        <InputLabel>الترم</InputLabel>
                        <Select
                            value={selectedTerm}
                            onChange={(e) => setSelectedTerm(e.target.value)}
                            label="الترم"
                            disabled={!selectedYear}
                        >
                            {terms.map((term) => (
                                <MenuItem key={term.id} value={term.id}>
                                    {term.name_display}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>القسم</InputLabel>
                        <Select
                            value={selectedDepartment}
                            onChange={(e) => {
                                setSelectedDepartment(e.target.value);
                                setSelectedLevel('');
                                setSubjects([]);
                            }}
                            label="القسم"
                        >
                            {departments.map((dept) => (
                                <MenuItem key={dept.id} value={dept.id}>
                                    {dept.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 180 }}>
                        <InputLabel>الفرقة</InputLabel>
                        <Select
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                            label="الفرقة"
                            disabled={!selectedDepartment || !selectedYear}
                        >
                            {levels.map((level) => (
                                <MenuItem key={level.id} value={level.id}>
                                    {level.display_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* Row 2: Subject, Doctor, Template */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                    <Autocomplete
                        options={subjects}
                        getOptionLabel={(option) => `${option.code} - ${option.name}`}
                        value={selectedSubject}
                        onChange={(_, value) => setSelectedSubject(value)}
                        sx={{ minWidth: 300 }}
                        renderInput={(params) => <TextField {...params} label="المادة" />}
                        disabled={!selectedLevel || !selectedTerm}
                    />

                    <Autocomplete
                        options={doctors}
                        getOptionLabel={(option) => option.full_name}
                        value={selectedDoctor}
                        onChange={(_, value) => setSelectedDoctor(value)}
                        sx={{ minWidth: 250 }}
                        renderInput={(params) => <TextField {...params} label="الدكتور" />}
                    />

                    <FormControl sx={{ minWidth: 180 }}>
                        <InputLabel>قالب التقييم</InputLabel>
                        <Select
                            value={selectedTemplate}
                            onChange={(e) => setSelectedTemplate(e.target.value)}
                            label="قالب التقييم"
                        >
                            {gradingTemplates.map((t) => (
                                <MenuItem key={t.id} value={t.id}>
                                    {t.name} {t.is_default && '(افتراضي)'}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        onClick={handleAssign}
                        disabled={submitting || !selectedDoctor || !selectedSubject || !selectedTerm}
                        sx={{ height: 56 }}
                    >
                        {submitting ? <CircularProgress size={24} /> : 'تعيين'}
                    </Button>
                </Box>
            </Paper>

            <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    التعيينات الحالية ({assignments.length})
                </Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell>الدكتور</TableCell>
                                <TableCell>المادة</TableCell>
                                <TableCell>القسم</TableCell>
                                <TableCell>الفرقة</TableCell>
                                <TableCell>الترم</TableCell>
                                <TableCell>العام</TableCell>
                                <TableCell>قالب التقييم</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {assignments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        لا توجد تعيينات
                                    </TableCell>
                                </TableRow>
                            ) : (
                                assignments.map((a) => (
                                    <TableRow key={a.id}>
                                        <TableCell>{a.doctor_name}</TableCell>
                                        <TableCell>{a.subject_code} - {a.subject_name}</TableCell>
                                        <TableCell>{a.department}</TableCell>
                                        <TableCell>{a.level_name}</TableCell>
                                        <TableCell>{a.term}</TableCell>
                                        <TableCell>{a.academic_year}</TableCell>
                                        <TableCell>{a.grading_template || '-'}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Box sx={{ mt: 2 }}>
                <Button variant="outlined" onClick={() => navigate('/staff-affairs')}>
                    رجوع
                </Button>
            </Box>
        </Container>
    );
};

export default AssignDoctors;
