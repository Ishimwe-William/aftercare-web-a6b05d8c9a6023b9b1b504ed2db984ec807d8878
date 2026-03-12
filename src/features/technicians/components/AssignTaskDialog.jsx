import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    FormLabel,
    FormGroup,
    FormControlLabel,
    Checkbox,
    TextField,
    Box,
    Typography,
    Chip,
    CircularProgress,
    Alert,
    Divider
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { SpecialityChip } from '../../../utils/specialityUtils';

const AssignTaskDialog = ({
                              open,
                              technician,
                              onClose,
                              onAssign,
                              allTasks = [],
                              technicianTasks = [],
                              loading = false
                          }) => {
    const [selectedTaskIds, setSelectedTaskIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open && technician) {
            // Pre-select tasks already assigned to this technician
            const assignedTaskIds = technicianTasks
                .filter(task => task.technicianId === technician.id)
                .map(task => task.id || task.taskId);
            setSelectedTaskIds(assignedTaskIds);
        }
    }, [open, technician, technicianTasks]);

    const handleToggleTask = (taskId) => {
        setSelectedTaskIds(prev => {
            if (prev.includes(taskId)) {
                return prev.filter(id => id !== taskId);
            } else {
                return [...prev, taskId];
            }
        });
    };

    const handleSubmit = async () => {
        if (!technician) return;

        // Find newly assigned tasks (not previously assigned)
        const previouslyAssignedIds = technicianTasks
            .filter(task => task.technicianId === technician.id)
            .map(task => task.id || task.taskId);

        const newlyAssignedIds = selectedTaskIds.filter(
            id => !previouslyAssignedIds.includes(id)
        );

        // Submit the newly assigned tasks
        if (newlyAssignedIds.length > 0) {
            setIsSubmitting(true);
            try {
                await onAssign({
                    technicianId: technician.id,
                    taskIds: newlyAssignedIds
                });
            } catch (error) {
                console.error('Failed to assign tasks:', error);
            } finally {
                setIsSubmitting(false);
            }
        } else {
            onClose();
        }
    };

    const handleClose = () => {
        setSearchTerm('');
        setFilterStatus('all');
        setSelectedTaskIds([]);
        setIsSubmitting(false);
        onClose();
    };

    const getStatusColor = (status) => {
        const colors = {
            'PENDING': 'warning',
            'IN_PROGRESS': 'info',
            'COMPLETED': 'success',
            'CANCELLED': 'error',
            'PAUSED': 'default'
        };
        return colors[status] || 'default';
    };

    const getFilteredTasks = () => {
        let filtered = [...allTasks];
        filtered = filtered.filter(task => task.status !== 'COMPLETED' && task.status !== 'CANCELLED');

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(task =>
                task.issueType?.toLowerCase().includes(term) ||
                task.description?.toLowerCase().includes(term) ||
                task.motorcyclePlateNumber?.toLowerCase().includes(term) ||
                String(task.id || task.taskId).toLowerCase().includes(term)
            );
        }

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(task => task.status === filterStatus);
        }

        // Sort: pending first, then by due time
        filtered = [...filtered].sort((a, b) => {
            if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
            if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;

            if (a.dueTime && b.dueTime) {
                return new Date(a.dueTime) - new Date(b.dueTime);
            }
            return 0;
        });

        return filtered;
    };

    const filteredTasks = getFilteredTasks();
    const newAssignmentsCount = selectedTaskIds.filter(
        id => !technicianTasks.some(task =>
            (task.id || task.taskId) === id && task.technicianId === technician?.id
        )
    ).length;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                Assign Tasks to {technician?.fullName || technician?.username}
            </DialogTitle>

            <DialogContent>
                {technician && (
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="subtitle2">
                                {technician.fullName || technician.username}
                            </Typography>
                            <SpecialityChip speciality={technician.speciality} />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            Current Active Tasks: {technician.activeTasks || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Completed Tasks: {technician.completedTasks || 0}
                        </Typography>
                    </Box>
                )}

                <Divider sx={{ mb: 2 }} />

                {/* Search and Filter */}
                <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                        size="small"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                        sx={{ flex: 1, minWidth: 200 }}
                    />

                    <FormControl size="small">
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {['all', 'PENDING', 'IN_PROGRESS'].map(status => (
                                <Chip
                                    key={status}
                                    label={status === 'all' ? 'All' : status.replace('_', ' ')}
                                    onClick={() => setFilterStatus(status)}
                                    color={filterStatus === status ? 'primary' : 'default'}
                                    size="small"
                                />
                            ))}
                        </Box>
                    </FormControl>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : filteredTasks.length === 0 ? (
                    <Alert severity="info">
                        No tasks available for assignment
                    </Alert>
                ) : (
                    <FormControl component="fieldset" fullWidth>
                        <FormLabel component="legend" sx={{ mb: 1 }}>
                            Select Tasks ({filteredTasks.length} available)
                        </FormLabel>
                        <FormGroup>
                            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                                {filteredTasks.map((task) => {
                                    const taskId = task.id || task.taskId;
                                    const isChecked = selectedTaskIds.includes(taskId);
                                    const wasAssigned = technicianTasks.some(
                                        t => (t.id || t.taskId) === taskId &&
                                            t.technicianId === technician?.id
                                    );

                                    return (
                                        <Box
                                            key={taskId}
                                            sx={{
                                                p: 2,
                                                mb: 1,
                                                border: '1px solid',
                                                borderColor: isChecked ? 'primary.main' : 'divider',
                                                borderRadius: 1,
                                                backgroundColor: isChecked ? 'action.selected' : 'background.paper',
                                                '&:hover': {
                                                    backgroundColor: 'action.hover'
                                                }
                                            }}
                                        >
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={isChecked}
                                                        onChange={() => handleToggleTask(taskId)}
                                                        disabled={task.status === 'COMPLETED' || task.status === 'CANCELLED'}
                                                    />
                                                }
                                                label={
                                                    <Box sx={{ width: '100%' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                            <Typography variant="subtitle2">
                                                                {task.issueType}
                                                            </Typography>
                                                            <Chip
                                                                label={task.status}
                                                                size="small"
                                                                color={getStatusColor(task.status)}
                                                            />
                                                            {wasAssigned && (
                                                                <Chip
                                                                    label="Currently Assigned"
                                                                    size="small"
                                                                    color="secondary"
                                                                    variant="outlined"
                                                                />
                                                            )}
                                                        </Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            ID: {taskId}
                                                        </Typography>
                                                        {task.motorcyclePlateNumber && (
                                                            <Typography variant="body2" color="text.secondary">
                                                                Motorcycle: {task.motorcyclePlateNumber}
                                                            </Typography>
                                                        )}
                                                        {task.description && (
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                                sx={{
                                                                    mt: 0.5,
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 2,
                                                                    WebkitBoxOrient: 'vertical',
                                                                    overflow: 'hidden'
                                                                }}
                                                            >
                                                                {task.description}
                                                            </Typography>
                                                        )}
                                                        {task.dueTime && (
                                                            <Typography variant="caption" color="error">
                                                                Due: {new Date(task.dueTime).toLocaleString()}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                }
                                                sx={{ width: '100%', m: 0 }}
                                            />
                                        </Box>
                                    );
                                })}
                            </Box>
                        </FormGroup>
                    </FormControl>
                )}

                {newAssignmentsCount > 0 && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        {newAssignmentsCount} new task(s) will be assigned.
                        An email notification will be sent to the technician.
                    </Alert>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || isSubmitting || newAssignmentsCount === 0}
                >
                    {loading || isSubmitting ? 'Assigning...' : `Assign ${newAssignmentsCount} Task${newAssignmentsCount !== 1 ? 's' : ''}`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AssignTaskDialog;