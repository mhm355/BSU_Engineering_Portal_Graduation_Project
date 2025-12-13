import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Grid, Card, CardContent, Button, Breadcrumbs, Link, CircularProgress, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import FolderIcon from '@mui/icons-material/Folder';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';

export default function HierarchyView() {
    const [departments, setDepartments] = useState([]);
    const [levels, setLevels] = useState([]);
    const [students, setStudents] = useState([]);

    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await axios.get('/api/academic/departments/', { withCredentials: true });
            setDepartments(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching departments:', err);
            setLoading(false);
        }
    };

    const fetchLevels = async (deptId) => {
        setLoading(true);
        try {
            // Ideally we filter levels by department. Our API might return all.
            // Let's assume we filter on frontend or add query param.
            // For now, fetch all and filter.
            const response = await axios.get('/api/academic/levels/', { withCredentials: true });
            const deptLevels = response.data.filter(l => l.department === deptId); // Assuming department ID is in 'department' field
            setLevels(deptLevels);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching levels:', err);
            setLoading(false);
        }
    };

    const fetchStudents = async (levelId) => {
        setLoading(true);
        try {
            // We need an endpoint to get students by level (enrollment).
            // We don't have a direct "students by level" endpoint yet.
            // We can use StudentEnrollmentViewSet if we exposed it, or filter users?
            // Let's assume we added a filter to UserViewSet or similar.
            // For this demo, let's just show a placeholder list or fetch all users and filter (inefficient but works for demo).
            // Actually, let's just show a dummy list or "No students found" if we can't easily fetch.
            // Better: Fetch all users with role STUDENT.
            const response = await axios.get('/api/auth/users/', { withCredentials: true });
            const allStudents = response.data.filter(u => u.role === 'STUDENT');
            setStudents(allStudents); // In real app, filter by level via enrollment
            setLoading(false);
        } catch (err) {
            console.error('Error fetching students:', err);
            setLoading(false);
        }
    };

    const handleDeptClick = (dept) => {
        setSelectedDept(dept);
        fetchLevels(dept.id);
        setSelectedLevel(null);
        setStudents([]);
    };

    const handleLevelClick = (level) => {
        setSelectedLevel(level);
        fetchStudents(level.id);
    };

    const resetView = () => {
        setSelectedDept(null);
        setSelectedLevel(null);
        setStudents([]);
        fetchDepartments();
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 4 }}>
                الهيكل الأكاديمي
            </Typography>

            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 3, fontFamily: 'Cairo' }}>
                <Link underline="hover" color="inherit" onClick={resetView} sx={{ cursor: 'pointer' }}>
                    الأقسام
                </Link>
                {selectedDept && (
                    <Link underline="hover" color="inherit" onClick={() => { setSelectedLevel(null); setStudents([]); }} sx={{ cursor: 'pointer' }}>
                        {selectedDept.name}
                    </Link>
                )}
                {selectedLevel && (
                    <Typography color="text.primary" sx={{ fontFamily: 'Cairo' }}>{selectedLevel.name}</Typography>
                )}
            </Breadcrumbs>

            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}

            {!loading && !selectedDept && (
                <Grid container spacing={3}>
                    {departments.map((dept) => (
                        <Grid item xs={12} md={4} key={dept.id}>
                            <Card sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }} onClick={() => handleDeptClick(dept)}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <FolderIcon sx={{ fontSize: 50, color: '#1976d2', mb: 2 }} />
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{dept.name}</Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Cairo' }}>{dept.code}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {!loading && selectedDept && !selectedLevel && (
                <Grid container spacing={3}>
                    {levels.length > 0 ? levels.map((level) => (
                        <Grid item xs={12} md={4} key={level.id}>
                            <Card sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }} onClick={() => handleLevelClick(level)}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <FolderIcon sx={{ fontSize: 50, color: '#f57c00', mb: 2 }} />
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>{level.name}</Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Cairo' }}>{level.year_name}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    )) : (
                        <Typography sx={{ p: 3, fontFamily: 'Cairo' }}>لا توجد فرق دراسية مسجلة لهذا القسم.</Typography>
                    )}
                </Grid>
            )}

            {!loading && selectedLevel && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                        الطلاب المسجلين ({students.length})
                    </Typography>
                    <List>
                        {students.map((student) => (
                            <ListItem key={student.id} divider>
                                <ListItemIcon>
                                    <PersonIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary={`${student.first_name} ${student.last_name}`}
                                    secondary={student.username}
                                    primaryTypographyProps={{ fontFamily: 'Cairo' }}
                                    secondaryTypographyProps={{ fontFamily: 'Cairo' }}
                                />
                            </ListItem>
                        ))}
                        {students.length === 0 && <Typography sx={{ fontFamily: 'Cairo' }}>لا يوجد طلاب مسجلين.</Typography>}
                    </List>
                </Paper>
            )}
        </Container>
    );
}
