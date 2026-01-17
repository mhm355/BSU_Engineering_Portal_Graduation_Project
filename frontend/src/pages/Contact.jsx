import React, { useState } from 'react';
import {
    Box, Container, Typography, Grid, Paper, TextField, Button,
    Accordion, AccordionSummary, AccordionDetails, IconButton,
    MenuItem, Snackbar, Alert, CircularProgress, Chip,
    InputAdornment, Fade, Grow, Slide
} from '@mui/material';
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
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// CSS keyframes for animations
const animationStyles = `
@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
}
@keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
@keyframes rotateReverse {
    from { transform: rotate(360deg); }
    to { transform: rotate(0deg); }
}
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
}
@keyframes slideInRight {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
}
@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}
`;

// Contact cards data
const contactInfo = [
    {
        icon: <LocationOnIcon sx={{ fontSize: 32 }} />,
        title: 'العنوان',
        details: ['شرق النيل، بني سويف، مصر', 'كلية الهندسة - جامعة بني سويف'],
        color: '#4CAF50'
    },
    {
        icon: <PhoneIcon sx={{ fontSize: 32 }} />,
        title: 'الهاتف',
        details: ['082-2334015', '082-2334016', '082-2334017'],
        color: '#2196F3'
    },
    {
        icon: <EmailIcon sx={{ fontSize: 32 }} />,
        title: 'البريد الإلكتروني',
        details: ['info@eng.bsu.edu.eg', 'dean@eng.bsu.edu.eg', 'support@eng.bsu.edu.eg'],
        color: '#FF9800'
    },
    {
        icon: <AccessTimeIcon sx={{ fontSize: 32 }} />,
        title: 'ساعات العمل',
        details: ['الأحد - الخميس: 8:00ص - 4:00م', 'الجمعة - السبت: مغلق'],
        color: '#9C27B0'
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
    { icon: <YouTubeIcon />, url: 'https://youtube.com/@bsu_eng', color: '#FF0000', label: 'YouTube' }
];

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
    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

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

    // Styles
    const glassCardStyle = {
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
        }
    };

    const inputStyle = {
        '& .MuiOutlinedInput-root': {
            fontFamily: 'Cairo',
            borderRadius: '16px',
            transition: 'all 0.3s ease',
            textAlign: 'right',
            fontSize: '1.1rem',
            backgroundColor: '#fafbfc',
            '& input': {
                padding: '18px 16px',
                textAlign: 'right'
            },
            '& textarea': {
                padding: '18px 16px',
                textAlign: 'right'
            },
            '&:hover': {
                boxShadow: '0 6px 20px rgba(10, 35, 66, 0.12)',
                backgroundColor: '#fff'
            },
            '&.Mui-focused': {
                boxShadow: '0 8px 30px rgba(10, 35, 66, 0.18)',
                backgroundColor: '#fff'
            }
        },
        '& .MuiInputLabel-root': {
            fontFamily: 'Cairo',
            fontSize: '1rem',
            right: 28,
            left: 'auto',
            transformOrigin: 'right'
        },
        '& .MuiInputLabel-shrink': {
            transformOrigin: 'right',
            right: 14
        },
        '& .MuiOutlinedInput-notchedOutline': {
            textAlign: 'right',
            borderWidth: '2px'
        },
        '& .MuiFormHelperText-root': {
            fontFamily: 'Cairo',
            textAlign: 'right',
            marginRight: 8
        }
    };

    return (
        <Box sx={{ direction: 'rtl', overflow: 'hidden', textAlign: 'right' }}>
            {/* Inject CSS animations */}
            <style>{animationStyles}</style>

            {/* Hero Section */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #0A2342 0%, #1a3a5c 50%, #0A2342 100%)',
                    position: 'relative',
                    py: { xs: 8, md: 12 },
                    overflow: 'hidden'
                }}
            >
                {/* Animated Background Elements */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '-50%',
                        right: '-20%',
                        width: '600px',
                        height: '600px',
                        borderRadius: '50%',
                        border: '2px solid rgba(255, 193, 7, 0.1)',
                        pointerEvents: 'none',
                        animation: 'rotate 50s linear infinite'
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: '-30%',
                        left: '-10%',
                        width: '400px',
                        height: '400px',
                        borderRadius: '50%',
                        border: '2px solid rgba(255, 193, 7, 0.15)',
                        pointerEvents: 'none',
                        animation: 'rotateReverse 40s linear infinite'
                    }}
                />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                    <Fade in={mounted} timeout={800}>
                        <Box sx={{ animation: 'fadeInUp 0.8s ease-out' }}>
                            <Typography
                                variant="h2"
                                component="h1"
                                sx={{
                                    fontFamily: 'Cairo',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    textAlign: 'center',
                                    mb: 2,
                                    fontSize: { xs: '2rem', md: '3rem' }
                                }}
                            >
                                تواصل معنا
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontFamily: 'Cairo',
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    textAlign: 'center',
                                    maxWidth: '600px',
                                    mx: 'auto',
                                    lineHeight: 1.8
                                }}
                            >
                                نحن هنا لمساعدتك! تواصل معنا للاستفسارات أو الدعم
                            </Typography>

                            {/* Breadcrumb */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 1 }}>
                                <Chip
                                    label="الرئيسية"
                                    sx={{
                                        fontFamily: 'Cairo',
                                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
                                    }}
                                    clickable
                                    component="a"
                                    href="/"
                                />
                                <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', alignSelf: 'center' }}>/</Typography>
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
            </Box>

            {/* Contact Info Cards */}
            <Container maxWidth="lg" sx={{ mt: -6, position: 'relative', zIndex: 3 }}>
                <Grid container spacing={3} direction="row-reverse">
                    {contactInfo.map((info, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Grow in={mounted} timeout={500 + index * 200}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        ...glassCardStyle,
                                        p: 3,
                                        textAlign: 'center',
                                        height: '100%'
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 64,
                                            height: 64,
                                            borderRadius: '50%',
                                            bgcolor: `${info.color}15`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mx: 'auto',
                                            mb: 2,
                                            color: info.color,
                                            animation: 'float 3s ease-in-out infinite'
                                        }}
                                    >
                                        {info.icon}
                                    </Box>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontFamily: 'Cairo',
                                            fontWeight: 'bold',
                                            color: '#0A2342',
                                            mb: 1
                                        }}
                                    >
                                        {info.title}
                                    </Typography>
                                    {info.details.map((detail, idx) => (
                                        <Typography
                                            key={idx}
                                            variant="body2"
                                            sx={{
                                                fontFamily: 'Cairo',
                                                color: 'text.secondary',
                                                lineHeight: 1.8
                                            }}
                                        >
                                            {detail}
                                        </Typography>
                                    ))}
                                </Paper>
                            </Grow>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Main Content */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Grid container spacing={6} direction="row-reverse">
                    {/* Contact Form */}
                    <Grid item xs={12} lg={7}>
                        <Slide direction="left" in={mounted} timeout={600}>
                            <Paper
                                elevation={0}
                                sx={{
                                    ...glassCardStyle,
                                    p: { xs: 3, md: 5 }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: 'flex-end' }}>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography
                                            variant="h4"
                                            sx={{
                                                fontFamily: 'Cairo',
                                                fontWeight: 'bold',
                                                color: '#0A2342',
                                                fontSize: { xs: '1.5rem', md: '2rem' }
                                            }}
                                        >
                                            أرسل لنا رسالة
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                fontFamily: 'Cairo',
                                                color: 'text.secondary',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            سنرد عليك في أقرب وقت ممكن
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: '16px',
                                            bgcolor: '#FFC10720',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            ml: 3
                                        }}
                                    >
                                        <SendIcon sx={{ color: '#FFC107', fontSize: 28 }} />
                                    </Box>
                                </Box>

                                <form onSubmit={handleSubmit}>
                                    <Grid container spacing={3} direction="row-reverse">
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
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <PersonIcon sx={{ color: 'text.secondary' }} />
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
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <EmailIcon sx={{ color: 'text.secondary' }} />
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
                                                    endAdornment: (
                                                        <InputAdornment position="end" sx={{ mr: 3 }}>
                                                            <CategoryIcon sx={{ color: 'text.secondary' }} />
                                                        </InputAdornment>
                                                    )
                                                }}
                                            >
                                                {inquiryTypes.map((option) => (
                                                    <MenuItem
                                                        key={option.value}
                                                        value={option.value}
                                                        sx={{ fontFamily: 'Cairo', textAlign: 'right' }}
                                                    >
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
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
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <PhoneIcon sx={{ color: 'text.secondary' }} />
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
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
                                                    endAdornment: (
                                                        <InputAdornment position="end" sx={{ mr: 3 }}>
                                                            <BusinessIcon sx={{ color: 'text.secondary' }} />
                                                        </InputAdornment>
                                                    )
                                                }}
                                            >
                                                {departments.map((option) => (
                                                    <MenuItem
                                                        key={option.value}
                                                        value={option.value}
                                                        sx={{ fontFamily: 'Cairo', textAlign: 'right' }}
                                                    >
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
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <SubjectIcon sx={{ color: 'text.secondary' }} />
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
                                                    endAdornment: (
                                                        <InputAdornment position="end" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                                                            <MessageIcon sx={{ color: 'text.secondary' }} />
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
                                                    py: 1.5,
                                                    borderRadius: '12px',
                                                    fontSize: '1.1rem',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        bgcolor: '#1a3a5c',
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 8px 25px rgba(10, 35, 66, 0.3)'
                                                    },
                                                    '&:disabled': {
                                                        bgcolor: '#ccc'
                                                    }
                                                }}
                                                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                                            >
                                                {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </form>
                            </Paper>
                        </Slide>
                    </Grid>

                    {/* FAQ Section */}
                    <Grid item xs={12} lg={5}>
                        <Slide direction="right" in={mounted} timeout={800}>
                            <Box>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        ...glassCardStyle,
                                        p: { xs: 3, md: 4 }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: 'flex-end' }}>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography
                                                variant="h4"
                                                sx={{
                                                    fontFamily: 'Cairo',
                                                    fontWeight: 'bold',
                                                    color: '#0A2342',
                                                    fontSize: { xs: '1.5rem', md: '2rem' }
                                                }}
                                            >
                                                الأسئلة الشائعة
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    fontFamily: 'Cairo',
                                                    color: 'text.secondary',
                                                    fontSize: '1rem'
                                                }}
                                            >
                                                إجابات سريعة لأكثر الأسئلة شيوعًا
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                borderRadius: '16px',
                                                bgcolor: '#9C27B020',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                ml: 3
                                            }}
                                        >
                                            <HelpOutlineIcon sx={{ color: '#9C27B0', fontSize: 28 }} />
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
                                                borderRadius: '12px !important',
                                                border: '1px solid',
                                                borderColor: expandedFaq === index ? '#FFC107' : 'rgba(0, 0, 0, 0.08)',
                                                '&::before': { display: 'none' },
                                                overflow: 'hidden',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    borderColor: '#FFC107'
                                                }
                                            }}
                                        >
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon sx={{ color: '#0A2342' }} />}
                                                sx={{
                                                    bgcolor: expandedFaq === index ? '#FFC10710' : 'transparent',
                                                    flexDirection: 'row-reverse',
                                                    '& .MuiAccordionSummary-content': {
                                                        my: 2,
                                                        justifyContent: 'flex-end'
                                                    },
                                                    '& .MuiAccordionSummary-expandIconWrapper': {
                                                        marginRight: 0,
                                                        marginLeft: 'auto'
                                                    }
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontFamily: 'Cairo',
                                                        fontWeight: 'bold',
                                                        color: '#0A2342',
                                                        textAlign: 'right',
                                                        width: '100%'
                                                    }}
                                                >
                                                    {faq.question}
                                                </Typography>
                                            </AccordionSummary>
                                            <AccordionDetails sx={{ bgcolor: '#f8f9fa', textAlign: 'right' }}>
                                                <Typography
                                                    sx={{
                                                        fontFamily: 'Cairo',
                                                        color: 'text.secondary',
                                                        lineHeight: 1.8,
                                                        textAlign: 'right'
                                                    }}
                                                >
                                                    {faq.answer}
                                                </Typography>
                                            </AccordionDetails>
                                        </Accordion>
                                    ))}
                                </Paper>

                                {/* Social Media Links */}
                                <Paper
                                    elevation={0}
                                    sx={{
                                        ...glassCardStyle,
                                        p: 3,
                                        mt: 3,
                                        textAlign: 'center'
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontFamily: 'Cairo',
                                            fontWeight: 'bold',
                                            color: '#0A2342',
                                            mb: 2
                                        }}
                                    >
                                        تابعنا على وسائل التواصل
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                        {socialLinks.map((social, index) => (
                                            <IconButton
                                                key={index}
                                                component="a"
                                                href={social.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={social.label}
                                                sx={{
                                                    bgcolor: `${social.color}15`,
                                                    color: social.color,
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        bgcolor: social.color,
                                                        color: 'white',
                                                        transform: 'translateY(-3px) scale(1.1)'
                                                    }
                                                }}
                                            >
                                                {social.icon}
                                            </IconButton>
                                        ))}
                                    </Box>
                                </Paper>
                            </Box>
                        </Slide>
                    </Grid>
                </Grid>
            </Container>

            {/* Google Maps */}
            <Box sx={{ py: 6, bgcolor: '#f8f9fa' }}>
                <Container maxWidth="lg">
                    <Fade in={mounted} timeout={1000}>
                        <Box>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontFamily: 'Cairo',
                                        fontWeight: 'bold',
                                        color: '#0A2342',
                                        mb: 1
                                    }}
                                >
                                    موقعنا على الخريطة
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        fontFamily: 'Cairo',
                                        color: 'text.secondary'
                                    }}
                                >
                                    كلية الهندسة - جامعة بني سويف - شرق النيل
                                </Typography>
                            </Box>

                            <Paper
                                elevation={0}
                                sx={{
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3505.5380478!2d31.0920!3d29.0693!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sBeni%20Suef%20University!5e0!3m2!1sen!2seg!4v1234567890123"
                                    width="100%"
                                    height="400"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="موقع كلية الهندسة - جامعة بني سويف"
                                />
                            </Paper>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            {/* Quick Contact CTA */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #0A2342 0%, #1a3a5c 100%)',
                    py: 6
                }}
            >
                <Container maxWidth="md">
                    <Fade in={mounted} timeout={1200}>
                        <Box sx={{ textAlign: 'center' }}>
                            <CheckCircleOutlineIcon sx={{ fontSize: 48, color: '#FFC107', mb: 2 }} />
                            <Typography
                                variant="h4"
                                sx={{
                                    fontFamily: 'Cairo',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    mb: 2
                                }}
                            >
                                هل تحتاج مساعدة فورية؟
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    fontFamily: 'Cairo',
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    mb: 4,
                                    maxWidth: '500px',
                                    mx: 'auto'
                                }}
                            >
                                فريق الدعم لدينا متاح من الأحد إلى الخميس من 8 صباحًا حتى 4 مساءً
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
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
                                        px: 4,
                                        borderRadius: '12px',
                                        '&:hover': {
                                            bgcolor: '#ffca2c'
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
                                        borderColor: 'white',
                                        color: 'white',
                                        fontFamily: 'Cairo',
                                        fontWeight: 'bold',
                                        px: 4,
                                        borderRadius: '12px',
                                        '&:hover': {
                                            borderColor: '#FFC107',
                                            bgcolor: 'rgba(255, 193, 7, 0.1)'
                                        }
                                    }}
                                >
                                    راسلنا
                                </Button>
                            </Box>
                        </Box>
                    </Fade>
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
                    sx={{ fontFamily: 'Cairo', width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
