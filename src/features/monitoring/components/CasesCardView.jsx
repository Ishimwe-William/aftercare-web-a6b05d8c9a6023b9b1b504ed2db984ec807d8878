import React from 'react';
import {Grid, Card, CardContent, Box, Typography, Chip, LinearProgress, Button} from '@mui/material';
import {Visibility, SwapHoriz, Receipt} from '@mui/icons-material';

const CasesCardView = ({cases, onView, onReassign, onGenerateInvoice}) => {
    const getStatusColor = (status) => {
        const colors = {PENDING: 'warning', IN_PROGRESS: 'info', COMPLETED: 'success', CANCELLED: 'error'};
        return colors[status] || 'default';
    };

    return (
        <Grid container spacing={2}>
            {cases.map(c => (
                <Grid item xs={12} sm={6} md={4} key={c.caseId}>
                    <Card>
                        <CardContent>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                                <Typography variant="h6">{c.caseId}</Typography>
                                <Chip label={c.status} color={getStatusColor(c.status)} size="small"/>
                            </Box>
                            <Typography color="textSecondary" variant="body2" gutterBottom>
                                {c.motorcycle.plateNumber} • {c.motorcycle.model}
                            </Typography>
                            <Typography variant="body2" sx={{mb: 1}}>{c.issue}</Typography>
                            <Typography variant="body2" color="textSecondary" sx={{mb: 2}}>
                                Technician: {c.technician}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{mb: 2}}>
                                Created at: {c.createdAt?.substring(0, c.createdAt?.indexOf('T'))}
                            </Typography>
                            <Box sx={{mb: 2}}>
                                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 0.5}}>
                                    <Typography variant="caption">Progress</Typography>
                                    <Typography variant="caption">{c.progress}%</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={c.progress}
                                                sx={{height: 8, borderRadius: 4}}/>
                            </Box>
                            <Box sx={{display: 'flex', gap: 1}}>
                                <Button size="small" variant="outlined" startIcon={<Visibility/>}
                                        onClick={() => onView(c)}>View</Button>
                                <Button disabled={c.status === 'COMPLETED'} size="small" variant="outlined" startIcon={<SwapHoriz/>}
                                        onClick={() => onReassign(c)}>Reassign</Button>
                                {c.status === 'COMPLETED' && (
                                    <Button
                                        size="small"
                                        variant="contained"
                                        startIcon={<Receipt/>}
                                        onClick={() => onGenerateInvoice(c)}
                                    >
                                        Invoice
                                    </Button>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default CasesCardView;
