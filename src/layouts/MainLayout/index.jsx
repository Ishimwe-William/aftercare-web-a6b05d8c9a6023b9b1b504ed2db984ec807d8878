import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useDrawer } from '../../hooks/useDrawer';
import AppBarComponent from './AppBar';
import Sidebar from './Sidebar';
import { DrawerHeader } from './styles';

const MainLayout = () => {
    const { open, handleOpen, handleClose } = useDrawer();

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            <AppBarComponent
                open={open}
                onDrawerOpen={handleOpen}
            />

            <Sidebar
                open={open}
                onDrawerClose={handleClose}
            />

            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <DrawerHeader />
                <Outlet />
            </Box>
        </Box>
    );
};

export default MainLayout;