import React, { useState } from 'react';
import { Container, Typography, Box, Paper, Grid, Card, CardContent, Avatar, Chip, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab, Accordion, AccordionSummary, AccordionDetails, ToggleButtonGroup, ToggleButton, Button, Collapse } from '@mui/material';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import ScienceIcon from '@mui/icons-material/Science';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import BoltIcon from '@mui/icons-material/Bolt';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

export default function ElectricalDepartmentPage() {
    const [activeYear, setActiveYear] = useState(0);
    const [specialization, setSpecialization] = useState('ece');
    const [showFaculty, setShowFaculty] = useState(false);

    const faculty = [
        { name: 'أ.د/ محمد محمود سامي عبد العزيز', role: 'رئيس مجلس القسم', rank: 'head' },
        { name: 'أ.د/ جان هنري حنا', role: 'أستاذ', rank: 'professor' },
        { name: 'أ.م.د/ عرفة سيد محمد منصور', role: 'أستاذ مساعد', rank: 'assistant' },
        { name: 'أ.م.د/ فتحي محمد مصطفى', role: 'أستاذ مساعد', rank: 'assistant' },
        { name: 'أ.م.د/ شيماء حسن سيد بركات', role: 'أستاذ مساعد', rank: 'assistant' },
        { name: 'د/ فتحي عبد اللطيف المسيري', role: 'مدرس', rank: 'lecturer' },
        { name: 'د/ ليلى أبو هاشم محمد', role: 'مدرس', rank: 'lecturer' },
        { name: 'د/ أسماء محمد أحمد عبد الغني', role: 'مدرس', rank: 'lecturer' },
        { name: 'د/ محمد فيصل', role: 'مدرس', rank: 'lecturer' }
    ];

    const assistants = [
        { name: 'م.م/ محمد ذكري', role: 'معيد' },
        { name: 'م.م/ محمد جاد المولى عبد ربه', role: 'معيد' },
        { name: 'م/ مصطفى موسى', role: 'مهندس' }
    ];

    const labs = [
        'معمل الآلات والمحولات الكهربية',
        'معمل إلكترونيات القدرة',
        'معمل الطاقة الجديدة والمتجددة',
        'معمل التركيبات الكهربية',
        'معمل نظم القوى الكهربية',
        'معمل الأساسيات الكهربية والإلكترونية',
        'معمل الأنظمة المدمجة',
        'معمل الاتصالات',
        'معمل التحكم المنطقي المبرمج',
        'معمل الحاسب الآلي',
        'معمل الفيزياء'
    ];

    const getRankColor = (rank) => {
        switch (rank) {
            case 'head': return { bg: '#FFC107', text: '#000' };
            case 'professor': return { bg: '#f57c00', text: '#fff' };
            case 'assistant': return { bg: '#ff9800', text: '#fff' };
            case 'lecturer': return { bg: '#ffb74d', text: '#000' };
            default: return { bg: '#9e9e9e', text: '#fff' };
        }
    };

    // First Year - Shared for both specializations
    const sharedFirstYear = {
        first: {
            sem1: [
                { code: 'PHM113E', name: 'احتمالات وإحصاء هندسي' },
                { code: 'PHM122', name: 'الفيزياء الحديثة وميكانيكا الكم' },
                { code: 'EPM111', name: 'دوائر كهربية(1)' },
                { code: 'EPM121', name: 'مجالات كهرومغناطيسية' },
                { code: 'CVE111E', name: 'هندسة مدنية' },
                { code: 'ECE111', name: 'أساسيات الكترونية' },
            ],
            sem2: [
                { code: 'PHM112', name: 'الدوال الخاصة والمعادلات التفاضلية الجزئية' },
                { code: 'MEP114', name: 'هندسة ميكانيكية' },
                { code: 'EPM171', name: 'قياسات كهربية وإلكترونية' },
                { code: 'EPM112', name: 'دوائر كهربية(2)' },
                { code: 'ECE151', name: 'دوائر منطقية' },
                { code: 'HUMX52E', name: 'مهارات الاتصال والعرض' },
            ]
        }
    };

    // ECE Specialization subjects
    const eceSubjects = {
        second: {
            sem1: [
                { code: 'PHM218', name: 'الدوال المركبة والتحليل العددي' },
                { code: 'ECE235', name: 'إشارات ونظم' },
                { code: 'ECE216', name: 'دوائر إلكترونية رقمية' },
                { code: 'ECE261', name: 'برمجة الحاسب' },
                { code: 'ECE212', name: 'دوائر إلكترونية تناظرية(1)' },
                { code: 'HUMX12E', name: 'كتابة التقارير الفنية' },
            ],
            sem2: [
                { code: 'ECE213', name: 'دوائر إلكترونية تناظرية(2)' },
                { code: 'ECE252', name: 'تنظيم حاسبات' },
                { code: 'ECE253', name: 'متحكمات دقيقة وربط بالأنظمة' },
                { code: 'ECE236', name: 'مبادئ نظم الاتصالات' },
                { code: 'EPM271', name: 'ديناميكا النظم وعناصر التحكم' },
                { code: 'HUMX53', name: 'مهارات البحث والتحليل' },
            ]
        },
        third: {
            sem1: [
                { code: 'ECE353', name: 'الدوائر المتكاملة التناظرية' },
                { code: 'EPM323', name: 'الطاقة والطاقة المتجددة' },
                { code: 'ECE321', name: 'موجات كهرومغناطيسية' },
                { code: 'ECE331', name: 'أنظمة اتصالات تناظرية ورقمية' },
                { code: 'EPM372', name: 'هندسة التحكم الآلي' },
                { code: 'HUMX61E', name: 'اقتصاد هندسي واستثمار' },
            ],
            sem2: [
                { code: 'ECE354', name: 'نظم للأنظمة المدمجة' },
                { code: 'ECE317', name: 'تصميم الدوائر المتكاملة الرقمية' },
                { code: 'ECE3E1', name: 'مقرر اختياري(1)', elective: true },
                { code: 'ECE3E2', name: 'مقرر اختياري(2)', elective: true },
                { code: 'ECE324', name: 'إلكترونيات ضوئية' },
                { code: 'HUMX32E', name: 'إدارة مشروعات الهندسة الكهربية' },
            ]
        },
        fourth: {
            sem1: [
                { code: 'ECE400', name: 'مشروع(1)' },
                { code: 'ECE432', name: 'معالجة إشارات رقمية' },
                { code: 'ECE421', name: 'هوائيات وانتشار موجات' },
                { code: 'ECE4E1', name: 'مقرر اختياري(3)', elective: true },
                { code: 'ECE4E2', name: 'مقرر اختياري(4)', elective: true },
                { code: 'HUMX41E', name: 'أخلاقيات المهنة' },
            ],
            sem2: [
                { code: 'ECE401', name: 'مشروع(2)' },
                { code: 'ECE422', name: 'أنظمة ميكروويڤية' },
                { code: 'ECE4E3', name: 'مقرر اختياري(5)', elective: true },
                { code: 'ECE4E4', name: 'مقرر اختياري(6)', elective: true },
                { code: 'HUMX73E', name: 'الأثر البيئي للمشروعات' },
            ]
        }
    };

    // Power Specialization subjects
    const powerSubjects = {
        second: {
            sem1: [
                { code: 'PHM212', name: 'التحليل العددي' },
                { code: 'EPM232', name: 'ديناميكا نظم القوى الكهربية' },
                { code: 'EPM211P', name: 'محطات محولات الجهد العالي' },
                { code: 'EPM221', name: 'تحويل طاقة' },
                { code: 'ECE237', name: 'معالجة إشارات' },
                { code: 'HUMX12P', name: 'كتابة التقارير الفنية' },
            ],
            sem2: [
                { code: 'EPM212', name: 'طاقة جديدة ومتجددة' },
                { code: 'EPM215', name: 'متحكمات دقيقة' },
                { code: 'EPM222', name: 'آلات كهربية(1)' },
                { code: 'EPM231', name: 'نقل وتوزيع الطاقة الكهربية(1)' },
                { code: 'ECE238', name: 'نظم اتصالات' },
                { code: 'HUMX53P', name: 'مهارات البحث والتحليل' },
            ]
        },
        third: {
            sem1: [
                { code: 'EPM4E1', name: 'مقرر اختياري(1)', elective: true },
                { code: 'EPM321', name: 'آلات كهربية(2)' },
                { code: 'EPM341', name: 'هندسة الجهد العالي(1)' },
                { code: 'EPM381', name: 'التحكم الآلي' },
                { code: 'EPM351', name: 'إلكترونيات القوى(1)' },
            ],
            sem2: [
                { code: 'EPM332', name: 'تحليل نظم القوى الكهربية(1)' },
                { code: 'EPM333', name: 'توليد واقتصاديات تشغيل القوى الكهربية' },
                { code: 'EPM3E2', name: 'مقرر اختياري(2)', elective: true },
                { code: 'EPM3E3', name: 'مقرر اختياري(3)', elective: true },
                { code: 'EPM334', name: 'تخطيط الشبكات الكهربية' },
                { code: 'HUMX32P', name: 'إدارة المشروعات' },
            ]
        },
        fourth: {
            sem1: [
                { code: 'EPM400', name: 'المشروع' },
                { code: 'EPM412', name: 'استخدامات الطاقة الكهربية' },
                { code: 'EPM413', name: 'إلكترونيات القوى(2)' },
                { code: 'EPM481', name: 'التحكم في نظم القوى الكهربية' },
                { code: 'EPM4E4', name: 'مقرر اختياري(4)', elective: true },
                { code: 'HUMX73P', name: 'الأثر البيئي للمشروعات' },
            ],
            sem2: [
                { code: 'EPM431', name: 'تحليل نظم القوى الكهربية(2)' },
                { code: 'EPM414', name: 'هندسة الجهد العالي(2)' },
                { code: 'EPM4E5', name: 'مقرر اختياري(5)', elective: true },
                { code: 'EPM452', name: 'تسيير كهربي' },
                { code: 'EPM462', name: 'وقاية نظم القوى الكهربية' },
                { code: 'HUMX34', name: 'إدارة أعمال' },
            ]
        }
    };

    const years = ['الفرقة الأولى', 'الفرقة الثانية', 'الفرقة الثالثة', 'الفرقة الرابعة'];
    const yearKeys = ['first', 'second', 'third', 'fourth'];

    const getSubjects = () => {
        if (activeYear === 0) return sharedFirstYear;
        return specialization === 'ece' ? eceSubjects : powerSubjects;
    };

    const renderSubjectsTable = (subjectList) => (
        <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Table size="small">
                <TableHead>
                    <TableRow sx={{ background: 'linear-gradient(135deg, #f57c00 0%, #e65100 100%)' }}>
                        <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center', py: 2 }}>كود المادة</TableCell>
                        <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center', py: 2 }}>اسم المادة</TableCell>
                        <TableCell sx={{ color: 'white', fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center', py: 2 }}>نوع</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {subjectList.map((subj, idx) => (
                        <TableRow
                            key={idx}
                            sx={{
                                background: idx % 2 === 0 ? 'linear-gradient(to left, #f8f9fa, #fff)' : 'white',
                                transition: 'background 0.2s',
                                '&:hover': { background: '#fff3e0' }
                            }}
                        >
                            <TableCell sx={{ textAlign: 'center', py: 1.5 }}>
                                <Chip
                                    label={subj.code}
                                    size="small"
                                    sx={{
                                        fontFamily: 'monospace',
                                        fontWeight: 'bold',
                                        bgcolor: '#f57c00',
                                        color: 'white',
                                        fontSize: '0.75rem'
                                    }}
                                />
                            </TableCell>
                            <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'right', fontWeight: 500 }}>{subj.name}</TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                                {subj.elective ? (
                                    <Chip
                                        label="اختياري"
                                        size="small"
                                        sx={{ fontFamily: 'Cairo', fontSize: '0.7rem', bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 'bold' }}
                                    />
                                ) : (
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4caf50' }}>
                                        <CheckCircleIcon sx={{ fontSize: 18, mr: 0.5 }} />
                                        <Typography variant="caption" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>إجباري</Typography>
                                    </Box>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Hero Section */}
            <Paper
                elevation={0}
                sx={{
                    p: 5,
                    mb: 4,
                    background: 'linear-gradient(135deg, #f57c00 0%, #e65100 100%)',
                    color: 'white',
                    borderRadius: 4,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)',
                    }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, position: 'relative' }}>
                    <ElectricalServicesIcon sx={{ fontSize: 60, mr: 2, opacity: 0.9 }} />
                    <Typography variant="h3" component="h1" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                        قسم الهندسة الكهربية
                    </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontFamily: 'Cairo', textAlign: 'center', opacity: 0.85 }}>
                    Electrical Engineering Department
                </Typography>
            </Paper>

            {/* About Section */}
            <Paper elevation={3} sx={{ p: 4, mb: 4, borderRight: '5px solid #f57c00', borderRadius: 3, background: 'linear-gradient(to left, #f8f9fa, white)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ bgcolor: '#f57c00', p: 1.5, borderRadius: 2, mr: 2 }}>
                        <ElectricalServicesIcon sx={{ fontSize: 30, color: 'white' }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                        نبذة عن القسم
                    </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontFamily: 'Cairo', lineHeight: 2.2, textAlign: 'justify', color: '#333' }}>
                    يهدف قسم الهندسة الكهربائية إلى تحقيق التميز والريادة في التعليم الهندسي في مجال الهندسة الكهربائية محلياً وإقليمياً ودولياً لإثراء حياة الأفراد والمجتمع والبيئة المحيطة كما يهدف إلى توفير مستوى تعليمي راق للخريجين من خلال أنشطة تدريبية ذات صلة بالمجتمع تجعلهم متميزين علمياً ومهنياً وخلقياً وذوي قدرة تنافسية عالية.
                </Typography>
            </Paper>

            {/* Programs Section */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 4, height: '100%', borderTop: '5px solid #2196f3', borderRadius: 3, transition: 'all 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ bgcolor: '#e3f2fd', p: 1.5, borderRadius: 2, mr: 2 }}>
                                <SettingsInputAntennaIcon sx={{ color: '#2196f3', fontSize: 28 }} />
                            </Box>
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                                برنامج هندسة الإلكترونيات والاتصالات
                            </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontFamily: 'Cairo', lineHeight: 2, textAlign: 'justify', mb: 2, color: '#555' }}>
                            يهدف برنامج هندسة الإلكترونيات والاتصالات لتقديم المعرفة التحليلية والتكنولوجية المتقدمة في مختلف مجالات الإلكترونيات ونظم الاتصالات.
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Chip label="تصميم الأنظمة الإلكترونية والدوائر" sx={{ fontFamily: 'Cairo', bgcolor: '#e3f2fd' }} />
                            <Chip label="تصميم شبكات الاتصالات الحديثة" sx={{ fontFamily: 'Cairo', bgcolor: '#e3f2fd' }} />
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 4, height: '100%', borderTop: '5px solid #4caf50', borderRadius: 3, transition: 'all 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ bgcolor: '#e8f5e9', p: 1.5, borderRadius: 2, mr: 2 }}>
                                <BoltIcon sx={{ color: '#4caf50', fontSize: 28 }} />
                            </Box>
                            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                                برنامج هندسة القوى والآلات الكهربية
                            </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontFamily: 'Cairo', lineHeight: 2, textAlign: 'justify', mb: 2, color: '#555' }}>
                            إعداد خريج مبدع ومتمكن في مجال هندسة القوى والآلات الكهربية، قادر على تصميم وتشغيل وصيانة أنظمة القوى الكهربائية.
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Chip label="تطوير البنية التحتية الكهربائية" sx={{ fontFamily: 'Cairo', bgcolor: '#e8f5e9' }} />
                            <Chip label="رفع كفاءة استخدام الطاقة" sx={{ fontFamily: 'Cairo', bgcolor: '#e8f5e9' }} />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Subjects Section */}
            <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ bgcolor: '#fff3e0', p: 1.5, borderRadius: 2, mr: 2 }}>
                        <MenuBookIcon sx={{ fontSize: 30, color: '#f57c00' }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                        المواد الدراسية
                    </Typography>
                </Box>

                {/* Specialization Toggle - Only show for years 2-4 */}
                {activeYear > 0 && (
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                        <ToggleButtonGroup
                            value={specialization}
                            exclusive
                            onChange={(e, v) => v && setSpecialization(v)}
                            sx={{
                                direction: 'ltr',
                                bgcolor: '#f5f5f5',
                                borderRadius: 2,
                                p: 0.5
                            }}
                        >
                            <ToggleButton value="ece" sx={{ fontFamily: 'Cairo', px: 3, borderRadius: '8px !important', '&.Mui-selected': { bgcolor: '#2196f3', color: 'white' } }}>
                                <SettingsInputAntennaIcon sx={{ mr: 1 }} />
                                الإلكترونيات والاتصالات
                            </ToggleButton>
                            <ToggleButton value="power" sx={{ fontFamily: 'Cairo', px: 3, borderRadius: '8px !important', '&.Mui-selected': { bgcolor: '#4caf50', color: 'white' } }}>
                                <BoltIcon sx={{ mr: 1 }} />
                                القوى والآلات الكهربية
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                )}

                <Tabs
                    value={activeYear}
                    onChange={(e, v) => setActiveYear(v)}
                    variant="fullWidth"
                    sx={{
                        mb: 3,
                        bgcolor: '#f5f5f5',
                        borderRadius: 2,
                        p: 0.5,
                        '& .MuiTab-root': {
                            fontFamily: 'Cairo',
                            fontWeight: 'bold',
                            borderRadius: 1.5,
                            minHeight: 48,
                            transition: 'all 0.2s'
                        },
                        '& .Mui-selected': {
                            bgcolor: '#f57c00',
                            color: 'white !important'
                        },
                        '& .MuiTabs-indicator': { display: 'none' }
                    }}
                >
                    {years.map((year, idx) => (
                        <Tab key={idx} label={year} />
                    ))}
                </Tabs>

                {activeYear === 0 && (
                    <Box sx={{ mb: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1976d2' }}>
                            الفرقة الأولى مشتركة لجميع التخصصات
                        </Typography>
                    </Box>
                )}

                {yearKeys.map((yearKey, idx) => {
                    const subjects = getSubjects();
                    return activeYear === idx && subjects[yearKey] && (
                        <Box key={yearKey}>
                            <Accordion defaultExpanded sx={{ mb: 2, borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#fff3e0' }}>
                                    <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#f57c00' }}>الفصل الدراسي الأول</Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 2 }}>
                                    {renderSubjectsTable(subjects[yearKey].sem1)}
                                </AccordionDetails>
                            </Accordion>
                            <Accordion defaultExpanded sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#fff3e0' }}>
                                    <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#f57c00' }}>الفصل الدراسي الثاني</Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 2 }}>
                                    {renderSubjectsTable(subjects[yearKey].sem2)}
                                </AccordionDetails>
                            </Accordion>
                        </Box>
                    );
                })}
            </Paper>

            {/* Faculty Section - Collapsible */}
            <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: showFaculty ? 3 : 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ bgcolor: '#fff3e0', p: 1.5, borderRadius: 2, mr: 2 }}>
                            <PersonIcon sx={{ fontSize: 30, color: '#f57c00' }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                                أعضاء هيئة التدريس
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                {faculty.length} عضو هيئة تدريس + {assistants.length} من الهيئة المعاونة
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant={showFaculty ? 'outlined' : 'contained'}
                        color="warning"
                        onClick={() => setShowFaculty(!showFaculty)}
                        endIcon={showFaculty ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        sx={{
                            fontFamily: 'Cairo',
                            fontWeight: 'bold',
                            borderRadius: 2,
                            px: 3
                        }}
                    >
                        {showFaculty ? 'إخفاء' : 'عرض الأعضاء'}
                    </Button>
                </Box>

                <Collapse in={showFaculty}>
                    <Grid container spacing={2}>
                        {faculty.map((member, index) => {
                            const colors = getRankColor(member.rank);
                            return (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Paper
                                        elevation={2}
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            borderRight: `4px solid ${colors.bg}`,
                                            transition: 'all 0.2s',
                                            '&:hover': { transform: 'translateX(-5px)', boxShadow: 4 }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar sx={{ bgcolor: colors.bg, color: colors.text, mr: 2, width: 45, height: 45 }}>
                                                <SchoolIcon />
                                            </Avatar>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '0.9rem' }} noWrap>
                                                    {member.name}
                                                </Typography>
                                                <Chip
                                                    label={member.role}
                                                    size="small"
                                                    sx={{
                                                        fontFamily: 'Cairo',
                                                        fontSize: '0.65rem',
                                                        height: 22,
                                                        bgcolor: `${colors.bg}20`,
                                                        color: colors.bg,
                                                        fontWeight: 'bold',
                                                        mt: 0.5
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>
                            );
                        })}
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 2 }}>
                        أعضاء الهيئة المعاونة
                    </Typography>
                    <Grid container spacing={2}>
                        {assistants.map((member, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Paper
                                    elevation={2}
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        borderRight: '4px solid #9e9e9e',
                                        transition: 'all 0.2s',
                                        '&:hover': { transform: 'translateX(-5px)', boxShadow: 4 }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Avatar sx={{ bgcolor: '#9e9e9e', mr: 2, width: 45, height: 45 }}>
                                            <SchoolIcon />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                {member.name}
                                            </Typography>
                                            <Chip label={member.role} size="small" sx={{ fontFamily: 'Cairo', fontSize: '0.65rem', height: 22, mt: 0.5 }} />
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Collapse>
            </Paper>

            {/* Labs Section */}
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, background: 'linear-gradient(135deg, #f5f5f5 0%, #fff3e0 100%)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ bgcolor: '#f57c00', p: 1.5, borderRadius: 2, mr: 2 }}>
                        <ScienceIcon sx={{ fontSize: 30, color: 'white' }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                        معامل القسم
                    </Typography>
                </Box>
                <Grid container spacing={2}>
                    {labs.map((lab, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Paper
                                elevation={1}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    transition: 'all 0.2s',
                                    '&:hover': { transform: 'translateX(-3px)', boxShadow: 3, borderRight: '3px solid #4caf50' }
                                }}
                            >
                                <CheckCircleIcon sx={{ color: '#4caf50', mr: 1.5, fontSize: 22 }} />
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', fontWeight: 500 }}>
                                    {lab}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Paper>
        </Container>
    );
}
