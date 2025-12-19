import React from 'react';
import { Container, Typography, Box, Paper, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BalanceIcon from '@mui/icons-material/Balance';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SchoolIcon from '@mui/icons-material/School';
import GroupsIcon from '@mui/icons-material/Groups';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ScienceIcon from '@mui/icons-material/Science';
import PublicIcon from '@mui/icons-material/Public';

export default function EthicsPage() {
    const sections = [
        {
            title: 'أولاً: أخلاقيات عضو هيئة التدريس في التدريس',
            icon: <SchoolIcon sx={{ color: '#0A2342' }} />,
            items: [
                'التأكد من إتقان المادة التي يقوم بتدريسها ويؤهل نفسه فيها قبل أن يقبل تدريسها',
                'التحضير الجيد لمادته مع الإحاطة الوافية بمستجداتها ليكون متمكناً من المادة',
                'الالتزام بمعايير الجودة في تحديد المستوى العلمي للمادة',
                'إعلان إطار المقرر وأهدافه ومحتوياته وأساليب تقييمه ومراجعه',
                'التغيير والتطوير في أساليب التدريس بشكل مشوق وممتع',
                'الالتزام باستخدام وقت التدريس استخداماً جيداً بما يحقق مصلحة الطلاب',
                'الامتناع عن إعطاء الدروس الخصوصية تحت أي مسمى',
                'أن يكون حسن المظهر ولديه ثقة بنفسه ويحسن اختيار الألفاظ'
            ]
        },
        {
            title: 'ثانياً: أخلاقيات عضو هيئة التدريس في التعامل مع الطلاب',
            icon: <GroupsIcon sx={{ color: '#0A2342' }} />,
            items: [
                'الاحترام المتبادل',
                'عدم التمييز بين الطلاب على أساس المعرفة أو الدين أو النوع',
                'احترام استقلال الطلاب فكل طالب من حقه أن يكون رأيه بنفسه',
                'أن يعلم الطالب كيف يفكر بأسلوب منطقي',
                'أن يكون قدوة حسنة للطلاب ونموذج للقيم الديموقراطية',
                'اكتشاف مهارات الطلاب المختلفة وتوجيهها'
            ]
        },
        {
            title: 'ثالثاً: أخلاقيات عضو هيئة التدريس في تقييم الطلاب',
            icon: <AssignmentIcon sx={{ color: '#0A2342' }} />,
            items: [
                'التقييم المستمر أو الدوري للطلاب مع إفادتهم بنتائج التقييم',
                'إخطار ولي الأمر بنتائج التقييم في الحالات التي تستوجب ذلك',
                'توخي العدل والجودة في تصميم الامتحان',
                'توخي الدقة والعدل والتزام النظام والانضباط في جلسات الامتحان',
                'منع الغش منعاً باتاً ومعاقبة الغش والشروع فيه',
                'تراعى الدقة التامة في تصحيح كراسات الإجابة مع المحافظة على سرية الأسماء'
            ]
        },
        {
            title: 'رابعاً: أخلاقيات عضو هيئة التدريس في التعامل مع زملائه',
            icon: <HandshakeIcon sx={{ color: '#0A2342' }} />,
            items: [
                'الاحترام المتبادل',
                'الالتزام بالصدق والأمانة',
                'التعاون والتبادل العلمي',
                'النصيحة والحرص على مصلحة الزملاء',
                'احترام المرتبة العلمية'
            ]
        },
        {
            title: 'خامساً: أخلاقيات عضو هيئة التدريس كباحث علمي',
            icon: <ScienceIcon sx={{ color: '#0A2342' }} />,
            items: [
                'الأمانة والمصداقية في التخطيط للبحث والتعامل مع البيانات',
                'عدم إجراء تعديلات في البيانات الخام للحصول على نتائج معينة',
                'الإشارة إلى المصادر التي اقتبس منها سواء كان الاقتباس حرفياً أو تلخيصاً',
                'إعطاء كل ذي حق حقه والإشارة إلى كل من ساهم في البحث',
                'التواضع والبعد عن أسلوب السخرية والاستهزاء',
                'الموضوعية وعدم التحيز',
                'يجب أن يهدف البحث إلى خدمة المجتمع ويكون ذا أهمية وأثر واضح'
            ]
        },
        {
            title: 'سادساً: أخلاقيات المهنة في خدمة الجامعة والمجتمع',
            icon: <PublicIcon sx={{ color: '#0A2342' }} />,
            items: [
                'ربط ما يعلمه الأستاذ باحتياجات المجتمع',
                'تقديم الخدمات للقطاعات المختلفة',
                'المساهمة في حل مشكلات المجتمع',
                'تقبل المهام المسندة إليه في النهوض بشئون الجامعة بصدر رحب',
                'القيام بكل ما في وسعه لمعاونة وتنمية الهيئة المعاونة له'
            ]
        }
    ];

    const studentEthics = [
        'التحلي بالأخلاق الحسنة مثل الصدق والأمانة والاحترام في كل الأعمال والنشاطات',
        'الانتظام في الدراسة والقيام بكافة المتطلبات الدراسية',
        'احترام أعضاء هيئة التدريس والموظفين والعمال وغيرهم من الطلاب',
        'احترام القواعد والترتيبات المتعلقة بسير المحاضرات والانتظام فيها',
        'الالتزام بعدم حضور المحاضرات غير المسجل فيها إلا بإذن خاص',
        'تقديم معلومات صحيحة ودقيقة عند التسجيل',
        'حمل البطاقة الجامعية أثناء التواجد داخل الجامعة',
        'اتباع الأنظمة الجامعية ولوائحها والتعليمات والقرارات',
        'الالتزام بالهدوء والسكينة داخل مرافق الجامعة والامتناع عن التدخين',
        'عدم الغش واللجوء إلى انتحال أعمال الغير'
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Hero Section */}
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    mb: 4,
                    background: 'linear-gradient(135deg, #0A2342 0%, #1a4a7a 100%)',
                    color: 'white',
                    borderRadius: 3
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <BalanceIcon sx={{ fontSize: 50, mr: 2 }} />
                    <Typography variant="h3" component="h1" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                        الميثاق الأخلاقي
                    </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontFamily: 'Cairo', textAlign: 'center', opacity: 0.9 }}>
                    ميثاق أخلاقيات ممارسة المهنة لكلية الهندسة
                </Typography>
            </Paper>

            {/* Introduction */}
            <Paper elevation={2} sx={{ p: 4, mb: 4, borderRight: '4px solid #FFC107' }}>
                <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 2 }}>
                    مصادر المعايير الأخلاقية
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'Cairo', lineHeight: 2 }}>
                    تستمد المعايير الأخلاقية من:
                </Typography>
                <List>
                    <ListItem>
                        <ListItemIcon><CheckCircleOutlineIcon sx={{ color: '#4caf50' }} /></ListItemIcon>
                        <ListItemText
                            primary="القيم الإنسانية الأساسية المنبثقة من الديانات السماوية مثل الأمانة والصدق وعدم إيذاء الغير"
                            primaryTypographyProps={{ fontFamily: 'Cairo' }}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><CheckCircleOutlineIcon sx={{ color: '#4caf50' }} /></ListItemIcon>
                        <ListItemText
                            primary="الثقافة السائدة في المجتمع"
                            primaryTypographyProps={{ fontFamily: 'Cairo' }}
                        />
                    </ListItem>
                </List>
            </Paper>

            {/* Faculty Ethics Sections */}
            <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 3 }}>
                أخلاقيات أعضاء هيئة التدريس
            </Typography>
            {sections.map((section, index) => (
                <Accordion key={index} sx={{ mb: 1, '&:before': { display: 'none' } }}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                            bgcolor: '#f8f9fa',
                            borderRight: '4px solid #FFC107',
                            '&:hover': { bgcolor: '#e9ecef' }
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {section.icon}
                            <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', ml: 2 }}>
                                {section.title}
                            </Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ bgcolor: 'white' }}>
                        <List dense>
                            {section.items.map((item, idx) => (
                                <ListItem key={idx}>
                                    <ListItemIcon>
                                        <CheckCircleOutlineIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item}
                                        primaryTypographyProps={{ fontFamily: 'Cairo', lineHeight: 1.8 }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </AccordionDetails>
                </Accordion>
            ))}

            <Divider sx={{ my: 4 }} />

            {/* Student Ethics */}
            <Paper elevation={2} sx={{ p: 4, borderTop: '4px solid #0A2342' }}>
                <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 3 }}>
                    أخلاقيات الطالب الجامعي
                </Typography>
                <List>
                    {studentEthics.map((item, index) => (
                        <ListItem key={index}>
                            <ListItemIcon>
                                <CheckCircleOutlineIcon sx={{ color: '#0A2342' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary={item}
                                primaryTypographyProps={{ fontFamily: 'Cairo', lineHeight: 1.8 }}
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Container>
    );
}
