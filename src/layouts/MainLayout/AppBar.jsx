import React from 'react';
import { Toolbar, IconButton, Box, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ElectricBike from '@mui/icons-material/ElectricBike';
import { AppBar as StyledAppBar } from './styles';
import UserMenu from './UserMenu';
import yellowLogo from "../../assets/images/Horizontal-logo-yellow.avif";

const AppBarComponent = ({ open, onDrawerOpen }) => {
    return (
        <StyledAppBar
            position="fixed"
            open={open}
            sx={{ backgroundColor: '#ffffff', color: "#000000" }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    onClick={onDrawerOpen}
                    edge="start"
                    sx={{ marginRight: 5, ...(open && { display: 'none' }) }}
                >
                    <MenuIcon />
                </IconButton>

                <Box
                    component="img"
                    src={yellowLogo}
                    alt="Ampersand Logo"
                    sx={{
                        maxWidth: "50%",
                        height: "auto",
                        objectFit: 'contain',
                        maxHeight: 50,
                        marginRight: 3,
                    }}
                />

                <ElectricBike sx={{ mr: 2, fontSize: 40, cursor: "pointer" }} />

                <Typography variant="h6" noWrap component="div">
                    AmperOps
                </Typography>

                <UserMenu />
            </Toolbar>
        </StyledAppBar>
    );
};

export default AppBarComponent;