import React, { useState } from 'react';
import {
    Box,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Typography,
    Divider,
    ListItemIcon
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { signOut } from '../../features/auth/authSlice';
import { adjustGooglePhotoSize } from '../../utils/imageHelpers';
import { useNavigate } from "react-router-dom";

const UserMenu = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const userPhotoUrl = user?.photoUrl;
    const fullName = user?.fullName;

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        handleClose();
        try {
            await dispatch(signOut()).unwrap();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <Box sx={{ marginLeft: 'auto' }}>
            <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
            >
                <Avatar
                    src={adjustGooglePhotoSize(userPhotoUrl)}
                    alt="User avatar"
                    onError={(e) => {
                        e.currentTarget.src = '';
                    }}
                    sx={{ width: 40, height: 40 }}
                >
                    <AccountCircle />
                </Avatar>

                <div>
                    <Typography sx={{ ml: 1 }} variant="body2" component="div">
                        {fullName?.trim()?.length > 10
                            ? fullName.substring(0, fullName.indexOf(" ")) || fullName
                            : fullName || "Profile"}
                    </Typography>
                    <Typography sx={{ ml: 1, fontSize: '0.75rem', color: 'text.secondary' }} variant="caption" component="div">
                        {user?.roles?.[0]?.replace('ROLE_', '') || 'STAFF'}
                    </Typography>
                </div>

            </IconButton>

            <Menu
                id="account-menu"
                anchorEl={anchorEl}
                keepMounted
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            '& .MuiAvatar-root': {
                                width: 32,
                                height: 32,
                                ml: -0.5,
                                mr: 1,
                            },
                            '&::before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                            },
                        },
                    },
                }}
            >
                <MenuItem onClick={() => {
                    handleClose();
                    navigate('/settings/profile');
                }}>
                    <Avatar src={adjustGooglePhotoSize(userPhotoUrl)} />
                    Profile
                </MenuItem>

                <Divider />

                <MenuItem onClick={() => {
                    handleClose();
                    navigate('/settings/users');
                }}>
                    <ListItemIcon>
                        <SettingsIcon fontSize="small" />
                    </ListItemIcon>
                    Settings
                </MenuItem>

                <MenuItem onClick={handleLogout} sx={{ color: "red" }}>
                    <ListItemIcon>
                        <LogoutIcon fontSize="small" sx={{ color: "red" }} />
                    </ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default UserMenu;