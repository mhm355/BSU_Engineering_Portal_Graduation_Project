import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, Box, IconButton, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Tooltip, Fade, Grow, CircularProgress
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function DeanExportData() {
    const navigate = useNavigate();
    const [years, setYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const config = {
        withCredentials: true,
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    };

    useEffect(() => {
        fetchYears();
    }, []);

    const fetchYears = async () => {
        try {
            // Fetch academic years (includes terms inside it based on serializer)
            const [yearsRes, termsRes] = await Promise.all([
                axios.get('/api/academic/years/', config),
                axios.get('/api/academic/terms/', config)
            ]);
            
            // Map terms to years
            const termsData = termsRes.data;
            const yearsData = yearsRes.data.map(y => ({
                ...y,
                terms: termsData.filter(t => t.academic_year === y.id)
            }));
            
            setYears(yearsData);
            setLoading(false);
        } catch (err) {
            setError('فشل في تحميل البيانات');
            setLoading(false);
        }
    };

    const handleExport = async (type, id) => {
        try {
            const url = type === 'year' 
                ? `/api/academic/export/?academic_year_id=${id}` 
                : `/api/academic/export/?term_id=${id}`;
                
            const response = await axios.get(url, {
                ...config,
                responseType: 'blob'
            });
            
            const blob = new Blob([response.data], { type: 'application/zip' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `${type}_${id}_database_export.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Export error:', err);
            setError('فشل في تصدير البيانات');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', pb: 6 }}>
            {/* Header */}
            <Box sx={{ bgcolor: '#1A237E', pt: 4, pb: 4, mb: 4, color: '#fff' }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton onClick={() => navigate('/dean/dashboard')} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' }}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                            تصدير البيانات المغلقة
                        </Typography>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="lg">
                {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

                <Grow in={true} timeout={500}>
                    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>العام الدراسي</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>حالة العام</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الفصول الدراسية</TableCell>
                                        <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>إجراءات</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {years.map((year) => (
                                        <TableRow key={year.id}>
                                            <TableCell sx={{ fontFamily: 'Cairo' }}>{year.name}</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo' }}>
                                                {year.status === 'CLOSED' ? 'مغلق' : 'مفتوح'}
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                    {year.terms.map(term => (
                                                        <Box key={term.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', minWidth: 80 }}>
                                                                {term.name_display}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: term.status === 'CLOSED' ? 'error.main' : 'success.main' }}>
                                                                ({term.status === 'CLOSED' ? 'مغلق' : 'مفتوح'})
                                                            </Typography>
                                                            {term.status === 'CLOSED' && (
                                                                <Tooltip title="تصدير الفصل الدراسي">
                                                                    <IconButton size="small" onClick={() => handleExport('term', term.id)} sx={{ color: 'primary.main' }}>
                                                                        <FileDownloadIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {year.status === 'CLOSED' && (
                                                    <Tooltip title="تصدير العام بالكامل">
                                                        <IconButton onClick={() => handleExport('year', year.id)} sx={{ color: 'primary.main', bgcolor: '#e8eaf6' }}>
                                                            <FileDownloadIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {years.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ fontFamily: 'Cairo', py: 3 }}>
                                                لا توجد بيانات متاحة
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grow>
            </Container>
        </Box>
    );
}
