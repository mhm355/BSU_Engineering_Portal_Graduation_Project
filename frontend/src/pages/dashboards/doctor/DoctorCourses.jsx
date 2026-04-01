import React, { useEffect, useState, useMemo } from 'react';
import {
    Box, Container, Typography, Paper, Grid, Card, CardContent, CardActions,
    Button, Alert, CircularProgress, Chip, TextField, MenuItem, Select,
    FormControl, InputLabel, Avatar, InputAdornment, Fade, Grow
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GroupIcon from '@mui/icons-material/Group';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import EventNoteIcon from '@mui/icons-material/EventNote';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function DoctorCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [filterTerm, setFilterTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const navigate = useNavigate();

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    useEffect(() => { fetchCourses(); }, []);

    const fetchCourses = async () => {
        try {
            const response = await axios.get('/api/academic/course-offerings/my_courses/', config);
            setCourses(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError('فشل تحميل المقررات الدراسية.');
        } finally {
            setLoading(false);
        }
    };

    // Unique year options from courses
    const yearOptions = useMemo(() => [...new Set(courses.map(c => c.academic_year).filter(Boolean))].sort().reverse(), [courses]);
    const termOptions = useMemo(() => [...new Set(courses.map(c => c.term).filter(Boolean))].sort(), [courses]);

    const filtered = useMemo(() => courses.filter(c => {
        if (search && !c.subject_name?.toLowerCase().includes(search.toLowerCase()) &&
            !c.subject_code?.toLowerCase().includes(search.toLowerCase()) &&
            !c.level_name?.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterYear && c.academic_year !== filterYear) return false;
        if (filterTerm && String(c.term) !== String(filterTerm)) return false;
        if (filterStatus === 'OPEN' && c.academic_year_status !== 'OPEN') return false;
        if (filterStatus === 'CLOSED' && c.academic_year_status !== 'CLOSED') return false;
        return true;
    }), [courses, search, filterYear, filterTerm, filterStatus]);

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 8, flexDirection: 'column', gap: 2 }}>
            <CircularProgress size={50} />
            <Typography sx={{ fontFamily: 'Cairo', color: '#666' }}>جاري تحميل المقررات...</Typography>
        </Box>
    );

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', pb: 6 }}>
            {/* Hero Header */}
            <Box sx={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', pt: 4, pb: 5, mb: 4, position: 'relative', overflow: 'hidden' }}>
                {/* Decorative circle - REMOVED */}
                {/* <Box sx={{ position: 'absolute', top: -60, right: -60, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} /> */}
                <Container maxWidth="xl">
                    <Fade in timeout={600}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Avatar sx={{ width: 72, height: 72, bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
                                <MenuBookIcon sx={{ fontSize: 40, color: '#fff' }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>مقرراتي الدراسية</Typography>
                                <Typography sx={{ fontFamily: 'Cairo', color: 'rgba(255,255,255,0.7)' }}>
                                    {courses.length} مقرر مسند | {filtered.length} ظاهر
                                </Typography>
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Container maxWidth="xl">
                {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3 }}>{error}</Alert>}

                {/* Filters Bar */}
                <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <FilterListIcon sx={{ color: '#666' }} />
                    <TextField
                        size="small" placeholder="بحث بالاسم أو الكود..." value={search}
                        onChange={e => setSearch(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#aaa' }} /></InputAdornment> }}
                        sx={{ minWidth: 220, fontFamily: 'Cairo', '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel sx={{ fontFamily: 'Cairo' }}>العام الأكاديمي</InputLabel>
                        <Select value={filterYear} onChange={e => setFilterYear(e.target.value)} label="العام الأكاديمي" sx={{ borderRadius: 3, fontFamily: 'Cairo' }}>
                            <MenuItem value=""><em>الكل</em></MenuItem>
                            {yearOptions.map(y => <MenuItem key={y} value={y} sx={{ fontFamily: 'Cairo' }}>{y}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel sx={{ fontFamily: 'Cairo' }}>الترم</InputLabel>
                        <Select value={filterTerm} onChange={e => setFilterTerm(e.target.value)} label="الترم" sx={{ borderRadius: 3, fontFamily: 'Cairo' }}>
                            <MenuItem value=""><em>الكل</em></MenuItem>
                            {termOptions.map(t => <MenuItem key={t} value={t} sx={{ fontFamily: 'Cairo' }}>الترم {t}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel sx={{ fontFamily: 'Cairo' }}>حالة العام</InputLabel>
                        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} label="حالة العام" sx={{ borderRadius: 3, fontFamily: 'Cairo' }}>
                            <MenuItem value="">الكل</MenuItem>
                            <MenuItem value="OPEN" sx={{ fontFamily: 'Cairo' }}>مفتوح</MenuItem>
                            <MenuItem value="CLOSED" sx={{ fontFamily: 'Cairo' }}>مغلق</MenuItem>
                        </Select>
                    </FormControl>
                    {(search || filterYear || filterTerm || filterStatus) && (
                        <Button size="small" onClick={() => { setSearch(''); setFilterYear(''); setFilterTerm(''); setFilterStatus(''); }} sx={{ fontFamily: 'Cairo', color: '#e53935' }}>
                            مسح الفلاتر
                        </Button>
                    )}
                </Paper>

                {filtered.length > 0 ? (
                    <Grid container spacing={3}>
                        {filtered.map((course, idx) => (
                            <Grid item xs={12} sm={6} lg={4} key={course.id}>
                                <Grow in timeout={400 + idx * 50}>
                                    <Card sx={{
                                        height: '100%', display: 'flex', flexDirection: 'column',
                                        borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                        border: course.academic_year_status === 'OPEN' ? '2px solid #4CAF5044' : '2px solid #eeeeee',
                                        transition: 'all 0.3s ease',
                                        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }
                                    }}>
                                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                            {/* Header */}
                                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                                <Avatar sx={{ bgcolor: course.academic_year_status === 'OPEN' ? '#4F46E5' : '#9e9e9e', width: 48, height: 48 }}>
                                                    <MenuBookIcon />
                                                </Avatar>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744', lineHeight: 1.3 }}>
                                                        {course.subject_name}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#888' }}>{course.subject_code}</Typography>
                                                </Box>
                                            </Box>

                                            {/* Chips */}
                                            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                                <Chip label={`ترم ${course.term}`} size="small" color="primary" sx={{ fontFamily: 'Cairo' }} />
                                                <Chip label={course.academic_year_status === 'OPEN' ? 'مفتوح' : 'مغلق'} size="small"
                                                    color={course.academic_year_status === 'OPEN' ? 'success' : 'default'} sx={{ fontFamily: 'Cairo' }} />
                                                {course.specialization_code && (
                                                    <Chip label={course.specialization_name} size="small" color="secondary" sx={{ fontFamily: 'Cairo' }} />
                                                )}
                                            </Box>

                                            {/* Info rows */}
                                            {[
                                                { label: 'القسم', value: course.department_name },
                                                { label: 'الفرقة', value: course.level_name },
                                                { label: 'العام الأكاديمي', value: course.academic_year },
                                            ].map(({ label, value }) => value && (
                                                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                                                    <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#888' }}>{label}</Typography>
                                                    <Typography variant="body2" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#444' }}>{value}</Typography>
                                                </Box>
                                            ))}

                                            {/* Student count */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, pt: 1.5, borderTop: '1px solid #f0f0f0' }}>
                                                <GroupIcon sx={{ color: '#0288d1', fontSize: 20 }} />
                                                <Typography sx={{ fontFamily: 'Cairo', color: '#555', fontSize: 14 }}>{course.student_count || 0} طالب</Typography>
                                                {course.final_exam_date && (
                                                    <>
                                                        <EventNoteIcon sx={{ color: '#f57c00', fontSize: 20, ml: 1 }} />
                                                        <Typography sx={{ fontFamily: 'Cairo', color: '#f57c00', fontSize: 13 }}>
                                                            {new Date(course.final_exam_date).toLocaleDateString('ar-EG')}
                                                        </Typography>
                                                    </>
                                                )}
                                            </Box>
                                        </CardContent>
                                        <CardActions sx={{ p: 2, pt: 0 }}>
                                            <Button
                                                variant="contained" fullWidth
                                                onClick={() => navigate(`/doctor/courses/${course.id}`)}
                                                sx={{
                                                    fontFamily: 'Cairo', fontWeight: 'bold', borderRadius: 3,
                                                    background: course.academic_year_status === 'OPEN'
                                                        ? 'linear-gradient(135deg, #4F46E5, #7C3AED)'
                                                        : 'linear-gradient(135deg, #757575, #9e9e9e)',
                                                }}
                                            >
                                                إدارة المقرر
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grow>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                        <MenuBookIcon sx={{ fontSize: 80, color: '#ddd', mb: 2 }} />
                        <Typography variant="h5" sx={{ fontFamily: 'Cairo', color: '#999' }}>
                            {courses.length === 0 ? 'لا توجد مقررات مسندة إليك حالياً' : 'لا توجد نتائج للفلاتر المحددة'}
                        </Typography>
                    </Paper>
                )}
            </Container>
        </Box>
    );
}
