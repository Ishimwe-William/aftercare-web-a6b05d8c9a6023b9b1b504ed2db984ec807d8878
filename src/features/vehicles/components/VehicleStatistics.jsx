import React from 'react';
import { Grid, Card, CardContent, Box, Typography } from '@mui/material';
import {
    DirectionsBike as BikeIcon,
    CheckCircle as CheckCircleIcon,
    Build as BuildIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card>
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography color="textSecondary" variant="body2">
                        {title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600, mt: 1 }}>
                        {value || 0}
                    </Typography>
                </Box>
                <Icon sx={{ fontSize: 48, color, opacity: 0.3 }} />
            </Box>
        </CardContent>
    </Card>
);

const VehicleStatistics = ({ statistics }) => {
    const stats = [
        {
            title: 'Total Motorcycles',
            value: statistics?.totalMotorcycles,
            icon: BikeIcon,
            color: '#2196F3'
        },
        {
            title: 'Active',
            value: statistics?.activeMotorcycles,
            icon: CheckCircleIcon,
            color: '#4CAF50'
        },
        {
            title: 'In Service',
            value: statistics?.inServiceMotorcycles,
            icon: BuildIcon,
            color: '#FF9800'
        },
        {
            title: 'Need Service',
            value: statistics?.motorcyclesNeedingService,
            icon: WarningIcon,
            color: '#F44336'
        }
    ];

    return (
        <Grid container spacing={3} sx={{ mb: 3 }}>
            {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                    <StatCard {...stat} />
                </Grid>
            ))}
        </Grid>
    );
};

export default VehicleStatistics;