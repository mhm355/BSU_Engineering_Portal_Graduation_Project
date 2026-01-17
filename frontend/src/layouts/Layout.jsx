import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Layout() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f3f4f6' }}>
            <Header />
            <Box component="main" sx={{ flexGrow: 1 }}>
                <Outlet />
            </Box>
            <Footer />
        </Box>
    );
}
