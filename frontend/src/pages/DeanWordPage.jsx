import React from 'react';
import { Container, Typography, Box, Paper, Avatar } from '@mui/material';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

export default function DeanWordPage() {
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
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', textAlign: 'center' }}>
                    كلمة عميد الكلية
                </Typography>
            </Paper>

            {/* Dean's Word */}
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, position: 'relative' }}>
                <FormatQuoteIcon sx={{ fontSize: 60, color: '#FFC107', opacity: 0.3, position: 'absolute', top: 20, right: 20 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                    <Avatar
                        sx={{
                            width: 120,
                            height: 120,
                            bgcolor: '#0A2342',
                            fontSize: '2rem',
                            fontFamily: 'Cairo',
                            mb: 2
                        }}
                    >
                        أ.د
                    </Avatar>
                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                        أ.د. أحمد محمد حسن
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontFamily: 'Cairo', color: 'text.secondary' }}>
                        عميد كلية الهندسة - جامعة بني سويف
                    </Typography>
                </Box>

                <Box sx={{ px: { xs: 2, md: 6 } }}>
                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', lineHeight: 2.2, textAlign: 'justify', mb: 3 }}>
                        تعتبر كليات الهندسة قاطرة التقدم والنهضة للأمم التي تنشد التطور والرقي. ولقد تأخر إنشاء وبدء الدراسة لكلية الهندسة بمحافظة بني سويف سنوات طويلة، ولكن بحمد الله بدأت الدراسة بكلية الهندسة جامعة بني سويف بالقرار الوزاري رقم 3762 لسنة 9/12/2009 على أن تتم الدراسة طبقاً للائحة الداخلية لمرحلة البكالوريوس لكلية الهندسة جامعة القاهرة والتي بدأت في العام الدراسي 2009-2010 لبرنامج هندسة الإنشاءات بنظام الساعات المعتمدة.
                    </Typography>

                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', lineHeight: 2.2, textAlign: 'justify', mb: 3 }}>
                        وقد صار لزاماً على الكلية إعادة النظر في نظام الدراسة بالساعات المعتمدة وتعديل اللائحة لتدارك السلبيات التي ظهرت عند تطبيق هذا النظام، وبدراسة متطلبات وظروف محافظة بني سويف ومنطقة شمال الصعيد تم تعديل اللائحة الداخلية الجديدة لمرحلة البكالوريوس لتسمح بدراسة برنامج الهندسة المدنية (عام) بنظام الفصلين.
                    </Typography>

                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', lineHeight: 2.2, textAlign: 'justify', mb: 3 }}>
                        وقد روعي عند وضع اللائحة التوازنات المطلوبة بين الساعات الدراسية لكل من المقررات الأساسية والإنسانية والهندسية والتطبيقية والاختيارية التخصصية. وجاري استكمال المتطلبات الأساسية حتى تتمكن الكلية من بدء الدراسة بقسم الهندسة المعمارية في العام الدراسي القادم مع توالي فتح تخصصات جديدة في الأعوام القادمة.
                    </Typography>

                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', lineHeight: 2.2, textAlign: 'justify', mb: 3 }}>
                        وتضع إدارة الكلية النشاط الطلابي كهدف أساسي وتربوي لتنمية المهارات البشرية للطلاب من خلال مجموعة من الأنشطة الاجتماعية والفنية والكشفية والرياضية المتنوعة.
                    </Typography>

                    <Typography variant="body1" sx={{ fontFamily: 'Cairo', lineHeight: 2.2, textAlign: 'justify' }}>
                        وتأمل إدارة الكلية بتعاون وتكاتف جميع أفراد أسرة الكلية من الطلاب والعاملين وأعضاء هيئة التدريس من المشاركة في مشروع نهضة مصر من خلال النهوض بالمجتمع الجامعي في بني سويف مما يؤثر بإيجابية على نهضة مجتمع محافظة بني سويف.
                    </Typography>
                </Box>

                <FormatQuoteIcon sx={{ fontSize: 60, color: '#FFC107', opacity: 0.3, position: 'absolute', bottom: 20, left: 20, transform: 'rotate(180deg)' }} />
            </Paper>
        </Container>
    );
}
