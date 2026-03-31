import React from 'react';
import { Box, Container, Grid, Typography, Link as MuiLink, IconButton, Divider, Chip, Avatar } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SchoolIcon from '@mui/icons-material/School';
import EngineeringIcon from '@mui/icons-material/Engineering';
import GroupsIcon from '@mui/icons-material/Groups';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Link } from 'react-router-dom';

// Quick Link Component
const QuickLink = ({ to, icon: Icon, children }) => (
    <MuiLink
        component={Link}
        to={to}
        color="inherit"
        underline="none"
        sx={{
            fontFamily: 'Cairo',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            py: 1,
            px: 1.5,
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
                bgcolor: 'rgba(79, 70, 229, 0.1)',
                color: '#818CF8',
                transform: 'translateX(-5px)',
                '& .link-icon': {
                    color: '#818CF8',
                    transform: 'scale(1.1)',
                },
                '& .link-arrow': {
                    opacity: 1,
                    transform: 'translateX(0)',
                }
            }
        }}
    >
        {Icon && <Icon className="link-icon" sx={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', transition: 'all 0.3s' }} />}
        <Typography variant="body2" sx={{ fontFamily: 'Cairo', flex: 1 }}>{children}</Typography>
        <ArrowForwardIcon className="link-arrow" sx={{ fontSize: 16, opacity: 0, transform: 'translateX(-10px)', transition: 'all 0.3s' }} />
    </MuiLink>
);

// Contact Info Component
const ContactInfo = ({ icon: Icon, title, value, href }) => (
    <Box
        component={href ? 'a' : 'div'}
        href={href}
        sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
            mb: 2.5,
            textDecoration: 'none',
            color: 'inherit',
            transition: 'all 0.3s',
            cursor: href ? 'pointer' : 'default',
            '&:hover': href ? {
                '& .contact-icon': {
                    bgcolor: '#4F46E5',
                    color: '#fff',
                    transform: 'scale(1.1)',
                }
            } : {}
        }}
    >
        <Box
            className="contact-icon"
            sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                bgcolor: 'rgba(79, 70, 229, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s',
            }}
        >
            <Icon sx={{ color: '#818CF8', fontSize: 20 }} />
        </Box>
        <Box>
            <Typography variant="caption" sx={{ fontFamily: 'Cairo', color: 'rgba(255,255,255,0.6)', display: 'block' }}>
                {title}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Cairo', fontWeight: 500 }}>
                {value}
            </Typography>
        </Box>
    </Box>
);

// Social Button Component
const SocialButton = ({ icon: Icon, href, color }) => (
    <IconButton
        href={href}
        target="_blank"
        sx={{
            width: 45,
            height: 45,
            bgcolor: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            transition: 'all 0.3s ease',
            '&:hover': {
                bgcolor: color,
                borderColor: color,
                transform: 'translateY(-3px)',
                boxShadow: `0 8px 25px ${color}40`,
            }
        }}
    >
        <Icon />
    </IconButton>
);

export default function Footer() {
    return (
        <Box component="footer" sx={{ mt: 'auto' }}>
            {/* Decorative Top Wave */}
            <Box
                sx={{
                    height: 3,
                    background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                }}
            />

            {/* Main Footer Content */}
            <Box
                sx={{
                    background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(180deg, #171923 0%, #0F172A 100%)'
                        : 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
                    color: 'white',
                    pt: 6,
                    pb: 3,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Decorative Elements - subtle static gradients */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -100,
                        right: -100,
                        width: 300,
                        height: 300,
                        borderRadius: '50%',
                        background: (theme) => `radial-gradient(circle, ${theme.palette.primary.main}15 0%, transparent 70%)`,
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -50,
                        left: -50,
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: (theme) => `radial-gradient(circle, ${theme.palette.secondary.main}10 0%, transparent 70%)`,
                    }}
                />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container spacing={5}>
                        {/* About Section */}
                        <Grid item xs={12} md={4}>
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Avatar
                                        src="/logo.jpg"
                                        sx={{
                                            width: 60,
                                            height: 60,
                                            border: (theme) => `3px solid ${theme.palette.primary.main}50`,
                                            boxShadow: (theme) => `0 4px 20px ${theme.palette.primary.main}30`,
                                        }}
                                    />
                                    <Box>
                                        <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: 'primary.light' }}>
                                            كلية الهندسة
                                        </Typography>
                                        <Typography variant="caption" sx={{ fontFamily: 'Cairo', color: 'rgba(255,255,255,0.7)' }}>
                                            جامعة بني سويف
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontFamily: 'Cairo',
                                        color: 'rgba(255,255,255,0.75)',
                                        lineHeight: 1.8,
                                        mb: 3,
                                    }}
                                >
                                    صرح تعليمي رائد يهدف إلى تخريج مهندسين متميزين قادرين على المنافسة في سوق العمل المحلي والإقليمي.
                                </Typography>
                            </Box>

                            {/* Social Media */}
                            <Typography
                                variant="subtitle2"
                                sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 2, color: 'secondary.light' }}
                            >
                                تابعنا على
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                <SocialButton icon={FacebookIcon} href="#" color="#1877F2" />
                                <SocialButton icon={TwitterIcon} href="#" color="#1DA1F2" />
                                <SocialButton icon={LinkedInIcon} href="#" color="#0A66C2" />
                                <SocialButton icon={YouTubeIcon} href="#" color="#FF0000" />
                                <SocialButton icon={InstagramIcon} href="#" color="#E4405F" />
                            </Box>
                        </Grid>

                        {/* Quick Links Section */}
                        <Grid item xs={12} sm={6} md={4}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontFamily: 'Cairo',
                                    fontWeight: 'bold',
                                    color: 'secondary.light',
                                    mb: 3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 4,
                                        height: 24,
                                        bgcolor: 'secondary.main',
                                        borderRadius: 2,
                                    }}
                                />
                                روابط هامة
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <QuickLink to="/about" icon={SchoolIcon}>عن الكلية</QuickLink>
                                <QuickLink to="/departments" icon={EngineeringIcon}>الأقسام العلمية</QuickLink>
                                <QuickLink to="/staff" icon={GroupsIcon}>أعضاء هيئة التدريس</QuickLink>
                                <QuickLink to="/contact" icon={ContactMailIcon}>اتصل بنا</QuickLink>
                            </Box>
                        </Grid>

                        {/* Contact Section */}
                        <Grid item xs={12} sm={6} md={4}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontFamily: 'Cairo',
                                    fontWeight: 'bold',
                                    color: 'secondary.light',
                                    mb: 3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 4,
                                        height: 24,
                                        bgcolor: 'secondary.main',
                                        borderRadius: 2,
                                    }}
                                />
                                تواصل معنا
                            </Typography>
                            <ContactInfo
                                icon={LocationOnIcon}
                                title="العنوان"
                                value="شرق النيل، بني سويف، مصر"
                            />
                            <ContactInfo
                                icon={EmailIcon}
                                title="البريد الإلكتروني"
                                value="info@eng.bsu.edu.eg"
                                href="mailto:info@eng.bsu.edu.eg"
                            />
                            <ContactInfo
                                icon={PhoneIcon}
                                title="الهاتف"
                                value="082-1234567"
                                href="tel:082-1234567"
                            />
                        </Grid>
                    </Grid>

                    {/* Bottom Bar */}
                    <Box
                        sx={{
                            mt: 6,
                            pt: 4,
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                            <Grid item xs={12} md={6}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontFamily: 'Cairo',
                                        color: 'rgba(255,255,255,0.6)',
                                        textAlign: { xs: 'center', md: 'right' },
                                    }}
                                >
                                    © {new Date().getFullYear()} كلية الهندسة، جامعة بني سويف. جميع الحقوق محفوظة.
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontFamily: 'Cairo',
                                        color: 'rgba(255,255,255,0.6)',
                                        textAlign: { xs: 'center', md: 'left' },
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: { xs: 'center', md: 'flex-start' },
                                        gap: 0.5,
                                    }}
                                >
                                    صُنع بـ <FavoriteIcon sx={{ fontSize: 16, color: '#EF4444' }} /> في مصر
                                    <Chip
                                        label="v2.0"
                                        size="small"
                                        sx={{
                                            ml: 1,
                                            height: 20,
                                            fontSize: '0.65rem',
                                            bgcolor: (theme) => `${theme.palette.primary.main}20`,
                                            color: 'primary.light',
                                            border: (theme) => `1px solid ${theme.palette.primary.main}40`,
                                        }}
                                    />
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
}
