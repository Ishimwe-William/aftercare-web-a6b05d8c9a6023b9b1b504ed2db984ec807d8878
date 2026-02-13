import React from 'react';
import {Paper, Typography, Stack, Alert} from '@mui/material';
import {Warning, Schedule} from '@mui/icons-material';

const AlertsSection = ({alerts, onAlertClick}) => {
    if (!alerts || alerts.length === 0) return null;

    const getSeverityColor = (severity) => {
        if (!severity) return 'info';

        const colors = {
            error: 'error',
            warning: 'warning',
            info: 'info'
        };
        const normalizedSeverity = severity.toLowerCase();
        return colors[normalizedSeverity] || 'info';
    };

    // Sort alerts by severity (ERROR > WARNING > INFO)
    const sortedAlerts = [...alerts].sort((a, b) => {
        const severityOrder = {ERROR: 3, WARNING: 2, INFO: 1};
        return severityOrder[b.severity] - severityOrder[a.severity];
    });

    // Take only the first 5 alerts
    const limitedAlerts = sortedAlerts.slice(0, 5);

    return (
        <Paper sx={{p: 2, mb: 3}}>
            <Typography variant="h6" gutterBottom>
                Active Alerts {alerts.length > 5 && `(${alerts.length - 5} more)`}
            </Typography>
            <Stack spacing={1}>
                {limitedAlerts.map(alert => (
                    <Alert
                        key={alert.id}
                        severity={getSeverityColor(alert.severity)}
                        icon={alert.severity === 'WARNING' ? <Warning/> : <Schedule/>}
                        onClick={() => onAlertClick({caseId: alert.caseId})}
                        sx={{cursor: 'pointer'}}
                    >
                        {alert.message}
                    </Alert>
                ))}
            </Stack>
        </Paper>
    );
};

export default AlertsSection;