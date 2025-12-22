import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Card, CardContent, Button,
  CircularProgress, Alert, Chip, FormControl, InputLabel, Select, MenuItem,
  Accordion, AccordionSummary, AccordionDetails, Divider
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
      // Auto-select current year
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

  const CourseCard = ({ course }) => (
    <Card
      sx={{
        width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.33% - 16px)' },
        bgcolor: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        transition: 'all 0.3s',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-4px)',
        }
      }}
    >
      <CardContent>
        {/* Course Header */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary">
            {course.subject_code}
          </Typography>
          <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
            {course.subject_name}
          </Typography>
        </Box>

        {/* Course Details */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SchoolIcon fontSize="small" color="action" />
            <Typography variant="body2" sx={{ fontFamily: 'Cairo' }}>
              {course.department_name}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonthIcon fontSize="small" color="action" />
            <Typography variant="body2" sx={{ fontFamily: 'Cairo' }}>
              {course.level_name}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon fontSize="small" color="action" />
            <Typography variant="body2" sx={{ fontFamily: 'Cairo' }}>
              {course.student_count} طالب
            </Typography>
          </Box>
        </Box>

        {/* Grading Template Badge */}
        {course.grading_template && (
          <Chip
            label={`قالب: ${course.grading_template}`}
            size="small"
            variant="outlined"
            sx={{ mb: 2 }}
          />
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate(`/doctor/courses/${course.id}`)}
            sx={{ fontFamily: 'Cairo' }}
          >
            إدارة المقرر
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate(`/doctor/courses/${course.id}/quiz`)}
            sx={{ fontFamily: 'Cairo' }}
          >
            إنشاء اختبار
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const TermSection = ({ title, courses, color, defaultExpanded }) => (
    <Accordion defaultExpanded={defaultExpanded} sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
        sx={{
          bgcolor: color,
          color: 'white',
          '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 2 }
        }}
      >
        <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Chip
          label={`${courses.length} مقرر`}
          size="small"
          sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
        />
      </AccordionSummary>
      <AccordionDetails sx={{ p: 3, bgcolor: '#fafafa' }}>
        {courses.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <MenuBookIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
            <Typography sx={{ fontFamily: 'Cairo', color: '#999' }}>
              لا توجد مقررات معينة لك في هذا الترم
            </Typography>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <img
          src={user.profile_picture || "https://via.placeholder.com/100"}
          alt="Profile"
          style={{ width: 80, height: 80, borderRadius: '50%' }}
        />
        <Box>
          <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
            مرحباً، د. {user.first_name} {user.last_name}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" sx={{ fontFamily: 'Cairo' }}>
            عضو هيئة تدريس
          </Typography>
        </Box>
      </Box>

      {/* Year Selector */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>العام الدراسي</InputLabel>
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            label="العام الدراسي"
          >
            {academicYears.map((year) => (
              <MenuItem key={year.id} value={year.id}>
                {year.name}
                {year.is_current && (
                  <Chip label="الحالي" size="small" color="success" sx={{ ml: 1 }} />
                )}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : courses.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5' }}>
          <MenuBookIcon sx={{ fontSize: 60, color: '#999', mb: 2 }} />
          <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: '#666' }}>
            لا توجد مقررات معينة لك في هذا العام
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Cairo' }}>
            سيقوم شئون العاملين بتعيين المقررات لك
          </Typography>
        </Card>
      ) : (
        <>
          {/* First Term Section */}
          <TermSection
            title="الترم الأول"
            courses={firstTermCourses}
            color="#1976d2"
            defaultExpanded={true}
          />

          {/* Second Term Section */}
          <TermSection
            title="الترم الثاني"
            courses={secondTermCourses}
            color="#7b1fa2"
            defaultExpanded={secondTermCourses.length > 0}
          />
        </>
      )}
    </Container>
  );
}
