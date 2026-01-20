import React, { useState } from 'react';
import { Container, Typography, Box, Paper, Grid, Card, CardContent, Avatar, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab, Accordion, AccordionSummary, AccordionDetails, Button, Collapse, IconButton } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function CivilDepartmentPage() {
    const [activeYear, setActiveYear] = useState(0);
    const [showFaculty, setShowFaculty] = useState(false);

    const faculty = [
        { name: 'أ.د/ عمرو الخولي', role: 'رئيس القسم', rank: 'head' },
        { name: 'أ.د/ أحمد محمد أحمد حسن بخيت', role: 'عميد الكلية', rank: 'dean' },
        { name: 'أ.د/ أحمد شعبان', role: 'أستاذ', rank: 'professor' },
        { name: 'أ.د/ أحمد زيدان', role: 'أستاذ', rank: 'professor' },
        { name: 'أ.د/ أحمد محمد كامل التهامي', role: 'أستاذ', rank: 'professor' },
        { name: 'أ.د/ كمال الغمري متولي محمد', role: 'أستاذ', rank: 'professor' },
        { name: 'أ.م.د/ وائل نشأت عبد السميع عبد الغني', role: 'أستاذ مساعد', rank: 'assistant' },
        { name: 'أ.م.د/ محمد نبيل علي بيومي', role: 'أستاذ مساعد', rank: 'assistant' },
        { name: 'أ.م.د/ أماني طلعت عبد القادر حسونه', role: 'أستاذ مساعد', rank: 'assistant' },
        { name: 'أ.م.د/ ناصر زكي أحمد أبو القاسم', role: 'أستاذ مساعد', rank: 'assistant' },
        { name: 'أ.م.د/ محمد عبد السلام إبراهيم عرب', role: 'أستاذ مساعد', rank: 'assistant' },
        { name: 'أ.م.د/ محمود عبد العزيز عبد المحسن المندوه', role: 'أستاذ مساعد', rank: 'assistant' },
        { name: 'أ.م.د/ شرين أحمد إبراهيم زكي', role: 'أستاذ مساعد', rank: 'assistant' },
        { name: 'أ.م.د/ وائل صلاح الدين زكي', role: 'أستاذ مساعد', rank: 'assistant' },
        { name: 'د. سحر عبد السلام مصطفى أحمد', role: 'مدرس', rank: 'lecturer' },
        { name: 'د. محمود سيد محمود', role: 'مدرس', rank: 'lecturer' },
        { name: 'د. عمرو علي حسن فرج البنا', role: 'مدرس', rank: 'lecturer' },
        { name: 'د. فتحي محمود فتحي', role: 'مدرس', rank: 'lecturer' },
        { name: 'د. خالد محمد يوسف أمان', role: 'مدرس', rank: 'lecturer' },
        { name: 'د. أحمد سعد ربيع', role: 'مدرس', rank: 'lecturer' },
        { name: 'د. محمود كمال محمد طه', role: 'مدرس', rank: 'lecturer' },
        { name: 'د. دينا علي عبد العزيز حسين', role: 'مدرس', rank: 'lecturer' }
    ];

    const getRankColor = (rank) => {
        switch (rank) {
            case 'head': return { bg: '#FFC107', text: '#000' };
            case 'dean': return { bg: '#4caf50', text: '#fff' };
            case 'professor': return { bg: '#1976d2', text: '#fff' };
            case 'assistant': return { bg: '#0288d1', text: '#fff' };
            case 'lecturer': return { bg: '#78909c', text: '#fff' };
            default: return { bg: '#9e9e9e', text: '#fff' };
        }
    };

    const subjects = {
        first: {
            sem1: [
                { code: 'PHM111', name: 'الجبر الخطي والتكامل متعدد المتغيرات' },
                { code: 'PHM131', name: 'ميكانيكا الأجسام الجاسئة' },
                { code: 'CVE111', name: 'تحليل إنشاءات(1)' },
                { code: 'CVE131', name: 'رسم مدني(1)' },
                { code: 'CVE121', name: 'المساحة(1)' },
            ],
            sem2: [
                { code: 'CVE112', name: 'ميكانيكا إنشاءات(1)' },
                { code: 'CVE113', name: 'مقاومة وتكنولوجيا المواد(1)' },
                { code: 'CVE122', name: 'المساحة(2)' },
                { code: 'CVE114', name: 'جيولوجيا هندسية' },
                { code: 'HUMX52', name: 'مهارات العرض والاتصال' },
                { code: 'PHM113', name: 'الاحتمالات والإحصاء' },
            ]
        },
        second: {
            sem1: [
                { code: 'CVE211', name: 'تحليل الإنشاءات(2)' },
                { code: 'CVE212', name: 'مقاومة وتكنولوجيا المواد(2)' },
                { code: 'CVE231', name: 'ميكانيكا الموائع' },
                { code: 'EPM211', name: 'التركيبات الكهربية ومعدات الإنشاء' },
                { code: 'ARC211', name: 'تخطيط وإنشاء ومواصفات معمارية' },
                { code: 'HUM2E1', name: 'مقرر اختياري(1)', elective: true },
            ],
            sem2: [
                { code: 'CVE213', name: 'ميكانيكا الإنشاءات(2)' },
                { code: 'CVE214', name: 'خرسانة مسلحة(1)' },
                { code: 'CVE221', name: 'هندسة الجيوماتكس' },
                { code: 'CVE232', name: 'هندسة الري والصرف' },
                { code: 'CVE215', name: 'إدارة مشروعات التشييد(1)' },
            ]
        },
        third: {
            sem1: [
                { code: 'CVE311', name: 'تحليل الإنشاءات(3)' },
                { code: 'CVE312', name: 'خرسانة مسلحة(2)' },
                { code: 'CVE313', name: 'منشآت معدنية(1)' },
                { code: 'CVE331', name: 'الهندسة الهيدروليكية' },
                { code: 'CVE321', name: 'ميكانيكا التربة(1)' },
                { code: 'CVE322', name: 'تخطيط النقل وهندسة المرور' },
            ],
            sem2: [
                { code: 'CVE314', name: 'ميكانيكا الإنشاءات(3)' },
                { code: 'CVE315', name: 'خرسانة مسلحة(3)' },
                { code: 'CVE316', name: 'منشآت معدنية(2)' },
                { code: 'CVE332', name: 'تصميمات أعمال الري(1)' },
                { code: 'CVE323', name: 'ميكانيكا التربة(2)' },
                { code: 'CVE412', name: 'إدارة مشروعات التشييد(2)' },
            ]
        },
        fourth: {
            sem1: [
                { code: 'CVE411', name: 'خرسانة مسلحة(4)' },
                { code: 'CVE421', name: 'هندسة الطرق والمطارات(1)' },
                { code: 'CVE422', name: 'أساسات(1)' },
                { code: 'CVE423', name: 'هندسة صحية وبيئية(1)' },
                { code: 'HUMX41', name: 'أخلاقيات المهنة' },
                { code: 'CVE4E1', name: 'مقرر اختياري(2)', elective: true },
            ],
            sem2: [
                { code: 'CVE424', name: 'أساسات(2)' },
                { code: 'CVE431', name: 'تصميمات أعمال الري(2)' },
                { code: 'HUMX61', name: 'اقتصاد هندسي' },
                { code: 'CVE4E2', name: 'مقرر اختياري(3)', elective: true },
                { code: 'CVE4E3', name: 'مقرر اختياري(4)', elective: true },
                { code: 'CVE400', name: 'مشروع التخرج' },
            ]
        }
    };

    const years = ['الفرقة الأولى', 'الفرقة الثانية', 'الفرقة الثالثة', 'الفرقة الرابعة'];
    const yearKeys = ['first', 'second', 'third', 'fourth'];

    const renderSubjectsTable = (subjectList) => (
        <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Table size="small">
                <TableHead>
                    <TableRow sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)' }}>
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
                                '&:hover': { background: '#e3f2fd' }
                            }}
                        >
                            <TableCell sx={{ textAlign: 'center', py: 1.5 }}>
                                <Chip
                                    label={subj.code}
                                    size="small"
                                    sx={{
                                        fontFamily: 'monospace',
                                        fontWeight: 'bold',
                                        bgcolor: '#1976d2',
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
                    background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
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
                    <ConstructionIcon sx={{ fontSize: 60, mr: 2, opacity: 0.9 }} />
                    <Typography variant="h3" component="h1" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                        قسم الهندسة المدنية
                    </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontFamily: 'Cairo', textAlign: 'center', opacity: 0.85 }}>
                    Civil Engineering Department
                </Typography>
            </Paper>

            {/* About Section */}
            <Paper elevation={3} sx={{ p: 4, mb: 4, borderRight: '5px solid #1976d2', borderRadius: 3, background: 'linear-gradient(to left, #f8f9fa, white)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ bgcolor: '#1976d2', p: 1.5, borderRadius: 2, mr: 2 }}>
                        <ConstructionIcon sx={{ fontSize: 30, color: 'white' }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                        نبذة عن القسم
                    </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontFamily: 'Cairo', lineHeight: 2.2, textAlign: 'justify', mb: 2, color: '#333' }}>
                    يهدف قسم الهندسة المدنية إلى تحقيق التميز والريادة في التعليم الهندسي في مجال الهندسة المدنية محلياً وإقليمياً ودولياً لإثراء حياة الأفراد والمجتمع والبيئة المحيطة كما يهدف إلى توفير مستوى تعليمي راق للخريجين من خلال أنشطة تدريبية ذات صلة بالمجتمع تجعلهم متميزين علمياً ومهنياً وخلقياً وذوي قدرة تنافسية عالية في مجال الهندسة المدنية.
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'Cairo', lineHeight: 2.2, textAlign: 'justify', color: '#333' }}>
                    ويركز البرنامج على تخريج مهندسين ذوي كفاءة عالية وقادرين على التعلم المستمر ومواكبة التطورات التكنولوجية المتلاحقة في مجالات الهندسة المدنية عن طريق تقديم برنامج دراسي متكامل يشتمل على المعلومات النظرية إلى جانب المهارات التقنية.
                </Typography>
            </Paper>

            {/* Subjects Section */}
            <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ bgcolor: '#e3f2fd', p: 1.5, borderRadius: 2, mr: 2 }}>
                        <MenuBookIcon sx={{ fontSize: 30, color: '#1976d2' }} />
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
                            bgcolor: '#1976d2',
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
                                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#e3f2fd' }}>
                                    <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1976d2' }}>الفصل الدراسي الأول</Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 2 }}>
                                    {renderSubjectsTable(subjects[yearKey].sem1)}
                                </AccordionDetails>
                            </Accordion>
                            <Accordion defaultExpanded sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#e3f2fd' }}>
                                    <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1976d2' }}>الفصل الدراسي الثاني</Typography>
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
                        <Box sx={{ bgcolor: '#e3f2fd', p: 1.5, borderRadius: 2, mr: 2 }}>
                            <PersonIcon sx={{ fontSize: 30, color: '#1976d2' }} />
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

            {/* Graduate Features */}
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, background: 'linear-gradient(135deg, #f5f5f5 0%, #e3f2fd 100%)' }}>
                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 2 }}>
                    مميزات الخريج
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'Cairo', lineHeight: 2, color: '#333' }}>
                    يتميز الخريج بالجدارات اللازمة لمواجهة التحديات التقنية والاجتماعية للمستقبل والحصول على فرص مناسبة للعمل بالإضافة إلى إمكانية مواصلة دراساته للحصول على درجات أعلى سواء في مصر أو أي دولة أخرى.
                </Typography>
            </Paper>
        </Container>
    );
}
