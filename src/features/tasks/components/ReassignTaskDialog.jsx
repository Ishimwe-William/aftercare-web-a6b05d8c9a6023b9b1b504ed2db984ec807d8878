import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Box,
    Alert,
    Typography
} from '@mui/material';
import { reassignTask } from '../taskAssignmentSlice';

const ReassignTaskDialog = ({ open, task, onClose, onSuccess, technicians }) => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector(state => state.tasks);

    const [newTechnicianId, setNewTechnicianId] = useState('');
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (task) {
            setNewTechnicianId('');
            setReason('');
        }
    }, [task]);

    const handleSubmit = async () => {
        if (!newTechnicianId) return;

        try {
            await dispatch(reassignTask({
                taskId: task.id,
                newTechnicianId,
                reason
            })).unwrap();
            onSuccess();
        } catch (err) {
            console.error('Failed to reassign task:', err);
        }
    };

    const currentTechnician = technicians?.find(t => t.id === task?.technicianId);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Reassign Task</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {task && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                                <strong>Task:</strong> {task.issueType}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Motorcycle:</strong> {task.motorcyclePlateNumber}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Currently assigned to:</strong> {currentTechnician?.fullName || 'Unknown'}
                            </Typography>
                        </Alert>
                    )}

                    <TextField
                        select
                        fullWidth
                        label="Reassign to Technician"
                        value={newTechnicianId}
                        onChange={(e) => setNewTechnicianId(e.target.value)}
                        sx={{ mb: 2 }}
                        required
                    >
                        {technicians
                            ?.filter(tech => tech.id !== task?.technicianId)
                            .map((tech) => (
                                <MenuItem key={tech.id} value={tech.id}>
                                    {tech.fullName} {tech.status ? '(Available)' : '(Offline)'}
                                </MenuItem>
                            ))}
                    </TextField>

                    <TextField
                        fullWidth
                        label="Reason for Reassignment"
                        multiline
                        rows={3}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Optional: Provide a reason for this reassignment"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading || !newTechnicianId}
                >
                    {loading ? 'Reassigning...' : 'Reassign Task'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReassignTaskDialog;