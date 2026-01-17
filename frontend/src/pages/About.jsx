import React from 'react';
import { Box, Container, Typography, Paper, Grid } from '@mui/material';

export default function About() {
    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Typography variant="h3" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', textAlign: 'center', mb: 6 }}>
                عن الكلية
            </Typography>

            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
                        <Typography variant="h5" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#FFC107' }}>
                            الرؤية
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: 'Cairo', lineHeight: 1.8 }}>
                            تتطلع كلية الهندسة بجامعة بني سويف إلى أن تكون مؤسسة تعليمية وبحثية رائدة محلياً وإقليمياً، تساهم في تحقيق التنمية المستدامة من خلال تخريج مهندسين متميزين وبحوث علمية مبتكرة.
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
                        <Typography variant="h5" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#FFC107' }}>
                            الرسالة
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: 'Cairo', lineHeight: 1.8 }}>
                            تلتزم الكلية بإعداد خريجين مؤهلين علمياً ومهنياً وأخلاقياً، قادرين على المنافسة في سوق العمل، وتوفير بيئة محفزة للبحث العلمي، وتقديم خدمات استشارية وهندسية للمجتمع.
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 4, mt: 2 }}>
                        <Typography variant="h5" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                            كلمة العميد
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: 'Cairo', lineHeight: 1.8, mb: 2 }}>
                            أبنائي الطلاب، زملائي أعضاء هيئة التدريس، يسعدني أن أرحب بكم في رحاب كلية الهندسة. نحن نعمل جاهدين لتوفير بيئة تعليمية متميزة تواكب التطورات التكنولوجية العالمية.
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: 'Cairo', lineHeight: 1.8 }}>
                            إن كليتنا تزخر بنخبة من الأساتذة والعلماء، وتضم معامل مجهزة بأحدث التقنيات لخدمة العملية التعليمية والبحثية. ندعوكم جميعاً للمشاركة الفعالة في الأنشطة الطلابية والعلمية لبناء مستقبل مشرق لوطننا الحبيب.
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}
