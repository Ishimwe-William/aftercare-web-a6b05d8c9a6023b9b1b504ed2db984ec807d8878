import React from 'react';
import { useTheme } from '@mui/material/styles';
import {
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    IconButton,
    Typography
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { NAVIGATION } from '../../config/navigation.config';
import { Drawer, DrawerHeader } from './styles';

const Sidebar = ({ open, onDrawerClose }) => {
    const theme = useTheme();
    const location = useLocation();
    const { hasRole } = useAuth();

    const renderNavigationItems = (items) => {
        return items.map((item) => {
            const isAllowed = hasRole(item.roles);
            if (!isAllowed) return null;

            const isSelected = location.pathname === item.path;
            const Icon = item.icon;

            return (
                <ListItem key={item.id} disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                        component={Link}
                        to={item.path}
                        selected={isSelected}
                        sx={[
                            {
                                minHeight: 48,
                                px: 2.5,
                                '&.Mui-selected': {
                                    backgroundColor: '#FDDE11',
                                    '&:hover': {
                                        backgroundColor: '#FDDE11',
                                    },
                                },
                                '&.Mui-selected .MuiListItemIcon-root, &.Mui-selected .MuiTypography-root': {
                                    color: '#000000',
                                },
                            },
                            open ? { justifyContent: 'initial' } : { justifyContent: 'center' },
                        ]}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: 0,
                                mr: open ? 3 : 'auto',
                                justifyContent: 'center',
                            }}
                        >
                            <Icon />
                        </ListItemIcon>
                        <ListItemText
                            primary={item.label}
                            sx={{ opacity: open ? 1 : 0 }}
                        />
                    </ListItemButton>
                </ListItem>
            );
        });
    };

    return (
        <Drawer variant="permanent" open={open}>
            <DrawerHeader>
                <Typography variant="h6" noWrap component="div">
                    Aftercare Services
                </Typography>
                <IconButton onClick={onDrawerClose}>
                    {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </IconButton>
            </DrawerHeader>

            <Divider />

            <List>
                {renderNavigationItems(NAVIGATION.MAIN)}
            </List>

            <Divider />

            <List>
                {renderNavigationItems(NAVIGATION.AFTERCARE)}
            </List>
        </Drawer>
    );
};

export default Sidebar;