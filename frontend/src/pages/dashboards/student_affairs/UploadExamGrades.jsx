import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Paper, Button, Alert, CircularProgress,
    FormControl, InputLabel, Select, MenuItem, IconButton, RadioGroup,
    FormControlLabel, Radio, FormLabel
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function UploadExamGrades() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Selection state
    const [departments, setDepartments] = useState([]);
    const [years, setYears] = useState([]);
    const [levels, setLevels] = useState([]);
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [gradeType, setGradeType] = useState('midterm');
    const [file, setFile] = useState(null);

    useEffect(() => {
        fetchDepartments();
        fetchYears();
    }, []);

    useEffect(() => {
        if (selectedDept && selectedYear) {
            fetchLevels();
        }
    }, [selectedDept, selectedYear]);

    const fetchDepartments = async () => {
        try {
            const res = await axios.get('/api/academic/departments/', { withCredentials: true });
            setDepartments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchYears = async () => {
        try {
            const res = await axios.get('/api/academic/years/', { withCredentials: true });
            setYears(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchLevels = async () => {
        try {
            const res = await axios.get(`/api/academic/levels/?department=${selectedDept}&academic_year=${selectedYear}`, { withCredentials: true });
            setLevels(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const getLevelName = (name) => {
        const names = {
            'PREPARATORY': 'الفرقة الإعدادية',
            'FIRST': 'الفرقة الأولى',
            'SECOND': 'الفرقة الثانية',
            'THIRD': 'الفرقة الثالثة',
            'FOURTH': 'الفرقة الرابعة',
        };
        return names[name] || name;
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedLevel || !file) {
            setError('يرجى تحديد الفرقة ورفع الملف');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('level_id', selectedLevel);
        formData.append('grade_type', gradeType);

        try {
            const res = await axios.post('/api/academic/exam-grades/upload/', formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess(res.data.message);
            if (res.data.errors && res.data.errors.length > 0) {
                setError(`بعض الأخطاء: ${res.data.errors.join(', ')}`);
            }
            setFile(null);
        } catch (err) {
            setError(err.response?.data?.error || 'فشل رفع الدرجات');
        }
        setLoading(false);
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <IconButton onClick={() => navigate('/student-affairs/dashboard')}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                    رفع درجات الامتحانات
                </Typography>
            </Box>

            <Paper sx={{ p: 3 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Department Selection */}
                    <FormControl fullWidth>
                        <InputLabel sx={{ fontFamily: 'Cairo' }}>القسم</InputLabel>
                        <Select
                            value={selectedDept}
                            onChange={(e) => { setSelectedDept(e.target.value); setSelectedLevel(''); }}
                            label="القسم"
                        >
                            {departments.map(d => (
                                <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Year Selection */}
                    <FormControl fullWidth>
                        <InputLabel sx={{ fontFamily: 'Cairo' }}>السنة الأكاديمية</InputLabel>
                        <Select
                            value={selectedYear}
                            onChange={(e) => { setSelectedYear(e.target.value); setSelectedLevel(''); }}
                            label="السنة الأكاديمية"
                        >
                            {years.map(y => (
                                <MenuItem key={y.id} value={y.id}>{y.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Level Selection */}
                    <FormControl fullWidth disabled={!selectedDept || !selectedYear}>
                        <InputLabel sx={{ fontFamily: 'Cairo' }}>الفرقة</InputLabel>
                        <Select
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                            label="الفرقة"
                        >
                            {levels.map(l => (
                                <MenuItem key={l.id} value={l.id}>{getLevelName(l.name)}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Grade Type Selection */}
                    <FormControl>
                        <FormLabel sx={{ fontFamily: 'Cairo' }}>نوع الامتحان</FormLabel>
                        <RadioGroup row value={gradeType} onChange={(e) => setGradeType(e.target.value)}>
                            <FormControlLabel value="midterm" control={<Radio />} label="منتصف الترم" sx={{ fontFamily: 'Cairo' }} />
                            <FormControlLabel value="final" control={<Radio />} label="النهائي" sx={{ fontFamily: 'Cairo' }} />
                        </RadioGroup>
                    </FormControl>

                    {/* File Upload */}
                    <Box sx={{ textAlign: 'center', p: 3, border: '2px dashed #ccc', borderRadius: 2 }}>
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<UploadFileIcon />}
                            sx={{ fontFamily: 'Cairo' }}
                        >
                            اختيار ملف Excel
                            <input type="file" hidden accept=".xlsx,.xls" onChange={handleFileChange} />
                        </Button>
                        {file && (
                            <Typography sx={{ mt: 1, fontFamily: 'Cairo' }}>{file.name}</Typography>
                        )}
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1, fontFamily: 'Cairo' }}>
                            الصيغة: national_id | [subject_codes...]
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        size="large"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                        onClick={handleUpload}
                        disabled={loading || !file || !selectedLevel}
                        sx={{ fontFamily: 'Cairo' }}
                    >
                        {loading ? 'جاري الرفع...' : 'رفع الدرجات'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}
