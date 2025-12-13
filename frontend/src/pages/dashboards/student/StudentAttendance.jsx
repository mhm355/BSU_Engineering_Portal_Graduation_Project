import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';

export default function StudentAttendance() {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const response = await axios.get('/api/academic/attendance/', { withCredentials: true });
            setAttendance(response.data);
        } catch (err) {
            console.error('Error fetching attendance:', err);
            setError('فشل تحميل سجل الحضور. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 4 }}>
                سجل الحضور والغياب
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo' }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'right' }}>المادة</TableCell>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'right' }}>التاريخ</TableCell>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'right' }}>الحالة</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {attendance.length > 0 ? (
                            attendance.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>{record.course_name}</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>{record.date}</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>
                                        <span style={{
                                            fontWeight: 'bold',
                                            color: record.status === 'PRESENT' ? 'green' : 'red'
                                        }}>
                                            {record.status === 'PRESENT' ? 'حاضر' : 'غائب'}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} sx={{ textAlign: 'center', fontFamily: 'Cairo', py: 3 }}>
                                    لا توجد سجلات حضور متاحة حالياً.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
}
