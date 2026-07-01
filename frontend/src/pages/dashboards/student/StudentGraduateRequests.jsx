import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert, useTheme,
    Tabs, Tab, Grid, Card, CardContent, Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import ScienceIcon from '@mui/icons-material/Science';
import HomeIcon from '@mui/icons-material/Home';
import DomainIcon from '@mui/icons-material/Domain';
import ExtensionIcon from '@mui/icons-material/Extension';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function StudentGraduateRequests() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    
    const [tabValue, setTabValue] = useState(0);
    
    // Requests State
    const [requests, setRequests] = useState([]);
    const [requestsLoading, setRequestsLoading] = useState(true);
    const [requestsError, setRequestsError] = useState('');
    
    // Clearance State
    const [clearance, setClearance] = useState(null);
    const [clearanceLoading, setClearanceLoading] = useState(true);
    const [clearanceError, setClearanceError] = useState('');
    
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({
        request_type: 'GRADUATION_STATEMENT',
        notes: ''
    });

    useEffect(() => {
        if (tabValue === 0) fetchRequests();
        if (tabValue === 1) fetchClearance();
    }, [tabValue]);

    const fetchRequests = async () => {
        setRequestsLoading(true);
        try {
            const config = { withCredentials: true };
            const res = await axios.get('/api/graduate-affairs/student-requests/', config);
            setRequests(Array.isArray(res.data) ? res.data : (res.data?.results || []));
            setRequestsError('');
        } catch (err) {
            setRequestsError('فشل تحميل الطلبات. الرجاء المحاولة لاحقاً.');
        } finally {
            setRequestsLoading(false);
        }
    };

    const fetchClearance = async () => {
        setClearanceLoading(true);
        try {
            const config = { withCredentials: true };
            const res = await axios.get('/api/graduate-affairs/student-clearance/', config);
            setClearance(res.data);
            setClearanceError('');
        } catch (err) {
            if (err.response?.status === 404) {
                setClearanceError('لا يوجد بيانات إخلاء طرف مسجلة لك حتى الآن.');
            } else {
                setClearanceError('فشل تحميل بيانات إخلاء الطرف.');
            }
        } finally {
            setClearanceLoading(false);
        }
    };

    const getStatusChip = (status) => {
        switch (status) {
            case 'SUBMITTED': return <Chip label="تم التقديم" color="primary" size="small" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} />;
            case 'UNDER_REVIEW': return <Chip icon={<PendingIcon />} label="قيد المراجعة" color="info" size="small" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} />;
            case 'MISSING_DOCUMENTS': return <Chip label="مستندات ناقصة" color="warning" size="small" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} />;
            case 'APPROVED': return <Chip icon={<CheckCircleIcon />} label="تمت الموافقة" color="success" size="small" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} />;
            case 'COMPLETED': return <Chip icon={<CheckCircleIcon />} label="مكتمل" color="success" size="small" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} />;
            case 'REJECTED': return <Chip label="مرفوض" color="error" size="small" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} />;
            default: return <Chip label="قيد الانتظار" color="default" size="small" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }} />;
        }
    };

    const handleCreateRequest = async () => {
        if (!formData.notes && formData.request_type !== 'GRADUATION_STATEMENT') {
            setRequestsError('يرجى إضافة تفاصيل الطلب');
            return;
        }
        
        try {
            const config = { withCredentials: true };
            await axios.post('/api/graduate-affairs/student-requests/', formData, config);
            setOpenDialog(false);
            setFormData({ request_type: 'GRADUATION_STATEMENT', notes: '' });
            fetchRequests();
        } catch (err) {
            setRequestsError('فشل تقديم الطلب');
        }
    };

    const renderClearanceCard = (title, isCleared, notes, IconComponent) => (
        <Card sx={{ borderRadius: 3, height: '100%', borderTop: `4px solid ${isCleared ? '#4CAF50' : '#FF9800'}`, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isCleared ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)', color: isCleared ? '#4CAF50' : '#FF9800' }}>
                        <IconComponent />
                    </Box>
                    <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                        {title}
                    </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: 'text.secondary' }}>الحالة:</Typography>
                    {isCleared ? (
                        <Chip size="small" label="مُخلى" color="success" icon={<CheckCircleIcon />} sx={{ fontFamily: 'Cairo' }} />
                    ) : (
                        <Chip size="small" label="غير مُخلى" color="warning" icon={<PendingIcon />} sx={{ fontFamily: 'Cairo' }} />
                    )}
                </Box>
                {notes && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f5f5f5', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ fontFamily: 'Cairo', color: 'text.secondary', display: 'block', mb: 0.5 }}>ملاحظات:</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'Cairo' }}>{notes}</Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4, minHeight: '80vh' }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/student/dashboard')}
                sx={{ mb: 2, fontFamily: 'Cairo' }}
            >
                عودة للرئيسية
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                    خدمات الخريجين وإخلاء الطرف
                </Typography>
            </Box>

            <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Tabs 
                    value={tabValue} 
                    onChange={(e, v) => setTabValue(v)} 
                    centered 
                    sx={{ bgcolor: isDark ? 'background.paper' : '#f8f9fa', borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab icon={<AssessmentIcon />} iconPosition="start" label="طلباتي والإفادات" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1.1rem', py: 2 }} />
                    <Tab icon={<AssignmentTurnedInIcon />} iconPosition="start" label="إخلاء الطرف" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1.1rem', py: 2 }} />
                </Tabs>

                <Box sx={{ px: { xs: 2, md: 4 }, py: 2, minHeight: 400 }}>
                    {/* Tab 1: Requests */}
                    <TabPanel value={tabValue} index={0}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)} sx={{ fontFamily: 'Cairo', borderRadius: 2 }}>
                                تقديم طلب جديد
                            </Button>
                        </Box>

                        {requestsError && <Alert severity="error" sx={{ mb: 3, fontFamily: 'Cairo' }}>{requestsError}</Alert>}

                        {requestsLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>
                        ) : (
                            <TableContainer elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                <Table>
                                    <TableHead sx={{ bgcolor: isDark ? 'background.default' : '#f5f5f5' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>رقم الطلب</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>نوع الطلب</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>تاريخ التقديم</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الحالة</TableCell>
                                            <TableCell sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>ملاحظات الإدارة</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {requests.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center" sx={{ py: 4, fontFamily: 'Cairo' }}>
                                                    لم تقم بتقديم أي طلبات حتى الآن
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            requests.map((req) => (
                                                <TableRow key={req.id} hover>
                                                    <TableCell sx={{ fontFamily: 'monospace' }}>#{req.id}</TableCell>
                                                    <TableCell sx={{ fontFamily: 'Cairo' }}>
                                                        {req.request_type_display || req.request_type}
                                                    </TableCell>
                                                    <TableCell sx={{ fontFamily: 'Cairo' }}>
                                                        {new Date(req.created_at).toLocaleDateString('ar-EG')}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusChip(req.status)}
                                                    </TableCell>
                                                    <TableCell sx={{ fontFamily: 'Cairo', color: 'text.secondary' }}>
                                                        {req.admin_notes || '-'}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </TabPanel>

                    {/* Tab 2: Clearance */}
                    <TabPanel value={tabValue} index={1}>
                        {clearanceError ? (
                            <Alert severity="warning" sx={{ mb: 3, fontFamily: 'Cairo' }}>{clearanceError}</Alert>
                        ) : clearanceLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>
                        ) : clearance ? (
                            <Box>
                                <Box sx={{ mb: 4, textAlign: 'center', p: 3, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa', borderRadius: 3 }}>
                                    <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', mb: 1 }}>
                                        حالة إخلاء الطرف العام
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                        {getStatusChip(clearance.overall_status)}
                                    </Box>
                                </Box>

                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6} md={4}>
                                        {renderClearanceCard('المكتبة', clearance.library_cleared, clearance.library_notes, LocalLibraryIcon)}
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        {renderClearanceCard('الشؤون المالية (المصاريف)', clearance.finance_cleared, clearance.finance_notes, AccountBalanceIcon)}
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        {renderClearanceCard('المعامل', clearance.labs_cleared, clearance.labs_notes, ScienceIcon)}
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        {renderClearanceCard('القسم العلمي', clearance.department_cleared, clearance.department_notes, DomainIcon)}
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        {renderClearanceCard('المدينة الجامعية', clearance.housing_cleared, clearance.housing_notes, HomeIcon)}
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        {renderClearanceCard('جهات أخرى', clearance.other_cleared, clearance.other_notes, ExtensionIcon)}
                                    </Grid>
                                </Grid>
                            </Box>
                        ) : null}
                    </TabPanel>
                </Box>
            </Paper>

            {/* Create Request Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                    تقديم طلب جديد
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel sx={{ fontFamily: 'Cairo' }}>نوع الطلب</InputLabel>
                            <Select
                                value={formData.request_type}
                                onChange={(e) => setFormData({ ...formData, request_type: e.target.value })}
                                label="نوع الطلب"
                                sx={{ fontFamily: 'Cairo' }}
                            >
                                <MenuItem value="GRADUATION_STATEMENT" sx={{ fontFamily: 'Cairo' }}>إفادة تخرج</MenuItem>
                                <MenuItem value="TEMP_CERTIFICATE" sx={{ fontFamily: 'Cairo' }}>شهادة تخرج مؤقتة</MenuItem>
                                <MenuItem value="OFFICIAL_CERTIFICATE" sx={{ fontFamily: 'Cairo' }}>شهادة تخرج رسمية</MenuItem>
                                <MenuItem value="CERTIFICATE_REPLACEMENT" sx={{ fontFamily: 'Cairo' }}>بدل فاقد شهادة</MenuItem>
                                <MenuItem value="TRANSCRIPT_AR" sx={{ fontFamily: 'Cairo' }}>كشف درجات عربي</MenuItem>
                                <MenuItem value="TRANSCRIPT_EN" sx={{ fontFamily: 'Cairo' }}>كشف درجات إنجليزي</MenuItem>
                                <MenuItem value="DEGREE_VERIFICATION" sx={{ fontFamily: 'Cairo' }}>خطاب تأكيد درجة</MenuItem>
                                <MenuItem value="CERTIFICATE_AUTH" sx={{ fontFamily: 'Cairo' }}>توثيق شهادة</MenuItem>
                                <MenuItem value="INFO_UPDATE" sx={{ fontFamily: 'Cairo' }}>تحديث بيانات</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="تفاصيل الطلب (أو سبب الطلب)"
                            multiline
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            fullWidth
                            InputProps={{ sx: { fontFamily: 'Cairo' } }}
                            InputLabelProps={{ sx: { fontFamily: 'Cairo' } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ fontFamily: 'Cairo' }}>إلغاء</Button>
                    <Button onClick={handleCreateRequest} variant="contained" sx={{ fontFamily: 'Cairo' }}>
                        إرسال الطلب
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
