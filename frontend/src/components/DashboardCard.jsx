import React from 'react';
import { Paper, Typography, Box, Button, Avatar } from '@mui/material';

const DashboardCard = ({
  icon: Icon,
  title,
  description,
  buttonText,
  onClick,
  color = 'primary',
  disabled = false,
  count = null,
}) => {
  const colorMap = {
    primary: { bg: '#E3F2FD', icon: '#1E88E5', btn: '#1E88E5' },
    secondary: { bg: '#E8F5E9', icon: '#43A047', btn: '#43A047' },
    info: { bg: '#E0F7FA', icon: '#0097A7', btn: '#0097A7' },
    warning: { bg: '#FFF3E0', icon: '#F57C00', btn: '#F57C00' },
    error: { bg: '#FFEBEE', icon: '#D32F2F', btn: '#D32F2F' },
    purple: { bg: '#F3E5F5', icon: '#7B1FA2', btn: '#7B1FA2' },
  };

  const colors = colorMap[color] || colorMap.primary;

  return (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[4],
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: colors.bg,
            color: colors.icon,
            border: 'none',
          }}
        >
          {count !== null ? (
            <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: colors.icon }}>
              {count}
            </Typography>
          ) : (
            <Icon sx={{ fontSize: 24 }} />
          )}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: '1rem',
              color: 'text.primary',
              mb: 0.5,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: '0.875rem',
              lineHeight: 1.5,
            }}
          >
            {description}
          </Typography>
        </Box>
      </Box>

      {buttonText && (
        <Box sx={{ mt: 'auto', pt: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={onClick}
            disabled={disabled}
            sx={{
              borderRadius: 2,
              py: 1,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: 'none',
              bgcolor: colors.btn,
              '&:hover': {
                bgcolor: colors.btn,
                filter: 'brightness(0.9)',
                boxShadow: 'none',
              },
            }}
          >
            {buttonText}
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default DashboardCard;
