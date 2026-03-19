import React, { createContext, useState, useContext, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';

/**
 * Centralized toast/snackbar notification system.
 *
 * Wrap your app with <ToastProvider>, then use:
 *   const { showToast } = useToast();
 *   showToast('Operation successful', 'success');
 *   showToast('Something went wrong', 'error');
 */

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState({
        open: false,
        message: '',
        severity: 'info', // 'success' | 'error' | 'warning' | 'info'
        duration: 4000,
    });

    const showToast = useCallback((message, severity = 'info', duration = 4000) => {
        setToast({ open: true, message, severity, duration });
    }, []);

    const handleClose = (_, reason) => {
        if (reason === 'clickaway') return;
        setToast(prev => ({ ...prev, open: false }));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <Snackbar
                open={toast.open}
                autoHideDuration={toast.duration}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleClose}
                    severity={toast.severity}
                    variant="filled"
                    sx={{
                        width: '100%',
                        fontFamily: 'Cairo',
                        fontSize: '0.95rem',
                        borderRadius: 2,
                    }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
