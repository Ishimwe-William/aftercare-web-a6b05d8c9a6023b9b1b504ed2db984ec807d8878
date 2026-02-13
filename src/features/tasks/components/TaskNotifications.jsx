import React from 'react';
import {
    Box,
    Paper,
    Alert,
    AlertTitle,
    Stack,
    Typography,
    Chip
} from '@mui/material';
import {
    Warning as WarningIcon,
    CheckCircle as CheckIcon,
    HourglassEmpty as PendingIcon,
    Build as InProgressIcon
} from '@mui/icons-material';

const TaskNotifications = ({ statistics }) => {
    if (!statistics) return null;

    const alerts = [];

    if (statistics.overdueTasks > 0) {
        alerts.push({
            severity: 'error',
            icon: <WarningIcon />,
            title: 'Overdue Tasks',
            message: `${statistics.overdueTasks} task(s) are overdue and require immediate attention`
        });
    }

    if (statistics.pendingTasks > 10) {
        alerts.push({
            severity: 'warning',
            icon: <PendingIcon />,
            title: 'High Pending Tasks',
            message: `${statistics.pendingTasks} task(s) are pending assignment or action`
        });
    }

    if (alerts.length === 0) {
        return (
            <Alert
                icon={<CheckIcon />}
                severity="success"
                sx={{ mb: 3, borderRadius: 2 }}
            >
                <AlertTitle>All Clear</AlertTitle>
                No urgent tasks requiring immediate attention
            </Alert>
        );
    }

    return (
        <Box sx={{ mb: 3 }}>
            {alerts.map((alert, index) => (
                <Alert
                    key={index}
                    icon={alert.icon}
                    severity={alert.severity}
                    sx={{ mb: 2, borderRadius: 2 }}
                >
                    <AlertTitle>{alert.title}</AlertTitle>
                    {alert.message}
                </Alert>
            ))}

            {/* Statistics Summary */}
            <Paper sx={{ p: 2, mt: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                    Task Overview
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                    <Chip
                        icon={<PendingIcon />}
                        label={`${statistics.pendingTasks} Pending`}
                        color="warning"
                        variant="outlined"
                    />
                    <Chip
                        icon={<InProgressIcon />}
                        label={`${statistics.inProgressTasks} In Progress`}
                        color="info"
                        variant="outlined"
                    />
                    <Chip
                        icon={<CheckIcon />}
                        label={`${statistics.completedTasks} Completed`}
                        color="success"
                        variant="outlined"
                    />
                    {statistics.overdueTasks > 0 && (
                        <Chip
                            icon={<WarningIcon />}
                            label={`${statistics.overdueTasks} Overdue`}
                            color="error"
                        />
                    )}
                </Stack>
            </Paper>
        </Box>
    );
};

export default TaskNotifications;