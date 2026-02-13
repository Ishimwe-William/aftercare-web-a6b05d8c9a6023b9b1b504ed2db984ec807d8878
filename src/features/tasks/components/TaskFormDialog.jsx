import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
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
    Alert, FormControl
} from '@mui/material';
import {DateTimePicker} from '@mui/x-date-pickers/DateTimePicker';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {createTask, updateTask} from '../taskAssignmentSlice';
import { fetchIssues } from '../../settings/issuesSlice';

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

const TaskFormDialog = ({open, task, onClose, onSuccess, technicians, motorcycles}) => {
    const dispatch = useDispatch();
    // Use the 'tasks' state key (as confirmed in previous steps)
    const {loading, error} = useSelector(state => state.tasks);
    const { issues: availableIssues } = useSelector(state => state.issues || { issues: [] });

    // Determine mode: task exists -> Edit Mode, task is null -> Create Mode
    const isEditMode = !!task;

    const [formData, setFormData] = useState(initialFormData);

    // Effect to handle form population when 'task' prop changes (Edit Mode)
    useEffect(() => {
        if (isEditMode && task) {
            setFormData({
                motorcycleId: task.motorcycleId || '',
                technicianId: task.technicianId || '',
                issueType: task.issueType || '',
                description: task.description || '',
                notes: task.notes || '',
                estimatedTime: task.estimatedTime || '',
                dueTime: task.dueTime ? new Date(task.dueTime) : null,
                // Ensure laborHours is handled correctly (it's Bigdecimal in backend, but passed as string/number here)
                laborHours: task.laborHours ? String(task.laborHours) : ''
            });
        } else {
            // Reset form for Create Mode when dialog is opened without a task
            setFormData(initialFormData);
        }
    }, [task, open, isEditMode]); // Rerun when task or dialog visibility changes

    useEffect(() => {
        // Ensure known issues are loaded so we can suggest them in the Issue Type field
        dispatch(fetchIssues());
    }, [dispatch]);

    const handleChange = (field, value) => {
        setFormData({...formData, [field]: value});
    };

    const handleSubmit = async () => {
        // Construct taskData, ensuring estimatedTime and laborHours are numbers/null
        const taskData = {
            ...formData,
            estimatedTime: formData.estimatedTime ? Number(formData.estimatedTime) : null,
            // Backend DTO expects BigDecimal, so sending as string/number is typical for DTO mapping
            laborHours: formData.laborHours ? formData.laborHours : null
        };

        try {
            if (isEditMode) {
                await dispatch(updateTask({
                    taskId: task.id,
                    taskData: taskData
                })).unwrap();
            } else {
                await dispatch(createTask(taskData)).unwrap();
            }
            onSuccess();
        } catch (err) {
            console.error(`Failed to ${isEditMode ? 'update' : 'create'} task:`, err);
        }
    };

    const dialogTitle = isEditMode ? 'Edit Task' : 'Create New Task';
    const submitButtonText = isEditMode ? 'Update Task' : 'Create Task';

    // Basic validation check for required fields
    const isFormInvalid = !formData.motorcycleId || !formData.technicianId || !formData.issueType;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent>
                <Box sx={{mt: 2}}>
                    {error && (
                        <Alert severity="error" sx={{mb: 2}}>
                            {error}
                        </Alert>
                    )}

                    <Grid container spacing={2}>

                        {/* Motorcycle Select */}
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth size="small" sx={{m: 1, minWidth: 120}}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Motorcycle"
                                    value={formData.motorcycleId}
                                    onChange={(e) => handleChange('motorcycleId', e.target.value)}
                                    required
                                    disabled={isEditMode} // Usually prevent changing motorcycle after creation
                                >
                                    {motorcycles?.map((bike) => (
                                        <MenuItem key={bike.id} value={bike.id}>
                                            {bike.plateNumber} - {bike.model}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </FormControl>
                        </Grid>

                        {/* Technician Select */}
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth size="small" sx={{m: 1, minWidth: 150}}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Assign to Technician"
                                    value={formData.technicianId}
                                    onChange={(e) => handleChange('technicianId', e.target.value)}
                                    required
                                >
                                    {technicians?.map((tech) => (
                                        <MenuItem key={tech.id} value={tech.id}>
                                            {tech.fullName}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </FormControl>
                        </Grid>

                        {/* Issue Type */}
                        <Grid item xs={12}>
                             <FormControl fullWidth size="small" sx={{m: 1, minWidth: 120}}>
                                <Autocomplete
                                    freeSolo
                                    options={(availableIssues || []).map(i => i.name)}
                                    value={formData.issueType}
                                    onChange={(e, value) => handleChange('issueType', value || '')}
                                    onInputChange={(e, value) => handleChange('issueType', value)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            label="Issue Type"
                                            required
                                        />
                                    )}
                                />
                            </FormControl>
                        </Grid>

                        {/* Description */}
                        <Grid item xs={12}>
                            <FormControl fullWidth size="small" sx={{m: 1, minWidth: 120}}>
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
                            <FormControl fullWidth size="small" sx={{m: 1, minWidth: 120}}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Estimated Time (minutes)"
                                    value={formData.estimatedTime}
                                    onChange={(e) => handleChange('estimatedTime', e.target.value)}
                                />
                            </FormControl>
                        </Grid>

                        {/* Labor Hours (Only visible in Edit Mode) */}
                        {isEditMode && (
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth size="small" sx={{m: 1, minWidth: 120}}>
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
                            <FormControl fullWidth size="small" sx={{m: 1, minWidth: 120}}>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DateTimePicker
                                        label="Due Date & Time"
                                        value={formData.dueTime}
                                        onChange={(newValue) => handleChange('dueTime', newValue)}
                                        renderInput={(params) => <TextField {...params} fullWidth/>}
                                    />
                                </LocalizationProvider>
                            </FormControl>
                        </Grid>

                        {/* Notes */}
                        <Grid item xs={12}>
                            <FormControl fullWidth size="small" sx={{m: 1, minWidth: 120}}>
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
                    {loading ? `${submitButtonText}ing...` : submitButtonText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TaskFormDialog;