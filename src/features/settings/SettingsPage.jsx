import React, {useState, useEffect} from 'react';
import {
    Box,
    Paper,
    Tabs,
    Tab,
    Typography,
    useMediaQuery,
    createTheme, Stack,
} from '@mui/material';
import {
    Person,
    People,
    History,
    AttachMoney
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfileSection from './components/ProfileSection';
import UserManagementSection from './components/UserManagementSection';
import AuditLogsSection from './components/AuditLogsSection';
//import LaborRateSection from './components/LaborRateSection';
import {useAuth} from '../auth/hooks/useAuth';
import IssuesManagementSection from "./components/IssuesManagementSection";

const theme = createTheme();

const SettingsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const {user} = useAuth();

    const isAdmin = user?.roles?.includes('ROLE_ADMIN');
    const isSupervisor = user?.roles?.includes('ROLE_SUPERVISOR');

    const tabs = [
        {label: 'Profile', icon: <Person/>, component: <ProfileSection/>, path: 'profile'},
        isSupervisor || isAdmin ? {label: 'Issues Management', icon: <History/>, component: <IssuesManagementSection/>, path: 'issues'} : null,
        ...(isAdmin ? [
            //{label: 'Labor Rate', icon: <AttachMoney/>, component: <LaborRateSection/>, path: 'labor-rate'},
            {label: 'User Management', icon: <People/>, component: <UserManagementSection/>, path: 'users'},
            {label: 'Audit Logs', icon: <History/>, component: <AuditLogsSection/>, path: 'audit-logs'},
        ] : []),
    ];

    // Get current tab from URL
    const getCurrentTab = () => {
        const path = location.pathname.split('/').pop();
        const index = tabs.findIndex(tab => tab.path === path);
        return index >= 0 ? index : 0;
    };

    const [activeTab, setActiveTab] = useState(getCurrentTab());

    useEffect(() => {
        setActiveTab(getCurrentTab());
    }, [location.pathname]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        navigate(`/settings/${tabs[newValue].path}`);
    };

    // Redirect to first tab if on base settings route
    useEffect(() => {
        if (location.pathname === '/settings' || location.pathname === '/settings/') {
            navigate(`/settings/${tabs[0].path}`, { replace: true });
        }
    }, [location.pathname, navigate]);

    return (
        <Box sx={{width: '100%', minHeight: '100vh', bgcolor: '#f5f5f5', p: 3}}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" gutterBottom>
                    Settings
                </Typography>
            </Stack>
            <Paper sx={{paddingTop: 3, mb: 3, borderRadius: 2}}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: {xs: 'column', md: 'row'},
                    minHeight: '70vh'
                }}>
                    <Tabs
                        orientation={isMobile ? 'horizontal' : 'vertical'}
                        variant={isMobile ? 'scrollable' : 'standard'}
                        value={activeTab}
                        onChange={handleTabChange}
                        sx={{
                            borderRight: isMobile ? 0 : 1,
                            borderBottom: isMobile ? 1 : 0,
                            borderColor: 'divider',
                            minWidth: isMobile ? 'auto' : 200,
                            '& .MuiTab-root': {
                                alignItems: 'flex-start',
                                textAlign: 'left',
                                minHeight: 48,
                            }
                        }}
                    >
                        {tabs.map((tab, index) => (
                            <Tab
                                key={index}
                                icon={tab.icon}
                                iconPosition="start"
                                label={tab.label}
                                sx={{justifyContent: 'flex-start', px: 3}}
                            />
                        ))}
                    </Tabs>

                    <Box sx={{flexGrow: 1, p: 3}}>
                        {tabs[activeTab]?.component}
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default SettingsPage;