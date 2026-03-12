import React from 'react';
import {
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Box,
    Avatar,
    Rating,
    Tooltip
} from '@mui/material';
import {TrendingUp, Info} from '@mui/icons-material';
import { SpecialityChip } from '../../../utils/specialityUtils';

const TechnicianLeaderboard = ({technicians = [], performance}) => {
    // Filter technicians who have completed at least one task
    const validTechs = (Array.isArray(performance) ? performance : []).filter(
        tech => (tech?.totalTasksCompleted || 0) > 0
    );

    const getPhotoUrl = (techId) => {
        const tech = technicians.find((t) => t?.id === techId);
        return tech?.photoUrl || null;
    }

    const getSpeciality = (techId) => {
        const tech = technicians.find((t) => t?.id === techId);
        return tech?.speciality || null;
    }

    if (validTechs.length === 0) {
        return (
            <Paper sx={{p: 2, mb: 3}}>
                <Typography variant="h6" sx={{mb: 2, display: 'flex', alignItems: 'center', gap: 1}}>
                    <TrendingUp/> Top Performers
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    No technicians with completed tasks yet.
                </Typography>
            </Paper>
        );
    }

    // Find normalization baselines
    const maxTasks = Math.max(...validTechs.map(t => t.totalTasksCompleted || 0), 1);

    // Compute composite score: 50% tasks, 30% efficiency, 20% on-time rate
    const getCompositeScore = (tech) => {
        const tasks = tech.totalTasksCompleted || 0;
        const eff = tech.efficiencyScore || 0;
        const onTime = tech.onTimeCompletionRate || 0;

        const normTasks = tasks / maxTasks;
        const normEff = eff / 100;
        const normOnTime = onTime / 100;

        return (normTasks * 50) + (normEff * 30) + (normOnTime * 20);
    };

    // Enrich with score and sort
    const topPerformers = validTechs
        .map(tech => ({
            ...tech,
            compositeScore: getCompositeScore(tech)
        }))
        .sort((a, b) => b.compositeScore - a.compositeScore)
        .slice(0, 3);

    const getInitials = (nameOrUsername = '') => {
        const parts = (nameOrUsername || '').trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return '?';
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const calculateRating = (score) => {
        // Map 0–100 composite score → 0–5 stars
        return Math.min(5, Math.max(0, score / 20));
    };

    return (
        <Paper sx={{p: 2, mb: 3}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 2}}>
                <TrendingUp/>
                <Typography variant="h6">
                    Top Performers
                </Typography>
                <Tooltip
                    title={
                        <Typography variant="caption">
                            Ranked by composite score:<br/>
                            • 50% Tasks Completed (normalized)<br/>
                            • 30% Efficiency Score<br/>
                            • 20% On-Time Rate
                        </Typography>
                    }
                >
                    <Info fontSize="small" color="action"/>
                </Tooltip>
            </Box>

            <Grid container spacing={2}>
                {topPerformers.map((tech, idx) => {
                    const rating = calculateRating(tech.compositeScore);
                    const name = tech?.fullName || tech?.username || 'Unknown';

                    return (
                        <Grid item xs={12} md={4} key={tech?.technicianId ?? `${name}-${idx}`}>
                            <Card sx={{bgcolor: idx === 0 ? '#fff8e1' : 'background.paper'}}>
                                <CardContent>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 1}}>
                                        <Typography variant="h4" color="primary">
                                            #{idx + 1}
                                        </Typography>
                                        <Avatar src={getPhotoUrl(tech?.technicianId)} alt={name}>
                                            {getInitials(name)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle1" noWrap>
                                                {name}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                                                <Rating
                                                    value={rating}
                                                    readOnly
                                                    size="small"
                                                    precision={0.1}
                                                />
                                                <SpecialityChip speciality={getSpeciality(tech?.technicianId)} />
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Score:</strong> {tech.compositeScore.toFixed(1)} / 100
                                        <br/>
                                        {tech.totalTasksCompleted ?? 0} tasks completed
                                        {typeof tech.averageCompletionTimeHours === 'number' && (
                                            <> • {tech.averageCompletionTimeHours.toFixed(1)}h avg</>
                                        )}
                                        <br/>
                                        Eff: {tech.efficiencyScore?.toFixed(1) ?? 'N/A'} |
                                        On-Time: {tech.onTimeCompletionRate?.toFixed(1) ?? 'N/A'}%
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Paper>
    );
};

export default TechnicianLeaderboard;