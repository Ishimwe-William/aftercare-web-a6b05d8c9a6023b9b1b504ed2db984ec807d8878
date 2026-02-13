import React from 'react';
import { Paper, Typography, Stack, Alert } from '@mui/material';
import { Warning } from '@mui/icons-material';

const StockAlerts = ({ alerts }) => {
    if (!alerts || (alerts.lowStockParts?.length === 0 && alerts.outOfStockParts?.length === 0)) {
        return null;
    }

    return (
        <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Warning color="error" /> Stock Alerts
            </Typography>
            <Stack spacing={1}>
                {alerts.outOfStockParts?.map(item => (
                    <Alert key={item.partId} severity="error">
                        {item.name} - Out of Stock (Threshold: {item.lowStockThreshold})
                    </Alert>
                ))}
                {alerts.lowStockParts?.map(item => (
                    <Alert key={item.partId} severity="warning">
                        {item.name} - Only {item.quantityAvailable} units remaining (Threshold: {item.lowStockThreshold})
                    </Alert>
                ))}
            </Stack>
        </Paper>
    );
};

export default StockAlerts;