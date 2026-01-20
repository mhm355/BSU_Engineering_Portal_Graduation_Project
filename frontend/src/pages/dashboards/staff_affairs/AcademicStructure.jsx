import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, Box, Grid, List, ListItem, ListItemText,
    ListItemIcon, CircularProgress, Alert, Button, Chip, Accordion,
    AccordionSummary, AccordionDetails, Avatar, Fade, Grow
} from '@mui/material';
import { keyframes } from '@mui/system';
import {
    School as DeptIcon,
    ExpandMore as ExpandIcon,
    Book as SubjectIcon,
    Folder as LevelIcon,
    ArrowBack as ArrowBackIcon,
    AccountTree as TreeIcon,
    MenuBook as MenuBookIcon,
    Category as CategoryIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const AcademicStructure = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [expandedDept, setExpandedDept] = useState(null);
    const [subjects, setSubjects] = useState({});

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/academic/departments/', config);
            setDepartments(res.data);
        } catch (err) {
            setError('خطأ في تحميل الأقسام');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async (deptId) => {
        if (subjects[deptId]) return;

        try {
            const res = await axios.get(`/api/academic/subjects/?department=${deptId}`, config);
            setSubjects((prev) => ({ ...prev, [deptId]: res.data }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleExpandDept = (deptId) => {
        if (expandedDept === deptId) {
            setExpandedDept(null);
        } else {
            setExpandedDept(deptId);
            fetchSubjects(deptId);
        }
    };

    const levelNames = {
        PREPARATORY: 'الإعدادية',
        FIRST: 'الأولى',
        SECOND: 'الثانية',
        THIRD: 'الثالثة',
        FOURTH: 'الرابعة',
    };

    const levelColors = {
        PREPARATORY: '#9C27B0',
        FIRST: '#2196F3',
        SECOND: '#4CAF50',
        THIRD: '#FF9800',
        FOURTH: '#E91E63',
    };

    const groupSubjectsByLevel = (subjectList) => {
        const grouped = {};
        subjectList.forEach((subj) => {
            const level = subj.level;
            if (!grouped[level]) {
                grouped[level] = { sem1: [], sem2: [] };
            }
            if (subj.semester === 1) {
                grouped[level].sem1.push(subj);
            } else {
                grouped[level].sem2.push(subj);
            }
        });
        return grouped;
    };

    const totalSubjects = Object.values(subjects).flat().length;

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', pb: 6 }}>
            {/* Hero Header */}
            <Box sx={{ background: 'linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)', pt: 4, pb: 6, mb: 4, position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', animation: `${float} 6s ease-in-out infinite` }} />
                <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', animation: `${float} 8s ease-in-out infinite`, animationDelay: '2s' }} />

                <Container maxWidth="lg">
                    <Fade in={true} timeout={800}>
                        <Box>
                            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/staff-affairs/dashboard')} sx={{ color: '#fff', mb: 2, fontFamily: 'Cairo', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                                العودة للوحة التحكم
                            </Button>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                                    <TreeIcon sx={{ fontSize: 45, color: '#fff' }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                        الهيكل الأكاديمي
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: 'rgba(255,255,255,0.9)' }}>
                                        عرض الأقسام والفرق والمواد (للقراءة فقط)
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Container maxWidth="lg">
                {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem' }} onClose={() => setError(null)}>{error}</Alert>}

                {/* Stats Row */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={4}>
                        <Grow in={true} timeout={400}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 55, height: 55, background: 'linear-gradient(135deg, #0288d1, #03a9f4)' }}>
                                    <DeptIcon sx={{ fontSize: 28 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{departments.length}</Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>الأقسام</Typography>
                                </Box>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Grow in={true} timeout={500}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 55, height: 55, background: 'linear-gradient(135deg, #4CAF50, #8BC34A)' }}>
                                    <LevelIcon sx={{ fontSize: 28 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>5</Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>الفرق الدراسية</Typography>
                                </Box>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Grow in={true} timeout={600}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 55, height: 55, background: 'linear-gradient(135deg, #FF9800, #FFB74D)' }}>
                                    <MenuBookIcon sx={{ fontSize: 28 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{totalSubjects}</Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>المواد المحملة</Typography>
                                </Box>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={50} /></Box>
                ) : (
                    <Box>
                        {departments.map((dept, index) => (
                            <Grow in={true} timeout={400 + index * 100} key={dept.id}>
                                <Accordion
                                    expanded={expandedDept === dept.id}
                                    onChange={() => handleExpandDept(dept.id)}
                                    sx={{ mb: 2, borderRadius: '16px !important', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', '&:before': { display: 'none' } }}
                                >
                                    <AccordionSummary expandIcon={<ExpandIcon sx={{ color: '#0288d1', fontSize: 30 }} />} sx={{ py: 1.5, px: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                            <Avatar sx={{ width: 50, height: 50, background: 'linear-gradient(135deg, #0288d1, #03a9f4)' }}>
                                                <DeptIcon />
                                            </Avatar>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{dept.name}</Typography>
                                                <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
                                                    <Chip label={dept.code} size="small" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', bgcolor: '#e3f2fd', color: '#0288d1' }} />
                                                    {dept.has_specializations && (
                                                        <Chip icon={<CategoryIcon sx={{ fontSize: 16 }} />} label="يحتوي تخصصات" size="small" color="secondary" sx={{ fontFamily: 'Cairo' }} />
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ bgcolor: '#fafafa', p: 3 }}>
                                        {subjects[dept.id] ? (
                                            <Box>
                                                {Object.entries(groupSubjectsByLevel(subjects[dept.id])).length === 0 ? (
                                                    <Alert severity="info" sx={{ fontFamily: 'Cairo', borderRadius: 2 }}>
                                                        لا توجد مواد مسجلة لهذا القسم
                                                    </Alert>
                                                ) : (
                                                    Object.entries(groupSubjectsByLevel(subjects[dept.id])).map(([level, semesters]) => (
                                                        <Box key={level} sx={{ mb: 4 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                                <Avatar sx={{ width: 40, height: 40, bgcolor: levelColors[level] || '#666' }}>
                                                                    <LevelIcon />
                                                                </Avatar>
                                                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                                                    الفرقة {levelNames[level] || level}
                                                                </Typography>
                                                                <Chip label={`${semesters.sem1.length + semesters.sem2.length} مادة`} size="small" sx={{ fontFamily: 'Cairo' }} />
                                                            </Box>

                                                            <Grid container spacing={3}>
                                                                <Grid item xs={12} md={6}>
                                                                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '2px solid #e3f2fd', bgcolor: '#fff' }}>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                                            <Avatar sx={{ width: 30, height: 30, bgcolor: '#2196F3', fontSize: 14 }}>1</Avatar>
                                                                            <Typography variant="subtitle1" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1976d2' }}>
                                                                                الفصل الدراسي الأول ({semesters.sem1.length} مادة)
                                                                            </Typography>
                                                                        </Box>
                                                                        <List dense>
                                                                            {semesters.sem1.map((subj) => (
                                                                                <ListItem key={subj.id} sx={{ py: 0.5, borderRadius: 2, '&:hover': { bgcolor: '#f5f5f5' } }}>
                                                                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                                                                        <SubjectIcon fontSize="small" sx={{ color: '#2196F3' }} />
                                                                                    </ListItemIcon>
                                                                                    <ListItemText
                                                                                        primary={<Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '0.95rem' }}>{subj.name}</Typography>}
                                                                                        secondary={<Box sx={{ display: 'flex', gap: 1 }}>
                                                                                            <Chip label={subj.code} size="small" sx={{ height: 22, fontSize: '0.75rem' }} />
                                                                                            {subj.is_elective && <Chip label="اختياري" size="small" color="info" sx={{ height: 22, fontSize: '0.75rem' }} />}
                                                                                        </Box>}
                                                                                    />
                                                                                </ListItem>
                                                                            ))}
                                                                            {semesters.sem1.length === 0 && <Typography color="text.secondary" sx={{ fontFamily: 'Cairo', py: 1 }}>لا توجد مواد</Typography>}
                                                                        </List>
                                                                    </Paper>
                                                                </Grid>
                                                                <Grid item xs={12} md={6}>
                                                                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '2px solid #e8f5e9', bgcolor: '#fff' }}>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                                            <Avatar sx={{ width: 30, height: 30, bgcolor: '#4CAF50', fontSize: 14 }}>2</Avatar>
                                                                            <Typography variant="subtitle1" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#388e3c' }}>
                                                                                الفصل الدراسي الثاني ({semesters.sem2.length} مادة)
                                                                            </Typography>
                                                                        </Box>
                                                                        <List dense>
                                                                            {semesters.sem2.map((subj) => (
                                                                                <ListItem key={subj.id} sx={{ py: 0.5, borderRadius: 2, '&:hover': { bgcolor: '#f5f5f5' } }}>
                                                                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                                                                        <SubjectIcon fontSize="small" sx={{ color: '#4CAF50' }} />
                                                                                    </ListItemIcon>
                                                                                    <ListItemText
                                                                                        primary={<Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '0.95rem' }}>{subj.name}</Typography>}
                                                                                        secondary={<Box sx={{ display: 'flex', gap: 1 }}>
                                                                                            <Chip label={subj.code} size="small" sx={{ height: 22, fontSize: '0.75rem' }} />
                                                                                            {subj.is_elective && <Chip label="اختياري" size="small" color="info" sx={{ height: 22, fontSize: '0.75rem' }} />}
                                                                                        </Box>}
                                                                                    />
                                                                                </ListItem>
                                                                            ))}
                                                                            {semesters.sem2.length === 0 && <Typography color="text.secondary" sx={{ fontFamily: 'Cairo', py: 1 }}>لا توجد مواد</Typography>}
                                                                        </List>
                                                                    </Paper>
                                                                </Grid>
                                                            </Grid>
                                                        </Box>
                                                    ))
                                                )}
                                            </Box>
                                        ) : (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                            </Grow>
                        ))}
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default AcademicStructure;
