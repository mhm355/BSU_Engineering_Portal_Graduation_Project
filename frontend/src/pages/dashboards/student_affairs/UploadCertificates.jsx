import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, TextField, Button, Alert, MenuItem, Grid } from '@mui/material';
import axios from 'axios';

export default function UploadCertificates() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await axios.get('/api/auth/users/', { withCredentials: true });
            setStudents(response.data.filter(u => u.role === 'STUDENT'));
        } catch (err) {
            console.error('Error fetching students:', err);
        }
    };

    const handleUpload = async () => {
        if (!selectedStudent || !file) {
            setError('يرجى اختيار الطالب والملف.');
            return;
        }

        const formData = new FormData();
        formData.append('student', selectedStudent);
        formData.append('file', file);
        formData.append('description', description);

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
            setSuccess('تم رفع الشهادة بنجاح.');
            setSelectedStudent('');
            setDescription('');
            setFile(null);
        } catch (err) {
            console.error('Error uploading certificate:', err);
            setError('فشل رفع الشهادة.');
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

            <Paper sx={{ p: 4 }}>
                {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo' }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3, fontFamily: 'Cairo' }}>{success}</Alert>}

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            select
                            label="اختر الطالب"
                            fullWidth
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                            SelectProps={{ style: { fontFamily: 'Cairo' } }}
                        >
                            {students.map((student) => (
                                <MenuItem key={student.id} value={student.id} sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>
                                    {student.first_name} {student.last_name} ({student.username})
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="وصف الشهادة (اختياري)"
                            fullWidth
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
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
                            disabled={uploading}
                            sx={{ fontFamily: 'Cairo', bgcolor: '#0A2342' }}
                        >
                            {uploading ? 'جاري الرفع...' : 'حفظ الشهادة'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}
