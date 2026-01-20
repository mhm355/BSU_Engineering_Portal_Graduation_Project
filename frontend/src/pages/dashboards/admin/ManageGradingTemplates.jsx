import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, Box, Button, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Alert, Chip, Grid, Card, CardContent,
    Avatar, Tooltip, Fade, Grow, Skeleton, LinearProgress, Divider
} from '@mui/material';
import { keyframes } from '@mui/system';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GradingIcon from '@mui/icons-material/Grading';
import AssignmentIcon from '@mui/icons-material/Assignment';
import QuizIcon from '@mui/icons-material/Quiz';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import DescriptionIcon from '@mui/icons-material/Description';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PercentIcon from '@mui/icons-material/Percent';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Stats Card Component
const StatCard = ({ icon: Icon, value, label, color, delay = 0 }) => (
    <Grow in={true} timeout={800 + delay}>
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 4,
                background: '#fff',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.06)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 20px 40px ${color}25`,
                }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 8px 24px ${color}40`,
                    }}
                >
                    <Icon sx={{ fontSize: 28, color: '#fff' }} />
                </Box>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a2744', fontFamily: 'Cairo', lineHeight: 1 }}>
                        {value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', fontFamily: 'Cairo' }}>
                        {label}
                    </Typography>
                </Box>
            </Box>
        </Paper>
    </Grow>
);

// Weight Bar Component
const WeightBar = ({ label, value, color, icon: Icon }) => (
    <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon sx={{ fontSize: 18, color }} />
                <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#555' }}>{label}</Typography>
            </Box>
            <Typography variant="body2" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color }}>{value}%</Typography>
        </Box>
        <LinearProgress
            variant="determinate"
            value={value}
            sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: `${color}20`,
                '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                }
            }}
        />
    </Box>
);

// Template Card Component
const TemplateCard = ({ template, onEdit, delay = 0 }) => {
    const totalWeight = (
        parseInt(template.attendance_weight || 0) +
        parseInt(template.quizzes_weight || 0) +
        parseInt(template.coursework_weight || 0) +
        parseInt(template.midterm_weight || 0) +
        parseInt(template.final_weight || 0)
    );

    return (
        <Grow in={true} timeout={800 + delay}>
            <Card
                sx={{
                    borderRadius: 4,
                    background: template.is_default
                        ? 'linear-gradient(135deg, #8E2DE215, #4A00E015)'
                        : '#fff',
                    boxShadow: template.is_default
                        ? '0 8px 32px rgba(142, 45, 226, 0.15)'
                        : '0 4px 20px rgba(0,0,0,0.08)',
                    border: template.is_default
                        ? '2px solid #8E2DE2'
                        : '1px solid rgba(0,0,0,0.06)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'visible',
                    '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                    }
                }}
            >
                {/* Default Badge */}
                {template.is_default && (
                    <Chip
                        icon={<StarIcon sx={{ color: '#fff !important', fontSize: 16 }} />}
                        label="القالب الافتراضي"
                        size="small"
                        sx={{
                            position: 'absolute',
                            top: -12,
                            right: 16,
                            background: 'linear-gradient(135deg, #8E2DE2, #4A00E0)',
                            color: '#fff',
                            fontFamily: 'Cairo',
                            fontWeight: 'bold',
                            px: 1,
                            animation: `${pulse} 2s infinite`,
                        }}
                    />
                )}

                <CardContent sx={{ p: 3 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                                sx={{
                                    width: 56,
                                    height: 56,
                                    background: 'linear-gradient(135deg, #8E2DE2, #4A00E0)',
                                }}
                            >
                                <GradingIcon sx={{ fontSize: 28 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                                    {template.name}
                                </Typography>
                                <Chip
                                    icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                                    label={`المجموع: ${totalWeight}%`}
                                    size="small"
                                    sx={{
                                        mt: 0.5,
                                        bgcolor: totalWeight === 100 ? '#e8f5e9' : '#ffebee',
                                        color: totalWeight === 100 ? '#2e7d32' : '#c62828',
                                        fontFamily: 'Cairo',
                                        fontWeight: 'bold',
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>

                    {/* Weights */}
                    <Box sx={{ mb: 2 }}>
                        <WeightBar label="الحضور" value={template.attendance_weight} color="#2196F3" icon={EventAvailableIcon} />
                        <WeightBar label="الكويزات" value={template.quizzes_weight} color="#9C27B0" icon={QuizIcon} />
                        <WeightBar label="أعمال السنة" value={template.coursework_weight} color="#FF9800" icon={AssignmentIcon} />
                        <WeightBar label="الميدتيرم" value={template.midterm_weight} color="#00BCD4" icon={DescriptionIcon} />
                        <WeightBar label="الفاينال" value={template.final_weight} color="#4CAF50" icon={SchoolIcon} />
                    </Box>

                    {/* Extra Info */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                        <Chip
                            label={`${template.attendance_slots} حصة`}
                            size="small"
                            variant="outlined"
                            sx={{ fontFamily: 'Cairo' }}
                        />
                        <Chip
                            label={`${template.quiz_count} كويز`}
                            size="small"
                            variant="outlined"
                            sx={{ fontFamily: 'Cairo' }}
                        />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Actions */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="تعديل القالب">
                            <Button
                                startIcon={<EditIcon />}
                                onClick={() => onEdit(template)}
                                sx={{
                                    fontFamily: 'Cairo',
                                    borderRadius: 2,
                                    px: 3,
                                    background: 'linear-gradient(135deg, #8E2DE2, #4A00E0)',
                                    color: '#fff',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #7B27C4, #3D00B8)',
                                    }
                                }}
                            >
                                تعديل
                            </Button>
                        </Tooltip>
                    </Box>
                </CardContent>
            </Card>
        </Grow>
    );
};

export default function ManageGradingTemplates() {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [open, setOpen] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState({
        name: '',
        attendance_weight: 10,
        attendance_slots: 14,
        quizzes_weight: 10,
        quiz_count: 2,
        coursework_weight: 10,
        midterm_weight: 20,
        final_weight: 50,
        is_default: false
    });
    const [isEdit, setIsEdit] = useState(false);

    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await axios.get('/api/academic/grading-templates/', config);
            setTemplates(response.data);
        } catch (err) {
            setError('فشل في تحميل قوالب التقييم');
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = (template = null) => {
        if (template) {
            setCurrentTemplate(template);
            setIsEdit(true);
        } else {
            setCurrentTemplate({
                name: '',
                attendance_weight: 10,
                attendance_slots: 14,
                quizzes_weight: 10,
                quiz_count: 2,
                coursework_weight: 10,
                midterm_weight: 20,
                final_weight: 50,
                is_default: false
            });
            setIsEdit(false);
        }
        setOpen(true);
        setError('');
    };

    const handleClose = () => {
        setOpen(false);
    };

    const getTotalWeight = () => {
        return (
            parseInt(currentTemplate.attendance_weight || 0) +
            parseInt(currentTemplate.quizzes_weight || 0) +
            parseInt(currentTemplate.coursework_weight || 0) +
            parseInt(currentTemplate.midterm_weight || 0) +
            parseInt(currentTemplate.final_weight || 0)
        );
    };

    const handleSave = async () => {
        if (!currentTemplate.name.trim()) {
            setError('يرجى إدخال اسم القالب');
            return;
        }

        if (getTotalWeight() !== 100) {
            setError(`مجموع الدرجات يجب أن يساوي 100 (الحالي: ${getTotalWeight()})`);
            return;
        }

        try {
            if (isEdit) {
                await axios.put(`/api/academic/grading-templates/${currentTemplate.id}/`, currentTemplate, config);
                setSuccess('تم تحديث القالب بنجاح');
            } else {
                await axios.post('/api/academic/grading-templates/', currentTemplate, config);
                setSuccess('تم إنشاء القالب بنجاح');
            }
            fetchTemplates();
            handleClose();
        } catch (err) {
            setError('حدث خطأ أثناء الحفظ');
        }
    };

    // Statistics
    const defaultTemplate = templates.find(t => t.is_default);

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', pb: 6 }}>
            {/* Hero Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',
                    pt: 4,
                    pb: 6,
                    mb: 4,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Floating Elements */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                        animation: `${float} 6s ease-in-out infinite`,
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -80,
                        left: -80,
                        width: 300,
                        height: 300,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.08)',
                        animation: `${float} 8s ease-in-out infinite`,
                        animationDelay: '2s',
                    }}
                />

                <Container maxWidth="xl">
                    <Fade in={true} timeout={800}>
                        <Box>
                            <Button
                                startIcon={<ArrowBackIcon />}
                                onClick={() => navigate('/admin/dashboard')}
                                sx={{
                                    color: '#fff',
                                    mb: 2,
                                    fontFamily: 'Cairo',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                                }}
                            >
                                العودة للوحة التحكم
                            </Button>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Avatar
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        backdropFilter: 'blur(10px)',
                                    }}
                                >
                                    <GradingIcon sx={{ fontSize: 45, color: '#fff' }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h3" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                        قوالب التقييم
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: 'rgba(255,255,255,0.9)' }}>
                                        تعريف توزيع الدرجات ونماذج التقييم للمقررات
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Container maxWidth="xl">
                {/* Alerts */}
                {error && (
                    <Fade in={true}>
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 3, fontFamily: 'Cairo' }} onClose={() => setError('')}>
                            {error}
                        </Alert>
                    </Fade>
                )}
                {success && (
                    <Fade in={true}>
                        <Alert severity="success" sx={{ mb: 3, borderRadius: 3, fontFamily: 'Cairo' }} onClose={() => setSuccess('')}>
                            {success}
                        </Alert>
                    </Fade>
                )}

                {/* Stats Row */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={GradingIcon}
                            value={templates.length}
                            label="إجمالي القوالب"
                            color="#8E2DE2"
                            delay={0}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={StarIcon}
                            value={defaultTemplate ? '1' : '0'}
                            label="القالب الافتراضي"
                            color="#FF9800"
                            delay={100}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={PercentIcon}
                            value="100%"
                            label="المجموع المطلوب"
                            color="#4CAF50"
                            delay={200}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={AssignmentIcon}
                            value="5"
                            label="عناصر التقييم"
                            color="#2196F3"
                            delay={300}
                        />
                    </Grid>
                </Grid>

                {/* Action Bar */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 4,
                        borderRadius: 4,
                        background: '#fff',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2,
                    }}
                >
                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1a2744' }}>
                        القوالب ({templates.length})
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpen()}
                        sx={{
                            fontFamily: 'Cairo',
                            fontWeight: 'bold',
                            px: 4,
                            py: 1.5,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #8E2DE2, #4A00E0)',
                            boxShadow: '0 8px 24px rgba(142, 45, 226, 0.35)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #7B27C4, #3D00B8)',
                                boxShadow: '0 12px 32px rgba(142, 45, 226, 0.45)',
                            }
                        }}
                    >
                        إضافة قالب جديد
                    </Button>
                </Paper>

                {/* Templates Grid */}
                {loading ? (
                    <Grid container spacing={3}>
                        {[1, 2, 3].map((i) => (
                            <Grid item xs={12} md={6} lg={4} key={i}>
                                <Skeleton variant="rounded" height={350} sx={{ borderRadius: 4 }} />
                            </Grid>
                        ))}
                    </Grid>
                ) : templates.length === 0 ? (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 8,
                            borderRadius: 4,
                            background: '#fff',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            textAlign: 'center',
                        }}
                    >
                        <GradingIcon sx={{ fontSize: 80, color: '#ddd', mb: 2 }} />
                        <Typography variant="h5" sx={{ fontFamily: 'Cairo', color: '#999', mb: 1 }}>
                            لا توجد قوالب تقييم
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#bbb', mb: 3 }}>
                            قم بإضافة قالب جديد لتوزيع الدرجات
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpen()}
                            sx={{
                                fontFamily: 'Cairo',
                                fontWeight: 'bold',
                                px: 4,
                                py: 1.5,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #8E2DE2, #4A00E0)',
                            }}
                        >
                            إضافة قالب
                        </Button>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {templates.map((template, idx) => (
                            <Grid item xs={12} md={6} lg={4} key={template.id}>
                                <TemplateCard
                                    template={template}
                                    onEdit={handleOpen}
                                    delay={idx * 100}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>

            {/* Add/Edit Dialog */}
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 4, p: 1 }
                }}
            >
                <DialogTitle sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1.5rem' }}>
                    {isEdit ? 'تعديل القالب' : 'إضافة قالب جديد'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            label="اسم القالب"
                            fullWidth
                            required
                            value={currentTemplate.name}
                            onChange={(e) => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
                            InputLabelProps={{ sx: { fontFamily: 'Cairo' } }}
                            InputProps={{ sx: { borderRadius: 2 } }}
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="الحضور %"
                                type="number"
                                value={currentTemplate.attendance_weight}
                                onChange={(e) => setCurrentTemplate({ ...currentTemplate, attendance_weight: parseInt(e.target.value) || 0 })}
                                fullWidth
                                InputProps={{ sx: { borderRadius: 2 } }}
                            />
                            <TextField
                                label="عدد الحصص"
                                type="number"
                                value={currentTemplate.attendance_slots}
                                onChange={(e) => setCurrentTemplate({ ...currentTemplate, attendance_slots: parseInt(e.target.value) || 0 })}
                                fullWidth
                                InputProps={{ sx: { borderRadius: 2 } }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="الكويزات %"
                                type="number"
                                value={currentTemplate.quizzes_weight}
                                onChange={(e) => setCurrentTemplate({ ...currentTemplate, quizzes_weight: parseInt(e.target.value) || 0 })}
                                fullWidth
                                InputProps={{ sx: { borderRadius: 2 } }}
                            />
                            <TextField
                                label="عدد الكويزات"
                                type="number"
                                value={currentTemplate.quiz_count}
                                onChange={(e) => setCurrentTemplate({ ...currentTemplate, quiz_count: parseInt(e.target.value) || 0 })}
                                fullWidth
                                InputProps={{ sx: { borderRadius: 2 } }}
                            />
                        </Box>
                        <TextField
                            label="أعمال السنة %"
                            type="number"
                            value={currentTemplate.coursework_weight}
                            onChange={(e) => setCurrentTemplate({ ...currentTemplate, coursework_weight: parseInt(e.target.value) || 0 })}
                            InputProps={{ sx: { borderRadius: 2 } }}
                        />
                        <TextField
                            label="الميدتيرم %"
                            type="number"
                            value={currentTemplate.midterm_weight}
                            onChange={(e) => setCurrentTemplate({ ...currentTemplate, midterm_weight: parseInt(e.target.value) || 0 })}
                            InputProps={{ sx: { borderRadius: 2 } }}
                        />
                        <TextField
                            label="الفاينال %"
                            type="number"
                            value={currentTemplate.final_weight}
                            onChange={(e) => setCurrentTemplate({ ...currentTemplate, final_weight: parseInt(e.target.value) || 0 })}
                            InputProps={{ sx: { borderRadius: 2 } }}
                        />

                        {/* Visual Total */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                bgcolor: getTotalWeight() === 100 ? '#e8f5e9' : '#fff3e0',
                                border: `2px solid ${getTotalWeight() === 100 ? '#4CAF50' : '#FF9800'}`,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: getTotalWeight() === 100 ? '#2e7d32' : '#e65100' }}>
                                    المجموع الكلي
                                </Typography>
                                <Chip
                                    label={`${getTotalWeight()}%`}
                                    sx={{
                                        fontFamily: 'Cairo',
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        bgcolor: getTotalWeight() === 100 ? '#4CAF50' : '#FF9800',
                                        color: '#fff',
                                    }}
                                />
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={Math.min(getTotalWeight(), 100)}
                                sx={{
                                    mt: 1,
                                    height: 10,
                                    borderRadius: 5,
                                    bgcolor: 'rgba(0,0,0,0.1)',
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 5,
                                        bgcolor: getTotalWeight() === 100 ? '#4CAF50' : '#FF9800',
                                    }
                                }}
                            />
                            {getTotalWeight() !== 100 && (
                                <Typography variant="body2" sx={{ mt: 1, fontFamily: 'Cairo', color: '#e65100' }}>
                                    يجب أن يكون المجموع 100% (الفرق: {100 - getTotalWeight()}%)
                                </Typography>
                            )}
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={handleClose} sx={{ fontFamily: 'Cairo', px: 3, borderRadius: 2 }}>
                        إلغاء
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={getTotalWeight() !== 100}
                        sx={{
                            fontFamily: 'Cairo',
                            px: 4,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #8E2DE2, #4A00E0)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #7B27C4, #3D00B8)',
                            },
                            '&:disabled': {
                                background: '#ccc',
                            }
                        }}
                    >
                        حفظ
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
