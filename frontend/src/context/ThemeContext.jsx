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
                    main: '#1E88E5',
                    light: '#42A5F5',
                    dark: '#1565C0',
                    contrastText: '#FFFFFF',
                },
                secondary: {
                    main: '#43A047',
                    light: '#66BB6A',
                    dark: '#2E7D32',
                    contrastText: '#FFFFFF',
                },
                background: {
                    default: '#F5F7FA',
                    paper: '#FFFFFF',
                    elevated: '#FFFFFF',
                },
                text: {
                    primary: '#1A202C',
                    secondary: '#4A5568',
                    disabled: '#A0AEC0',
                },
                divider: 'rgba(160, 174, 192, 0.2)',
                error: {
                    main: '#E53E3E',
                    light: '#FC8181',
                    dark: '#C53030',
                },
                warning: {
                    main: '#DD6B20',
                    light: '#F6AD55',
                    dark: '#C05621',
                },
                info: {
                    main: '#3182CE',
                    light: '#63B3ED',
                    dark: '#2B6CB0',
                },
                success: {
                    main: '#38A169',
                    light: '#68D391',
                    dark: '#276749',
                },
                gradient: {
                    primary: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
                    secondary: 'linear-gradient(135deg, #43A047 0%, #2E7D32 100%)',
                    accent: 'linear-gradient(135deg, #ED8936 0%, #DD6B20 100%)',
                    hero: 'linear-gradient(135deg, #1E88E5 0%, #43A047 100%)',
                },
            } : {
                primary: {
                    main: '#4299E1',
                    light: '#63B3ED',
                    dark: '#3182CE',
                    contrastText: '#FFFFFF',
                },
                secondary: {
                    main: '#48BB78',
                    light: '#68D391',
                    dark: '#38A169',
                    contrastText: '#FFFFFF',
                },
                background: {
                    default: '#171923',
                    paper: '#232836',
                    elevated: '#2D3748',
                },
                text: {
                    primary: '#F7FAFC',
                    secondary: '#A0AEC0',
                    disabled: '#718096',
                },
                divider: 'rgba(160, 174, 192, 0.1)',
                error: {
                    main: '#FC8181',
                    light: '#FEB2B2',
                    dark: '#F56565',
                },
                warning: {
                    main: '#F6AD55',
                    light: '#FBD38D',
                    dark: '#ED8936',
                },
                info: {
                    main: '#63B3ED',
                    light: '#90CDF4',
                    dark: '#4299E1',
                },
                success: {
                    main: '#68D391',
                    light: '#9AE6B4',
                    dark: '#48BB78',
                },
                gradient: {
                    primary: 'linear-gradient(135deg, #4299E1 0%, #3182CE 100%)',
                    secondary: 'linear-gradient(135deg, #48BB78 0%, #38A169 100%)',
                    accent: 'linear-gradient(135deg, #ED8936 0%, #DD6B20 100%)',
                    hero: 'linear-gradient(135deg, #4299E1 0%, #48BB78 100%)',
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
                            boxShadow: '0 10px 20px -10px rgba(30, 136, 229, 0.4)',
                        },
                    },
                    containedPrimary: {
                        background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)',
                        },
                    },
                    containedSecondary: {
                        background: 'linear-gradient(135deg, #43A047 0%, #2E7D32 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #388E3C 0%, #1B5E20 100%)',
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
                        borderRadius: 16,
                        boxShadow: mode === 'light' 
                            ? '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)'
                            : '0 1px 3px rgba(0, 0, 0, 0.2)',
                        border: mode === 'light' 
                            ? '1px solid rgba(0, 0, 0, 0.04)' 
                            : '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: mode === 'light'
                                ? '0 4px 12px rgba(0, 0, 0, 0.1)'
                                : '0 4px 12px rgba(0, 0, 0, 0.3)',
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
                            ? '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)'
                            : '0 1px 3px rgba(0, 0, 0, 0.2)',
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
                                ? 'rgba(30, 136, 229, 0.08)'
                                : 'rgba(66, 153, 225, 0.15)',
                            color: mode === 'light' ? '#1E88E5' : '#4299E1',
                        },
                        '&:hover': {
                            backgroundColor: mode === 'light' ? 'rgba(30, 136, 229, 0.04)' : 'rgba(66, 153, 225, 0.08)',
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
                                borderColor: mode === 'light' ? '#1E88E5' : '#4299E1',
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
                        border: `2px solid ${mode === 'light' ? '#FFFFFF' : '#2D3748'}`,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    },
                },
            },
            MuiFab: {
                styleOverrides: {
                    root: {
                        borderRadius: 16,
                        boxShadow: '0 8px 24px rgba(30, 136, 229, 0.35)',
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
