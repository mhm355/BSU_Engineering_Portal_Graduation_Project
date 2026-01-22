import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Box, Container,
  Drawer, List, ListItem, ListItemText, ListItemIcon, Divider, Avatar, Chip, Fade, Grow, Collapse
} from '@mui/material';
import { keyframes } from '@mui/system';
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

// Animations
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

// Navigation Item Component
const NavItem = ({ label, hasMenu, onClick, isActive, sx = {} }) => (
  <Button
    onClick={onClick}
    endIcon={hasMenu ? <KeyboardArrowDownIcon sx={{ transition: 'transform 0.3s' }} /> : null}
    sx={{
      fontFamily: 'Cairo',
      fontWeight: 600,
      fontSize: '0.95rem',
      color: isActive ? '#FFC107' : '#fff',
      px: 2.5,
      py: 1,
      borderRadius: 2,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&::before': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: isActive ? 'translateX(-50%) scaleX(1)' : 'translateX(-50%) scaleX(0)',
        width: '80%',
        height: 3,
        background: 'linear-gradient(90deg, #FFC107, #FFD54F)',
        borderRadius: 2,
        transition: 'transform 0.3s ease',
      },
      '&:hover': {
        color: '#FFC107',
        bgcolor: 'rgba(255, 193, 7, 0.1)',
        '&::before': {
          transform: 'translateX(-50%) scaleX(1)',
        },
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
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
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
          bgcolor: '#fff',
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
              color: '#0A2342',
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
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentMenu, setCurrentMenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          height: 4,
          background: 'linear-gradient(90deg, #0A2342 0%, #1a4a7a 25%, #FFC107 50%, #1a4a7a 75%, #0A2342 100%)',
          backgroundSize: '200% 100%',
          animation: `${shimmer} 8s linear infinite`,
        }}
      />

      <AppBar
        position="sticky"
        elevation={scrolled ? 8 : 0}
        sx={{
          background: scrolled
            ? 'linear-gradient(135deg, rgba(10, 35, 66, 0.98) 0%, rgba(26, 58, 92, 0.98) 100%)'
            : 'linear-gradient(135deg, #0A2342 0%, #1a3a5c 50%, #0A2342 100%)',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          borderBottom: scrolled ? '1px solid rgba(255,193,7,0.3)' : 'none',
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
                animation: `${float} 4s ease-in-out infinite`,
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: -3,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FFC107, #FFD54F)',
                    opacity: 0.3,
                    animation: `${pulse} 2s ease-in-out infinite`,
                  }
                }}
              >
                <Avatar
                  src="/logo.jpg"
                  alt="Logo"
                  sx={{
                    width: { xs: 50, md: 60 },
                    height: { xs: 50, md: 60 },
                    border: '3px solid rgba(255,193,7,0.5)',
                    boxShadow: '0 8px 32px rgba(255,193,7,0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      borderColor: '#FFC107',
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
                    color: '#fff',
                    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
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
                      color: 'rgba(255,255,255,0.85)',
                      fontWeight: 500,
                    }}
                  >
                    جامعة بني سويف
                  </Typography>
                  <Chip
                    label="Faculty of Engineering"
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      bgcolor: 'rgba(255,193,7,0.2)',
                      color: '#FFC107',
                      border: '1px solid rgba(255,193,7,0.3)',
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Desktop Navigation */}
            <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 0.5, flexGrow: 1, justifyContent: 'center' }}>
              <Box component={Link} to="/" style={{ textDecoration: 'none' }}>
                <NavItem label="الرئيسية" isActive={isActive('/')} />
              </Box>
              <NavItem label="عن الكلية" hasMenu onClick={(e) => handleMenuOpen(e, 'about')} />
              <NavItem label="الأقسام" hasMenu onClick={(e) => handleMenuOpen(e, 'departments')} />
              <NavItem label="الطلاب" hasMenu onClick={(e) => handleMenuOpen(e, 'students')} />
              <Box component={Link} to="/contact" style={{ textDecoration: 'none' }}>
                <NavItem label="اتصل بنا" isActive={isActive('/contact')} />
              </Box>
            </Box>

            {/* Mobile Menu Button */}
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                display: { lg: 'none' },
                color: '#fff',
                bgcolor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 2,
                p: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(255,193,7,0.2)',
                  borderColor: '#FFC107',
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
              background: 'linear-gradient(180deg, #0A2342 0%, #1a3a5c 100%)',
              borderLeft: '3px solid #FFC107',
            }
          }}
        >
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Drawer Header */}
            <Box
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, rgba(255,193,7,0.15) 0%, transparent 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={handleDrawerToggle} sx={{ color: '#fff' }}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src="/logo.jpg" sx={{ width: 60, height: 60, border: '2px solid #FFC107' }} />
                <Box>
                  <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: '#fff' }}>
                    كلية الهندسة
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Cairo' }}>
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
                  '&:hover': { bgcolor: 'rgba(255,193,7,0.1)' }
                }}
              >
                <ListItemIcon><HomeIcon sx={{ color: '#FFC107' }} /></ListItemIcon>
                <ListItemText
                  primary="الرئيسية"
                  primaryTypographyProps={{ fontFamily: 'Cairo', fontWeight: 600, color: '#fff' }}
                />
              </ListItem>

              {/* About Menu */}
              <ListItem button onClick={() => toggleMobileSubmenu('about')} sx={{ py: 1.5, px: 3 }}>
                <ListItemIcon><InfoIcon sx={{ color: '#FFC107' }} /></ListItemIcon>
                <ListItemText
                  primary="عن الكلية"
                  primaryTypographyProps={{ fontFamily: 'Cairo', fontWeight: 600, color: '#fff' }}
                />
                {expandedMobile === 'about' ? <ExpandLess sx={{ color: '#fff' }} /> : <ExpandMore sx={{ color: '#fff' }} />}
              </ListItem>
              <Collapse in={expandedMobile === 'about'} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>
                  {menuItems.about.map((item, idx) => (
                    <ListItem
                      key={idx}
                      button
                      component={Link}
                      to={item.link}
                      onClick={handleDrawerToggle}
                      sx={{ py: 1.2, px: 5 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>{React.cloneElement(item.icon, { sx: { color: 'rgba(255,255,255,0.7)' } })}</ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{ fontFamily: 'Cairo', fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>

              {/* Departments Menu */}
              <ListItem button onClick={() => toggleMobileSubmenu('departments')} sx={{ py: 1.5, px: 3 }}>
                <ListItemIcon><EngineeringIcon sx={{ color: '#FFC107' }} /></ListItemIcon>
                <ListItemText
                  primary="الأقسام"
                  primaryTypographyProps={{ fontFamily: 'Cairo', fontWeight: 600, color: '#fff' }}
                />
                {expandedMobile === 'departments' ? <ExpandLess sx={{ color: '#fff' }} /> : <ExpandMore sx={{ color: '#fff' }} />}
              </ListItem>
              <Collapse in={expandedMobile === 'departments'} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>
                  {menuItems.departments.map((item, idx) => (
                    <ListItem
                      key={idx}
                      button
                      component={Link}
                      to={item.link}
                      onClick={handleDrawerToggle}
                      sx={{ py: 1.2, px: 5 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>{React.cloneElement(item.icon, { sx: { color: 'rgba(255,255,255,0.7)' } })}</ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{ fontFamily: 'Cairo', fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>

              {/* Students Menu */}
              <ListItem button onClick={() => toggleMobileSubmenu('students')} sx={{ py: 1.5, px: 3 }}>
                <ListItemIcon><SchoolIcon sx={{ color: '#FFC107' }} /></ListItemIcon>
                <ListItemText
                  primary="الطلاب"
                  primaryTypographyProps={{ fontFamily: 'Cairo', fontWeight: 600, color: '#fff' }}
                />
                {expandedMobile === 'students' ? <ExpandLess sx={{ color: '#fff' }} /> : <ExpandMore sx={{ color: '#fff' }} />}
              </ListItem>
              <Collapse in={expandedMobile === 'students'} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>
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
                      <ListItemIcon sx={{ minWidth: 36 }}>{React.cloneElement(item.icon, { sx: { color: 'rgba(255,255,255,0.7)' } })}</ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{ fontFamily: 'Cairo', fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)' }}
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
                <ListItemIcon><ContactPhoneIcon sx={{ color: '#FFC107' }} /></ListItemIcon>
                <ListItemText
                  primary="اتصل بنا"
                  primaryTypographyProps={{ fontFamily: 'Cairo', fontWeight: 600, color: '#fff' }}
                />
              </ListItem>
            </List>

            {/* Footer */}
            <Box sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Cairo' }}>
                © 2025 كلية الهندسة - جامعة بني سويف
              </Typography>
            </Box>
          </Box>
        </Drawer>
      </AppBar>
    </>
  );
}
