import React, { useState, useEffect, useMemo } from 'react';
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
    Stack,
    DialogContentText,
    Button,
    DialogContent,
    DialogTitle,
    Dialog,
    DialogActions
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
    fetchTaskById,
    deleteTask
} from './taskAssignmentSlice';

import { fetchAllMotorcycles } from '../vehicles/motorcycleSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';

import TaskQueue from './components/TaskQueue';
import TaskKanbanBoard from './components/TaskKanbanBoard';
import TaskGanttView from './components/TaskGanttView';
import TaskNotifications from './components/TaskNotifications';
import { TaskFiltersPanel } from './components/TaskFiltersPanel';
import ReassignTaskDialog from './components/ReassignTaskDialog';
import { fetchTechnicians } from "../technicians/technicianSlice";
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
        plateNumber: '',
        startDate: null,
        endDate: null
    });

    // ── FULL CLIENT-SIDE FILTERING (Priority + everything else) ─────────────
    const filterTasks = (tasks = [], currentFilters) => {
        return tasks.filter(task => {
            // Status
            const matchesStatus = currentFilters.status === 'all' ||
                task.status === currentFilters.status;

            // Priority (this was the missing piece before)
            const matchesPriority = currentFilters.priority === 'all' ||
                task.priority === currentFilters.priority;

            // Technician
            const matchesTechnician = !currentFilters.technicianId ||
                task.technicianId === currentFilters.technicianId;

            // Plate Number search
            const matchesPlate = !currentFilters.plateNumber ||
                task.motorcycle?.plateNumber?.toLowerCase().includes(
                    currentFilters.plateNumber.toLowerCase()
                );

            // Date Range
            let matchesDate = true;
            if (currentFilters.startDate && currentFilters.endDate) {
                if (!task.createdAt) {
                    matchesDate = false;
                } else {
                    const taskDate = new Date(task.createdAt);
                    const start = new Date(currentFilters.startDate);
                    start.setHours(0, 0, 0, 0);
                    const end = new Date(currentFilters.endDate);
                    end.setHours(23, 59, 59, 999);
                    matchesDate = taskDate >= start && taskDate <= end;
                }
            }

            return matchesStatus && matchesPriority && matchesTechnician &&
                matchesPlate && matchesDate;
        });
    };

    const filteredTasks = useMemo(() => filterTasks(taskQueue, filters), [taskQueue, filters]);

    const [dialogs, setDialogs] = useState({
        reassign: false,
        delete: false
    });

    const [selectedTask, setSelectedTask] = useState(null);

    useEffect(() => {
        loadInitialData();
    }, []);

    // Handle URL-based create/edit dialogs
    useEffect(() => {
        const isCreateUrl = location.pathname.endsWith('/create');
        const isEditUrl = taskId && location.pathname.includes(`/edit/${taskId}`);

        if (isCreateUrl) {
            setSelectedTask(null);
        } else if (isEditUrl) {
            dispatch(fetchTaskById(taskId))
                .unwrap()
                .then(taskData => setSelectedTask(taskData))
                .catch(() => navigate('/tasks'));
        } else {
            setSelectedTask(null);
        }
    }, [location.pathname, taskId, dispatch, navigate]);

    const loadInitialData = () => {
        dispatch(fetchAllTasks({ page: 0, size: 100 }));
        dispatch(fetchTaskStatistics());
        dispatch(fetchTechnicians());
        dispatch(fetchAllMotorcycles({ size: 1000 }));
    };

    const handleViewChange = (event, newValue) => {
        setViewMode(newValue);
    };

    const handleFilterChange = (newFilters) => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);

        // Only refetch from backend when Status changes (other filters are client-side)
        if (newFilters.status !== undefined && newFilters.status !== filters.status) {
            if (newFilters.status !== 'all') {
                dispatch(fetchTasksByStatus(newFilters.status));
            } else {
                dispatch(fetchAllTasks({ page: 0, size: 100 }));
            }
        }
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
        if (selectedTask?.id) {
            dispatch(deleteTask(selectedTask.id))
                .unwrap()
                .then(() => {
                    closeDialog('delete');
                    loadInitialData();
                })
                .catch(console.error);
        }
    };

    const closeDialog = (type) => {
        if (type === 'taskForm' || location.pathname.endsWith('/create') || location.pathname.includes('/edit/')) {
            navigate('/tasks');
        } else if (type === 'reassign') {
            setDialogs({ ...dialogs, reassign: false });
        } else if (type === 'delete') {
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

    const isTaskFormDialogOpen = location.pathname.endsWith('/create') ||
        (taskId && location.pathname.includes(`/tasks/edit/${taskId}`));

    if (loading && !taskQueue.length && !isTaskFormDialogOpen) {
        return <LoadingSpinner />;
    }

    return (
        <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#f5f5f5', p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" gutterBottom>
                    Task Assignment & Workflow
                </Typography>
            </Stack>

            <TaskNotifications statistics={statistics} />

            <TaskFiltersPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                technicians={technicians}
                openDialog={openDialog}
            />

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

            <Box sx={{ mt: 3 }}>
                {viewMode === 1 && (
                    <TaskQueue
                        tasks={filteredTasks}
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
                        tasks={filteredTasks}
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
                        tasks={filteredTasks}
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

            <Dialog open={dialogs.delete} onClose={() => closeDialog('delete')}>
                <DialogTitle>Confirm Task Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete Task #{selectedTask?.id}?
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => closeDialog('delete')} color="primary">Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={loading}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

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