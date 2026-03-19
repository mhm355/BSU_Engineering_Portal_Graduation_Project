import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * Displays a banner when the browser goes offline.
 * Includes a retry button to check connectivity.
 * Automatically dismisses when back online.
 */
const OfflineBanner = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                background: 'linear-gradient(135deg, #d32f2f, #f44336)',
                color: '#fff',
                py: 1.5,
                px: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                boxShadow: '0 4px 20px rgba(211, 47, 47, 0.4)',
                fontFamily: 'Cairo',
            }}
        >
            <WifiOffIcon />
            <Typography sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                لا يوجد اتصال بالإنترنت
            </Typography>
            <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={() => window.location.reload()}
                sx={{
                    color: '#fff',
                    borderColor: '#fff',
                    fontFamily: 'Cairo',
                    '&:hover': { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.15)' },
                }}
            >
                إعادة المحاولة
            </Button>
        </Box>
    );
};

export default OfflineBanner;
