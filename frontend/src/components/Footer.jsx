import React from 'react';
import { Box, Container, Grid, Typography, Link as MuiLink, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <Box component="footer" sx={{ bgcolor: '#0A2342', color: 'white', py: 6, mt: 'auto', borderTop: '4px solid #FFC107' }}>
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#FFC107' }}>
                            كلية الهندسة - جامعة بني سويف
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'Cairo', mb: 2 }}>
                            صرح تعليمي رائد يهدف إلى تخريج مهندسين متميزين قادرين على المنافسة في سوق العمل المحلي والإقليمي.
                        </Typography>
                        <Box>
                            <IconButton color="inherit" href="#"><FacebookIcon /></IconButton>
                            <IconButton color="inherit" href="#"><TwitterIcon /></IconButton>
                            <IconButton color="inherit" href="#"><LinkedInIcon /></IconButton>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#FFC107' }}>
                            روابط هامة
                        </Typography>
                        <Box display="flex" flexDirection="column" gap={1}>
                            <MuiLink component={Link} to="/about" color="inherit" underline="hover" sx={{ fontFamily: 'Cairo' }}>عن الكلية</MuiLink>
                            <MuiLink component={Link} to="/departments" color="inherit" underline="hover" sx={{ fontFamily: 'Cairo' }}>الأقسام العلمية</MuiLink>
                            <MuiLink component={Link} to="/staff" color="inherit" underline="hover" sx={{ fontFamily: 'Cairo' }}>أعضاء هيئة التدريس</MuiLink>
                            <MuiLink component={Link} to="/contact" color="inherit" underline="hover" sx={{ fontFamily: 'Cairo' }}>اتصل بنا</MuiLink>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#FFC107' }}>
                            تواصل معنا
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'Cairo', mb: 1 }}>
                            العنوان: شرق النيل، بني سويف، مصر
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'Cairo', mb: 1 }}>
                            البريد الإلكتروني: info@eng.bsu.edu.eg
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'Cairo' }}>
                            الهاتف: 082-1234567
                        </Typography>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 5, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ fontFamily: 'Cairo' }}>
                        &copy; {new Date().getFullYear()} كلية الهندسة، جامعة بني سويف. جميع الحقوق محفوظة.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
