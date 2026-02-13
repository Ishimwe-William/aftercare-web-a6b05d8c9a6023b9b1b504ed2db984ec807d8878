import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    Box,
    Typography,
    Chip,
    LinearProgress,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Paper
} from '@mui/material';

const CaseDetailsDialog = ({open, onClose, caseDetails}) => {
    const getStatusColor = (status) => {
        const colors = {PENDING: 'warning', IN_PROGRESS: 'info', COMPLETED: 'success', CANCELLED: 'error'};
        return colors[status] || 'default';
    };

    if (!caseDetails) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Case Details - {caseDetails?.caseInfo?.caseId}</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    <Box>
                        <Typography variant="subtitle2" color="textSecondary">Motorcycle</Typography>
                        <Typography>{caseDetails.caseInfo.motorcycle.model} ({caseDetails.caseInfo.motorcycle.plateNumber})</Typography>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" color="textSecondary">Issue</Typography>
                        <Typography>{caseDetails.caseInfo.issue}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" color="textSecondary">Technician</Typography>
                        <Typography>{caseDetails.caseInfo.technician}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                        <Chip label={caseDetails.caseInfo.status} color={getStatusColor(caseDetails.caseInfo.status)}
                              size="small"/>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" color="textSecondary">Progress</Typography>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mt: 1}}>
                            <LinearProgress variant="determinate" value={caseDetails.caseInfo.progress} sx={{flex: 1}}/>
                            <Typography>{caseDetails.caseInfo.progress}%</Typography>
                        </Box>
                    </Box>

                    {caseDetails.partsUsed?.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>Parts Used</Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Part Name</TableCell>
                                            <TableCell align="right">Quantity</TableCell>
                                            <TableCell align="right">Total Cost</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {caseDetails.partsUsed.map(p => (
                                            <TableRow key={p.partId}>
                                                <TableCell>{p.partName}</TableCell>
                                                <TableCell align="right">{p.quantityUsed}</TableCell>
                                                <TableCell align="right">{p.totalCost.toLocaleString()} RWF</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}

                    {caseDetails.activityHistory?.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>Activity
                                History</Typography>
                            <Stack spacing={1}>
                                {caseDetails.activityHistory.map((a, i) => (
                                    <Paper key={i} sx={{p: 1.5, bgcolor: '#f9f9f9'}}>
                                        <Typography variant="caption" color="textSecondary">
                                            {new Date(a.timestamp).toLocaleString()}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>{a.performedBy}:</strong> {a.action} — {a.details}
                                        </Typography>
                                    </Paper>
                                ))}
                            </Stack>
                        </Box>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default CaseDetailsDialog;