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
    Typography,
    Chip
} from '@mui/material';
import { reassignTask } from '../taskAssignmentSlice';

// ─── Speciality chip (same palette as TechnicianTable / TaskFormDialog) ───────
const SPECIALITY_COLORS = {
    'Engine':     '#e57373',
    'Electrical': '#64b5f6',
    'Brakes':     '#ff8a65',
    'Tyres':      '#81c784',
    'Suspension': '#ba68c8',
    'Bodywork':   '#4dd0e1',
    'Exhaust':    '#a1887f',
    'General':    '#90a4ae',
};

const SpecialityChip = ({ speciality }) => {
    if (!speciality) return null;
    const bg = SPECIALITY_COLORS[speciality] ?? '#90a4ae';
    return (
        <Chip
            label={speciality}
            size="small"
            sx={{ backgroundColor: bg, color: '#fff', fontWeight: 600, fontSize: '0.68rem', ml: 1 }}
        />
    );
};

// ─────────────────────────────────────────────────────────────────────────────

const ReassignTaskDialog = ({ open, task, onClose, onSuccess, technicians }) => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector(state => state.tasks);

    const [newTechnicianId, setNewTechnicianId] = useState('');
    const [reason,          setReason]          = useState('');

    useEffect(() => {
        if (task) {
            setNewTechnicianId('');
            setReason('');
        }
    }, [task]);

    const handleSubmit = async () => {
        if (!newTechnicianId) return;
        try {
            await dispatch(reassignTask({ taskId: task.id, newTechnicianId, reason })).unwrap();
            onSuccess();
        } catch (err) {
            console.error('Failed to reassign task:', err);
        }
    };

    const currentTechnician = technicians?.find(t => t.id === task?.technicianId);
    // Available technicians = everyone except the one currently assigned
    const eligibleTechnicians = technicians?.filter(t => t.id !== task?.technicianId) ?? [];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Reassign Task</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {task && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                                <strong>Task:</strong> {task.issueType}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Motorcycle:</strong> {task.motorcyclePlateNumber}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <Typography variant="body2">
                                    <strong>Currently assigned to:</strong>&nbsp;
                                    {currentTechnician?.fullName || 'Unknown'}
                                </Typography>
                                {/* Show current technician's speciality for context */}
                                <SpecialityChip speciality={currentTechnician?.speciality} />
                            </Box>
                        </Alert>
                    )}

                    {/* Technician dropdown — shows speciality chip + online indicator */}
                    <TextField
                        select
                        fullWidth
                        label="Reassign to Technician"
                        value={newTechnicianId}
                        onChange={(e) => setNewTechnicianId(e.target.value)}
                        sx={{ mb: 2 }}
                        required
                        SelectProps={{
                            renderValue: (selectedId) => {
                                const tech = technicians?.find(t => t.id === selectedId);
                                if (!tech) return '';
                                return (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body2">{tech.fullName || tech.username}</Typography>
                                        <SpecialityChip speciality={tech.speciality} />
                                    </Box>
                                );
                            }
                        }}
                    >
                        {eligibleTechnicians.map((tech) => (
                            <MenuItem key={tech.id} value={tech.id}>
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                                    {/* Left: name + online dot */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2">
                                            {tech.fullName || tech.username}
                                        </Typography>
                                        <Box
                                            sx={{
                                                width: 8, height: 8, borderRadius: '50%',
                                                bgcolor: tech.status ? 'success.main' : 'grey.400'
                                            }}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            {tech.status ? 'Online' : 'Offline'}
                                        </Typography>
                                    </Box>
                                    {/* Right: speciality chip */}
                                    <SpecialityChip speciality={tech.speciality} />
                                </Box>
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
                        placeholder="Optional: provide a reason for this reassignment"
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