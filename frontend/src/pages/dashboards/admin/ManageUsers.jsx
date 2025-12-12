import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Alert, MenuItem } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState({ username: '', first_name: '', last_name: '', email: '', role: 'STUDENT', national_id: '' });
    const [isEdit, setIsEdit] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            // Note: We need a list endpoint for users. Assuming /api/auth/users/ or similar.
            // Since we didn't explicitly create a list endpoint in users/views.py, we might need to add it.
            // For now, let's assume we added a UserViewSet in users/views.py
            const response = await axios.get('http://localhost:8000/api/auth/users/');
            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching users:', err);
            // Fallback for demo if endpoint doesn't exist yet
            setUsers([]);
        }
    };

    const handleOpen = (user = { username: '', first_name: '', last_name: '', email: '', role: 'STUDENT', national_id: '' }) => {
        setCurrentUser(user);
        setIsEdit(!!user.id);
        setOpen(true);
        setError('');
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSave = async () => {
        try {
            if (isEdit) {
                await axios.put(`http://localhost:8000/api/auth/users/${currentUser.id}/`, currentUser);
            } else {
                await axios.post('http://localhost:8000/api/auth/users/', { ...currentUser, password: currentUser.national_id || 'password123' });
            }
            fetchUsers();
            handleClose();
        } catch (err) {
            setError('حدث خطأ أثناء الحفظ. تأكد من صحة البيانات.');
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
            try {
                await axios.delete(`http://localhost:8000/api/auth/users/${id}/`);
                fetchUsers();
            } catch (err) {
                console.error('Error deleting user:', err);
            }
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                    إدارة المستخدمين
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon sx={{ ml: 1 }} />}
                    onClick={() => handleOpen()}
                    sx={{ fontFamily: 'Cairo', fontWeight: 'bold', bgcolor: '#0A2342' }}
                >
                    إضافة مستخدم جديد
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'right' }}>اسم المستخدم</TableCell>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'right' }}>الاسم الكامل</TableCell>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'right' }}>الدور</TableCell>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'right' }}>البريد الإلكتروني</TableCell>
                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center' }}>الإجراءات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>{user.username}</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>{user.first_name} {user.last_name}</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>{user.role}</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>{user.email}</TableCell>
                                <TableCell sx={{ textAlign: 'center' }}>
                                    <IconButton color="primary" onClick={() => handleOpen(user)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(user.id)}>
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
                    {isEdit ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
                </DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2, fontFamily: 'Cairo' }}>{error}</Alert>}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="اسم المستخدم"
                            fullWidth
                            value={currentUser.username}
                            onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
                            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                            disabled={isEdit}
                        />
                        <TextField
                            label="الاسم الأول"
                            fullWidth
                            value={currentUser.first_name}
                            onChange={(e) => setCurrentUser({ ...currentUser, first_name: e.target.value })}
                            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                        />
                        <TextField
                            label="اسم العائلة"
                            fullWidth
                            value={currentUser.last_name}
                            onChange={(e) => setCurrentUser({ ...currentUser, last_name: e.target.value })}
                            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                        />
                        <TextField
                            label="الرقم القومي (كلمة المرور الافتراضية)"
                            fullWidth
                            value={currentUser.national_id}
                            onChange={(e) => {
                                if (e.target.value.length <= 14 && /^\d*$/.test(e.target.value)) {
                                    setCurrentUser({ ...currentUser, national_id: e.target.value });
                                }
                            }}
                            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                            helperText={`${currentUser.national_id.length}/14`}
                            error={currentUser.national_id.length > 0 && currentUser.national_id.length !== 14}
                        />
                        <TextField
                            select
                            label="الدور"
                            fullWidth
                            value={currentUser.role}
                            onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
                            InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
                        >
                            <MenuItem value="STUDENT" sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>طالب</MenuItem>
                            <MenuItem value="DOCTOR" sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>عضو هيئة تدريس</MenuItem>
                            <MenuItem value="STAFF" sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>شئون طلاب</MenuItem>
                            <MenuItem value="ADMIN" sx={{ fontFamily: 'Cairo', textAlign: 'right' }}>مدير نظام</MenuItem>
                        </TextField>
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
