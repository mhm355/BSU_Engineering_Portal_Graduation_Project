import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Card, CardContent, Button, Grid, Paper,
  CircularProgress, Alert, Chip, FormControl, Select, MenuItem,
  Accordion, AccordionSummary, AccordionDetails, Avatar, Fade, Grow
} from '@mui/material';
import { keyframes } from '@mui/system';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ClassIcon from '@mui/icons-material/Class';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

export default function DoctorDashboard() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('access_token');
  const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetchAcademicYears();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchAcademicYears = async () => {
    try {
      const res = await axios.get('/api/academic/years/', config);
      setAcademicYears(res.data);
      const currentYear = res.data.find(y => y.is_current);
      if (currentYear) {
        setSelectedYear(currentYear.id);
      } else if (res.data.length > 0) {
        setSelectedYear(res.data[0].id);
      }
    } catch (err) {
      setError('فشل في تحميل الأعوام الدراسية');
    }
  };

  useEffect(() => {
    if (selectedYear) {
      fetchMyCourses();
    }
  }, [selectedYear]);

  const fetchMyCourses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/academic/course-offerings/my_courses/?academic_year=${selectedYear}`,
        config
      );
      setCourses(res.data);
    } catch (err) {
      setError('فشل في تحميل المقررات');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  // Group courses by term
  const firstTermCourses = courses.filter(c => c.term_name === 'FIRST');
  const secondTermCourses = courses.filter(c => c.term_name === 'SECOND');
  const totalStudents = courses.reduce((sum, c) => sum + (c.student_count || 0), 0);

  const CourseCard = ({ course, index }) => (
    <Grow in={true} timeout={400 + index * 100}>
      <Card
        sx={{
          width: '100%',
          bgcolor: '#fff',
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transition: 'all 0.3s',
          overflow: 'hidden',
          '&:hover': {
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            transform: 'translateY(-8px)',
          }
        }}
      >
        {/* Card Header with Gradient */}
        <Box sx={{
          background: 'linear-gradient(135deg, #0288d1, #03a9f4)',
          p: 2.5,
          color: '#fff'
        }}>
          <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 'bold' }}>
            {course.subject_code}
          </Typography>
          <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mt: 0.5, lineHeight: 1.3 }}>
            {course.subject_name}
          </Typography>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {/* Course Details */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#e3f2fd' }}>
                <SchoolIcon fontSize="small" sx={{ color: '#1976d2' }} />
              </Avatar>
              <Typography variant="body1" sx={{ fontFamily: 'Cairo', fontWeight: 500 }}>
                {course.department_name}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#f3e5f5' }}>
                <CalendarMonthIcon fontSize="small" sx={{ color: '#9c27b0' }} />
              </Avatar>
              <Typography variant="body1" sx={{ fontFamily: 'Cairo', fontWeight: 500 }}>
                {course.level_name}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#e8f5e9' }}>
                <GroupIcon fontSize="small" sx={{ color: '#4caf50' }} />
              </Avatar>
              <Typography variant="body1" sx={{ fontFamily: 'Cairo', fontWeight: 500 }}>
                {course.student_count} طالب
              </Typography>
            </Box>
          </Box>

          {/* Grading Template Badge */}
          {course.grading_template && (
            <Chip
              icon={<AssignmentIcon sx={{ fontSize: 16 }} />}
              label={`قالب: ${course.grading_template}`}
              size="small"
              sx={{ mb: 2.5, fontFamily: 'Cairo', bgcolor: '#fff3e0', color: '#e65100' }}
            />
          )}

          {/* Action Button */}
          <Button
            variant="contained"
            fullWidth
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate(`/doctor/courses/${course.id}`)}
            sx={{
              fontFamily: 'Cairo',
              fontWeight: 'bold',
              py: 1.5,
              borderRadius: 3,
              fontSize: '1.05rem',
              background: 'linear-gradient(135deg, #0288d1, #03a9f4)',
              boxShadow: '0 4px 15px rgba(2, 136, 209, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0277bd, #0288d1)',
              }
            }}
          >
            إدارة المقرر
          </Button>
        </CardContent>
      </Card>
    </Grow>
  );

  const TermSection = ({ title, courses, color, icon, defaultExpanded }) => (
    <Accordion
      defaultExpanded={defaultExpanded}
      sx={{
        mb: 3,
        borderRadius: '16px !important',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        '&:before': { display: 'none' }
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: 'white', fontSize: 30 }} />}
        sx={{
          background: color,
          color: 'white',
          py: 1.5,
          '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 2 }
        }}
      >
        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 45, height: 45 }}>
          {icon}
        </Avatar>
        <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Chip
          label={`${courses.length} مقرر`}
          sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white', fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '0.95rem' }}
        />
      </AccordionSummary>
      <AccordionDetails sx={{ p: 4, bgcolor: '#fafafa' }}>
        {courses.length > 0 ? (
          <Grid container spacing={3}>
            {courses.map((course, index) => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <CourseCard course={course} index={index} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <MenuBookIcon sx={{ fontSize: 70, color: '#ddd', mb: 2 }} />
            <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: '#999' }}>
              لا توجد مقررات معينة لك في هذا الترم
            </Typography>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', pb: 6 }}>
      {/* Hero Header */}
      <Box sx={{ background: 'linear-gradient(135deg, #0A2342 0%, #1a4480 100%)', pt: 4, pb: 6, mb: 4, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', animation: `${float} 6s ease-in-out infinite` }} />
        <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', animation: `${float} 8s ease-in-out infinite`, animationDelay: '2s' }} />

        <Container maxWidth="xl">
          <Fade in={true} timeout={800}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Avatar
                    src={user.profile_picture}
                    sx={{ width: 100, height: 100, border: '4px solid rgba(255,255,255,0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
                  >
                    <PersonIcon sx={{ fontSize: 50 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                      مرحباً، د. {user.first_name} {user.last_name}
                    </Typography>
                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: 'rgba(255,255,255,0.85)', mt: 0.5 }}>
                      عضو هيئة تدريس - كلية الهندسة
                    </Typography>
                  </Box>
                </Box>

                {/* Year Selector */}
                <Paper elevation={0} sx={{ p: 1.5, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
                  <FormControl sx={{ minWidth: 200 }}>
                    <Select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      displayEmpty
                      sx={{
                        color: '#fff',
                        fontFamily: 'Cairo',
                        fontSize: '1.1rem',
                        '.MuiOutlinedInput-notchedOutline': { border: 'none' },
                        '.MuiSvgIcon-root': { color: '#fff' },
                        bgcolor: 'rgba(255,255,255,0.1)',
                        borderRadius: 2
                      }}
                    >
                      {academicYears.map((year) => (
                        <MenuItem key={year.id} value={year.id} sx={{ fontFamily: 'Cairo', fontSize: '1.1rem' }}>
                          {year.name}
                          {year.is_current && <Chip label="الحالي" size="small" color="success" sx={{ ml: 1 }} />}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Paper>
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {error && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo', borderRadius: 3, fontSize: '1.1rem' }} onClose={() => setError('')}>{error}</Alert>}

        {/* Stats Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Grow in={true} timeout={400}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 60, height: 60, background: 'linear-gradient(135deg, #0288d1, #03a9f4)' }}>
                  <MenuBookIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Box>
                  <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{courses.length}</Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666', fontSize: '1.1rem' }}>إجمالي المقررات</Typography>
                </Box>
              </Paper>
            </Grow>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Grow in={true} timeout={500}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 60, height: 60, background: 'linear-gradient(135deg, #4CAF50, #8BC34A)' }}>
                  <GroupIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Box>
                  <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{totalStudents}</Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666', fontSize: '1.1rem' }}>إجمالي الطلاب</Typography>
                </Box>
              </Paper>
            </Grow>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Grow in={true} timeout={600}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 60, height: 60, background: 'linear-gradient(135deg, #9c27b0, #ba68c8)' }}>
                  <ClassIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Box>
                  <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>{academicYears.length}</Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#666', fontSize: '1.1rem' }}>الأعوام الدراسية</Typography>
                </Box>
              </Paper>
            </Grow>
          </Grid>
        </Grid>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={60} /></Box>
        ) : courses.length === 0 ? (
          <Grow in={true} timeout={700}>
            <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <MenuBookIcon sx={{ fontSize: 100, color: '#ddd', mb: 3 }} />
              <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#666', mb: 2 }}>
                لا توجد مقررات معينة لك في هذا العام
              </Typography>
              <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: '#999' }}>
                سيقوم شئون العاملين بتعيين المقررات لك
              </Typography>
            </Paper>
          </Grow>
        ) : (
          <>
            {/* First Term Section */}
            <TermSection
              title="الترم الأول"
              courses={firstTermCourses}
              color="linear-gradient(135deg, #1976d2, #42a5f5)"
              icon={<CalendarMonthIcon />}
              defaultExpanded={true}
            />

            {/* Second Term Section */}
            <TermSection
              title="الترم الثاني"
              courses={secondTermCourses}
              color="linear-gradient(135deg, #7b1fa2, #ba68c8)"
              icon={<CalendarMonthIcon />}
              defaultExpanded={secondTermCourses.length > 0}
            />
          </>
        )}
      </Container>
    </Box>
  );
}
