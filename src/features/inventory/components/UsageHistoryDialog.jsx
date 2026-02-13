import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress
} from '@mui/material';
import { FileDownload } from '@mui/icons-material';

const UsageHistoryDialog = ({ open, part, usageHistory, loading, onClose, onExport }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Usage History - {part?.name}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <Typography variant="body2">
                        Total Units Used: <strong>{part?.totalUsed || 0}</strong>
                    </Typography>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Task ID</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>Usage Notes</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            <CircularProgress size={24} />
                                        </TableCell>
                                    </TableRow>
                                ) : usageHistory.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            No usage history found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    usageHistory.map((usage, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{formatDate(usage.usedAt)}</TableCell>
                                            <TableCell>{usage.taskId}</TableCell>
                                            <TableCell>{usage.quantityUsed}</TableCell>
                                            <TableCell>{usage.notes || '-'}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                <Button variant="outlined" startIcon={<FileDownload />} onClick={onExport}>
                    Export
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UsageHistoryDialog;