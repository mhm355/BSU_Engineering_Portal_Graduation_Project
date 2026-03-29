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

    const getDesignTokens = (mode) => ({
        direction: 'rtl',
        palette: {
            mode,
            ...(mode === 'light' ? {
                primary: {
                    main: '#4F46E5',
                    light: '#818CF8',
                    dark: '#3730A3',
                    contrastText: '#FFFFFF',
                },
                secondary: {
                    main: '#14B8A6',
                    light: '#5EEAD4',
                    dark: '#0F766E',
                    contrastText: '#FFFFFF',
                },
                background: {
                    default: '#F8FAFC',
                    paper: '#FFFFFF',
                    elevated: '#F1F5F9',
                },
                text: {
                    primary: '#1E293B',
                    secondary: '#64748B',
                    disabled: '#94A3B8',
                },
                divider: 'rgba(148, 163, 184, 0.2)',
                error: {
                    main: '#EF4444',
                    light: '#FCA5A5',
                    dark: '#DC2626',
                },
                warning: {
                    main: '#F59E0B',
                    light: '#FCD34D',
                    dark: '#D97706',
                },
                info: {
                    main: '#3B82F6',
                    light: '#93C5FD',
                    dark: '#2563EB',
                },
                success: {
                    main: '#10B981',
                    light: '#6EE7B7',
                    dark: '#059669',
                },
                gradient: {
                    primary: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                    secondary: 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)',
                    accent: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
                    dark: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
                },
            } : {
                primary: {
                    main: '#818CF8',
                    light: '#A5B4FC',
                    dark: '#6366F1',
                    contrastText: '#FFFFFF',
                },
                secondary: {
                    main: '#5EEAD4',
                    light: '#99F6E4',
                    dark: '#2DD4BF',
                    contrastText: '#0F172A',
                },
                background: {
                    default: '#0F172A',
                    paper: '#1E293B',
                    elevated: '#334155',
                },
                text: {
                    primary: '#F8FAFC',
                    secondary: '#94A3B8',
                    disabled: '#64748B',
                },
                divider: 'rgba(148, 163, 184, 0.1)',
                error: {
                    main: '#F87171',
                    light: '#FCA5A5',
                    dark: '#EF4444',
                },
                warning: {
                    main: '#FBBF24',
                    light: '#FCD34D',
                    dark: '#F59E0B',
                },
                info: {
                    main: '#60A5FA',
                    light: '#93C5FD',
                    dark: '#3B82F6',
                },
                success: {
                    main: '#34D399',
                    light: '#6EE7B7',
                    dark: '#10B981',
                },
                gradient: {
                    primary: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                    secondary: 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)',
                    accent: 'linear-gradient(135deg, #FBBF24 0%, #F87171 100%)',
                    dark: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                },
            }),
        },
        typography: {
            fontFamily: '"Cairo", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            h1: {
                fontWeight: 700,
                fontSize: '3rem',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
            },
            h2: {
                fontWeight: 700,
                fontSize: '2.25rem',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
            },
            h3: {
                fontWeight: 600,
                fontSize: '1.875rem',
                lineHeight: 1.3,
            },
            h4: {
                fontWeight: 600,
                fontSize: '1.5rem',
                lineHeight: 1.4,
            },
            h5: {
                fontWeight: 600,
                fontSize: '1.25rem',
                lineHeight: 1.4,
            },
            h6: {
                fontWeight: 600,
                fontSize: '1.125rem',
                lineHeight: 1.5,
            },
            subtitle1: {
                fontWeight: 500,
                fontSize: '1rem',
                lineHeight: 1.5,
            },
            subtitle2: {
                fontWeight: 500,
                fontSize: '0.875rem',
                lineHeight: 1.5,
            },
            body1: {
                fontSize: '1rem',
                lineHeight: 1.6,
            },
            body2: {
                fontSize: '0.875rem',
                lineHeight: 1.6,
            },
            button: {
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'none',
            },
            caption: {
                fontSize: '0.75rem',
                lineHeight: 1.5,
            },
        },
        shape: {
            borderRadius: 16,
        },
        shadows: [
            'none',
            '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            ...Array(18).fill('0 25px 50px -12px rgba(0, 0, 0, 0.25)'),
        ],
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        padding: '10px 24px',
                        fontWeight: 600,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 10px 20px -10px rgba(79, 70, 229, 0.5)',
                        },
                    },
                    containedPrimary: {
                        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)',
                        },
                    },
                    containedSecondary: {
                        background: 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #0D9488 0%, #0891B2 100%)',
                        },
                    },
                    outlined: {
                        borderWidth: 2,
                        '&:hover': {
                            borderWidth: 2,
                        },
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 20,
                        boxShadow: mode === 'light' 
                            ? '0 4px 20px rgba(0, 0, 0, 0.08)'
                            : '0 4px 20px rgba(0, 0, 0, 0.3)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: mode === 'light'
                                ? '0 20px 40px rgba(0, 0, 0, 0.12)'
                                : '0 20px 40px rgba(0, 0, 0, 0.4)',
                        },
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        borderRadius: 20,
                    },
                    elevation1: {
                        boxShadow: mode === 'light'
                            ? '0 4px 20px rgba(0, 0, 0, 0.08)'
                            : '0 4px 20px rgba(0, 0, 0, 0.3)',
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backdropFilter: 'blur(20px)',
                        backgroundColor: mode === 'light' 
                            ? 'rgba(255, 255, 255, 0.85)'
                            : 'rgba(30, 41, 59, 0.85)',
                        boxShadow: 'none',
                        borderBottom: `1px solid ${mode === 'light' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.1)'}`,
                    },
                },
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        borderRight: 'none',
                        backgroundColor: mode === 'light' ? '#FFFFFF' : '#1E293B',
                    },
                },
            },
            MuiListItemButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        margin: '4px 12px',
                        padding: '10px 16px',
                        transition: 'all 0.3s ease',
                        '&.Mui-selected': {
                            background: mode === 'light'
                                ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)'
                                : 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                            color: mode === 'light' ? '#4F46E5' : '#818CF8',
                        },
                        '&:hover': {
                            backgroundColor: mode === 'light' ? 'rgba(79, 70, 229, 0.05)' : 'rgba(99, 102, 241, 0.1)',
                        },
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 12,
                            transition: 'all 0.3s ease',
                            '& fieldset': {
                                borderWidth: 2,
                            },
                            '&:hover fieldset': {
                                borderColor: mode === 'light' ? '#4F46E5' : '#818CF8',
                            },
                            '&.Mui-focused fieldset': {
                                borderWidth: 2,
                            },
                        },
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        fontWeight: 500,
                    },
                },
            },
            MuiAvatar: {
                styleOverrides: {
                    root: {
                        border: `2px solid ${mode === 'light' ? '#FFFFFF' : '#334155'}`,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    },
                },
            },
            MuiFab: {
                styleOverrides: {
                    root: {
                        borderRadius: 16,
                        boxShadow: '0 8px 24px rgba(79, 70, 229, 0.4)',
                    },
                },
            },
            MuiTooltip: {
                styleOverrides: {
                    tooltip: {
                        borderRadius: 8,
                        fontWeight: 500,
                        backgroundColor: mode === 'light' ? '#1E293B' : '#F8FAFC',
                        color: mode === 'light' ? '#F8FAFC' : '#1E293B',
                    },
                },
            },
            MuiBadge: {
                styleOverrides: {
                    badge: {
                        fontWeight: 600,
                    },
                },
            },
            MuiTableCell: {
                styleOverrides: {
                    root: {
                        borderBottom: `1px solid ${mode === 'light' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.1)'}`,
                    },
                    head: {
                        fontWeight: 600,
                        color: mode === 'light' ? '#475569' : '#94A3B8',
                    },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        borderRadius: 24,
                        boxShadow: mode === 'light'
                            ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                            : '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    },
                },
            },
            MuiSnackbarContent: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                    },
                },
            },
        },
    });

    const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

    return (
        <ThemeContext.Provider value={{ mode, toggleMode, isDark: mode === 'dark' }}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
}
