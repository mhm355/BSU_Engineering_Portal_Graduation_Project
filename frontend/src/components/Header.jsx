import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Box, Container,
  Drawer, List, ListItem, ListItemText, ListItemIcon, Divider, Avatar, Chip, Fade, Grow, Collapse
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import SchoolIcon from '@mui/icons-material/School';
import EngineeringIcon from '@mui/icons-material/Engineering';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import EmailIcon from '@mui/icons-material/Email';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GavelIcon from '@mui/icons-material/Gavel';
import BalanceIcon from '@mui/icons-material/Balance';
import GroupsIcon from '@mui/icons-material/Groups';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import FoundationIcon from '@mui/icons-material/Foundation';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import GlobalSearch from './GlobalSearch';
import SearchIcon from '@mui/icons-material/Search';

// Navigation Item Component
const NavItem = ({ label, hasMenu, onClick, isActive, sx = {} }) => (
  <Button
    onClick={onClick}
    endIcon={hasMenu ? <KeyboardArrowDownIcon sx={{ transition: 'transform 0.3s' }} /> : null}
    sx={{
      fontFamily: 'Cairo',
      fontWeight: 600,
      fontSize: '0.95rem',
      color: (theme) => isActive 
        ? theme.palette.primary.main 
        : theme.palette.text.primary,
      px: 2.5,
      py: 1,
      borderRadius: 2,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        color: 'primary.main',
        bgcolor: 'action.hover',
        '& .MuiSvgIcon-root': {
          transform: 'rotate(180deg)',
        }
      },
      ...sx,
    }}
  >
    {label}
  </Button>
);

// Dropdown Menu Component
const StyledMenu = ({ anchorEl, open, onClose, items }) => (
  <Menu
    anchorEl={anchorEl}
    open={open}
    onClose={onClose}
    TransitionComponent={Grow}
    TransitionProps={{ timeout: 250 }}
    PaperProps={{
      elevation: 24,
      sx: {
        mt: 1.5,
        minWidth: 240,
        borderRadius: 3,
        overflow: 'visible',
        bgcolor: 'background.paper',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 8px 25px rgba(0,0,0,0.1)',
        '&::before': {
          content: '""',
          display: 'block',
          position: 'absolute',
          top: 0,
          right: 24,
          width: 12,
          height: 12,
          bgcolor: 'background.paper',
          transform: 'translateY(-50%) rotate(45deg)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderBottom: 'none',
          borderRight: 'none',
        },
      },
    }}
    sx={{ direction: 'rtl' }}
  >
    {items?.map((item, index) => (
      <MenuItem
        key={index}
        component={item.external ? 'a' : Link}
        to={!item.external ? item.link : undefined}
        href={item.external ? item.link : undefined}
        target={item.external ? '_blank' : undefined}
        onClick={onClose}
        sx={{
          fontFamily: 'Cairo',
          fontWeight: 500,
          py: 1.5,
          px: 3,
          gap: 1.5,
          transition: 'all 0.2s ease',
          borderRadius: 2,
          mx: 1,
          my: 0.5,
          '&:hover': {
            bgcolor: 'rgba(10, 35, 66, 0.08)',
            transform: 'translateX(-4px)',
            '& .menu-icon': {
              color: '#4F46E5',
              transform: 'scale(1.1)',
            }
          }
        }}
      >
        {item.icon && (
          <Box className="menu-icon" sx={{ color: '#666', transition: 'all 0.2s' }}>
            {item.icon}
          </Box>
        )}
        {item.text}
      </MenuItem>
    ))}
  </Menu>
);

export default function Header() {
  const { user } = useAuth();
  const { isDark, toggleMode } = useThemeMode();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentMenu, setCurrentMenu] = useState(null);
  const [expandedMobile, setExpandedMobile] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
    setExpandedMobile(null);
  };

  const handleMenuOpen = (event, menuName) => {
    setAnchorEl(event.currentTarget);
    setCurrentMenu(menuName);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentMenu(null);
  };

  const toggleMobileSubmenu = (menuName) => {
    setExpandedMobile(expandedMobile === menuName ? null : menuName);
  };

  const menuItems = {
    about: [
      { text: 'نبذة عن الكلية', link: '/about', icon: <AccountBalanceIcon fontSize="small" /> },
      { text: 'كلمة عميد الكلية', link: '/dean-word', icon: <PersonIcon fontSize="small" /> },
      { text: 'الرؤية والرسالة', link: '/vision-mission', icon: <VisibilityIcon fontSize="small" /> },
      { text: 'اللائحة الداخلية', link: '/regulations', icon: <GavelIcon fontSize="small" /> },
      { text: 'الميثاق الأخلاقي', link: '/ethics', icon: <BalanceIcon fontSize="small" /> },
      { text: 'أعضاء هيئة التدريس', link: '/staff', icon: <GroupsIcon fontSize="small" /> },
    ],
    departments: [
      { text: 'كل الأقسام', link: '/departments', icon: <EngineeringIcon fontSize="small" /> },
      { text: 'هندسة مدنية', link: '/departments/civil', icon: <FoundationIcon fontSize="small" /> },
      { text: 'هندسة معمارية', link: '/departments/arch', icon: <ArchitectureIcon fontSize="small" /> },
      { text: 'هندسة كهربية', link: '/departments/electrical', icon: <ElectricalServicesIcon fontSize="small" /> },
    ],
    students: [
      { text: 'البريد الإلكتروني', link: 'http://www.email.bsu.edu.eg/_BSU_Std.aspx', external: true, icon: <EmailIcon fontSize="small" /> },
      { text: 'المدن الجامعية', link: 'https://www.bsu.edu.eg/Sector_Home.aspx?cat_id=286', external: true, icon: <ApartmentIcon fontSize="small" /> },
      { text: 'نتائج الكليات', link: 'http://www.results.bsu.edu.eg/', external: true, icon: <AssessmentIcon fontSize="small" /> },
      { text: 'الدفع الإلكتروني', link: 'http://www.payment.bsu.edu.eg/services/', external: true, icon: <PaymentIcon fontSize="small" /> },
    ]
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Top Accent Bar */}
      <Box
        sx={{
          height: 3,
          background: (theme) => theme.palette.mode === 'dark' 
            ? 'linear-gradient(90deg, #3182CE 0%, #38A169 100%)'
            : 'linear-gradient(90deg, #1E88E5 0%, #43A047 100%)',
        }}
      />

      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(180deg, #171923 0%, #232836 100%)'
            : 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
          borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 70, md: 80 }, gap: 2 }}>
            {/* Logo Section */}
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                textDecoration: 'none',
                flexGrow: { xs: 1, lg: 0 },
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                }}
              >
                <Avatar
                  src="/logo.jpg"
                  alt="Logo"
                  sx={{
                    width: { xs: 50, md: 60 },
                    height: { xs: 50, md: 60 },
                    border: (theme) => `3px solid ${theme.palette.primary.main}`,
                    boxShadow: (theme) => `0 4px 12px ${theme.palette.primary.main}30`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    }
                  }}
                />
              </Box>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'Cairo',
                    fontWeight: 800,
                    color: 'text.primary',
                    lineHeight: 1.2,
                    letterSpacing: 0.5,
                  }}
                >
                  كلية الهندسة
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Cairo',
                      color: 'text.secondary',
                      fontWeight: 500,
                    }}
                  >
                    جامعة بني سويف
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Desktop Navigation */}
            <Box sx={{ 
              display: { xs: 'none', lg: 'flex' }, 
              alignItems: 'center', 
              gap: 1, 
              flexGrow: 1, 
              justifyContent: 'center' 
            }}>
              <Box component={Link} to="/" style={{ textDecoration: 'none' }}>
                <NavItem label="الرئيسية" isActive={isActive('/')} />
              </Box>
              <Box component={Link} to="/about" style={{ textDecoration: 'none' }}>
                <NavItem label="عن الكلية" isActive={isActive('/about')} />
              </Box>
              <Box component={Link} to="/departments" style={{ textDecoration: 'none' }}>
                <NavItem label="الأقسام" isActive={isActive('/departments')} />
              </Box>
              <Box component={Link} to="/contact" style={{ textDecoration: 'none' }}>
                <NavItem label="اتصل بنا" isActive={isActive('/contact')} />
              </Box>
            </Box>

            {/* Search Button */}
            <IconButton
              onClick={() => setSearchOpen(true)}
              sx={{
                color: 'text.primary',
                bgcolor: 'action.hover',
                borderRadius: 2,
                p: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'action.selected',
                }
              }}
            >
              <SearchIcon />
            </IconButton>

            {/* Dark Mode Toggle */}
            <IconButton
              onClick={toggleMode}
              sx={{
                color: 'primary.main',
                bgcolor: 'action.hover',
                borderRadius: 2,
                p: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'action.selected',
                  transform: 'rotate(30deg)',
                }
              }}
            >
              {isDark ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            {/* Mobile Menu Button */}
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                display: { lg: 'none' },
                color: 'text.primary',
                bgcolor: 'action.hover',
                borderRadius: 2,
                p: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'action.selected',
                }
              }}
            >
              <MenuIcon sx={{ fontSize: 28 }} />
            </IconButton>
          </Toolbar>
        </Container>

        {/* Desktop Dropdown Menus */}
        <StyledMenu
          anchorEl={anchorEl}
          open={Boolean(anchorEl) && currentMenu !== null}
          onClose={handleMenuClose}
          items={currentMenu ? menuItems[currentMenu] : []}
        />

        {/* Mobile Drawer */}
        <Drawer
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          PaperProps={{
            sx: {
              width: 320,
              background: (theme) => theme.palette.mode === 'dark'
                ? theme.palette.background.paper
                : theme.palette.background.default,
              borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
            }
          }}
        >
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Drawer Header */}
            <Box
              sx={{
                p: 3,
                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, transparent 100%)`,
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={handleDrawerToggle} sx={{ color: 'text.primary' }}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src="/logo.jpg" sx={{ width: 60, height: 60, border: (theme) => `2px solid ${theme.palette.primary.main}` }} />
                <Box>
                  <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: 'text.primary' }}>
                    كلية الهندسة
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'Cairo' }}>
                    جامعة بني سويف
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Navigation List */}
            <List sx={{ flexGrow: 1, pt: 2 }}>
              <ListItem
                button
                component={Link}
                to="/"
                onClick={handleDrawerToggle}
                sx={{
                  py: 1.5,
                  px: 3,
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <ListItemIcon><HomeIcon sx={{ color: 'primary.main' }} /></ListItemIcon>
                <ListItemText
                  primary="الرئيسية"
                  primaryTypographyProps={{ fontFamily: 'Cairo', fontWeight: 600, color: 'text.primary' }}
                />
              </ListItem>

              {/* About Menu */}
              <ListItem button onClick={() => toggleMobileSubmenu('about')} sx={{ py: 1.5, px: 3 }}>
                <ListItemIcon><InfoIcon sx={{ color: 'primary.main' }} /></ListItemIcon>
                <ListItemText
                  primary="عن الكلية"
                  primaryTypographyProps={{ fontFamily: 'Cairo', fontWeight: 600, color: 'text.primary' }}
                />
                {expandedMobile === 'about' ? <ExpandLess sx={{ color: 'text.secondary' }} /> : <ExpandMore sx={{ color: 'text.secondary' }} />}
              </ListItem>
              <Collapse in={expandedMobile === 'about'} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ bgcolor: 'action.hover' }}>
                  {menuItems.about.map((item, idx) => (
                    <ListItem
                      key={idx}
                      button
                      component={Link}
                      to={item.link}
                      onClick={handleDrawerToggle}
                      sx={{ py: 1.2, px: 5 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>{React.cloneElement(item.icon, { sx: { color: 'text.secondary' } })}</ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{ fontFamily: 'Cairo', fontSize: '0.9rem', color: 'text.secondary' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>

              {/* Departments Menu */}
              <ListItem button onClick={() => toggleMobileSubmenu('departments')} sx={{ py: 1.5, px: 3 }}>
                <ListItemIcon><EngineeringIcon sx={{ color: 'primary.main' }} /></ListItemIcon>
                <ListItemText
                  primary="الأقسام"
                  primaryTypographyProps={{ fontFamily: 'Cairo', fontWeight: 600, color: 'text.primary' }}
                />
                {expandedMobile === 'departments' ? <ExpandLess sx={{ color: 'text.secondary' }} /> : <ExpandMore sx={{ color: 'text.secondary' }} />}
              </ListItem>
              <Collapse in={expandedMobile === 'departments'} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ bgcolor: 'action.hover' }}>
                  {menuItems.departments.map((item, idx) => (
                    <ListItem
                      key={idx}
                      button
                      component={Link}
                      to={item.link}
                      onClick={handleDrawerToggle}
                      sx={{ py: 1.2, px: 5 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>{React.cloneElement(item.icon, { sx: { color: 'text.secondary' } })}</ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{ fontFamily: 'Cairo', fontSize: '0.9rem', color: 'text.secondary' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>

              {/* Students Menu */}
              <ListItem button onClick={() => toggleMobileSubmenu('students')} sx={{ py: 1.5, px: 3 }}>
                <ListItemIcon><SchoolIcon sx={{ color: 'primary.main' }} /></ListItemIcon>
                <ListItemText
                  primary="الطلاب"
                  primaryTypographyProps={{ fontFamily: 'Cairo', fontWeight: 600, color: 'text.primary' }}
                />
                {expandedMobile === 'students' ? <ExpandLess sx={{ color: 'text.secondary' }} /> : <ExpandMore sx={{ color: 'text.secondary' }} />}
              </ListItem>
              <Collapse in={expandedMobile === 'students'} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ bgcolor: 'action.hover' }}>
                  {menuItems.students.map((item, idx) => (
                    <ListItem
                      key={idx}
                      button
                      component={item.external ? 'a' : Link}
                      to={!item.external ? item.link : undefined}
                      href={item.external ? item.link : undefined}
                      target={item.external ? '_blank' : undefined}
                      onClick={handleDrawerToggle}
                      sx={{ py: 1.2, px: 5 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>{React.cloneElement(item.icon, { sx: { color: 'text.secondary' } })}</ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{ fontFamily: 'Cairo', fontSize: '0.9rem', color: 'text.secondary' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>

              <ListItem
                button
                component={Link}
                to="/contact"
                onClick={handleDrawerToggle}
                sx={{ py: 1.5, px: 3 }}
              >
                <ListItemIcon><ContactPhoneIcon sx={{ color: 'primary.main' }} /></ListItemIcon>
                <ListItemText
                  primary="اتصل بنا"
                  primaryTypographyProps={{ fontFamily: 'Cairo', fontWeight: 600, color: 'text.primary' }}
                />
              </ListItem>
            </List>

            {/* Footer */}
            <Box sx={{ p: 3, borderTop: (theme) => `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontFamily: 'Cairo' }}>
                2025 كلية الهندسة - جامعة بني سويف
              </Typography>
            </Box>
          </Box>
        </Drawer>
      </AppBar>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
