import React from 'react';
import { Box, Container, Typography, Grid, Paper, TextField, Button } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

export default function Contact() {
    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Typography variant="h3" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', textAlign: 'center', mb: 6 }}>
                اتصل بنا
            </Typography>

            <Grid container spacing={6}>
                {/* Contact Info */}
                <Grid item xs={12} md={5}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <Paper elevation={2} sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <LocationOnIcon sx={{ color: '#FFC107', fontSize: 40 }} />
                            <Box>
                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>العنوان</Typography>
                                <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: 'text.secondary' }}>شرق النيل، بني سويف، مصر</Typography>
                            </Box>
                        </Paper>

                        <Paper elevation={2} sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <PhoneIcon sx={{ color: '#FFC107', fontSize: 40 }} />
                            <Box>
                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الهاتف</Typography>
                                <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: 'text.secondary' }}>082-1234567</Typography>
                            </Box>
                        </Paper>

                        <Paper elevation={2} sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <EmailIcon sx={{ color: '#FFC107', fontSize: 40 }} />
                            <Box>
                                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>البريد الإلكتروني</Typography>
                                <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: 'text.secondary' }}>info@eng.bsu.edu.eg</Typography>
                            </Box>
                        </Paper>
                    </Box>
                </Grid>

                {/* Contact Form */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={3} sx={{ p: 4 }}>
                        <Typography variant="h5" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 3 }}>
                            أرسل لنا رسالة
                        </Typography>
                        <form>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="الاسم" variant="outlined" InputLabelProps={{ style: { fontFamily: 'Cairo' } }} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="البريد الإلكتروني" variant="outlined" InputLabelProps={{ style: { fontFamily: 'Cairo' } }} />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="الموضوع" variant="outlined" InputLabelProps={{ style: { fontFamily: 'Cairo' } }} />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="الرسالة" multiline rows={4} variant="outlined" InputLabelProps={{ style: { fontFamily: 'Cairo' } }} />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button variant="contained" size="large" sx={{ bgcolor: '#0A2342', fontFamily: 'Cairo', fontWeight: 'bold', px: 4 }}>
                                        إرسال
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}
