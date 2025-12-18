import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    CircularProgress,
    Alert,
    Button,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    School as DeptIcon,
    ExpandMore as ExpandIcon,
    Book as SubjectIcon,
    Folder as LevelIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AcademicStructure = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [expandedDept, setExpandedDept] = useState(null);
    const [subjects, setSubjects] = useState({});

    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/academic/departments/', { headers });
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
            const res = await axios.get(`/api/academic/subjects/?department=${deptId}`, { headers });
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

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    الهيكل الأكاديمي
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    عرض الأقسام والمواد (للقراءة فقط)
                </Typography>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {departments.map((dept) => (
                <Accordion
                    key={dept.id}
                    expanded={expandedDept === dept.id}
                    onChange={() => handleExpandDept(dept.id)}
                    sx={{ mb: 1 }}
                >
                    <AccordionSummary expandIcon={<ExpandIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <DeptIcon color="primary" />
                            <Typography variant="h6">{dept.name}</Typography>
                            <Chip label={dept.code} size="small" />
                            {dept.has_specializations && (
                                <Chip label="يحتوي تخصصات" size="small" color="secondary" />
                            )}
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        {subjects[dept.id] ? (
                            <Box>
                                {Object.entries(groupSubjectsByLevel(subjects[dept.id])).map(
                                    ([level, semesters]) => (
                                        <Box key={level} sx={{ mb: 3 }}>
                                            <Typography
                                                variant="subtitle1"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    mb: 1,
                                                    color: 'primary.main',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                }}
                                            >
                                                <LevelIcon fontSize="small" />
                                                الفرقة {levelNames[level] || level}
                                            </Typography>

                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={6}>
                                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                                        <Typography
                                                            variant="subtitle2"
                                                            sx={{ mb: 1, fontWeight: 'bold' }}
                                                        >
                                                            الفصل الدراسي الأول ({semesters.sem1.length} مادة)
                                                        </Typography>
                                                        <List dense>
                                                            {semesters.sem1.map((subj) => (
                                                                <ListItem key={subj.id}>
                                                                    <ListItemIcon>
                                                                        <SubjectIcon fontSize="small" color="action" />
                                                                    </ListItemIcon>
                                                                    <ListItemText
                                                                        primary={`${subj.code} - ${subj.name}`}
                                                                        secondary={subj.is_elective ? 'اختياري' : null}
                                                                    />
                                                                </ListItem>
                                                            ))}
                                                        </List>
                                                    </Paper>
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                                        <Typography
                                                            variant="subtitle2"
                                                            sx={{ mb: 1, fontWeight: 'bold' }}
                                                        >
                                                            الفصل الدراسي الثاني ({semesters.sem2.length} مادة)
                                                        </Typography>
                                                        <List dense>
                                                            {semesters.sem2.map((subj) => (
                                                                <ListItem key={subj.id}>
                                                                    <ListItemIcon>
                                                                        <SubjectIcon fontSize="small" color="action" />
                                                                    </ListItemIcon>
                                                                    <ListItemText
                                                                        primary={`${subj.code} - ${subj.name}`}
                                                                        secondary={subj.is_elective ? 'اختياري' : null}
                                                                    />
                                                                </ListItem>
                                                            ))}
                                                        </List>
                                                    </Paper>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    )
                                )}
                            </Box>
                        ) : (
                            <CircularProgress size={24} />
                        )}
                    </AccordionDetails>
                </Accordion>
            ))}

            <Box sx={{ mt: 3 }}>
                <Button variant="outlined" onClick={() => navigate('/staff-affairs')}>
                    رجوع
                </Button>
            </Box>
        </Container>
    );
};

export default AcademicStructure;
