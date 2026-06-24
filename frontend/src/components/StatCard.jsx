import React from 'react';
import { Paper, Typography, Box, Avatar } from '@mui/material';

const StatCard = ({ icon: Icon, label, value, color = 'primary' }) => {
  const colorMap = {
    primary: { bg: '#E3F2FD', icon: '#1E88E5' },
    secondary: { bg: '#E8F5E9', icon: '#43A047' },
    info: { bg: '#E0F7FA', icon: '#0097A7' },
    warning: { bg: '#FFF3E0', icon: '#F57C00' },
    error: { bg: '#FFEBEE', icon: '#D32F2F' },
    purple: { bg: '#F3E5F5', icon: '#7B1FA2' },
  };

  const colors = colorMap[color] || colorMap.primary;

  return (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => theme.shadows[3],
        },
      }}
    >
      <Avatar
        sx={{
          width: 44,
          height: 44,
          bgcolor: colors.bg,
          color: colors.icon,
          border: 'none',
        }}
      >
        <Icon sx={{ fontSize: 22 }} />
      </Avatar>
      <Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            fontSize: '1.5rem',
            color: 'text.primary',
            lineHeight: 1,
          }}
        >
          {value}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: '0.8rem',
            mt: 0.5,
          }}
        >
          {label}
        </Typography>
      </Box>
    </Paper>
  );
};

export default StatCard;
