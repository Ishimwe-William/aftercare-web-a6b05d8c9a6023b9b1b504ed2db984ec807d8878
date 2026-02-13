import React from 'react';
import {Grid, Card, CardContent, Typography} from '@mui/material';

const StatsCards = ({stats}) => {
    if (!stats) return null;

    const cards = [
        {label: 'Total Cases', value: stats.totalCases, bg: '#fff'},
        {label: 'Pending', value: stats.pendingCases, bg: '#fff3e0', color: 'warning.main'},
        {label: 'In Progress', value: stats.inProgressCases, bg: '#e3f2fd', color: 'info.main'},
        {label: 'Completed', value: stats.completedCases, bg: '#e8f5e9', color: 'success.main'},
        {label: 'Overdue', value: stats.overdueCases, bg: '#ffebee', color: 'error.main'},
        {label: 'Avg Time (hrs)', value: stats.averageCompletionTime?.toFixed(1), bg: '#fff'}
    ];

    return (
        <Grid container spacing={2} sx={{mb: 3}}>
            {cards.map((card, i) => (
                <Grid item xs={12} sm={6} md={2} key={i}>
                    <Card sx={{bgcolor: card.bg}}>
                        <CardContent>
                            <Typography color="textSecondary" variant="body2">{card.label}</Typography>
                            <Typography variant="h4" color={card.color}>{card.value}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default StatsCards;
