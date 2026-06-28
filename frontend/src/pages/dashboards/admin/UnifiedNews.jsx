import React, { useState } from 'react';
import { Box, Container, Tabs, Tab, Typography, Paper, Button } from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import ArticleIcon from '@mui/icons-material/Article';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

import ManageNewsTab from './ManageNewsTab';
import AnnouncementsTab from './Announcements';

export default function UnifiedNews() {
    const [tab, setTab] = useState(0);
    const navigate = useNavigate();

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button
                onClick={() => navigate('/admin/dashboard')}
                startIcon={<ArrowBackIcon />}
                sx={{
                    mb: 2,
                    fontFamily: 'Cairo',
                    color: '#64748b',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' }
                }}
            >
                عودة للوحة التحكم
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                <Typography variant="h4" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#1E293B' }}>
                    إدارة الأخبار والإعلانات
                </Typography>
            </Box>

            <Paper sx={{ mb: 4, borderRadius: 3 }}>
                <Tabs
                    value={tab}
                    onChange={(e, v) => setTab(v)}
                    variant="fullWidth"
                    sx={{
                        '& .MuiTab-root': { fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '1.1rem' }
                    }}
                >
                    <Tab icon={<ArticleIcon />} iconPosition="start" label="إدارة الأخبار" />
                    <Tab icon={<CampaignIcon />} iconPosition="start" label="إعلانات النظام" />
                </Tabs>
            </Paper>

            <Box>
                {tab === 0 && <ManageNewsTab />}
                {tab === 1 && <AnnouncementsTab />}
            </Box>
        </Container>
    );
}
