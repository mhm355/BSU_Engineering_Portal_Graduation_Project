import React, { useEffect, useState, useMemo } from 'react';
import {
    Box, Container, Typography, TextField, InputAdornment,
    CircularProgress, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Tabs, Tab
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

export default function StaffDirectory() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDept, setSelectedDept] = useState('all');

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const response = await axios.get('/api/auth/public/staff/');
            setStaff(response.data);
        } catch (err) {
            console.error('Error fetching staff:', err);
            setStaff([]);
        } finally {
            setLoading(false);
        }
    };

    // Get unique departments for tabs
    const departments = useMemo(() => {
        const depts = [...new Set(staff.map(m => m.department || 'أخرى'))];
        return depts;
    }, [staff]);

    // Filter by search and department
    const filteredStaff = useMemo(() => {
        return staff.filter(member => {
            const matchesSearch = !searchQuery.trim() ||
                `${member.first_name} ${member.last_name}`.includes(searchQuery) ||
                member.email?.includes(searchQuery);
            const matchesDept = selectedDept === 'all' ||
                (member.department || 'أخرى') === selectedDept;
            return matchesSearch && matchesDept;
        });
    }, [staff, searchQuery, selectedDept]);

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 2 }}>
                    أعضاء هيئة التدريس
                </Typography>
                <Typography variant="h6" color="textSecondary" sx={{ fontFamily: 'Cairo', mb: 3 }}>
                    نخبة من أفضل الأساتذة والمحاضرين
                </Typography>

                {/* Search Box */}
                <TextField
                    placeholder="البحث بالاسم أو البريد الإلكتروني..."
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{
                        width: { xs: '100%', sm: '400px' },
                        bgcolor: 'white',
                        mb: 3,
                        '& .MuiInputBase-input': { fontFamily: 'Cairo' }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {/* Department Tabs */}
            {departments.length > 0 && (
                <Tabs
                    value={selectedDept}
                    onChange={(e, val) => setSelectedDept(val)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ mb: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}
                >
                    <Tab value="all" label="الكل" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} />
                    {departments.map(dept => (
                        <Tab key={dept} value={dept} label={dept} sx={{ fontFamily: 'Cairo' }} />
                    ))}
                </Tabs>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : filteredStaff.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography sx={{ fontFamily: 'Cairo', color: 'text.secondary' }}>
                        {searchQuery ? 'لا توجد نتائج للبحث' : 'لا يوجد أعضاء هيئة تدريس'}
                    </Typography>
                </Box>
            ) : (
                <TableContainer component={Paper} elevation={3}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#0A2342' }}>
                            <TableRow>
                                <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold', width: 50 }}>#</TableCell>
                                <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>الاسم</TableCell>
                                <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>البريد الإلكتروني</TableCell>
                                <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold' }}>القسم</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredStaff.map((member, idx) => (
                                <TableRow
                                    key={member.id}
                                    sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}
                                >
                                    <TableCell>{idx + 1}</TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 500 }}>
                                        {member.first_name} {member.last_name}
                                    </TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo' }}>
                                        {member.email || '-'}
                                    </TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo' }}>
                                        {member.department || '-'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Count */}
            <Typography sx={{ mt: 2, textAlign: 'center', fontFamily: 'Cairo', color: 'text.secondary' }}>
                إجمالي: {filteredStaff.length} عضو
            </Typography>
        </Container>
    );
}
