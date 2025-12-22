import React from 'react';
import { Container, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Accordion, AccordionSummary, AccordionDetails, Chip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GavelIcon from '@mui/icons-material/Gavel';

export default function RegulationsPage() {
    const gradingTable = [
        { grade: 'ممتاز', percentage: 'من 85% فأكثر' },
        { grade: 'جيد جداً', percentage: 'من 75% إلى أقل من 85%' },
        { grade: 'جيد', percentage: 'من 65% إلى أقل من 75%' },
        { grade: 'مقبول', percentage: 'من 50% إلى أقل من 65%' },
        { grade: 'ضعيف', percentage: 'من 30% إلى أقل من 50%' },
        { grade: 'ضعيف جداً', percentage: 'أقل من 30%' },
    ];

    const sections = [
        {
            title: 'مادة 1: أهداف الكلية',
            content: `الرؤية: كلية هندسة متميزة كمؤسسة علمية هندسية لخلق كوادر تواكب التطور العلمي وتساهم في خدمة المجتمع وصناعة التكنولوجيا.

الرسالة: الارتقاء المستمر بمستوى التعليم والمقررات والبحث العلمي من أجل خدمة العملية التعليمية وتحقيق أهداف الكلية في ظل منظومة وسياسة جامعة بني سويف.

الأهداف:
• إعداد خريجين متخصصين في مجالات العلوم الهندسية والتطبيقات العملية والتقنية قادرين على المنافسة في سوق العمل المحلي والعالمي وخدمة المجتمع.
• القيام بالدراسات والبحوث في مجالات العلوم الهندسية والتطبيقية للعمل على تطوير المجتمع وحل مشاكله.
• المساهمة مع مؤسسات الدولة في التخطيط للمستقبل عن طريق المشاركة في وضع استراتيجيات التنمية والنهضة.`
        },
        {
            title: 'مادة 2: شروط القبول',
            content: 'يشترط في القبول لكلية الهندسة جامعة بني سويف الحصول على الثانوية العامة (القسم العلمي) أو ما يعادلها ويكون التقدم عن طريق مكتب التنسيق طبقاً لقواعد المجلس الأعلى للجامعات بوزارة التعليم العالي كل عام.'
        },
        {
            title: 'مادة 3: أقسام الكلية',
            content: `1. قسم الهندسة المدنية
2. قسم الهندسة المعمارية
3. قسم الهندسة الميكانيكية (تحت التأسيس)
4. قسم الهندسة الكهربية

ويدخل في نطاق التدريس لكل قسم المقررات التي تندرج في تخصصه ويمكن الاستعانة لتدريس بعض المقررات الأساسية أو الإنسانية بأعضاء هيئة التدريس في أقسام وكليات جامعة بني سويف.`
        },
        {
            title: 'مادة 4: نظام الدراسة',
            content: 'يتم تطبيق الدراسة بنظام الفصلين على الطلاب المقيدين بالسنة الإعدادية والمنقولين إلى السنة الأولى في العام الدراسي 2012-2013 بعد إقرار هذه اللائحة.'
        },
        {
            title: 'مادة 6: مدة الدراسة',
            content: 'مدة الدراسة لنيل درجة البكالوريوس خمس سنوات تبدأ بسنة إعدادية عامة لجميع الطلاب ويكون التخصص بعد ذلك طبقاً لما هو وارد في جداول المقررات الدراسية.'
        },
        {
            title: 'مادة 9: التدريب العملي',
            content: 'يجب أن يؤدي كل طالب تدريباً عملياً ويحدد كل مجلس علمي نظاماً للتدريب العملي لطلاب السنوات الأولى والثانية والثالثة لمدة ثلاثة أسابيع على الأقل سنوياً داخل الكلية أو خارجها خلال العطلة الصيفية وينفذ تحت إشراف هيئة التدريس. ولا تمنح شهادة التخرج إلا للطلاب الذين أتموا بنجاح التدريب العملي.'
        },
        {
            title: 'مادة 10: الامتحانات',
            content: 'تعقد امتحانات النقل وامتحانات البكالوريوس في نهاية كل فصل دراسي في المقررات التي درسها الطالب في فرقته. ويشترط لدخول الطالب امتحان أي مقرر أن يكون مستوفياً نسبة حضور لا تقل عن 75% من الفترات المخصصة للدروس.'
        },
        {
            title: 'مادة 11: مشروع البكالوريوس',
            content: 'يقوم طلبة السنة النهائية بإعداد مشروع البكالوريوس وتحدد مجالس الأقسام المختصة موضوعه وتخصص له فترة لا تقل عن أربعة أسابيع ولا تزيد عن ستة أسابيع بعد الامتحان التحريري للفصل الدراسي الثاني من السنة الرابعة.'
        },
        {
            title: 'مادة 12: شروط النقل',
            content: `ينقل الطالب من الفرقة المقيد بها إلى الفرقة التي تليها إذا نجح في جميع المقررات أو كان راسباً أو غائباً فيما لا يزيد على مقررين من فرقته أو من فرقة أدنى.

كما يسمح للطالب الراسب في مقررات العلوم الإنسانية واللغات الفنية (بحد أقصى ثلاث مقررات) بالانتقال إلى الفرقة التالية.

يؤدي الطالب الامتحان فيما رسب فيه من مقررات التخلف في نهاية العطلة الصيفية، ويعتبر نجاحه في هذه الحالة بتقدير مقبول وبدرجة تقل درجة واحدة عن 65% من الدرجة القصوى للمادة.`
        }
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
                    <GavelIcon sx={{ fontSize: 50, mr: 2 }} />
                    <Typography variant="h3" component="h1" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                        اللائحة الداخلية
                    </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontFamily: 'Cairo', textAlign: 'center', opacity: 0.9 }}>
                    كلية الهندسة - جامعة بني سويف
                </Typography>
            </Paper>

            {/* Introduction */}
            <Paper elevation={2} sx={{ p: 4, mb: 4, borderRight: '4px solid #FFC107' }}>
                <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 2 }}>
                    مقدمة
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'Cairo', lineHeight: 2, textAlign: 'justify' }}>
                    بدأت الدراسة بكلية الهندسة جامعة بني سويف بالقرار الوزاري رقم 3762 لسنة 9/12/2009 على أن تتم الدراسة طبقاً للائحة الداخلية لمرحلة البكالوريوس لكلية الهندسة جامعة القاهرة والتي بدأت في العام الدراسي 2009-2010 بنظام الساعات المعتمدة. وقد تم الاسترشاد عند إعداد هذه اللائحة باللائحة الداخلية لكلية الهندسة جامعة القاهرة مع بعض التعديلات لتعظيم إيجابياتها وتطويرها وذلك لمواكبة التطور العالمي والمحلي في التعليم الهندسي.
                </Typography>
            </Paper>

            {/* Grading Table */}
            <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
                <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 3 }}>
                    نظام التقديرات (مادة 16)
                </Typography>
                <TableContainer>
                    <Table sx={{ minWidth: 400 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#0A2342' }}>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: 'white', textAlign: 'center' }}>التقدير</TableCell>
                                <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: 'white', textAlign: 'center' }}>النسبة المئوية</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {gradingTable.map((row, index) => (
                                <TableRow key={index} sx={{ '&:nth-of-type(odd)': { bgcolor: '#f5f5f5' } }}>
                                    <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'center' }}>
                                        <Chip
                                            label={row.grade}
                                            sx={{
                                                fontFamily: 'Cairo',
                                                bgcolor: index === 0 ? '#4caf50' : index === 1 ? '#8bc34a' : index === 2 ? '#cddc39' : index === 3 ? '#ffeb3b' : '#f44336',
                                                color: index <= 3 ? '#000' : '#fff'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontFamily: 'Cairo', textAlign: 'center' }}>{row.percentage}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Regulation Sections */}
            <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 3 }}>
                مواد اللائحة
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
                        <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                            {section.title}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ bgcolor: 'white' }}>
                        <Typography sx={{ fontFamily: 'Cairo', lineHeight: 2, whiteSpace: 'pre-line', textAlign: 'justify' }}>
                            {section.content}
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Container>
    );
}
