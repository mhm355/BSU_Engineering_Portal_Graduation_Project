import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, TextField, Button, Alert, MenuItem, Grid, Chip, CircularProgress } from '@mui/material';
import axios from 'axios';

export default function UploadCertificates() {
    const [departments, setDepartments] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loadingDepts, setLoadingDepts] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await axios.get('/api/academic/departments/', { withCredentials: true });
            setDepartments(response.data);
            setLoadingDepts(false);
        } catch (err) {
            console.error('Error fetching departments:', err);
            setError('فشل تحميل الأقسام');
            setLoadingDepts(false);
        }
    };

    const fetchStudentsByDepartment = async (deptId) => {
        setLoadingStudents(true);
        try {
            // Fetch fourth year students filtered by department
            const response = await axios.get(`/api/academic/student-affairs/students/?level_name=FOURTH&department=${deptId}`, { withCredentials: true });
            setStudents(response.data);
            setLoadingStudents(false);
        } catch (err) {
            console.error('Error fetching students:', err);
            setError('فشل تحميل الطلاب');
            setStudents([]);
            setLoadingStudents(false);
        }
    };

    const handleDepartmentChange = (e) => {
        const deptId = e.target.value;
        setSelectedDepartment(deptId);
        setSelectedStudent('');
        if (deptId) {
            fetchStudentsByDepartment(deptId);
        } else {
            setStudents([]);
        }
    };

    const handleUpload = async () => {
        if (!selectedStudent || !file) {
            setError('يرجى اختيار الطالب والملف.');
            return;
        }

        // Find the student to get user_id
        const student = students.find(s => s.id.toString() === selectedStudent.toString());
        if (!student || !student.user_id) {
            setError('خطأ في بيانات الطالب.');
            return;
        }

        const formData = new FormData();
        formData.append('student', student.user_id);  // Use user_id for the Certificate model
        formData.append('file', file);
        formData.append('description', description || 'شهادة التخرج');

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            await axios.post('/api/academic/certificates/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            });
            setSuccess(`تم رفع الشهادة بنجاح للطالب ${student.full_name}`);
            setSelectedStudent('');
            setDescription('');
            setFile(null);
        } catch (err) {
            console.error('Error uploading certificate:', err);
            setError('فشل رفع الشهادة. تأكد من صحة البيانات.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Button onClick={() => window.history.back()} sx={{ mb: 2, fontFamily: 'Cairo' }}>← عودة</Button>
            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 4 }}>
                رفع شهادات التخرج
            </Typography>

            <Alert severity="info" sx={{ mb: 3, fontFamily: 'Cairo' }}>
                اختر القسم أولاً ثم اختر الطالب من طلاب السنة الرابعة في هذا القسم.
            </Alert>

            <Paper sx={{ p: 4 }}>
                {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo' }} onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3, fontFamily: 'Cairo' }} onClose={() => setSuccess('')}>{success}</Alert>}

                {loadingDepts ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
                ) : (
                    <Grid container spacing={3}>
                        {/* Step 1: Select Department */}
                        <Grid item xs={12}>
                            <TextField
                                select
                                label="اختر القسم"
                                fullWidth
                                value={selectedDepartment}
                                onChange={handleDepartmentChange}
                                InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                                SelectProps={{ style: { fontFamily: 'Cairo' } }}
                            >
                                <MenuItem value="" sx={{ fontFamily: 'Cairo' }}>-- اختر القسم --</MenuItem>
                                {departments.map((dept) => (
                                    <MenuItem key={dept.id} value={dept.id} sx={{ fontFamily: 'Cairo' }}>
                                        {dept.name} ({dept.code})
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Step 2: Select Student (only shows after department is selected) */}
                        {selectedDepartment && (
                            <Grid item xs={12}>
                                {loadingStudents ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={30} /></Box>
                                ) : students.length === 0 ? (
                                    <Alert severity="warning" sx={{ fontFamily: 'Cairo' }}>
                                        لا يوجد طلاب في السنة الرابعة في هذا القسم.
                                    </Alert>
                                ) : (
                                    <TextField
                                        select
                                        label="اختر الطالب"
                                        fullWidth
                                        value={selectedStudent}
                                        onChange={(e) => setSelectedStudent(e.target.value)}
                                        InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                                        SelectProps={{ style: { fontFamily: 'Cairo' } }}
                                    >
                                        <MenuItem value="" sx={{ fontFamily: 'Cairo' }}>-- اختر الطالب --</MenuItem>
                                        {students.map((student) => (
                                            <MenuItem key={student.id} value={student.id} sx={{ fontFamily: 'Cairo' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                                    <span>{student.full_name}</span>
                                                    <Chip
                                                        size="small"
                                                        label={student.graduation_status === 'APPROVED' ? 'معتمد' : 'قيد المراجعة'}
                                                        color={student.graduation_status === 'APPROVED' ? 'success' : 'warning'}
                                                    />
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            </Grid>
                        )}

                        {/* Step 3: File and description (only shows after student is selected) */}
                        {selectedStudent && (
                            <>
                                <Grid item xs={12}>
                                    <TextField
                                        label="وصف الشهادة (اختياري)"
                                        fullWidth
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                                        placeholder="مثل: شهادة التخرج - دفعة 2024"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        fullWidth
                                        sx={{ fontFamily: 'Cairo', height: 56 }}
                                    >
                                        {file ? file.name : 'اختر ملف الشهادة (PDF/Image)'}
                                        <input
                                            type="file"
                                            hidden
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => setFile(e.target.files[0])}
                                        />
                                    </Button>
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        size="large"
                                        onClick={handleUpload}
                                        disabled={uploading || !file}
                                        sx={{ fontFamily: 'Cairo', bgcolor: '#0A2342' }}
                                    >
                                        {uploading ? 'جاري الرفع...' : 'رفع الشهادة'}
                                    </Button>
                                </Grid>
                            </>
                        )}
                    </Grid>
                )}
            </Paper>
        </Container>
    );
}
