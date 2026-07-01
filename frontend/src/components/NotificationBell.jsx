import React, { useState, useEffect } from 'react';
import {
    IconButton, Badge, Menu, MenuItem, Typography, Box, Divider,
    List, ListItem, ListItemText, ListItemAvatar, Avatar, Button,
    CircularProgress
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function NotificationBell() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchNotifications = () => {
        setLoading(true);
        axios.get('/api/graduate-affairs/notifications/', { withCredentials: true })
            .then(res => {
                setNotifications(res.data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 2 minutes
        const interval = setInterval(fetchNotifications, 120000);
        return () => clearInterval(interval);
    }, []);

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMarkAsRead = (id) => {
        axios.post(`/api/graduate-affairs/notifications/${id}/mark_read/`, {}, { withCredentials: true })
            .then(() => {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            });
    };

    const handleMarkAllAsRead = () => {
        axios.post('/api/graduate-affairs/notifications/mark_all_read/', {}, { withCredentials: true })
            .then(() => {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            });
    };

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) {
            handleMarkAsRead(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
            handleClose();
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const getIcon = (type) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
            case 'WARNING': return <WarningIcon sx={{ color: '#ff9800' }} />;
            default: return <InfoIcon sx={{ color: '#2196f3' }} />;
        }
    };

    return (
        <>
            <IconButton color="inherit" onClick={handleOpen} sx={{ ml: 1 }}>
                <Badge badgeContent={unreadCount} color="error" overlap="circular">
                    <NotificationsIcon sx={{ color: 'text.primary' }} />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        width: 360,
                        maxHeight: 500,
                        mt: 1.5,
                        borderRadius: 3,
                        boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                        '& .MuiList-root': { p: 0 }
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                    <Typography variant="subtitle1" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>
                        الإشعارات
                    </Typography>
                    {unreadCount > 0 && (
                        <Button size="small" onClick={handleMarkAllAsRead} sx={{ fontFamily: 'Cairo', fontSize: '0.8rem' }}>
                            تحديد الكل كمقروء
                        </Button>
                    )}
                </Box>

                <List sx={{ p: 0 }}>
                    {loading && notifications.length === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : notifications.length === 0 ? (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Cairo' }}>
                                لا توجد إشعارات
                            </Typography>
                        </Box>
                    ) : (
                        notifications.map((notification) => (
                            <React.Fragment key={notification.id}>
                                <ListItem 
                                    alignItems="flex-start"
                                    onClick={() => handleNotificationClick(notification)}
                                    sx={{ 
                                        cursor: 'pointer',
                                        bgcolor: notification.is_read ? 'transparent' : 'rgba(25, 118, 210, 0.05)',
                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: 'transparent' }}>
                                            {getIcon(notification.notification_type)}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle2" sx={{ fontFamily: 'Cairo', fontWeight: notification.is_read ? 'normal' : 'bold' }}>
                                                {notification.title}
                                            </Typography>
                                        }
                                        secondary={
                                            <React.Fragment>
                                                <Typography component="span" variant="body2" color="text.primary" sx={{ fontFamily: 'Cairo', display: 'block', mt: 0.5 }}>
                                                    {notification.message}
                                                </Typography>
                                                <Typography component="span" variant="caption" color="text.secondary" sx={{ fontFamily: 'Cairo', mt: 0.5, display: 'block' }}>
                                                    {new Date(notification.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </Typography>
                                            </React.Fragment>
                                        }
                                    />
                                </ListItem>
                                <Divider component="li" />
                            </React.Fragment>
                        ))
                    )}
                </List>
            </Menu>
        </>
    );
}
