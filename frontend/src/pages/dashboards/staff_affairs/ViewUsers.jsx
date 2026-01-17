import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableContainer,
    CircularProgress,
    Alert,
    Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ViewUsers = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [doctors, setDoctors] = useState([]);

    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const doctorRes = await axios.get('/api/academic/staff-affairs/doctors/', { headers });
            setDoctors(doctorRes.data);
        } catch (err) {
            setError('خطأ في تحميل البيانات');
        } finally {
            setLoading(false);
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
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                    عرض الدكاترة ({doctors.length})
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                                <TableCell>#</TableCell>
                                <TableCell>الاسم</TableCell>
                                <TableCell>الرقم القومي</TableCell>
                                <TableCell>البريد الإلكتروني</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {doctors.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        لا يوجد دكاترة - قم برفع قائمة الدكاترة أولاً
                                    </TableCell>
                                </TableRow>
                            ) : (
                                doctors.map((doc, index) => (
                                    <TableRow key={doc.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{doc.full_name}</TableCell>
                                        <TableCell>{doc.national_id}</TableCell>
                                        <TableCell>{doc.email || '-'}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ mt: 3 }}>
                    <Button variant="outlined" onClick={() => navigate('/staff-affairs/dashboard')}>
                        رجوع
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default ViewUsers;
