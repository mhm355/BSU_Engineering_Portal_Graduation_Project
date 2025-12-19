import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Paper, Button, Alert, LinearProgress,
    List, ListItem, ListItemText, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

export default function UploadStudents() {
    // Selection state
    const [departments, setDepartments] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [levels, setLevels] = useState([]);

    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [specializations, setSpecializations] = useState([]);
    const [selectedSpecialization, setSelectedSpecialization] = useState('');

    // Upload state
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loadingData, setLoadingData] = useState(true);

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedDepartment && selectedYear) {
            fetchLevels();
            // Fetch specializations for Electrical department
            const dept = departments.find(d => d.id === selectedDepartment);
            if (dept && dept.name.includes('كهرب')) {
                fetchSpecializations();
            } else {
                setSpecializations([]);
                setSelectedSpecialization('');
            }
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

            // Auto-select current year
            const currentYear = yearRes.data.find(y => y.is_current);
            if (currentYear) {
                setSelectedYear(currentYear.id);
            }
        } catch (err) {
            setError('فشل في تحميل البيانات');
        } finally {
            setLoadingData(false);
        }
    };

    const fetchLevels = async () => {
        try {
            const url = `/api/academic/levels/?department=${selectedDepartment}&academic_year=${selectedYear}`;
            const res = await axios.get(url, config);
            setLevels(res.data);

            // Auto-select if only one level (e.g., Prep department)
            if (res.data.length === 1) {
                setSelectedLevel(res.data[0].id);
            }
        } catch (err) {
            console.error('Error fetching levels:', err);
        }
    };

    const fetchSpecializations = async () => {
        try {
            const res = await axios.get(`/api/academic/specializations/?department=${selectedDepartment}`, config);
            setSpecializations(res.data);
        } catch (err) {
            console.error('Error fetching specializations:', err);
        }
    };

    // Check if specialization is needed (Electrical + level > FIRST)
    const selectedLevelData = levels.find(l => l.id === selectedLevel);
    const needsSpecialization = specializations.length > 0 &&
        selectedLevelData && selectedLevelData.name !== 'FIRST';

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setResult(null);
        setError('');
    };

    const handleUpload = async () => {
        if (!selectedDepartment || !selectedYear || !selectedLevel) {
            setError('يرجى اختيار القسم والعام الدراسي والفرقة أولاً');
            return;
        }
        if (needsSpecialization && !selectedSpecialization) {
            setError('يرجى اختيار التخصص (اتصالات/قوى)');
            return;
        }
        if (!file) {
            setError('يرجى اختيار ملف أولاً.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('department_id', selectedDepartment);
        formData.append('academic_year_id', selectedYear);
        formData.append('level_id', selectedLevel);
        if (needsSpecialization && selectedSpecialization) {
            formData.append('specialization_id', selectedSpecialization);
        }

        setUploading(true);
        setError('');
        setResult(null);

        try {
            const response = await axios.post('/api/academic/student-affairs/upload/', formData, {
                ...config,
                headers: { ...config.headers, 'Content-Type': 'multipart/form-data' }
            });
            setResult(response.data);
            setFile(null);
        } catch (err) {
            console.error('Error uploading file:', err);
            const errorMsg = err.response?.data?.error || 'فشل رفع الملف. تأكد من صحة البيانات.';
            setError(errorMsg);
        } finally {
            setUploading(false);
        }
    };

    // Sample data for file format example
    const sampleData = [
        { national_id: '12345678901234', full_name: 'أحمد محمد علي', email: 'ahmed@example.com' },
        { national_id: '23456789012345', full_name: 'محمد سعيد أحمد', email: '' },
    ];

    // Check if this is Prep department (only 1 level)
    const isPrepDepartment = levels.length === 1;
    // Selection complete when: dept + year + level selected, and specialization if needed
    const isSelectionComplete = selectedDepartment && selectedYear && selectedLevel &&
        (!needsSpecialization || selectedSpecialization);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button onClick={() => window.history.back()} sx={{ mb: 2, fontFamily: 'Cairo' }}>← عودة</Button>
            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 4 }}>
                رفع بيانات الطلاب
            </Typography>

            {/* Step 1: Selection */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                    الخطوة 1: اختر القسم والعام والفرقة
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>القسم</InputLabel>
                        <Select
                            value={selectedDepartment}
                            onChange={(e) => {
                                setSelectedDepartment(e.target.value);
                                setSelectedLevel('');
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

                    {/* Level dropdown - hide if only 1 level (Prep) */}
                    {!isPrepDepartment && (
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>الفرقة</InputLabel>
                            <Select
                                value={selectedLevel}
                                onChange={(e) => {
                                    setSelectedLevel(e.target.value);
                                    setSelectedSpecialization(''); // Reset specialization when level changes
                                }}
                                label="الفرقة"
                                disabled={!selectedDepartment || !selectedYear || levels.length === 0}
                            >
                                {levels.map((level) => (
                                    <MenuItem key={level.id} value={level.id}>{level.display_name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    {/* Specialization dropdown - for Electrical dept levels 2-4 */}
                    {needsSpecialization && (
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>التخصص</InputLabel>
                            <Select
                                value={selectedSpecialization}
                                onChange={(e) => setSelectedSpecialization(e.target.value)}
                                label="التخصص"
                            >
                                {specializations.map((spec) => (
                                    <MenuItem key={spec.id} value={spec.id}>{spec.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                </Box>

                {isSelectionComplete && (
                    <Alert severity="success" sx={{ mt: 2, fontFamily: 'Cairo' }}>
                        ✓ تم اختيار: {departments.find(d => d.id === selectedDepartment)?.name} -
                        {academicYears.find(y => y.id === selectedYear)?.name}
                        {!isPrepDepartment && ` - ${levels.find(l => l.id === selectedLevel)?.display_name}`}
                        {needsSpecialization && ` - ${specializations.find(s => s.id === selectedSpecialization)?.name}`}
                    </Alert>
                )}
            </Paper>

            {/* Step 2: File Format Info */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                    الخطوة 2: تنسيق الملف المطلوب
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Cairo', mb: 2 }}>
                    يجب أن يحتوي الملف على الأعمدة التالية:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip label="الرقم القومي (national_id)" color="primary" size="small" />
                    <Chip label="الاسم بالكامل (full_name)" color="primary" size="small" />
                    <Chip label="البريد الإلكتروني (email) - اختياري" color="secondary" size="small" variant="outlined" />
                </Box>

                <Alert severity="info" sx={{ mb: 2, fontFamily: 'Cairo' }}>
                    <strong>ملاحظة:</strong> القسم والعام الدراسي والفرقة يتم تحديدهم من القائمة أعلاه، وليس من الملف.
                </Alert>

                {/* Sample Table */}
                <Typography variant="body2" sx={{ fontFamily: 'Cairo', mb: 1, fontWeight: 'bold' }}>
                    مثال على الملف:
                </Typography>
                <TableContainer sx={{ maxHeight: 200 }}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>national_id</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>full_name</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>email (اختياري)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sampleData.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell sx={{ fontFamily: 'monospace' }}>{row.national_id}</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo' }}>{row.full_name}</TableCell>
                                    <TableCell>{row.email || '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Step 3: Upload Section */}
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                    الخطوة 3: رفع الملف
                </Typography>

                {!isSelectionComplete && (
                    <Alert severity="warning" sx={{ mb: 3, fontFamily: 'Cairo' }}>
                        يرجى إكمال الخطوة 1 أولاً (اختيار القسم والعام والفرقة)
                    </Alert>
                )}

                <Box sx={{ my: 3 }}>
                    <input
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        style={{ display: 'none' }}
                        id="raised-button-file"
                        type="file"
                        onChange={handleFileChange}
                        disabled={!isSelectionComplete}
                    />
                    <label htmlFor="raised-button-file">
                        <Button
                            variant="outlined"
                            component="span"
                            startIcon={<CloudUploadIcon />}
                            sx={{ fontFamily: 'Cairo' }}
                            disabled={!isSelectionComplete}
                        >
                            اختيار ملف
                        </Button>
                    </label>
                    {file && <Typography sx={{ mt: 1, fontFamily: 'Cairo' }}>{file.name}</Typography>}
                </Box>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpload}
                    disabled={!file || uploading || !isSelectionComplete}
                    sx={{ fontFamily: 'Cairo', px: 4 }}
                >
                    {uploading ? 'جاري الرفع...' : 'رفع البيانات'}
                </Button>

                {uploading && <LinearProgress sx={{ mt: 3 }} />}

                {error && <Alert severity="error" sx={{ mt: 3, fontFamily: 'Cairo' }}>{error}</Alert>}

                {result && (
                    <Box sx={{ mt: 3, textAlign: 'right' }}>
                        <Alert severity="success" sx={{ fontFamily: 'Cairo', mb: 2 }}>
                            تمت العملية!
                            <br />
                            • تم إنشاء {result.created} حساب جديد
                            <br />
                            • تم تحديث {result.updated} حساب موجود
                        </Alert>
                        {result.errors && result.errors.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Alert severity="warning" sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>
                                    <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>بعض الأخطاء ({result.errors.length}):</Typography>
                                </Alert>
                                <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                                    {result.errors.map((err, index) => (
                                        <ListItem key={index}>
                                            <ListItemText primary={err} primaryTypographyProps={{ fontFamily: 'Cairo', color: 'error' }} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        )}
                    </Box>
                )}
            </Paper>
        </Container>
    );
}
