import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Typography, Box, Paper, CircularProgress, Alert, Button, Divider, useTheme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import axios from 'axios';

export default function VerifyCertificate() {
    const { code } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        axios.get(`/api/graduate-affairs/public/verify-certificate/${code}/`)
            .then(res => {
                setData(res.data);
                setError(false);
            })
            .catch(() => {
                setError(true);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [code]);

    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: isDark ? 'background.default' : '#f0f4f8' }}>
            <Box sx={{ bgcolor: isDark ? 'background.paper' : '#1a2744', color: isDark ? 'text.primary' : '#fff', py: 3, textAlign: 'center', boxShadow: 3, borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                    بوابة التحقق من الشهادات
                </Typography>
                <Typography variant="subtitle1" sx={{ fontFamily: 'Cairo', opacity: 0.8 }}>
                    كلية الهندسة - جامعة بني سويف
                </Typography>
            </Box>
            
            <Container maxWidth="sm" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 5 }}>
                <Paper sx={{ p: 4, borderRadius: 4, width: '100%', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                    {loading ? (
                        <Box sx={{ py: 5 }}>
                            <CircularProgress size={60} thickness={4} sx={{ color: '#1a2744' }} />
                            <Typography sx={{ mt: 3, fontFamily: 'Cairo', color: 'text.secondary' }}>جاري التحقق من صحة الشهادة...</Typography>
                        </Box>
                    ) : error ? (
                        <Box sx={{ py: 3 }}>
                            <ErrorOutlineIcon sx={{ fontSize: 80, color: '#e53935', mb: 2 }} />
                            <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#e53935', mb: 1 }}>
                                شهادة غير صالحة
                            </Typography>
                            <Typography sx={{ fontFamily: 'Cairo', color: 'text.secondary', mb: 3 }}>
                                لم يتم العثور على شهادة مطابقة لرمز التحقق هذا. يرجى التأكد من مسح رمز الاستجابة السريعة (QR Code) بشكل صحيح.
                            </Typography>
                            <Button variant="outlined" component={Link} to="/" sx={{ fontFamily: 'Cairo', borderRadius: 2 }}>
                                العودة للصفحة الرئيسية
                            </Button>
                        </Box>
                    ) : (
                        <Box sx={{ py: 2 }}>
                            <VerifiedUserIcon sx={{ fontSize: 80, color: '#43a047', mb: 2 }} />
                            <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#43a047', mb: 1 }}>
                                شهادة موثقة وصالحة
                            </Typography>
                            <Typography sx={{ fontFamily: 'Cairo', color: 'text.secondary', mb: 4 }}>
                                تؤكد كلية الهندسة جامعة بني سويف صحة بيانات هذه الشهادة
                            </Typography>
                            
                            <Box sx={{ textAlign: 'right', bgcolor: isDark ? 'background.default' : '#f8fafc', p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                                <GridItem label="اسم الخريج:" value={data.student_name} />
                                <Divider sx={{ my: 1.5 }} />
                                <GridItem label="الرقم القومي:" value={data.national_id} />
                                <Divider sx={{ my: 1.5 }} />
                                <GridItem label="القسم:" value={data.department || 'غير محدد'} />
                                <Divider sx={{ my: 1.5 }} />
                                <GridItem label="حالة التخرج:" value={data.graduation_status || 'خريج'} />
                                <Divider sx={{ my: 1.5 }} />
                                <GridItem label="تاريخ الإصدار:" value={new Date(data.issued_at).toLocaleDateString('ar-EG')} />
                            </Box>
                        </Box>
                    )}
                </Paper>
            </Container>
        </Box>
    );
}

const GridItem = ({ label, value }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle2" sx={{ fontFamily: 'Cairo', color: 'text.primary', fontWeight: 'bold', width: '30%' }}>
            {label}
        </Typography>
        <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: 'text.secondary', width: '70%', textAlign: 'left', fontWeight: 500 }}>
            {value}
        </Typography>
    </Box>
);
