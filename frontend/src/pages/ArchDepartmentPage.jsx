import React, { useState } from 'react';
import { Container, Typography, Box, Paper, Grid, Card, CardContent, Avatar, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab, Accordion, AccordionSummary, AccordionDetails, Button, Collapse } from '@mui/material';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function ArchDepartmentPage() {
    const [activeYear, setActiveYear] = useState(0);
    const [showFaculty, setShowFaculty] = useState(false);

    const faculty = [
        { name: 'أ.د/ ريهام الدسوقي حامد', role: 'رئيس القسم', rank: 'head' },
        { name: 'أ.د/ محمد شكر ندا', role: 'أستاذ', rank: 'professor' },
        { name: 'أ.م.د/ سحر محسن رزق', role: 'أستاذ مساعد', rank: 'assistant' },
        { name: 'أ.م.د. إيمان بدوي أحمد محمود', role: 'أستاذ مساعد', rank: 'assistant' },
        { name: 'أ.م.د. مروة مصطفى الأشموني', role: 'أستاذ مساعد', rank: 'assistant' },
        { name: 'د. هبة حسن أحمد كامل إسماعيل', role: 'مدرس', rank: 'lecturer' },
        { name: 'د. نسمة محمد عبد المقصود', role: 'مدرس', rank: 'lecturer' },
        { name: 'د. هايدي عصام يوسف', role: 'مدرس', rank: 'lecturer' },
        { name: 'د. أحمد محمد طه علي', role: 'مدرس', rank: 'lecturer' },
        { name: 'د. هشام طاهر الليثي', role: 'مدرس', rank: 'lecturer' },
        { name: 'د. أيمن حسني محمد أبو العلا', role: 'مدرس', rank: 'lecturer' }
    ];

    const getRankColor = (rank) => {
        switch (rank) {
            case 'head': return { bg: '#FFC107', text: '#000' };
            case 'professor': return { bg: '#388e3c', text: '#fff' };
            case 'assistant': return { bg: '#2e7d32', text: '#fff' };
            case 'lecturer': return { bg: '#66bb6a', text: '#fff' };
            default: return { bg: '#9e9e9e', text: '#fff' };
        }
    };

    const subjects = {
        first: {
            sem1: [
                { code: 'ARC111', name: 'التصميم المعماري والإظهار المعماري(1)' },
                { code: 'ARC121', name: 'نظريات العمارة والتصميم(1)' },
                { code: 'ARC131', name: 'الإنشاء المعماري ومواد البناء(1)' },
                { code: 'PHM113A', name: 'الاحتمالات وإحصاء هندسية' },
                { code: 'CVE111A', name: 'نظرية الإنشاءات وخواص المواد' },
                { code: 'HUM1E1', name: 'مقرر اختياري(1)', elective: true },
            ],
            sem2: [
                { code: 'ARC112', name: 'التصميم المعماري(2)' },
                { code: 'ARC141', name: 'تاريخ العمارة(1)' },
                { code: 'ARC1141', name: 'الرسم المعماري والمهارات البصرية' },
                { code: 'ARC132', name: 'الإنشاء المعماري ومواد البناء(2)' },
                { code: 'HUM1E2', name: 'مقرر اختياري(2)', elective: true },
                { code: 'CVE112A', name: 'المساحة ونظم المعلومات الجغرافية' },
            ]
        },
        second: {
            sem1: [
                { code: 'ARC213', name: 'التصميم المعماري(3)' },
                { code: 'ARC222', name: 'نظريات العمارة والتصميم(2)' },
                { code: 'HUM2E1A', name: 'مقرر اختياري(3)', elective: true },
                { code: 'ARC233', name: 'الإنشاء المعماري وتكنولوجيا البناء(3)' },
                { code: 'ARC271', name: 'تاريخ ونظريات التخطيط العمراني' },
                { code: 'ARC261', name: 'التحكم البيئي والنظم البيئية المتكاملة(1)' },
            ],
            sem2: [
                { code: 'ARC214', name: 'التصميم المعماري(4)' },
                { code: 'ARC242', name: 'تاريخ العمارة(2)' },
                { code: 'ARC281', name: 'مقدمة في التصميم العمراني(1)' },
                { code: 'ARC234', name: 'الإنشاء المعماري وتكنولوجيا البناء(4)' },
                { code: 'HUMX45', name: 'الدراسات الإنسانية في العمارة' },
                { code: 'ARC262', name: 'التحكم البيئي والنظم البيئية المتكاملة(2)' },
            ]
        },
        third: {
            sem1: [
                { code: 'ARC315', name: 'التصميم المعماري(5)' },
                { code: 'ARC323', name: 'نظريات العمارة(3)' },
                { code: 'ARC391', name: 'التصميمات التنفيذية وقوانين البناء(1)' },
                { code: 'ARC372', name: 'التخطيط العمراني(1)' },
                { code: 'CVE313A', name: 'الإنشاءات المعدنية والخرسانة المسلحة' },
                { code: 'HUM3E1', name: 'مقرر اختياري(4)', elective: true },
            ],
            sem2: [
                { code: 'ARC316', name: 'التصميم المعماري(6)' },
                { code: 'ARC324', name: 'نظريات العمارة(4)' },
                { code: 'ARC392', name: 'التصميمات التنفيذية(2)' },
                { code: 'ARC382', name: 'تخطيط وتصميم المناطق السكنية' },
                { code: 'CVE314A', name: 'الأساسات والتربة' },
                { code: 'ARC3E2', name: 'مقرر اختياري(5)', elective: true },
            ]
        },
        fourth: {
            sem1: [
                { code: 'ARC400', name: 'مشروع التخرج(1)' },
                { code: 'HUMX38', name: 'العقود والمواصفات' },
                { code: 'ARC4E1', name: 'مقرر اختياري(6)', elective: true },
                { code: 'ARC4E2', name: 'مقرر اختياري(7)', elective: true },
                { code: 'HUMX73', name: 'الأثر البيئي للمشروعات' },
            ],
            sem2: [
                { code: 'ARC401', name: 'مشروع التخرج(2)' },
                { code: 'ARC4E3', name: 'مقرر اختياري(8)', elective: true },
                { code: 'ARC4E4', name: 'مقرر اختياري(9)', elective: true },
                { code: 'HUMX32', name: 'إدارة المشروعات' },
                { code: 'HUMX77', name: 'المجتمع وقضايا المواطنة' },
            ]
        }
    };

    const years = ['الفرقة الأولى', 'الفرقة الثانية', 'الفرقة الثالثة', 'الفرقة الرابعة'];
    const yearKeys = ['first', 'second', 'third', 'fourth'];

    const renderSubjectsTable = (subjectList) => (
        <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Table size="small">
                <TableHead>
                    <TableRow sx={{ background: 'linear-gradient(135deg, #388e3c 0%, #1b5e20 100%)' }}>
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
                                '&:hover': { background: '#e8f5e9' }
                            }}
                        >
                            <TableCell sx={{ textAlign: 'center', py: 1.5 }}>
                                <Chip
                                    label={subj.code}
                                    size="small"
                                    sx={{
                                        fontFamily: 'monospace',
                                        fontWeight: 'bold',
                                        bgcolor: '#388e3c',
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
                                        sx={{ fontFamily: 'Cairo', fontSize: '0.7rem', bgcolor: '#fff3e0', color: '#f57c00', fontWeight: 'bold' }}
                                    />
                                ) : (
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#388e3c' }}>
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
                    background: 'linear-gradient(135deg, #388e3c 0%, #1b5e20 100%)',
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
                    <ArchitectureIcon sx={{ fontSize: 60, mr: 2, opacity: 0.9 }} />
                    <Typography variant="h3" component="h1" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                        قسم الهندسة المعمارية
                    </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontFamily: 'Cairo', textAlign: 'center', opacity: 0.85 }}>
                    Architecture Department
                </Typography>
            </Paper>

            {/* About Section */}
            <Paper elevation={3} sx={{ p: 4, mb: 4, borderRight: '5px solid #388e3c', borderRadius: 3, background: 'linear-gradient(to left, #f8f9fa, white)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ bgcolor: '#388e3c', p: 1.5, borderRadius: 2, mr: 2 }}>
                        <ArchitectureIcon sx={{ fontSize: 30, color: 'white' }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                        نبذة عن القسم
                    </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontFamily: 'Cairo', lineHeight: 2.2, textAlign: 'justify', mb: 2, color: '#333' }}>
                    يهدف قسم الهندسة المعمارية إلى تحقيق التميز والريادة في التعليم الهندسي في مجال الهندسة المعمارية محلياً وإقليمياً ودولياً لإثراء حياة الأفراد والمجتمع والبيئة المحيطة، كما يهدف إلى توفير مستوى تعليمي راق للخريجين من خلال تطبيق برامج تعليمية وتدريبية وبحثية ذات صلة بالمجتمع.
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'Cairo', lineHeight: 2.2, textAlign: 'justify', mb: 2, color: '#333' }}>
                    وكذا إضافة مقررات العلوم الإنسانية والثقافة العلمية لتنمية المهارات الشخصية والعامة نحو تشكيل شخصية الخريج معمارياً ليتناسب مع احتياج سوق العمل.
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'Cairo', lineHeight: 2.2, textAlign: 'justify', color: '#333' }}>
                    ويطمح قسم الهندسة المعمارية إلى أن يكون معترف به إقليمياً ودولياً في مجالات التنمية المستدامة وتكنولوجيا المعلومات.
                </Typography>
            </Paper>

            {/* Subjects Section */}
            <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ bgcolor: '#e8f5e9', p: 1.5, borderRadius: 2, mr: 2 }}>
                        <MenuBookIcon sx={{ fontSize: 30, color: '#388e3c' }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                        المواد الدراسية
                    </Typography>
                </Box>

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
                            bgcolor: '#388e3c',
                            color: 'white !important'
                        },
                        '& .MuiTabs-indicator': { display: 'none' }
                    }}
                >
                    {years.map((year, idx) => (
                        <Tab key={idx} label={year} />
                    ))}
                </Tabs>

                {yearKeys.map((yearKey, idx) => (
                    activeYear === idx && (
                        <Box key={yearKey}>
                            <Accordion defaultExpanded sx={{ mb: 2, borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#e8f5e9' }}>
                                    <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#388e3c' }}>الفصل الدراسي الأول</Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 2 }}>
                                    {renderSubjectsTable(subjects[yearKey].sem1)}
                                </AccordionDetails>
                            </Accordion>
                            <Accordion defaultExpanded sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#e8f5e9' }}>
                                    <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#388e3c' }}>الفصل الدراسي الثاني</Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 2 }}>
                                    {renderSubjectsTable(subjects[yearKey].sem2)}
                                </AccordionDetails>
                            </Accordion>
                        </Box>
                    )
                ))}
            </Paper>

            {/* Faculty Section - Collapsible */}
            <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: showFaculty ? 3 : 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ bgcolor: '#e8f5e9', p: 1.5, borderRadius: 2, mr: 2 }}>
                            <PersonIcon sx={{ fontSize: 30, color: '#388e3c' }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                                أعضاء هيئة التدريس
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>
                                {faculty.length} عضو هيئة تدريس
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant={showFaculty ? 'outlined' : 'contained'}
                        color="success"
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
                </Collapse>
            </Paper>

            {/* Focus Areas */}
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, background: 'linear-gradient(135deg, #f5f5f5 0%, #e8f5e9 100%)' }}>
                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 3 }}>
                    مجالات التميز
                </Typography>
                <Grid container spacing={2}>
                    {['التنمية المستدامة', 'تكنولوجيا المعلومات', 'التصميم المعماري', 'التخطيط العمراني'].map((area, index) => (
                        <Grid item xs={6} sm={3} key={index}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 2,
                                    textAlign: 'center',
                                    borderRadius: 2,
                                    borderTop: '3px solid #388e3c',
                                    transition: 'all 0.2s',
                                    '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 }
                                }}
                            >
                                <Typography variant="body2" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#388e3c' }}>
                                    {area}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Paper>
        </Container>
    );
}
