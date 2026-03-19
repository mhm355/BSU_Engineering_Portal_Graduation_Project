import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

export function useThemeMode() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
    const [mode, setMode] = useState(() => {
        const saved = localStorage.getItem('themeMode');
        return saved || 'light';
    });

    useEffect(() => {
        localStorage.setItem('themeMode', mode);
    }, [mode]);

    const toggleMode = () => {
        setMode(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    const theme = useMemo(() => createTheme({
        direction: 'rtl',
        palette: {
            mode,
            ...(mode === 'dark' ? {
                background: {
                    default: '#0a1929',
                    paper: '#132f4c',
                },
                primary: { main: '#5090d3' },
                text: { primary: '#e0e0e0', secondary: '#b0b0b0' },
            } : {
                background: {
                    default: '#f5f7fa',
                    paper: '#ffffff',
                },
                primary: { main: '#1976d2' },
            }),
        },
        typography: {
            fontFamily: '"Cairo", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        shape: { borderRadius: 12 },
    }), [mode]);

    return (
        <ThemeContext.Provider value={{ mode, toggleMode, isDark: mode === 'dark' }}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
}
