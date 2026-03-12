import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Autocomplete,
    TextField,
    MenuItem,
    Grid,
    Box,
    Alert,
    FormControl,
    Chip,
    Typography
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { createTask, updateTask } from '../taskAssignmentSlice';
import { fetchIssues } from '../../settings/issuesSlice';

// ─── Helpers (same palette as TechnicianTable) ────────────────────────────────
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

const initialFormData = {
    motorcycleId: '',
    technicianId: '',
    issueType: '',
    description: '',
    notes: '',
    estimatedTime: '',
    dueTime: null,
    laborHours: ''
};

const TaskFormDialog = ({ open, task, onClose, onSuccess, technicians, motorcycles }) => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector(state => state.tasks);
    const { issues: availableIssues } = useSelector(state => state.issues || { issues: [] });

    const isEditMode = !!task;
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        if (isEditMode && task) {
            setFormData({
                motorcycleId:  task.motorcycleId  || '',
                technicianId:  task.technicianId  || '',
                issueType:     task.issueType     || '',
                description:   task.description   || '',
                notes:         task.notes         || '',
                estimatedTime: task.estimatedTime || '',
                dueTime:       task.dueTime ? new Date(task.dueTime) : null,
                laborHours:    task.laborHours ? String(task.laborHours) : ''
            });
        } else {
            setFormData(initialFormData);
        }
    }, [task, open, isEditMode]);

    useEffect(() => {
        dispatch(fetchIssues());
    }, [dispatch]);

    const handleChange = (field, value) => setFormData({ ...formData, [field]: value });

    const handleSubmit = async () => {
        const taskData = {
            ...formData,
            estimatedTime: formData.estimatedTime ? Number(formData.estimatedTime) : null,
            laborHours:    formData.laborHours    ? formData.laborHours             : null
        };
        try {
            if (isEditMode) {
                await dispatch(updateTask({ taskId: task.id, taskData })).unwrap();
            } else {
                await dispatch(createTask(taskData)).unwrap();
            }
            onSuccess();
        } catch (err) {
            console.error(`Failed to ${isEditMode ? 'update' : 'create'} task:`, err);
        }
    };

    const isFormInvalid = !formData.motorcycleId || !formData.technicianId || !formData.issueType;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{isEditMode ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Grid container spacing={2}>

                        {/* Motorcycle */}
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth size="small" sx={{ m: 1, minWidth: 120 }}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Motorcycle"
                                    value={formData.motorcycleId}
                                    onChange={(e) => handleChange('motorcycleId', e.target.value)}
                                    required
                                    disabled={isEditMode}
                                >
                                    {motorcycles?.map((bike) => (
                                        <MenuItem key={bike.id} value={bike.id}>
                                            {bike.plateNumber} - {bike.model}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </FormControl>
                        </Grid>

                        {/* Technician — shows speciality chip next to name */}
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth size="small" sx={{ m: 1, minWidth: 150 }}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Assign to Technician"
                                    value={formData.technicianId}
                                    onChange={(e) => handleChange('technicianId', e.target.value)}
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
                                    {technicians?.map((tech) => (
                                        <MenuItem key={tech.id} value={tech.id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="body2">{tech.fullName || tech.username}</Typography>
                                                    {/* Online/offline indicator */}
                                                    <Box
                                                        sx={{
                                                            width: 8, height: 8, borderRadius: '50%',
                                                            bgcolor: tech.status ? 'success.main' : 'grey.400'
                                                        }}
                                                    />
                                                </Box>
                                                <SpecialityChip speciality={tech.speciality} />
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </FormControl>
                        </Grid>

                        {/* Issue Type */}
                        <Grid item xs={12}>
                            <FormControl fullWidth size="small" sx={{ m: 1, minWidth: 120 }}>
                                <Autocomplete
                                    freeSolo
                                    options={(availableIssues || []).map(i => i.name)}
                                    value={formData.issueType}
                                    onChange={(e, value) => handleChange('issueType', value || '')}
                                    onInputChange={(e, value) => handleChange('issueType', value)}
                                    renderInput={(params) => (
                                        <TextField {...params} fullWidth label="Issue Type" required />
                                    )}
                                />
                            </FormControl>
                        </Grid>

                        {/* Description */}
                        <Grid item xs={12}>
                            <FormControl fullWidth size="small" sx={{ m: 1, minWidth: 120 }}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    multiline
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                />
                            </FormControl>
                        </Grid>

                        {/* Estimated Time */}
                        <Grid item xs={12} md={isEditMode ? 4 : 6}>
                            <FormControl fullWidth size="small" sx={{ m: 1, minWidth: 120 }}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Estimated Time (minutes)"
                                    value={formData.estimatedTime}
                                    onChange={(e) => handleChange('estimatedTime', e.target.value)}
                                />
                            </FormControl>
                        </Grid>

                        {/* Labor Hours — Edit mode only */}
                        {isEditMode && (
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth size="small" sx={{ m: 1, minWidth: 120 }}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Labor Hours"
                                        value={formData.laborHours}
                                        onChange={(e) => handleChange('laborHours', e.target.value)}
                                    />
                                </FormControl>
                            </Grid>
                        )}

                        {/* Due Date & Time */}
                        <Grid item xs={12} md={isEditMode ? 4 : 6}>
                            <FormControl fullWidth size="small" sx={{ m: 1, minWidth: 120 }}>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DateTimePicker
                                        label="Due Date & Time"
                                        value={formData.dueTime}
                                        onChange={(v) => handleChange('dueTime', v)}
                                        renderInput={(params) => <TextField {...params} fullWidth />}
                                    />
                                </LocalizationProvider>
                            </FormControl>
                        </Grid>

                        {/* Notes */}
                        <Grid item xs={12}>
                            <FormControl fullWidth size="small" sx={{ m: 1, minWidth: 120 }}>
                                <TextField
                                    fullWidth
                                    label="Notes"
                                    multiline
                                    rows={isEditMode ? 3 : 2}
                                    value={formData.notes}
                                    onChange={(e) => handleChange('notes', e.target.value)}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading || isFormInvalid}
                >
                    {loading
                        ? `${isEditMode ? 'Update' : 'Create'}ing...`
                        : isEditMode ? 'Update Task' : 'Create Task'
                    }
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TaskFormDialog;