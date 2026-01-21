import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, Box, Grid, List, ListItem, ListItemText,
    ListItemIcon, CircularProgress, Alert, Button, Chip, Accordion,
    AccordionSummary, AccordionDetails, Avatar, Fade, Grow, IconButton, Collapse
} from '@mui/material';
import { keyframes } from '@mui/system';
import {
    School as DeptIcon,
    ExpandMore as ExpandIcon,
    Book as SubjectIcon,
    Folder as FolderIcon,
    FolderOpen as FolderOpenIcon,
    ArrowBack as ArrowBackIcon,
    MenuBook as MenuBookIcon,
    Download as DownloadIcon,
    PictureAsPdf as PdfIcon,
    Slideshow as SlidesIcon,
    PlayCircle as VideoIcon,
    InsertDriveFile as FileIcon,
    ExpandLess as ExpandLessIcon,
    VideoLibrary as VideoLibraryIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
`;

export default function StudentMaterials() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [studentInfo, setStudentInfo] = useState(null);
    const [expandedSubject, setExpandedSubject] = useState(null);
    const [lectures, setLectures] = useState({});

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    useEffect(() => {
        fetchStudentSubjects();
    }, []);

    const fetchStudentSubjects = async () => {
        setLoading(true);
        try {
            // First get student profile to know their department/level/specialization
            const profileRes = await axios.get('/api/academic/student/profile/', config);
            const student = profileRes.data;
            setStudentInfo(student);

            // Fetch subjects for the student's level and department
            let url = `/api/academic/subjects/?level=${student.level_name}`;

            if (student.department_id) {
                url += `&department=${student.department_id}`;
            }
            if (student.specialization_id) {
                url += `&specialization=${student.specialization_id}`;
            }

            const subjectsRes = await axios.get(url, config);
            setSubjects(subjectsRes.data);
        } catch (err) {
            console.error('Error fetching subjects:', err);
            setError('خطأ في تحميل المقررات. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    const fetchLecturesForSubject = async (subjectId) => {
        if (lectures[subjectId]) return;

        try {
            // Fetch lectures from course offerings that match this subject
            const res = await axios.get(`/api/academic/lectures/?subject=${subjectId}`, config);
            setLectures((prev) => ({ ...prev, [subjectId]: res.data }));
        } catch (err) {
            console.error('Error fetching lectures:', err);
            setLectures((prev) => ({ ...prev, [subjectId]: [] }));
        }
    };

    const handleExpandSubject = (subjectId) => {
        if (expandedSubject === subjectId) {
            setExpandedSubject(null);
        } else {
            setExpandedSubject(subjectId);
            fetchLecturesForSubject(subjectId);
        }
    };

    const groupSubjectsBySemester = (subjectList) => {
        const sem1 = subjectList.filter(s => s.semester === 1);
        const sem2 = subjectList.filter(s => s.semester === 2);
        return { sem1, sem2 };
    };

    const getFileIcon = (fileUrl) => {
        if (!fileUrl) return <FileIcon sx={{ fontSize: 28, color: '#666' }} />;
        const url = fileUrl.toLowerCase();
        if (url.endsWith('.pdf')) return <PdfIcon sx={{ fontSize: 28, color: '#d32f2f' }} />;
        if (url.endsWith('.ppt') || url.endsWith('.pptx')) return <SlidesIcon sx={{ fontSize: 28, color: '#ff9800' }} />;
        if (['.mp4', '.avi', '.mov', '.mkv'].some(ext => url.endsWith(ext))) return <VideoIcon sx={{ fontSize: 28, color: '#1976d2' }} />;
        return <FileIcon sx={{ fontSize: 28, color: '#666' }} />;
    };

    const getFolderColor = (index) => {
        const colors = ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#E91E63', '#00BCD4'];
        return colors[index % colors.length];
    };

    const { sem1, sem2 } = groupSubjectsBySemester(subjects);
    const totalSubjects = subjects.length;

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', pb: 6 }}>
            {/* Hero Header */}
            <Box sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', pt: 4, pb: 6, mb: 4, position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', animation: `${float} 6s ease-in-out infinite` }} />
                <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', animation: `${float} 8s ease-in-out infinite`, animationDelay: '2s' }} />

                <Container maxWidth="lg">
                    <Fade in={true} timeout={800}>
                        <Box>
                            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/student/dashboard')} sx={{ color: '#fff', mb: 2, fontFamily: 'Cairo', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                                العودة للوحة التحكم
                            </Button>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                                    <FolderIcon sx={{ fontSize: 45, color: '#fff' }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                        المحاضرات والمواد الدراسية
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: 'rgba(255,255,255,0.9)' }}>
                                        {studentInfo?.department_name || ''} - {studentInfo?.level_display || ''}
                                        {studentInfo?.specialization_name ? ` - ${studentInfo.specialization_name}` : ''}
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
                    <Grid item xs={6} md={4}>
                        <Grow in={true} timeout={400}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 55, height: 55, background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                                    <MenuBookIcon sx={{ fontSize: 28 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{totalSubjects}</Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>المقررات</Typography>
                                </Box>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={6} md={4}>
                        <Grow in={true} timeout={500}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 55, height: 55, background: 'linear-gradient(135deg, #2196F3, #21CBF3)' }}>
                                    <SubjectIcon sx={{ fontSize: 28 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{sem1.length}</Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>الفصل الأول</Typography>
                                </Box>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Grow in={true} timeout={600}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 55, height: 55, background: 'linear-gradient(135deg, #4CAF50, #8BC34A)' }}>
                                    <SubjectIcon sx={{ fontSize: 28 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{sem2.length}</Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666' }}>الفصل الثاني</Typography>
                                </Box>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>

                {subjects.length === 0 ? (
                    <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <FolderIcon sx={{ fontSize: 80, color: '#ddd', mb: 2 }} />
                        <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#666', mb: 1 }}>
                            لا توجد مقررات متاحة حالياً
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#999' }}>
                            سيتم إضافة المقررات قريباً
                        </Typography>
                    </Paper>
                ) : (
                    <Grid container spacing={4}>
                        {/* Semester 1 */}
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '2px solid #e3f2fd', bgcolor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <Avatar sx={{ width: 45, height: 45, bgcolor: '#2196F3' }}>1</Avatar>
                                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1976d2' }}>
                                        الفصل الدراسي الأول ({sem1.length} مادة)
                                    </Typography>
                                </Box>
                                {sem1.length === 0 ? (
                                    <Typography color="text.secondary" sx={{ fontFamily: 'Cairo', py: 2, textAlign: 'center' }}>لا توجد مواد</Typography>
                                ) : (
                                    sem1.map((subject, index) => (
                                        <SubjectFolder
                                            key={subject.id}
                                            subject={subject}
                                            index={index}
                                            expanded={expandedSubject === subject.id}
                                            onToggle={() => handleExpandSubject(subject.id)}
                                            lectures={lectures[subject.id]}
                                            getFileIcon={getFileIcon}
                                            getFolderColor={getFolderColor}
                                        />
                                    ))
                                )}
                            </Paper>
                        </Grid>

                        {/* Semester 2 */}
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '2px solid #e8f5e9', bgcolor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <Avatar sx={{ width: 45, height: 45, bgcolor: '#4CAF50' }}>2</Avatar>
                                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#388e3c' }}>
                                        الفصل الدراسي الثاني ({sem2.length} مادة)
                                    </Typography>
                                </Box>
                                {sem2.length === 0 ? (
                                    <Typography color="text.secondary" sx={{ fontFamily: 'Cairo', py: 2, textAlign: 'center' }}>لا توجد مواد</Typography>
                                ) : (
                                    sem2.map((subject, index) => (
                                        <SubjectFolder
                                            key={subject.id}
                                            subject={subject}
                                            index={index + 10}
                                            expanded={expandedSubject === subject.id}
                                            onToggle={() => handleExpandSubject(subject.id)}
                                            lectures={lectures[subject.id]}
                                            getFileIcon={getFileIcon}
                                            getFolderColor={getFolderColor}
                                        />
                                    ))
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                )}
            </Container>
        </Box>
    );
}

// Sub-component for a subject folder
function SubjectFolder({ subject, index, expanded, onToggle, lectures, getFileIcon, getFolderColor }) {
    const color = getFolderColor(index);

    return (
        <Paper
            elevation={0}
            sx={{
                mb: 2,
                borderRadius: 3,
                overflow: 'hidden',
                border: expanded ? `2px solid ${color}` : '2px solid #eee',
                transition: 'all 0.3s',
                '&:hover': { borderColor: color }
            }}
        >
            <Box
                onClick={onToggle}
                sx={{
                    p: 2,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    bgcolor: expanded ? `${color}10` : 'transparent',
                    '&:hover': { bgcolor: `${color}15` }
                }}
            >
                <Avatar sx={{ width: 45, height: 45, bgcolor: color, animation: expanded ? `${float} 2s ease-in-out infinite` : 'none' }}>
                    {expanded ? <FolderOpenIcon /> : <FolderIcon />}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                        {subject.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip label={subject.code} size="small" sx={{ height: 22, fontSize: '0.75rem' }} />
                        {subject.is_elective && <Chip label="اختياري" size="small" color="info" sx={{ height: 22, fontSize: '0.75rem' }} />}
                    </Box>
                </Box>
                <IconButton size="small">
                    {expanded ? <ExpandLessIcon sx={{ color }} /> : <ExpandIcon sx={{ color: '#999' }} />}
                </IconButton>
            </Box>

            <Collapse in={expanded}>
                <Box sx={{ p: 2, bgcolor: '#fafafa' }}>
                    {!lectures ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={24} /></Box>
                    ) : lectures.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 2, color: '#999' }}>
                            <VideoLibraryIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                            <Typography variant="body2" sx={{ fontFamily: 'Cairo' }}>
                                لا توجد محاضرات حتى الآن
                            </Typography>
                        </Box>
                    ) : (
                        lectures.map((lecture) => (
                            <Paper
                                key={lecture.id}
                                elevation={0}
                                sx={{
                                    p: 2,
                                    mb: 1,
                                    borderRadius: 2,
                                    bgcolor: '#fff',
                                    border: '1px solid #eee',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    '&:hover': { borderColor: color }
                                }}
                            >
                                {getFileIcon(lecture.file)}
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                        {lecture.title}
                                    </Typography>
                                    {lecture.description && (
                                        <Typography variant="caption" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                            {lecture.description}
                                        </Typography>
                                    )}
                                </Box>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<DownloadIcon />}
                                    href={lecture.file ? lecture.file.replace('http://backend:8000', '') : '#'}
                                    target="_blank"
                                    sx={{ fontFamily: 'Cairo', borderRadius: 2, bgcolor: color, '&:hover': { bgcolor: color } }}
                                >
                                    تحميل
                                </Button>
                            </Paper>
                        ))
                    )}
                </Box>
            </Collapse>
        </Paper>
    );
}
