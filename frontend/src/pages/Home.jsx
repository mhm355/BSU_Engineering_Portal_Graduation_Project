import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button, Paper, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';

export default function Home() {
    // Dummy news data for now
    const [newsList, setNewsList] = React.useState([]);
    const [selectedNews, setSelectedNews] = React.useState(null);

    const getImageUrl = (image) => {
        if (!image) return null;
        if (image.includes('http://backend:8000')) {
            return image.replace('http://backend:8000', '');
        }
        return image;
    };

    React.useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            // Public endpoint for news? NewsViewSet allows AllowAny for read.
            const response = await fetch('/api/content/news/');
            const data = await response.json();
            setNewsList(data);
        } catch (err) {
            console.error('Error fetching news:', err);
        }
    };

    return (
        <Box>
            {/* Hero Section */}
            <Box sx={{
                bgcolor: '#0A2342',
                color: 'white',
                py: { xs: 8, md: 12 },
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'center'
            }}>
                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
                    <img src="/logo.jpg" alt="Logo" style={{ width: 120, height: 120, borderRadius: '50%', marginBottom: 20, border: '4px solid white' }} />
                    <Typography variant="h3" component="h1" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                        مرحباً بكم في كلية الهندسة
                    </Typography>
                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', mb: 4, opacity: 0.9 }}>
                        جامعة بني سويف
                    </Typography>
                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', mb: 6, maxWidth: '800px', mx: 'auto', lineHeight: 1.6 }}>
                        صرح تعليمي رائد لإعداد مهندسين مبتكرين يساهمون في بناء المستقبل وتطوير المجتمع من خلال التعليم والبحث العلمي.
                    </Typography>
                    <Button
                        component={Link}
                        to="/login"
                        variant="contained"
                        size="large"
                        sx={{
                            bgcolor: '#FFC107',
                            color: '#0A2342',
                            fontFamily: 'Cairo',
                            fontWeight: 'bold',
                            px: 4,
                            py: 1.5,
                            '&:hover': { bgcolor: '#ffca2c' }
                        }}
                    >
                        الدخول إلى النظام
                    </Button>
                </Container>
                {/* Background Overlay */}
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: 'rgba(0,0,0,0.3)',
                    zIndex: 1
                }} />
            </Box>

            {/* News Section */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, borderBottom: '2px solid #FFC107', pb: 1, display: 'inline-flex' }}>
                    <NewspaperIcon sx={{ color: '#0A2342', mr: 1, fontSize: 30 }} />
                    <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                        آخر الأخبار والفعاليات
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {newsList.length === 0 && (
                        <Grid item xs={12}>
                            <Typography variant="body1" sx={{ fontFamily: 'Cairo', textAlign: 'center', color: 'text.secondary' }}>
                                لا توجد أخبار حالياً
                            </Typography>
                        </Grid>
                    )}
                    {newsList.map((news) => (
                        <Grid item xs={12} md={4} key={news.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
                                {news.image && (
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={getImageUrl(news.image)}
                                        alt={news.title}
                                        sx={{ objectFit: 'cover' }}
                                    />
                                )}
                                {!news.image && (
                                    <Box sx={{ height: 200, bgcolor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <NewspaperIcon sx={{ fontSize: 60, color: '#9e9e9e' }} />
                                    </Box>
                                )}
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="caption" color="textSecondary" sx={{ fontFamily: 'Cairo', display: 'block', mb: 1 }}>
                                        {new Date(news.created_at).toLocaleDateString('ar-EG')}
                                    </Typography>
                                    <Typography variant="h6" component="h2" gutterBottom sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
                                        {news.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Cairo', mb: 2, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                        {news.content}
                                    </Typography>
                                    {news.attachment && (
                                        <Button
                                            size="small"
                                            href={news.attachment}
                                            target="_blank"
                                            sx={{ fontFamily: 'Cairo', color: '#3b82f6', mb: 1, display: 'block' }}
                                        >
                                            تحميل المرفق
                                        </Button>
                                    )}
                                    <Button
                                        size="small"
                                        onClick={() => setSelectedNews(news)}
                                        sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}
                                    >
                                        اقرأ المزيد
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* News Details Dialog */}
            <Dialog
                open={!!selectedNews}
                onClose={() => setSelectedNews(null)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                {selectedNews && (
                    <>
                        <DialogTitle sx={{ fontFamily: 'Cairo', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {selectedNews.title}
                            <IconButton onClick={() => setSelectedNews(null)}>
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent dividers>
                            {selectedNews.image && (
                                <Box sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
                                    <img
                                        src={getImageUrl(selectedNews.image)}
                                        alt={selectedNews.title}
                                        style={{ width: '100%', maxHeight: 400, objectFit: 'contain', backgroundColor: '#f5f5f5' }}
                                    />
                                </Box>
                            )}
                            <Typography variant="body1" sx={{ fontFamily: 'Cairo', lineHeight: 1.8, fontSize: '1.1rem', whiteSpace: 'pre-line' }}>
                                {selectedNews.content}
                            </Typography>
                            {selectedNews.attachment && (
                                <Box sx={{ mt: 3 }}>
                                    <Button
                                        variant="outlined"
                                        href={selectedNews.attachment}
                                        target="_blank"
                                        sx={{ fontFamily: 'Cairo' }}
                                    >
                                        تحميل المرفق
                                    </Button>
                                </Box>
                            )}
                        </DialogContent>
                        <DialogActions sx={{ p: 2 }}>
                            <Button onClick={() => setSelectedNews(null)} sx={{ fontFamily: 'Cairo' }}>
                                إغلاق
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box >
    );
}
