import React from 'react';
import {
    Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button, Paper,
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Chip, Avatar, Fade, Grow, Zoom
} from '@mui/material';
import { keyframes } from '@mui/system';
import { Link } from 'react-router-dom';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import CloseIcon from '@mui/icons-material/Close';
import LoginIcon from '@mui/icons-material/Login';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DownloadIcon from '@mui/icons-material/Download';
import SchoolIcon from '@mui/icons-material/School';
import EngineeringIcon from '@mui/icons-material/Engineering';
import ScienceIcon from '@mui/icons-material/Science';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.9; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const slideUp = keyframes`
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 1; transform: translateY(0); }
`;

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => (
    <Grow in={true} timeout={800 + delay}>
        <Paper
            elevation={0}
            sx={{
                p: 4,
                height: '100%',
                borderRadius: 4,
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0,0,0,0.08)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 25px 50px rgba(10, 35, 66, 0.15)',
                    '& .feature-icon': {
                        transform: 'scale(1.1) rotate(5deg)',
                        background: 'linear-gradient(135deg, #0A2342, #1a4a7a)',
                    }
                }
            }}
        >
            <Box
                className="feature-icon"
                sx={{
                    width: 70,
                    height: 70,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #FFC107, #FFD54F)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    boxShadow: '0 10px 30px rgba(255,193,7,0.3)',
                    transition: 'all 0.4s ease',
                }}
            >
                <Icon sx={{ fontSize: 35, color: '#0A2342' }} />
            </Box>
            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342', mb: 1.5 }}>
                {title}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666', lineHeight: 1.8 }}>
                {description}
            </Typography>
        </Paper>
    </Grow>
);

// News Card Component
const NewsCard = ({ news, onReadMore, getImageUrl, delay = 0 }) => (
    <Grow in={true} timeout={600 + delay}>
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.06)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                    '& .news-image': {
                        transform: 'scale(1.05)',
                    },
                    '& .read-more-btn': {
                        background: 'linear-gradient(135deg, #0A2342, #1a4a7a)',
                        color: '#fff',
                    }
                }
            }}
        >
            <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                {news.image ? (
                    <CardMedia
                        component="img"
                        height="220"
                        image={getImageUrl(news.image)}
                        alt={news.title}
                        className="news-image"
                        sx={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    />
                ) : (
                    <Box
                        sx={{
                            height: 220,
                            background: 'linear-gradient(135deg, #e0e0e0, #f5f5f5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <NewspaperIcon sx={{ fontSize: 70, color: '#bdbdbd' }} />
                    </Box>
                )}
                <Chip
                    icon={<CalendarTodayIcon sx={{ fontSize: 14 }} />}
                    label={new Date(news.created_at).toLocaleDateString('ar-EG')}
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        bgcolor: 'rgba(255,255,255,0.95)',
                        fontFamily: 'Cairo',
                        fontWeight: 500,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    }}
                />
            </Box>
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography
                    variant="h6"
                    sx={{
                        fontFamily: 'Cairo',
                        fontWeight: 'bold',
                        color: '#0A2342',
                        mb: 2,
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {news.title}
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        fontFamily: 'Cairo',
                        color: '#666',
                        mb: 3,
                        lineHeight: 1.7,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {news.content}
                </Typography>
                {news.attachment && (
                    <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        href={news.attachment}
                        target="_blank"
                        sx={{
                            fontFamily: 'Cairo',
                            color: '#2196F3',
                            mb: 2,
                            '&:hover': { bgcolor: 'rgba(33,150,243,0.1)' }
                        }}
                    >
                        تحميل المرفق
                    </Button>
                )}
                <Button
                    className="read-more-btn"
                    fullWidth
                    endIcon={<ArrowForwardIcon />}
                    onClick={onReadMore}
                    sx={{
                        fontFamily: 'Cairo',
                        fontWeight: 'bold',
                        py: 1.5,
                        borderRadius: 3,
                        bgcolor: 'rgba(10,35,66,0.05)',
                        color: '#0A2342',
                        transition: 'all 0.3s ease',
                    }}
                >
                    اقرأ المزيد
                </Button>
            </CardContent>
        </Card>
    </Grow>
);

export default function Home() {
    const [newsList, setNewsList] = React.useState([]);
    const [selectedNews, setSelectedNews] = React.useState(null);

    const getImageUrl = (image) => {
        if (!image) return null;
        // Force relative path by stripping domain/protocol
        if (image.startsWith('http')) {
            try {
                const url = new URL(image);
                return url.pathname + url.search;
            } catch (e) {
                return image;
            }
        }
        return image;
    };

    React.useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const response = await fetch('/api/content/news/');
            const data = await response.json();
            setNewsList(data);
        } catch (err) {
            console.error('Error fetching news:', err);
        }
    };

    const features = [
        {
            icon: EngineeringIcon,
            title: 'برامج هندسية متميزة',
            description: 'أقسام متخصصة في الهندسة المدنية والمعمارية والكهربية بمناهج حديثة ومعتمدة دولياً.',
        },
        {
            icon: ScienceIcon,
            title: 'بحث علمي رائد',
            description: 'مراكز بحثية متطورة ومشاريع ابتكارية تساهم في حل مشكلات المجتمع.',
        },
        {
            icon: GroupsIcon,
            title: 'كوادر أكاديمية متميزة',
            description: 'نخبة من أعضاء هيئة التدريس ذوي الخبرة والكفاءة العلمية العالية.',
        },
        {
            icon: EmojiEventsIcon,
            title: 'إنجازات طلابية',
            description: 'طلاب متفوقون يحققون مراكز متقدمة في المسابقات المحلية والدولية.',
        },
    ];

    return (
        <Box sx={{ bgcolor: '#fafbfc' }}>
            {/* Hero Section */}
            <Box
                sx={{
                    position: 'relative',
                    minHeight: { xs: '90vh', md: '85vh' },
                    display: 'flex',
                    alignItems: 'center',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #0A2342 0%, #1a3a5c 50%, #0A2342 100%)',
                    backgroundSize: '200% 200%',
                    animation: `${gradientMove} 15s ease infinite`,
                }}
            >
                {/* Animated Background Elements */}
                <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,193,7,0.15) 0%, transparent 70%)', animation: `${float} 8s ease-in-out infinite` }} />
                <Box sx={{ position: 'absolute', bottom: -150, left: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)', animation: `${float} 10s ease-in-out infinite`, animationDelay: '2s' }} />
                <Box sx={{ position: 'absolute', top: '30%', left: '10%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,193,7,0.1) 0%, transparent 70%)', animation: `${float} 6s ease-in-out infinite`, animationDelay: '1s' }} />
                <Box sx={{ position: 'absolute', top: '60%', right: '15%', width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', animation: `${float} 7s ease-in-out infinite`, animationDelay: '3s' }} />

                {/* Grid Pattern Overlay */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
                        backgroundSize: '40px 40px',
                    }}
                />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={7}>
                            <Fade in={true} timeout={1000}>
                                <Box>
                                    <Chip
                                        icon={<AutoStoriesIcon sx={{ fontSize: 16 }} />}
                                        label="مرحباً بكم في بوابة كلية الهندسة"
                                        sx={{
                                            mb: 3,
                                            bgcolor: 'rgba(255,193,7,0.15)',
                                            color: '#FFC107',
                                            fontFamily: 'Cairo',
                                            fontWeight: 'bold',
                                            border: '1px solid rgba(255,193,7,0.3)',
                                            py: 2.5,
                                            px: 1,
                                        }}
                                    />
                                    <Typography
                                        variant="h2"
                                        sx={{
                                            fontFamily: 'Cairo',
                                            fontWeight: 800,
                                            color: '#fff',
                                            mb: 2,
                                            textShadow: '0 4px 30px rgba(0,0,0,0.3)',
                                            lineHeight: 1.2,
                                            fontSize: { xs: '2.5rem', md: '3.5rem' },
                                        }}
                                    >
                                        كلية الهندسة
                                    </Typography>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontFamily: 'Cairo',
                                            fontWeight: 600,
                                            color: '#FFC107',
                                            mb: 3,
                                            fontSize: { xs: '1.5rem', md: '2rem' },
                                        }}
                                    >
                                        جامعة بني سويف
                                    </Typography>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontFamily: 'Cairo',
                                            color: 'rgba(255,255,255,0.85)',
                                            mb: 5,
                                            maxWidth: 600,
                                            lineHeight: 1.8,
                                            fontWeight: 400,
                                        }}
                                    >
                                        صرح تعليمي رائد لإعداد مهندسين مبتكرين يساهمون في بناء المستقبل وتطوير المجتمع من خلال التعليم والبحث العلمي.
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                        <Button
                                            component={Link}
                                            to="/login"
                                            variant="contained"
                                            size="large"
                                            startIcon={<LoginIcon />}
                                            sx={{
                                                bgcolor: '#FFC107',
                                                color: '#0A2342',
                                                fontFamily: 'Cairo',
                                                fontWeight: 'bold',
                                                px: 5,
                                                py: 2,
                                                fontSize: '1.1rem',
                                                borderRadius: 3,
                                                boxShadow: '0 10px 40px rgba(255,193,7,0.4)',
                                                animation: `${pulse} 3s ease-in-out infinite`,
                                                '&:hover': {
                                                    bgcolor: '#FFD54F',
                                                    transform: 'translateY(-3px)',
                                                    boxShadow: '0 15px 50px rgba(255,193,7,0.5)',
                                                }
                                            }}
                                        >
                                            الدخول إلى النظام
                                        </Button>
                                        <Button
                                            component={Link}
                                            to="/about"
                                            variant="outlined"
                                            size="large"
                                            sx={{
                                                color: '#fff',
                                                borderColor: 'rgba(255,255,255,0.3)',
                                                fontFamily: 'Cairo',
                                                fontWeight: 'bold',
                                                px: 4,
                                                py: 2,
                                                borderRadius: 3,
                                                '&:hover': {
                                                    borderColor: '#FFC107',
                                                    bgcolor: 'rgba(255,193,7,0.1)',
                                                }
                                            }}
                                        >
                                            اكتشف المزيد
                                        </Button>
                                    </Box>
                                </Box>
                            </Fade>
                        </Grid>
                        <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                            <Zoom in={true} timeout={1200}>
                                <Box
                                    sx={{
                                        position: 'relative',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            inset: -20,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, rgba(255,193,7,0.2), transparent)',
                                            animation: `${pulse} 3s ease-in-out infinite`,
                                        }
                                    }}
                                >
                                    <Avatar
                                        src="/logo.jpg"
                                        sx={{
                                            width: 280,
                                            height: 280,
                                            border: '6px solid rgba(255,255,255,0.2)',
                                            boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
                                            animation: `${float} 5s ease-in-out infinite`,
                                        }}
                                    />
                                </Box>
                            </Zoom>
                        </Grid>
                    </Grid>
                </Container>

                {/* Bottom Wave */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 100,
                        background: 'linear-gradient(to top, #fafbfc, transparent)',
                    }}
                />
            </Box>

            {/* Features Section */}
            <Container maxWidth="lg" sx={{ py: 10, mt: -8, position: 'relative', zIndex: 3 }}>
                <Grid container spacing={4}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <FeatureCard {...feature} delay={index * 100} />
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* News Section */}
            <Box sx={{ bgcolor: '#fff', py: 10 }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Chip
                            icon={<NewspaperIcon />}
                            label="آخر المستجدات"
                            sx={{
                                mb: 2,
                                bgcolor: 'rgba(10,35,66,0.08)',
                                color: '#0A2342',
                                fontFamily: 'Cairo',
                                fontWeight: 'bold',
                            }}
                        />
                        <Typography
                            variant="h3"
                            sx={{
                                fontFamily: 'Cairo',
                                fontWeight: 'bold',
                                color: '#0A2342',
                                mb: 2,
                            }}
                        >
                            آخر الأخبار والفعاليات
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                fontFamily: 'Cairo',
                                color: '#666',
                                maxWidth: 600,
                                mx: 'auto',
                            }}
                        >
                            تابع أحدث أخبار الكلية والفعاليات والإنجازات
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        {newsList.length === 0 && (
                            <Grid item xs={12}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 8,
                                        textAlign: 'center',
                                        borderRadius: 4,
                                        bgcolor: 'rgba(0,0,0,0.02)',
                                    }}
                                >
                                    <NewspaperIcon sx={{ fontSize: 80, color: '#ddd', mb: 2 }} />
                                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', color: '#999' }}>
                                        لا توجد أخبار حالياً
                                    </Typography>
                                </Paper>
                            </Grid>
                        )}
                        {newsList.map((news, index) => (
                            <Grid item xs={12} md={4} key={news.id}>
                                <NewsCard
                                    news={news}
                                    onReadMore={() => setSelectedNews(news)}
                                    getImageUrl={getImageUrl}
                                    delay={index * 150}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* News Details Dialog */}
            <Dialog
                open={!!selectedNews}
                onClose={() => setSelectedNews(null)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        overflow: 'hidden',
                    }
                }}
            >
                {selectedNews && (
                    <>
                        <Box sx={{ position: 'relative' }}>
                            {selectedNews.image && (
                                <Box
                                    sx={{
                                        height: 300,
                                        backgroundImage: `url(${getImageUrl(selectedNews.image)})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                />
                            )}
                            <IconButton
                                onClick={() => setSelectedNews(null)}
                                sx={{
                                    position: 'absolute',
                                    top: 16,
                                    left: 16,
                                    bgcolor: 'rgba(255,255,255,0.9)',
                                    '&:hover': { bgcolor: '#fff' }
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <DialogContent sx={{ p: 4 }}>
                            <Chip
                                icon={<CalendarTodayIcon sx={{ fontSize: 14 }} />}
                                label={new Date(selectedNews.created_at).toLocaleDateString('ar-EG')}
                                size="small"
                                sx={{ mb: 2, fontFamily: 'Cairo' }}
                            />
                            <Typography
                                variant="h4"
                                sx={{
                                    fontFamily: 'Cairo',
                                    fontWeight: 'bold',
                                    color: '#0A2342',
                                    mb: 3,
                                }}
                            >
                                {selectedNews.title}
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    fontFamily: 'Cairo',
                                    lineHeight: 2,
                                    fontSize: '1.1rem',
                                    whiteSpace: 'pre-line',
                                    color: '#444',
                                }}
                            >
                                {selectedNews.content}
                            </Typography>
                            {selectedNews.attachment && (
                                <Box sx={{ mt: 4 }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<DownloadIcon />}
                                        href={selectedNews.attachment}
                                        target="_blank"
                                        sx={{
                                            fontFamily: 'Cairo',
                                            fontWeight: 'bold',
                                            bgcolor: '#0A2342',
                                            borderRadius: 3,
                                            px: 4,
                                            py: 1.5,
                                        }}
                                    >
                                        تحميل المرفق
                                    </Button>
                                </Box>
                            )}
                        </DialogContent>
                        <DialogActions sx={{ p: 3, borderTop: '1px solid #eee' }}>
                            <Button
                                onClick={() => setSelectedNews(null)}
                                sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}
                            >
                                إغلاق
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
}
