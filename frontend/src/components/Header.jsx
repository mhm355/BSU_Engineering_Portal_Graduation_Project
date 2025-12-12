import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Box, Container, Drawer, List, ListItem, ListItemText, ListItemIcon, Divider, Collapse } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import SchoolIcon from '@mui/icons-material/School';
import EngineeringIcon from '@mui/icons-material/Engineering';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import LoginIcon from '@mui/icons-material/Login';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentMenu, setCurrentMenu] = useState(null);
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event, menuName) => {
    setAnchorEl(event.currentTarget);
    setCurrentMenu(menuName);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentMenu(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = {
    about: [
      { text: 'نبذة عن الكلية', link: '/about' },
      { text: 'كلمة عميد الكلية', link: '/dean-word' },
      { text: 'الرؤية والرسالة', link: '/vision-mission' },
      { text: 'اللائحة الداخلية', link: '/regulations' },
      { text: 'أعضاء هيئة التدريس', link: '/staff' },
    ],
    departments: [
      { text: 'كل الأقسام', link: '/departments' },
      { text: 'هندسة مدنية', link: '/departments/civil' },
      { text: 'هندسة معمارية', link: '/departments/arch' },
      { text: 'هندسة كهربية', link: '/departments/electrical' },
    ],
    programs: [
      { text: 'برنامج الهندسة الإنشائية', link: '/programs/structural' },
    ],
    students: [
      { text: 'البريد الإلكتروني', link: 'http://www.email.bsu.edu.eg/_BSU_Std.aspx', external: true },
      { text: 'المدن الجامعية', link: 'https://www.bsu.edu.eg/Sector_Home.aspx?cat_id=286', external: true },
      { text: 'نتائج الكليات', link: 'http://www.results.bsu.edu.eg/', external: true },
      { text: 'الدفع الإلكتروني', link: 'http://www.payment.bsu.edu.eg/services/', external: true },
    ],
    services: [
      { text: 'الجداول الدراسية', link: '/services/schedules' },
      { text: 'المحاضرات', link: '/services/lectures' },
      { text: 'الشهادات', link: '/services/certificates' },
      { text: 'الشكاوى', link: '/services/complaints' },
    ]
  };

  return (
    <AppBar position="sticky" color="default" sx={{ borderBottom: '4px solid #FFC107', bgcolor: 'white' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo */}
          <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, textDecoration: 'none' }}>
            <img src="/logo.jpg" alt="Logo" style={{ width: 50, height: 50, borderRadius: '50%', marginLeft: 10 }} />
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: '#0A2342', fontFamily: 'Cairo' }}>
                كلية الهندسة
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ fontFamily: 'Cairo' }}>
                جامعة بني سويف
              </Typography>
            </Box>
          </Box>

          {/* Desktop Menu */}
          <Box sx={{ display: { xs: 'none', lg: 'flex' }, gap: 1 }}>
            <Button component={Link} to="/" color="inherit" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الرئيسية</Button>

            <Button color="inherit" onClick={(e) => handleMenuOpen(e, 'about')} endIcon={<ExpandMore />} sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>عن الكلية</Button>
            <Button color="inherit" onClick={(e) => handleMenuOpen(e, 'departments')} endIcon={<ExpandMore />} sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الأقسام</Button>
            <Button color="inherit" onClick={(e) => handleMenuOpen(e, 'programs')} endIcon={<ExpandMore />} sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>البرامج</Button>
            <Button color="inherit" onClick={(e) => handleMenuOpen(e, 'students')} endIcon={<ExpandMore />} sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الطلاب</Button>
            <Button color="inherit" onClick={(e) => handleMenuOpen(e, 'services')} endIcon={<ExpandMore />} sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>الخدمات</Button>

            <Button component={Link} to="/contact" color="inherit" sx={{ fontFamily: 'Cairo', fontWeight: 'bold' }}>اتصل بنا</Button>
            {user ? (
              <Button
                color="inherit"
                onClick={handleLogout}
                sx={{ bgcolor: '#d32f2f', color: '#fff', fontFamily: 'Cairo', fontWeight: 'bold', '&:hover': { bgcolor: '#b71c1c' } }}
              >
                تسجيل خروج
              </Button>
            ) : (
              <Button component={Link} to="/login" variant="contained" sx={{ bgcolor: '#0A2342', color: '#fff', fontFamily: 'Cairo', fontWeight: 'bold', '&:hover': { bgcolor: '#06152a' } }} startIcon={<LoginIcon />}>تسجيل الدخول</Button>
            )}
          </Box>

          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { lg: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>

      {/* Dropdown Menus */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        MenuListProps={{ 'aria-labelledby': 'basic-button' }}
        sx={{ direction: 'rtl' }}
      >
        {currentMenu && menuItems[currentMenu]?.map((item, index) => (
          <MenuItem
            key={index}
            component={item.external ? 'a' : Link}
            to={!item.external ? item.link : undefined}
            href={item.external ? item.link : undefined}
            target={item.external ? '_blank' : undefined}
            onClick={handleMenuClose}
            sx={{ fontFamily: 'Cairo', textAlign: 'right' }}
          >
            {item.text}
          </MenuItem>
        ))}
      </Menu>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', lg: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 } }}
      >
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', p: 2 }}>
          <Typography variant="h6" sx={{ my: 2, fontFamily: 'Cairo', fontWeight: 'bold', color: '#0A2342' }}>
            كلية الهندسة
          </Typography>
          <Divider />
          <List>
            <ListItem button component={Link} to="/">
              <ListItemIcon><HomeIcon /></ListItemIcon>
              <ListItemText primary="الرئيسية" primaryTypographyProps={{ fontFamily: 'Cairo' }} />
            </ListItem>
            <ListItem button component={Link} to="/about">
              <ListItemIcon><InfoIcon /></ListItemIcon>
              <ListItemText primary="عن الكلية" primaryTypographyProps={{ fontFamily: 'Cairo' }} />
            </ListItem>
            <ListItem button component={Link} to="/departments">
              <ListItemIcon><EngineeringIcon /></ListItemIcon>
              <ListItemText primary="الأقسام" primaryTypographyProps={{ fontFamily: 'Cairo' }} />
            </ListItem>
            <ListItem button component={Link} to="/contact">
              <ListItemIcon><ContactPhoneIcon /></ListItemIcon>
              <ListItemText primary="اتصل بنا" primaryTypographyProps={{ fontFamily: 'Cairo' }} />
            </ListItem>
            <ListItem button component={Link} to="/login">
              <ListItemIcon><LoginIcon /></ListItemIcon>
              <ListItemText primary="تسجيل الدخول" primaryTypographyProps={{ fontFamily: 'Cairo' }} />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
