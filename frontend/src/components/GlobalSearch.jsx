import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog, DialogTitle, DialogContent, TextField, InputAdornment,
    List, ListItem, ListItemAvatar, ListItemText, Avatar, Typography,
    Box, Chip, CircularProgress, IconButton, Fade
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import axios from 'axios';

const CATEGORY_CONFIG = {
    courses: { label: 'مقررات', icon: <MenuBookIcon fontSize="small" />, color: '#e65100', bgColor: '#fff3e0' },
    departments: { label: 'أقسام', icon: <SchoolIcon fontSize="small" />, color: '#1976d2', bgColor: '#e3f2fd' },
};

export default function GlobalSearch({ open, onClose }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ courses: [], departments: [] });
    const [loading, setLoading] = useState(false);

    const debounceSearch = useCallback(
        (() => {
            let timer;
            return (q) => {
                clearTimeout(timer);
                if (!q || q.length < 2) {
                    setResults({ courses: [], departments: [] });
                    return;
                }
                timer = setTimeout(() => performSearch(q), 400);
            };
        })(),
        []
    );

    useEffect(() => {
        debounceSearch(query);
    }, [query, debounceSearch]);

    useEffect(() => {
        if (!open) {
            setQuery('');
            setResults({ courses: [], departments: [] });
        }
    }, [open]);

    const performSearch = async (q) => {
        setLoading(true);
        try {
            const config = { withCredentials: true };
            const [subjectsRes, departmentsRes] = await Promise.all([
                axios.get('/api/academic/subjects/', config).catch(() => ({ data: [] })),
                axios.get('/api/academic/departments/', config).catch(() => ({ data: [] })),
            ]);

            const lq = q.toLowerCase();

            const courses = (Array.isArray(subjectsRes.data) ? subjectsRes.data : subjectsRes.data?.results || [])
                .filter(c =>
                    (c.name || '').toLowerCase().includes(lq) ||
                    (c.code || '').toLowerCase().includes(lq)
                )
                .slice(0, 8)
                .map(c => ({ id: c.id, primary: c.name, secondary: c.code }));

            const departments = (Array.isArray(departmentsRes.data) ? departmentsRes.data : departmentsRes.data?.results || [])
                .filter(d =>
                    (d.name || '').toLowerCase().includes(lq)
                )
                .slice(0, 5)
                .map(d => ({ id: d.id, primary: d.name, secondary: '' }));

            setResults({ courses, departments });
        } catch {
            // fail silently
        } finally {
            setLoading(false);
        }
    };

    const totalResults = results.courses.length + results.departments.length;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            TransitionComponent={Fade}
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    overflow: 'hidden',
                    maxHeight: '70vh',
                },
            }}
        >
            <DialogTitle sx={{ pb: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                    بحث شامل
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                <TextField
                    autoFocus
                    fullWidth
                    placeholder="ابحث عن مقرر أو قسم..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                {loading ? <CircularProgress size={20} /> : <SearchIcon sx={{ color: '#999' }} />}
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                            fontFamily: 'Cairo',
                            borderRadius: 3,
                            bgcolor: '#f8fafc',
                        },
                    }}
                />

                {query.length >= 2 && !loading && totalResults === 0 && (
                    <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#999', textAlign: 'center', py: 4 }}>
                        لا توجد نتائج لـ "{query}"
                    </Typography>
                )}

                {Object.entries(results).map(([category, items]) => {
                    if (items.length === 0) return null;
                    const cfg = CATEGORY_CONFIG[category];
                    return (
                        <Box key={category} sx={{ mb: 2 }}>
                            <Chip
                                icon={cfg.icon}
                                label={`${cfg.label} (${items.length})`}
                                size="small"
                                sx={{
                                    mb: 1,
                                    fontFamily: 'Cairo',
                                    fontWeight: 'bold',
                                    bgcolor: cfg.bgColor,
                                    color: cfg.color,
                                }}
                            />
                            <List dense sx={{ bgcolor: '#fafafa', borderRadius: 2 }}>
                                {items.map((item) => (
                                    <ListItem key={item.id} sx={{ borderBottom: '1px solid #eee' }}>
                                        <ListItemAvatar>
                                            <Avatar sx={{ width: 36, height: 36, bgcolor: cfg.bgColor, color: cfg.color }}>
                                                {cfg.icon}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={item.primary}
                                            secondary={item.secondary}
                                            primaryTypographyProps={{ fontFamily: 'Cairo', fontWeight: 600, fontSize: '0.9rem' }}
                                            secondaryTypographyProps={{ fontFamily: 'Cairo', fontSize: '0.8rem' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    );
                })}
            </DialogContent>
        </Dialog>
    );
}
