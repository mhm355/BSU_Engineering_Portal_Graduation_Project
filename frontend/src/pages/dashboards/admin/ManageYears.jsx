import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Alert, Checkbox, FormControlLabel } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import axios from 'axios';

export default function ManageYears() {
    const [years, setYears] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentYear, setCurrentYear] = useState({ name: '', is_current: false });
    const [isEdit, setIsEdit] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchYears();
    }, []);

    const fetchYears = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/academic/years/');
            setYears(response.data);
        } catch (err) {
            console.error('Error fetching years:', err);
        }
    };

    const handleOpen = (year = { name: '', is_current: false }) => {
        setCurrentYear(year);
        setIsEdit(!!year.id);
        setOpen(true);
        setError('');
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSave = async () => {
        try {
            if (isEdit) {
                await axios.put(`http://localhost:8000/api/academic/years/${currentYear.id}/`, currentYear);
            } else {
                await axios.post('http://localhost:8000/api/academic/years/', currentYear);
            }
            fetchYears();
            handleClose();
        } catch (err) {
            setError('حدث خطأ أثناء الحفظ. تأكد من صحة البيانات.');
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا العام الدراسي؟')) {
            try {
                await axios.delete(`http://localhost:8000/api/academic/years/${id}/`);
                fetchYears();
            } catch (err) {
                console.error('Error deleting year:', err);
                alert('لا يمكن حذف هذا العام لأنه مرتبط ببيانات أخرى.');
            }
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                    إدارة السنوات الدراسية
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon sx={{ ml: 1 }} />}
                    onClick={() => handleOpen()}
                    sx={{ fontFamily: 'Cairo', fontWeight: 'bold', bgcolor: '#0A2342' }}
                >
                    إضافة عام جديد
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'right' }}>اسم العام</TableCell>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center' }}>العام الحالي</TableCell>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center' }}>الإجراءات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {years.map((year) => (
                            <TableRow key={year.id}>
                                <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>{year.name}</TableCell>
                                <TableCell sx={{ textAlign: 'center' }}>
                                    {year.is_current && <CheckIcon color="success" />}
                                </TableCell>
                                <TableCell sx={{ textAlign: 'center' }}>
                                    <IconButton color="primary" onClick={() => handleOpen(year)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(year.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add/Edit Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>
                    {isEdit ? 'تعديل عام دراسي' : 'إضافة عام دراسي جديد'}
                </DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2, fontFamily: 'Cairo' }}>{error}</Alert>}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="اسم العام (مثال: 2024-2025)"
                            fullWidth
                            value={currentYear.name}
                            onChange={(e) => setCurrentYear({ ...currentYear, name: e.target.value })}
                            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={currentYear.is_current}
                                    onChange={(e) => setCurrentYear({ ...currentYear, is_current: e.target.checked })}
                                />
                            }
                            label={<Typography sx={{ fontFamily: 'Cairo' }}>تعيين كعام حالي</Typography>}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'flex-start', p: 2 }}>
                    <Button onClick={handleClose} sx={{ fontFamily: 'Cairo' }}>إلغاء</Button>
                    <Button onClick={handleSave} variant="contained" sx={{ fontFamily: 'Cairo', bgcolor: '#0A2342' }}>
                        حفظ
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
