import React, {useEffect, useState} from 'react';
import {
    Box,
    Typography,
    Paper,
    Snackbar,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import {useDispatch, useSelector} from 'react-redux';
import {
    fetchDashboardStats,
    fetchServiceTimeline,
    fetchRecentActivity,
    fetchOverdueTasks,
    clearError
} from './dashboardSlice';
import {useWebSocket} from '../../hooks/useWebSocket';
import KPICards from './components/KPICards';
import Charts from './components/Charts';
import ActivityFeed from './components/ActivityFeed';
import QuickActions from './components/QuickActions';

const DashboardPage = () => {
    const dispatch = useDispatch();
    const {user} = useSelector((state) => state.auth);
    const {stats, timeline, recentActivity, lastRefresh, error} = useSelector((state) => state.dashboard);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [logFilter, setLogFilter] = useState('');

    // WebSocket for real-time updates (replaces auto-refresh switch)
    useWebSocket(true);

    // Fetch data on mount and when filters change
    useEffect(() => {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString();
        const endDate = now.toISOString();

        dispatch(fetchDashboardStats());
        dispatch(fetchServiceTimeline({startDate, endDate}));

        const filters = {};
        if (logFilter) filters.action = logFilter;

        dispatch(fetchRecentActivity(filters));
        dispatch(fetchOverdueTasks());
    }, [dispatch, logFilter]);

    useEffect(() => {
        if (error) {
            setSnackbarOpen(true);
        }
    }, [error]);

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
        dispatch(clearError());
    };

    return (
        <Box sx={{flexGrow: 1, overflow: 'auto', p: 3, bgcolor: '#f5f5f5'}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3}}>
                <Box>
                    <Typography variant="h4" gutterBottom>
                        Welcome, {user?.fullName || 'User'}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Manager View - Operations Dashboard
                    </Typography>
                </Box>
            </Box>
            <KPICards stats={stats}/>
            <Charts timeline={timeline} stats={stats}/>
            {['ROLE_ADMIN', 'ROLE_SUPERVISOR'].includes(user?.roles[0]) && <QuickActions/>}

            <Paper elevation={2} sx={{p: 2.5, mt: 3}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                    <Box sx={{display: 'flex', gap: 2}}>
                        <FormControl sx={{minWidth: 150}}>
                            <InputLabel>Filter by Action</InputLabel>
                            <Select
                                value={logFilter}
                                label="Filter by Action"
                                onChange={(e) => setLogFilter(e.target.value)}
                                size="small"
                                variant="outlined">
                                <MenuItem value="">All Actions</MenuItem>
                                <MenuItem value="USER_CREATED">User Created</MenuItem>
                                <MenuItem value="USER_UPDATED">User Updated</MenuItem>
                                <MenuItem value="USER_DELETED">User Deleted</MenuItem>
                                <MenuItem value="USER_STATUS_TOGGLED">User Status Toggled</MenuItem>
                                <MenuItem value="TECHNICIAN_CREATED">Technician Created</MenuItem>
                                <MenuItem value="TECHNICIAN_UPDATED">Technician Updated</MenuItem>
                                <MenuItem value="TECHNICIAN_DELETED">Technician Deleted</MenuItem>
                                <MenuItem value="TASK_CREATED">Task Created</MenuItem>
                                <MenuItem value="TASK_UPDATED">Task Updated</MenuItem>
                                <MenuItem value="TASK_COMPLETED">Task Completed</MenuItem>
                                <MenuItem value="MOTORCYCLE_CREATED">Motorcycle Created</MenuItem>
                                <MenuItem value="MOTORCYCLE_UPDATED">Motorcycle Updated</MenuItem>
                                <MenuItem value="SPARE_PART_ADDED">Spare Part Added</MenuItem>
                                <MenuItem value="SPARE_PART_USED">Spare Part Used</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Typography variant="caption" color="text.secondary"
                                sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        <Box sx={{width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main'}}/>
                        Live Updates Active
                    </Typography>
                </Box>

                <ActivityFeed activities={recentActivity} lastRefresh={lastRefresh}/>
            </Paper>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                message={error}
            />
        </Box>
    );
};

export default DashboardPage;