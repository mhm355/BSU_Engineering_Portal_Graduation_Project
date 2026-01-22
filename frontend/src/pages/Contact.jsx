import React, { useState } from 'react';
import {
    Box, Container, Typography, Grid, Paper, TextField, Button,
    Accordion, AccordionSummary, AccordionDetails, IconButton,
    MenuItem, Snackbar, Alert, CircularProgress, Chip, Avatar,
    InputAdornment, Fade, Grow, Slide
} from '@mui/material';
import { keyframes } from '@mui/system';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import SubjectIcon from '@mui/icons-material/Subject';
import MessageIcon from '@mui/icons-material/Message';
import CategoryIcon from '@mui/icons-material/Category';
import BusinessIcon from '@mui/icons-material/Business';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import MapIcon from '@mui/icons-material/Map';
import HomeIcon from '@mui/icons-material/Home';
import { Link } from 'react-router-dom';

// Keyframe Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.9; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const rotateReverse = keyframes`
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
`;

const slideUp = keyframes`
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 1; transform: translateY(0); }
`;

// Contact cards data
const contactInfo = [
    {
        icon: <LocationOnIcon sx={{ fontSize: 36 }} />,
        title: 'العنوان',
        details: ['شرق النيل، بني سويف، مصر', 'كلية الهندسة - جامعة بني سويف'],
        color: '#4CAF50',
        gradient: 'linear-gradient(135deg, #4CAF50, #81C784)'
    },
    {
        icon: <PhoneIcon sx={{ fontSize: 36 }} />,
        title: 'الهاتف',
        details: ['082-2334015', '082-2334016', '082-2334017'],
        color: '#2196F3',
        gradient: 'linear-gradient(135deg, #2196F3, #64B5F6)'
    },
    {
        icon: <EmailIcon sx={{ fontSize: 36 }} />,
        title: 'البريد الإلكتروني',
        details: ['info@eng.bsu.edu.eg', 'dean@eng.bsu.edu.eg', 'support@eng.bsu.edu.eg'],
        color: '#FF9800',
        gradient: 'linear-gradient(135deg, #FF9800, #FFB74D)'
    },
    {
        icon: <AccessTimeIcon sx={{ fontSize: 36 }} />,
        title: 'ساعات العمل',
        details: ['الأحد - الخميس: 8:00ص - 4:00م', 'الجمعة - السبت: مغلق'],
        color: '#9C27B0',
        gradient: 'linear-gradient(135deg, #9C27B0, #BA68C8)'
    }
];

// FAQ data
const faqData = [
    {
        question: 'كيف يمكنني التقديم للالتحاق بالكلية؟',
        answer: 'يتم التقديم من خلال مكتب التنسيق الإلكتروني بوزارة التعليم العالي. يمكنك زيارة موقع التنسيق الرسمي واتباع الخطوات المحددة للتسجيل.'
    },
    {
        question: 'ما هي الأقسام المتاحة في الكلية؟',
        answer: 'تضم الكلية ثلاثة أقسام رئيسية: قسم الهندسة المدنية، قسم الهندسة المعمارية، وقسم الهندسة الكهربية. كل قسم يقدم برامج أكاديمية متميزة.'
    },
    {
        question: 'كيف يمكنني الحصول على شهادة التخرج؟',
        answer: 'يمكنك التقدم للحصول على شهادة التخرج من خلال شؤون الطلاب بعد استيفاء جميع المتطلبات الأكاديمية وسداد الرسوم المطلوبة.'
    },
    {
        question: 'ما هي طرق الدفع المتاحة للمصروفات الدراسية؟',
        answer: 'يمكن دفع المصروفات من خلال البنوك المعتمدة أو عبر نظام الدفع الإلكتروني على موقع الجامعة. كما يتوفر الدفع النقدي في خزينة الكلية.'
    },
    {
        question: 'كيف يمكنني التواصل مع أحد أعضاء هيئة التدريس؟',
        answer: 'يمكنك التواصل عبر البريد الإلكتروني الأكاديمي أو زيارة مكتب عضو هيئة التدريس خلال ساعات العمل الرسمية. تتوفر معلومات الاتصال على موقع الكلية.'
    }
];

// Inquiry types
const inquiryTypes = [
    { value: 'general', label: 'استفسار عام' },
    { value: 'admission', label: 'القبول والتسجيل' },
    { value: 'academic', label: 'الشؤون الأكاديمية' },
    { value: 'technical', label: 'الدعم التقني' },
    { value: 'complaint', label: 'شكوى أو اقتراح' },
    { value: 'other', label: 'أخرى' }
];

// Departments
const departments = [
    { value: 'general', label: 'إدارة الكلية' },
    { value: 'civil', label: 'قسم الهندسة المدنية' },
    { value: 'arch', label: 'قسم الهندسة المعمارية' },
    { value: 'electrical', label: 'قسم الهندسة الكهربية' },
    { value: 'student_affairs', label: 'شؤون الطلاب' },
    { value: 'it', label: 'الدعم التقني' }
];

// Social media links
const socialLinks = [
    { icon: <FacebookIcon />, url: 'https://facebook.com/bsu.eng', color: '#1877F2', label: 'Facebook' },
    { icon: <TwitterIcon />, url: 'https://twitter.com/bsu_eng', color: '#1DA1F2', label: 'Twitter' },
    { icon: <LinkedInIcon />, url: 'https://linkedin.com/company/bsu-eng', color: '#0A66C2', label: 'LinkedIn' },
    { icon: <YouTubeIcon />, url: 'https://youtube.com/@bsu_eng', color: '#FF0000', label: 'YouTube' },
    { icon: <InstagramIcon />, url: 'https://instagram.com/bsu_eng', color: '#E4405F', label: 'Instagram' }
];

// Contact Card Component
const ContactCard = ({ info, index }) => (
    <Grow in={true} timeout={600 + index * 150}>
        <Paper
            elevation={0}
            sx={{
                p: 4,
                height: '100%',
                textAlign: 'center',
                borderRadius: 4,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0,0,0,0.06)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: `0 25px 50px ${info.color}30`,
                    '& .card-icon': {
                        transform: 'scale(1.1) rotate(5deg)',
                        background: info.gradient,
                        color: '#fff',
                    },
                    '& .card-glow': {
                        opacity: 1,
                    }
                }
            }}
        >
            {/* Glow Effect */}
            <Box
                className="card-glow"
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: info.gradient,
                    opacity: 0,
                    transition: 'opacity 0.4s ease',
                }}
            />

            <Box
                className="card-icon"
                sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 4,
                    bgcolor: `${info.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    color: info.color,
                    transition: 'all 0.4s ease',
                    animation: `${float} 4s ease-in-out infinite`,
                    animationDelay: `${index * 0.2}s`,
                }}
            >
                {info.icon}
            </Box>

            <Typography
                variant="h5"
                sx={{
                    fontFamily: 'Cairo',
                    fontWeight: 'bold',
                    color: '#0A2342',
                    mb: 2
                }}
            >
                {info.title}
            </Typography>

            {info.details.map((detail, idx) => (
                <Typography
                    key={idx}
                    variant="body1"
                    sx={{
                        fontFamily: 'Cairo',
                        color: '#666',
                        lineHeight: 2
                    }}
                >
                    {detail}
                </Typography>
            ))}
        </Paper>
    </Grow>
);

export default function Contact() {
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        inquiryType: '',
        department: '',
        subject: '',
        message: ''
    });

    // UI state
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [expandedFaq, setExpandedFaq] = useState(false);

    // Validation function
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'الاسم مطلوب';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'البريد الإلكتروني مطلوب';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'البريد الإلكتروني غير صالح';
        }

        if (!formData.inquiryType) {
            newErrors.inquiryType = 'يرجى اختيار نوع الاستفسار';
        }

        if (!formData.subject.trim()) {
            newErrors.subject = 'الموضوع مطلوب';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'الرسالة مطلوبة';
        } else if (formData.message.trim().length < 20) {
            newErrors.message = 'الرسالة يجب أن تكون 20 حرفًا على الأقل';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setSnackbar({ open: true, message: 'يرجى تصحيح الأخطاء في النموذج', severity: 'error' });
            return;
        }

        setIsSubmitting(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('Form submitted:', formData);
            setSnackbar({ open: true, message: 'تم إرسال رسالتك بنجاح! سنتواصل معك قريبًا.', severity: 'success' });
            setFormData({
                name: '',
                email: '',
                phone: '',
                inquiryType: '',
                department: '',
                subject: '',
                message: ''
            });
        } catch (error) {
            setSnackbar({ open: true, message: 'حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.', severity: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Input Style
    const inputStyle = {
        '& .MuiOutlinedInput-root': {
            fontFamily: 'Cairo',
            borderRadius: 3,
            transition: 'all 0.3s ease',
            backgroundColor: 'rgba(250,251,252,0.8)',
            '&:hover': {
                boxShadow: '0 6px 20px rgba(10, 35, 66, 0.1)',
                backgroundColor: '#fff',
                '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#FFC107',
                }
            },
            '&.Mui-focused': {
                boxShadow: '0 8px 30px rgba(10, 35, 66, 0.15)',
                backgroundColor: '#fff',
                '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#0A2342',
                    borderWidth: 2,
                }
            }
        },
        '& .MuiInputLabel-root': {
            fontFamily: 'Cairo',
        },
        '& .MuiFormHelperText-root': {
            fontFamily: 'Cairo',
        }
    };

    return (
        <Box sx={{ bgcolor: '#fafbfc', overflow: 'hidden' }}>
            {/* Hero Section */}
            <Box
                sx={{
                    position: 'relative',
                    minHeight: { xs: '50vh', md: '60vh' },
                    display: 'flex',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #0A2342 0%, #1a3a5c 50%, #0A2342 100%)',
                    backgroundSize: '200% 200%',
                    animation: `${gradientMove} 15s ease infinite`,
                    overflow: 'hidden',
                }}
            >
                {/* Animated Background Elements */}
                <Box sx={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,193,7,0.12) 0%, transparent 70%)', animation: `${float} 8s ease-in-out infinite` }} />
                <Box sx={{ position: 'absolute', bottom: -150, left: -100, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)', animation: `${float} 10s ease-in-out infinite`, animationDelay: '2s' }} />
                <Box sx={{ position: 'absolute', top: '30%', left: '10%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,193,7,0.08) 0%, transparent 70%)', animation: `${float} 6s ease-in-out infinite`, animationDelay: '1s' }} />

                {/* Rotating Rings */}
                <Box sx={{ position: 'absolute', top: '10%', right: '-20%', width: 600, height: 600, borderRadius: '50%', border: '2px dashed rgba(255,193,7,0.15)', animation: `${rotate} 60s linear infinite` }} />
                <Box sx={{ position: 'absolute', bottom: '-30%', left: '-10%', width: 400, height: 400, borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.1)', animation: `${rotateReverse} 50s linear infinite` }} />

                {/* Grid Pattern */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
                        backgroundSize: '40px 40px',
                    }}
                />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                    {/* Home Button */}
                    <Fade in={true} timeout={600}>
                        <Box sx={{ mb: 4 }}>
                            <Button
                                component={Link}
                                to="/"
                                startIcon={<HomeIcon />}
                                sx={{
                                    color: 'rgba(255,255,255,0.8)',
                                    fontFamily: 'Cairo',
                                    fontWeight: 'bold',
                                    borderRadius: 3,
                                    px: 3,
                                    py: 1,
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(10px)',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                        borderColor: 'rgba(255,255,255,0.4)',
                                    }
                                }}
                            >
                                الصفحة الرئيسية
                            </Button>
                        </Box>
                    </Fade>

                    <Fade in={true} timeout={800}>
                        <Box>
                            <Chip
                                icon={<SupportAgentIcon sx={{ fontSize: 18 }} />}
                                label="نحن هنا لمساعدتك"
                                sx={{
                                    mb: 3,
                                    bgcolor: 'rgba(255,193,7,0.15)',
                                    color: '#FFC107',
                                    fontFamily: 'Cairo',
                                    fontWeight: 'bold',
                                    border: '1px solid rgba(255,193,7,0.3)',
                                    py: 2.5,
                                    px: 1,
                                }}
                            />

                            <Typography
                                variant="h2"
                                sx={{
                                    fontFamily: 'Cairo',
                                    fontWeight: 800,
                                    color: '#fff',
                                    mb: 2,
                                    textShadow: '0 4px 30px rgba(0,0,0,0.3)',
                                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                                }}
                            >
                                تواصل معنا
                            </Typography>

                            <Typography
                                variant="h6"
                                sx={{
                                    fontFamily: 'Cairo',
                                    color: 'rgba(255,255,255,0.85)',
                                    maxWidth: 600,
                                    mx: 'auto',
                                    lineHeight: 1.8,
                                    fontWeight: 400,
                                }}
                            >
                                فريقنا متاح للإجابة على استفساراتكم وتقديم الدعم اللازم
                            </Typography>

                            {/* Breadcrumb */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 1 }}>
                                <Chip
                                    label="الرئيسية"
                                    component={Link}
                                    to="/"
                                    clickable
                                    sx={{
                                        fontFamily: 'Cairo',
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                                    }}
                                />
                                <Typography sx={{ color: 'rgba(255,255,255,0.5)', alignSelf: 'center' }}>/</Typography>
                                <Chip
                                    label="اتصل بنا"
                                    sx={{
                                        fontFamily: 'Cairo',
                                        bgcolor: '#FFC107',
                                        color: '#0A2342',
                                        fontWeight: 'bold'
                                    }}
                                />
                            </Box>
                        </Box>
                    </Fade>
                </Container>

                {/* Bottom Wave */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 100,
                        background: 'linear-gradient(to top, #fafbfc, transparent)',
                    }}
                />
            </Box>

            {/* Contact Info Cards */}
            <Container maxWidth="lg" sx={{ mt: -8, position: 'relative', zIndex: 3 }}>
                <Grid container spacing={3}>
                    {contactInfo.map((info, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <ContactCard info={info} index={index} />
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Main Content */}
            <Container maxWidth="lg" sx={{ py: 10 }}>
                <Grid container spacing={6}>
                    {/* Contact Form */}
                    <Grid item xs={12} lg={7}>
                        <Grow in={true} timeout={800}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: { xs: 4, md: 6 },
                                    borderRadius: 5,
                                    background: 'rgba(255,255,255,0.98)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                {/* Shimmer Bar */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: 4,
                                        background: 'linear-gradient(90deg, transparent, #FFC107, #0A2342, #FFC107, transparent)',
                                        backgroundSize: '200% 100%',
                                        animation: `${shimmer} 3s linear infinite`,
                                    }}
                                />

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                                    <Box
                                        sx={{
                                            width: 70,
                                            height: 70,
                                            borderRadius: 4,
                                            background: 'linear-gradient(135deg, #FFC107, #FFD54F)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mr: 3,
                                            boxShadow: '0 10px 30px rgba(255,193,7,0.3)',
                                        }}
                                    >
                                        <SendIcon sx={{ color: '#0A2342', fontSize: 32 }} />
                                    </Box>
                                    <Box>
                                        <Typography
                                            variant="h4"
                                            sx={{
                                                fontFamily: 'Cairo',
                                                fontWeight: 'bold',
                                                color: '#0A2342',
                                            }}
                                        >
                                            أرسل لنا رسالة
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{ fontFamily: 'Cairo', color: '#666' }}
                                        >
                                            سنرد عليك في أقرب وقت ممكن
                                        </Typography>
                                    </Box>
                                </Box>

                                <form onSubmit={handleSubmit}>
                                    <Grid container spacing={3}>
                                        {/* Name */}
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                name="name"
                                                label="الاسم الكامل"
                                                value={formData.name}
                                                onChange={handleChange}
                                                error={!!errors.name}
                                                helperText={errors.name}
                                                sx={inputStyle}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <PersonIcon sx={{ color: '#0A2342' }} />
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        </Grid>

                                        {/* Email */}
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                name="email"
                                                label="البريد الإلكتروني"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                error={!!errors.email}
                                                helperText={errors.email}
                                                sx={inputStyle}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <EmailIcon sx={{ color: '#0A2342' }} />
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        </Grid>

                                        {/* Phone */}
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                name="phone"
                                                label="رقم الهاتف (اختياري)"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                sx={inputStyle}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <PhoneIcon sx={{ color: '#0A2342' }} />
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        </Grid>

                                        {/* Inquiry Type */}
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                select
                                                name="inquiryType"
                                                label="نوع الاستفسار"
                                                value={formData.inquiryType}
                                                onChange={handleChange}
                                                error={!!errors.inquiryType}
                                                helperText={errors.inquiryType}
                                                sx={inputStyle}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <CategoryIcon sx={{ color: '#0A2342' }} />
                                                        </InputAdornment>
                                                    )
                                                }}
                                            >
                                                {inquiryTypes.map((option) => (
                                                    <MenuItem key={option.value} value={option.value} sx={{ fontFamily: 'Cairo' }}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>

                                        {/* Department */}
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                select
                                                name="department"
                                                label="القسم المعني (اختياري)"
                                                value={formData.department}
                                                onChange={handleChange}
                                                sx={inputStyle}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <BusinessIcon sx={{ color: '#0A2342' }} />
                                                        </InputAdornment>
                                                    )
                                                }}
                                            >
                                                {departments.map((option) => (
                                                    <MenuItem key={option.value} value={option.value} sx={{ fontFamily: 'Cairo' }}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>

                                        {/* Subject */}
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                name="subject"
                                                label="الموضوع"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                error={!!errors.subject}
                                                helperText={errors.subject}
                                                sx={inputStyle}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <SubjectIcon sx={{ color: '#0A2342' }} />
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        </Grid>

                                        {/* Message */}
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                name="message"
                                                label="الرسالة"
                                                multiline
                                                rows={5}
                                                value={formData.message}
                                                onChange={handleChange}
                                                error={!!errors.message}
                                                helperText={errors.message || `${formData.message.length}/500 حرف`}
                                                inputProps={{ maxLength: 500 }}
                                                sx={inputStyle}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                                                            <MessageIcon sx={{ color: '#0A2342' }} />
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        </Grid>

                                        {/* Submit Button */}
                                        <Grid item xs={12}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                size="large"
                                                fullWidth
                                                disabled={isSubmitting}
                                                sx={{
                                                    bgcolor: '#0A2342',
                                                    fontFamily: 'Cairo',
                                                    fontWeight: 'bold',
                                                    py: 2,
                                                    borderRadius: 3,
                                                    fontSize: '1.1rem',
                                                    boxShadow: '0 10px 30px rgba(10,35,66,0.3)',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        bgcolor: '#1a4a7a',
                                                        transform: 'translateY(-3px)',
                                                        boxShadow: '0 15px 40px rgba(10,35,66,0.4)',
                                                    },
                                                    '&:disabled': {
                                                        bgcolor: 'rgba(10,35,66,0.5)',
                                                        color: '#fff',
                                                    }
                                                }}
                                                startIcon={isSubmitting ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                                            >
                                                {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </form>
                            </Paper>
                        </Grow>
                    </Grid>

                    {/* FAQ Section */}
                    <Grid item xs={12} lg={5}>
                        <Grow in={true} timeout={1000}>
                            <Box>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: { xs: 4, md: 5 },
                                        borderRadius: 5,
                                        background: 'rgba(255,255,255,0.98)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(0,0,0,0.06)',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                                        <Box
                                            sx={{
                                                width: 70,
                                                height: 70,
                                                borderRadius: 4,
                                                background: 'linear-gradient(135deg, #9C27B0, #BA68C8)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 3,
                                                boxShadow: '0 10px 30px rgba(156,39,176,0.3)',
                                            }}
                                        >
                                            <HelpOutlineIcon sx={{ color: '#fff', fontSize: 32 }} />
                                        </Box>
                                        <Box>
                                            <Typography
                                                variant="h4"
                                                sx={{
                                                    fontFamily: 'Cairo',
                                                    fontWeight: 'bold',
                                                    color: '#0A2342',
                                                }}
                                            >
                                                الأسئلة الشائعة
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                sx={{ fontFamily: 'Cairo', color: '#666' }}
                                            >
                                                إجابات سريعة لأكثر الأسئلة شيوعًا
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {faqData.map((faq, index) => (
                                        <Accordion
                                            key={index}
                                            expanded={expandedFaq === index}
                                            onChange={() => setExpandedFaq(expandedFaq === index ? false : index)}
                                            elevation={0}
                                            sx={{
                                                mb: 2,
                                                borderRadius: '16px !important',
                                                border: '1px solid',
                                                borderColor: expandedFaq === index ? '#FFC107' : 'rgba(0,0,0,0.08)',
                                                '&::before': { display: 'none' },
                                                overflow: 'hidden',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    borderColor: '#FFC107',
                                                    boxShadow: '0 5px 20px rgba(255,193,7,0.15)',
                                                }
                                            }}
                                        >
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon sx={{ color: '#0A2342' }} />}
                                                sx={{
                                                    bgcolor: expandedFaq === index ? 'rgba(255,193,7,0.08)' : 'transparent',
                                                    py: 1,
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontFamily: 'Cairo',
                                                        fontWeight: 'bold',
                                                        color: '#0A2342'
                                                    }}
                                                >
                                                    {faq.question}
                                                </Typography>
                                            </AccordionSummary>
                                            <AccordionDetails sx={{ bgcolor: 'rgba(250,251,252,0.8)' }}>
                                                <Typography
                                                    sx={{
                                                        fontFamily: 'Cairo',
                                                        color: '#666',
                                                        lineHeight: 1.9
                                                    }}
                                                >
                                                    {faq.answer}
                                                </Typography>
                                            </AccordionDetails>
                                        </Accordion>
                                    ))}
                                </Paper>

                                {/* Social Media Card */}
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        mt: 3,
                                        borderRadius: 4,
                                        background: 'linear-gradient(135deg, #0A2342, #1a4a7a)',
                                        textAlign: 'center',
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontFamily: 'Cairo',
                                            fontWeight: 'bold',
                                            color: '#fff',
                                            mb: 3
                                        }}
                                    >
                                        تابعنا على وسائل التواصل
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                                        {socialLinks.map((social, index) => (
                                            <IconButton
                                                key={index}
                                                component="a"
                                                href={social.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={social.label}
                                                sx={{
                                                    bgcolor: 'rgba(255,255,255,0.1)',
                                                    color: '#fff',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        bgcolor: social.color,
                                                        transform: 'translateY(-5px) scale(1.1)',
                                                        boxShadow: `0 10px 25px ${social.color}50`,
                                                    }
                                                }}
                                            >
                                                {social.icon}
                                            </IconButton>
                                        ))}
                                    </Box>
                                </Paper>
                            </Box>
                        </Grow>
                    </Grid>
                </Grid>
            </Container>

            {/* Google Maps Section */}
            <Box sx={{ py: 10, bgcolor: '#fff' }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Chip
                            icon={<MapIcon />}
                            label="الموقع"
                            sx={{
                                mb: 2,
                                bgcolor: 'rgba(10,35,66,0.08)',
                                color: '#0A2342',
                                fontFamily: 'Cairo',
                                fontWeight: 'bold',
                            }}
                        />
                        <Typography
                            variant="h3"
                            sx={{
                                fontFamily: 'Cairo',
                                fontWeight: 'bold',
                                color: '#0A2342',
                                mb: 2,
                            }}
                        >
                            موقعنا على الخريطة
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                fontFamily: 'Cairo',
                                color: '#666',
                            }}
                        >
                            كلية الهندسة - جامعة بني سويف - شرق النيل
                        </Typography>
                    </Box>

                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: 5,
                            overflow: 'hidden',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                        }}
                    >
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3505.5380478!2d31.0920!3d29.0693!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sBeni%20Suef%20University!5e0!3m2!1sen!2seg!4v1234567890123"
                            width="100%"
                            height="450"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="موقع كلية الهندسة - جامعة بني سويف"
                        />
                    </Paper>
                </Container>
            </Box>

            {/* Quick Contact CTA */}
            <Box
                sx={{
                    position: 'relative',
                    py: 10,
                    background: 'linear-gradient(135deg, #0A2342 0%, #1a3a5c 50%, #0A2342 100%)',
                    backgroundSize: '200% 200%',
                    animation: `${gradientMove} 15s ease infinite`,
                    overflow: 'hidden',
                }}
            >
                {/* Background Elements */}
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,193,7,0.1) 0%, transparent 70%)' }} />
                <Box sx={{ position: 'absolute', bottom: -50, left: -50, width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)' }} />

                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                    <Box
                        sx={{
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            bgcolor: 'rgba(255,193,7,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 4,
                            animation: `${pulse} 2s ease-in-out infinite`,
                        }}
                    >
                        <CheckCircleOutlineIcon sx={{ fontSize: 50, color: '#FFC107' }} />
                    </Box>

                    <Typography
                        variant="h3"
                        sx={{
                            fontFamily: 'Cairo',
                            fontWeight: 'bold',
                            color: '#fff',
                            mb: 2,
                        }}
                    >
                        هل تحتاج مساعدة فورية؟
                    </Typography>

                    <Typography
                        variant="h6"
                        sx={{
                            fontFamily: 'Cairo',
                            color: 'rgba(255,255,255,0.8)',
                            mb: 5,
                            maxWidth: 500,
                            mx: 'auto',
                            fontWeight: 400,
                        }}
                    >
                        فريق الدعم لدينا متاح من الأحد إلى الخميس من 8 صباحًا حتى 4 مساءً
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            size="large"
                            href="tel:082-2334015"
                            startIcon={<PhoneIcon />}
                            sx={{
                                bgcolor: '#FFC107',
                                color: '#0A2342',
                                fontFamily: 'Cairo',
                                fontWeight: 'bold',
                                px: 5,
                                py: 2,
                                borderRadius: 3,
                                fontSize: '1.1rem',
                                boxShadow: '0 10px 30px rgba(255,193,7,0.4)',
                                '&:hover': {
                                    bgcolor: '#FFD54F',
                                    transform: 'translateY(-3px)',
                                    boxShadow: '0 15px 40px rgba(255,193,7,0.5)',
                                }
                            }}
                        >
                            اتصل الآن
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            href="mailto:info@eng.bsu.edu.eg"
                            startIcon={<EmailIcon />}
                            sx={{
                                borderColor: 'rgba(255,255,255,0.4)',
                                color: '#fff',
                                fontFamily: 'Cairo',
                                fontWeight: 'bold',
                                px: 5,
                                py: 2,
                                borderRadius: 3,
                                fontSize: '1.1rem',
                                '&:hover': {
                                    borderColor: '#FFC107',
                                    bgcolor: 'rgba(255,193,7,0.1)',
                                }
                            }}
                        >
                            راسلنا
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{
                        fontFamily: 'Cairo',
                        width: '100%',
                        borderRadius: 3,
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
