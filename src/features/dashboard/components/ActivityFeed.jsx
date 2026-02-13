import React from 'react';
import { List, ListItem, ListItemText, Box, Typography, Chip } from '@mui/material';
import { Person } from '@mui/icons-material';

const ActivityFeed = ({ activities, lastRefresh }) => {
    const formatTimeAgo = (timestamp) => {
        const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Recent Activity</Typography>
                <Typography variant="caption" color="text.secondary">
                    Refreshed {formatTimeAgo(lastRefresh)}
                </Typography>
            </Box>

            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {activities && activities.length > 0 ? (
                    activities.map((activity) => (
                        <ListItem
                            key={activity.logId}
                            sx={{
                                mb: 1,
                                borderRadius: 1,
                                '&:hover': { bgcolor: 'action.hover' },
                                border: '1px solid',
                                borderColor: 'divider'
                            }}
                        >
                            <Box sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                                mr: 2,
                                flexShrink: 0
                            }} />
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                        <Typography variant="body2" fontWeight="medium">
                                            {activity.action.replace(/_/g, ' ')}
                                        </Typography>
                                        {activity.userName && (
                                            <Chip
                                                icon={<Person sx={{ fontSize: 14 }} />}
                                                label={activity.userName}
                                                size="small"
                                                variant="outlined"
                                                sx={{ height: 20, fontSize: '0.7rem' }}
                                            />
                                        )}
                                    </Box>
                                }
                                secondary={
                                    <Box>
                                        {activity.details && (
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                {activity.details}
                                            </Typography>
                                        )}
                                        <Typography variant="caption" color="text.secondary">
                                            {formatTimeAgo(activity.timestamp)}
                                        </Typography>
                                    </Box>
                                }
                            />
                        </ListItem>
                    ))
                ) : (
                    <ListItem>
                        <ListItemText
                            primary="No recent activity"
                            secondary="Activity will appear here when actions are performed"
                        />
                    </ListItem>
                )}
            </List>
        </Box>
    );
};

export default ActivityFeed;