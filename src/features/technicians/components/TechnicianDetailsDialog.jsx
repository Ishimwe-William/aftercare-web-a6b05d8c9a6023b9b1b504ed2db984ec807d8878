import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    Box,
    Typography,
    Avatar,
    Chip,
    Grid,
    Divider,
    Paper,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import { Description } from '@mui/icons-material';
import { format } from 'date-fns';
import { SpecialityChip } from '../../../utils/specialityUtils';

const TechnicianDetailsDialog = ({ open, technician, details, onClose }) => {
    const [tabValue, setTabValue] = useState(0);

    if (!technician || !details) return null;

    const getStatusColor = (status) => status ? 'success' : 'default';

    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
    };

    const handleGenerateProfile = () => {
        const csv = generateProfileCSV();
        downloadCSV(csv, `technician-profile-${technician.id}-${new Date().toISOString().split('T')[0]}.csv`);
    };

    const generateProfileCSV = () => {
        const headers = ['Section', 'Key', 'Value'];

        const rows = [];

        // Technician Info
        rows.push(['Technician Info', 'ID', technician.id]);
        rows.push(['Technician Info', 'Name', technician.fullName || technician.username]);
        rows.push(['Technician Info', 'Email', technician.email]);
        rows.push(['Technician Info', 'Phone', technician.phoneNumber || 'N/A']);
        rows.push(['Technician Info', 'Status', technician.status ? 'Online' : 'Offline']);
        rows.push(['Technician Info', 'Speciality', technician.speciality || 'N/A']);
        rows.push(['Technician Info', 'Roles', technician.roles?.join(', ') || 'N/A']);
        rows.push(['Technician Info', 'Created At', technician.createdAt || 'N/A']);
        rows.push(['Technician Info', 'Updated At', technician.updatedAt || 'N/A']);

        // Performance
        const perf = details.performance || {};
        rows.push(['Performance', 'Total Tasks Completed', perf.totalTasksCompleted || 0]);
        rows.push(['Performance', 'Active Tasks', perf.activeTasks || 0]);
        rows.push(['Performance', 'Pending Tasks', perf.pendingTasks || 0]);
        rows.push(['Performance', 'In Progress Tasks', perf.inProgressTasks || 0]);
        rows.push(['Performance', 'Overdue Tasks', perf.overdueTasksCount || 0]);
        rows.push(['Performance', 'On Time Tasks', perf.onTimeTasksCount || 0]);
        rows.push(['Performance', 'Average Delay (hours)', perf.averageDelayHours?.toFixed(2) || 'N/A']);
        rows.push(['Performance', 'On Time Rate (%)', perf.onTimeCompletionRate?.toFixed(1) || 'N/A']);
        rows.push(['Performance', 'Avg Completion Time (hours)', perf.averageCompletionTimeHours?.toFixed(2) || 'N/A']);
        rows.push(['Performance', 'Efficiency Score', perf.efficiencyScore?.toFixed(1) || 'N/A']);

        // Task History
        rows.push(['Task History', '', '']);
        details.tasks.forEach(task => {
            rows.push(['Task', 'ID', task.id]);
            rows.push(['Task', 'Issue Type', task.issueType]);
            rows.push(['Task', 'Status', task.status]);
            rows.push(['Task', 'Assigned At', task.assignedAt || 'N/A']);
            rows.push(['Task', 'Completed At', task.completedAt || 'N/A']);
            rows.push(['Task', 'Duration (hours)', task.durationInHours || 'N/A']);
            rows.push(['Task', '', '']); // Separator
        });

        // Activity Logs
        rows.push(['Activity Logs', '', '']);
        details.logs.forEach(log => {
            rows.push(['Log', 'Action', log.action]);
            rows.push(['Log', 'Details', log.details]);
            rows.push(['Log', 'Timestamp', log.timestamp]);
            rows.push(['Log', '', '']); // Separator
        });

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    };

    const downloadCSV = (csv, filename) => {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const performance = details?.performance || {};
    const taskHistory = details?.tasks || [];
    const activityLogs = details?.logs || [];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Technician Profile - {technician.fullName || technician.username}
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {/* Header Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                            sx={{ width: 56, height: 56 }}
                            src={technician.photoUrl}
                        >
                            {getInitials(technician.fullName || technician.username)}
                        </Avatar>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Typography variant="h6">
                                    {technician.fullName || technician.username}
                                </Typography>
                                <SpecialityChip speciality={technician.speciality} />
                                <Chip
                                    label={technician.status ? 'Online' : 'Offline'}
                                    color={getStatusColor(technician.status)}
                                    size="small"
                                />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                ID: {technician.id}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {technician.email} • {technician.phoneNumber || 'No phone'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Roles: {technician.roles?.join(', ') || 'N/A'}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider />

                    {/* Tabs */}
                    <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                        <Tab label="Overview" />
                        <Tab label="Task History" />
                        <Tab label="Activity Log" />
                    </Tabs>

                    {/* Tab: Overview */}
                    {tabValue === 0 && (
                        <Box>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Status
                                    </Typography>
                                    <Chip
                                        label={technician.status ? 'Online' : 'Offline'}
                                        color={getStatusColor(technician.status)}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Speciality
                                    </Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <SpecialityChip speciality={technician.speciality} />
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Email Status
                                    </Typography>
                                    <Chip
                                        label={technician.enabled ? 'Verified' : 'Unverified'}
                                        color={technician.enabled ? 'success' : 'default'}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Active Tasks
                                    </Typography>
                                    <Typography variant="h6">
                                        {performance.activeTasks || technician.activeTasks || 0}
                                    </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Completed Tasks
                                    </Typography>
                                    <Typography variant="h6">
                                        {performance.totalTasksCompleted || technician.completedTasks || 0}
                                    </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Avg Completion Time (hrs)
                                    </Typography>
                                    <Typography variant="h6">
                                        {performance.averageCompletionTimeHours?.toFixed(2) || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Efficiency Score
                                    </Typography>
                                    <Typography variant="h6">
                                        {performance.efficiencyScore?.toFixed(1) || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        On-Time Rate (%)
                                    </Typography>
                                    <Typography variant="h6">
                                        {performance.onTimeCompletionRate?.toFixed(1) || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Overdue Tasks
                                    </Typography>
                                    <Typography variant="h6">
                                        {performance.overdueTasksCount || 0}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {/* Tab: Task History */}
                    {tabValue === 1 && (
                        <Box>
                            {taskHistory.length > 0 ? (
                                <TableContainer component={Paper} sx={{ maxHeight: 300, overflow: 'auto' }}>
                                    <Table stickyHeader size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Task ID</TableCell>
                                                <TableCell>Issue Type</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Assigned</TableCell>
                                                <TableCell>Completed</TableCell>
                                                <TableCell>Duration</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {taskHistory.map((task) => (
                                                <TableRow key={task.id}>
                                                    <TableCell>{task.id}</TableCell>
                                                    <TableCell>{task.issueType}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={task.status}
                                                            size="small"
                                                            color={
                                                                task.status === 'COMPLETED'
                                                                    ? 'success'
                                                                    : task.status === 'IN_PROGRESS'
                                                                        ? 'primary'
                                                                        : 'default'
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {task.assignedAt
                                                            ? format(new Date(task.assignedAt), 'MMM dd, yyyy')
                                                            : 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {task.completedAt
                                                            ? format(new Date(task.completedAt), 'MMM dd, yyyy')
                                                            : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {task.durationInHours
                                                            ? `${task.durationInHours}h`
                                                            : '-'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                                    No task history available
                                </Typography>
                            )}
                        </Box>
                    )}

                    {/* Tab: Activity Log */}
                    {tabValue === 2 && (
                        <Box>
                            {activityLogs.length > 0 ? (
                                <TableContainer component={Paper} sx={{ maxHeight: 300, overflow: 'auto' }}>
                                    <Table stickyHeader size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Timestamp</TableCell>
                                                <TableCell>Action</TableCell>
                                                <TableCell>Details</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {activityLogs.map((log) => (
                                                <TableRow key={log.logId}>
                                                    <TableCell>
                                                        {log.timestamp ? format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm') : 'N/A'}
                                                    </TableCell>
                                                    <TableCell>{log.action}</TableCell>
                                                    <TableCell>{log.details}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                                    No activity logs available
                                </Typography>
                            )}
                        </Box>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                <Button
                    variant="outlined"
                    startIcon={<Description />}
                    onClick={handleGenerateProfile}
                >
                    Generate Profile Report
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TechnicianDetailsDialog;