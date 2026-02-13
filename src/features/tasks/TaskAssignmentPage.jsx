import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    Snackbar,
    Alert,
    Stack, DialogContentText, Button, DialogContent, DialogTitle, Dialog, DialogActions
} from '@mui/material';
import {
    ViewKanban as KanbanIcon,
    ViewList as ListIcon,
    Timeline as TimelineIcon
} from '@mui/icons-material';
import {
    fetchAllTasks,
    fetchTasksByStatus,
    fetchTaskStatistics,
    clearError,
    clearSuccessMessage,
    fetchTaskById, deleteTask
} from './taskAssignmentSlice';
import { fetchAllMotorcycles } from '../vehicles/motorcycleSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import TaskQueue from './components/TaskQueue';
import TaskKanbanBoard from './components/TaskKanbanBoard';
import TaskGanttView from './components/TaskGanttView';
import TaskNotifications from './components/TaskNotifications';
import {TaskFiltersPanel} from './components/TaskFiltersPanel';
import ReassignTaskDialog from './components/ReassignTaskDialog';
import {fetchTechnicians} from "../technicians/technicianSlice";
import TaskFormDialog from "./components/TaskFormDialog";

const TaskAssignmentPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { taskId } = useParams();

    const {
        taskQueue,
        statistics,
        loading,
        error,
        successMessage
    } = useSelector((state) => state.tasks);

    const { technicians } = useSelector((state) => state.technicians);
    const { motorcycles } = useSelector((state) => state.motorcycles);

    const [viewMode, setViewMode] = useState(0); // 0: Kanban, 1: Queue, 2: Gantt
    const [filters, setFilters] = useState({
        status: 'all',
        priority: 'all',
        technicianId: '',
        motorcycleId: '',
        dateRange: 'all',
        plateNumber: '' // Added to local state
    });

    const [dialogs, setDialogs] = useState({
        reassign: false,
        delete: false
    });

    const [selectedTask, setSelectedTask] = useState(null);

    useEffect(() => {
        loadInitialData();
    }, []);

    // Effect to handle URL-based dialog opening and data fetching
    useEffect(() => {
        const isCreateUrl = location.pathname.endsWith('/create');
        const isEditUrl = taskId && location.pathname.includes(`/edit/${taskId}`);

        if (isCreateUrl) {
            setSelectedTask(null); // Ensure no task is selected for creation
        } else if (isEditUrl) {
            // Fetch task and open Edit Dialog
            dispatch(fetchTaskById(taskId))
                .unwrap()
                .then(taskData => {
                    setSelectedTask(taskData);
                })
                .catch(err => {
                    console.error("Failed to fetch task for editing:", err);
                    navigate('/tasks');
                });
        } else {
            // Close dialog if not on create or edit route
            setSelectedTask(null);
        }
    }, [location.pathname, taskId, dispatch, navigate]);

    const loadInitialData = () => {
        dispatch(fetchAllTasks({ page: 0, size: 100 }));
        dispatch(fetchTaskStatistics());
        dispatch(fetchTechnicians());
        dispatch(fetchAllMotorcycles({ size: 1000 }));
    };

    const applyFilters = (newFilters) => {
        // Only trigger a re-fetch if the Status is changed (since the backend supports it)
        if (newFilters.status !== filters.status) {
            if (newFilters.status !== 'all') {
                dispatch(fetchTasksByStatus(newFilters.status));
            } else {
                dispatch(fetchAllTasks({ page: 0, size: 100 }));
            }
        }
    };

    const handleViewChange = (event, newValue) => {
        setViewMode(newValue);
    };

    const handleFilterChange = (newFilters) => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);
        // Only call applyFilters for server-side filter changes (Status)
        applyFilters(updatedFilters);
    };

    const openDialog = (type, task = null) => {
        setSelectedTask(task);
        if (type === 'create') {
            navigate('/tasks/create');
        } else if (type === 'edit' && task?.id) {
            navigate(`/tasks/edit/${task.id}`);
        } else if (type === 'reassign') {
            setDialogs({ ...dialogs, reassign: true });
        } else if (type === 'delete') {
            setDialogs({ ...dialogs, delete: true });
        }
    };

    const handleDeleteConfirm = () => {
        if (selectedTask && selectedTask.id) {
            dispatch(deleteTask(selectedTask.id))
                .unwrap()
                .then(() => {
                    closeDialog('delete');
                    loadInitialData(); // Refresh lists and stats
                })
                .catch((err) => {
                    console.error("Failed to delete task:", err);
                    // Error is handled by global error state in slice
                });
        }
    };

    const closeDialog = (type) => {
        if (type === 'taskForm' || location.pathname.endsWith('/create') || location.pathname.includes('/edit/')) {
            navigate('/tasks');
        } else if (type === 'reassign') {
            setDialogs({ ...dialogs, reassign: false });
        } else if (type === 'delete') { // <--- Add this block
            setDialogs({ ...dialogs, delete: false });
        }
        setSelectedTask(null);
    };

    const handleCreateEditSuccess = () => {
        closeDialog('taskForm');
        loadInitialData();
    };

    const handleReassignSuccess = () => {
        closeDialog('reassign');
        loadInitialData();
    };

    const handleCloseSnackbar = () => {
        if (error) dispatch(clearError());
        if (successMessage) dispatch(clearSuccessMessage());
    };

    // Derived state for TaskFormDialog visibility
    const isTaskFormDialogOpen = location.pathname.endsWith('/create') || (taskId && location.pathname.includes(`/tasks/edit/${taskId}`));

    if (loading && !taskQueue.length && !isTaskFormDialogOpen) {
        return <LoadingSpinner />;
    }

    return (
        <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#f5f5f5', p: 3 }}>
            {/* Header: REMOVE CREATE TASK BUTTON */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" gutterBottom>
                    Task Assignment & Workflow
                </Typography>
                {/* Create Task button removed from here */}
            </Stack>

            {/* Notifications */}
            <TaskNotifications statistics={statistics} />

            {/* Filters: Pass openDialog */}
            <TaskFiltersPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                technicians={technicians}
                openDialog={openDialog}
            />

            {/* View Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={viewMode}
                    onChange={handleViewChange}
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab icon={<KanbanIcon />} label="Kanban Board" iconPosition="start" />
                    <Tab icon={<ListIcon />} label="Task Queue" iconPosition="start" />
                    <Tab icon={<TimelineIcon />} label="Gantt Timeline" iconPosition="start" />
                </Tabs>
            </Paper>

            {/* View Content */}
            <Box sx={{ mt: 3 }}>
                {viewMode === 1 && (
                    <TaskQueue
                        tasks={taskQueue}
                        filters={filters}
                        technicians={technicians}
                        motorcycles={motorcycles}
                        onEdit={(task) => openDialog('edit', task)}
                        onReassign={(task) => openDialog('reassign', task)}
                        onRefresh={loadInitialData}
                        onDelete={(task) => openDialog('delete', task)}
                    />
                )}

                {viewMode === 0 && (
                    <TaskKanbanBoard
                        tasks={taskQueue}
                        filters={filters}
                        technicians={technicians}
                        onEdit={(task) => openDialog('edit', task)}
                        onReassign={(task) => openDialog('reassign', task)}
                        onRefresh={loadInitialData}
                        onDelete={(task) => openDialog('delete', task)}
                    />
                )}

                {viewMode === 2 && (
                    <TaskGanttView
                        tasks={taskQueue}
                        filters={filters}
                        technicians={technicians}
                        onEdit={(task) => openDialog('edit', task)}
                        onReassign={(task) => openDialog('reassign', task)}
                        onDelete={(task) => openDialog('delete', task)}
                    />
                )}
            </Box>

            {/* Dialogs */}
            <TaskFormDialog
                open={isTaskFormDialogOpen}
                task={selectedTask}
                onClose={() => closeDialog('taskForm')}
                onSuccess={handleCreateEditSuccess}
                technicians={technicians}
                motorcycles={motorcycles}
            />

            <ReassignTaskDialog
                open={dialogs.reassign}
                task={selectedTask}
                onClose={() => closeDialog('reassign')}
                onSuccess={handleReassignSuccess}
                technicians={technicians}
            />
            {/* Delete Confirmation Dialog */}
            <Dialog
                open={dialogs.delete}
                onClose={() => closeDialog('delete')}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Confirm Task Deletion"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete Task #{selectedTask?.id}?
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => closeDialog('delete')} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} disabled={loading} color="error" variant="contained" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={!!error || !!successMessage}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={error ? 'error' : 'success'}
                    variant="filled"
                >
                    {error || successMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TaskAssignmentPage;