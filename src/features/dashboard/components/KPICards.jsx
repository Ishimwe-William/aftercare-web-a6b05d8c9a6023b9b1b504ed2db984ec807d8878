import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const KPICards = ({ stats }) => {
    const navigate = useNavigate();

    if (!stats) return null;

    const activeCases = (stats.monitoringStats?.pendingCases || 0) + (stats.monitoringStats?.inProgressCases || 0);

    const kpis = [
        { title: 'Active Cases', value: activeCases, onClick: () => navigate('/monitoring') },
        { title: 'Technicians Online', value: stats.technicianWorkload?.filter(t => t.available).length || 0, onClick: () => navigate('/technicians') },
        { title: 'Pending Tasks', value: stats.taskStats?.pendingTasks || 0, onClick: () => navigate('/tasks') },
        { title: 'Avg Resolution Time', value: stats.taskStats?.averageCompletionTimeInHours ? `${Math.round(stats.taskStats.averageCompletionTimeInHours)}h` : 'N/A', onClick: () => navigate('/monitoring') },
        { title: 'Inventory Alerts', value: (stats.inventoryAlerts?.lowStockCount || 0) + (stats.inventoryAlerts?.outOfStockCount || 0), onClick: () => navigate('/inventory') },
    ];

    return (
        <Box sx={{ mt: 3, mx: -1.5 }}>
            <Grid container spacing={3}>
                {kpis.map((kpi, index) => (
                    <Grid item xs={12} sm={6} md={2.4} key={index}>
                        <Paper
                            elevation={2}
                            sx={{ p: 3, cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                            onClick={kpi.onClick}
                        >
                            <Typography variant="h4" fontWeight="bold" color="primary">
                                {kpi.value}
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                {kpi.title}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default KPICards;