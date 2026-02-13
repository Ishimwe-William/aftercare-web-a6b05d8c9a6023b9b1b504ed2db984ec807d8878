import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Alert, Snackbar } from '@mui/material';
import {
    fetchTechnicians,
    fetchAllTechniciansPerformance,
    searchTechnicians,
    toggleTechnicianStatus,
    fetchTechnicianDetails,
    clearError
} from './technicianSlice';
import * as taskSlice from "../tasks/taskAssignmentSlice";
import TechnicianFilters from './components/TechnicianFilters';
import TechnicianLeaderboard from './components/TechnicianLeaderboard';
import TechnicianTable from './components/TechnicianTable';
import TechnicianDetailsDialog from './components/TechnicianDetailsDialog';
import AssignTaskDialog from './components/AssignTaskDialog';
import LoadingSpinner from "../../components/common/LoadingSpinner";

const TechniciansPage = () => {
    const dispatch = useDispatch();
    const { technicians, performanceData, technicianDetails, status, error } = useSelector(
        (state) => state.technicians
    );
    const { tasks } = useSelector((state) => state.tasks);

    const [filters, setFilters] = useState({
        status: 'all',
        sortBy: 'name',
        searchTerm: ''
    });

    const [selectedTechnician, setSelectedTechnician] = useState(null);
    const [technicianTasks, setTechnicianTasks] = useState([]);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [assignOpen, setAssignOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // FIX 1: Wrap loadData in useCallback to stabilize the function reference
    const loadData = useCallback(() => {
        dispatch(fetchTechnicians());
        dispatch(fetchAllTechniciansPerformance());
        dispatch(taskSlice.fetchAllTasks({ size: 1000 }));
    }, [dispatch]);

    // FIX 2: Add loadData to the dependency array
    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleFilterChange = (field, value) => {
        setFilters({ ...filters, [field]: value });
    };

    const handleSearch = (searchTerm) => {
        setFilters({ ...filters, searchTerm });
        if (searchTerm.trim()) {
            dispatch(searchTechnicians(searchTerm));
        } else {
            dispatch(fetchTechnicians());
        }
    };

    const handleViewDetails = async (tech) => {
        try {
            const res = await dispatch(fetchTechnicianDetails(tech.id)).unwrap();
            setSelectedTechnician(res.technician);
            setDetailsOpen(true);
        } catch (err) {
            setSnackbar({
                open: true,
                message: err || 'Failed to load details',
                severity: 'error'
            });
        }
    };

    const handleAssignTask = async (tech) => {
        setSelectedTechnician(tech);
        try {
            const techTasks = await dispatch(taskSlice.fetchTasksByTechnician(tech.id)).unwrap();
            setTechnicianTasks(techTasks);
        } catch (err) {
            console.error('Failed to fetch technician tasks:', err);
            setTechnicianTasks([]);
        }
        setAssignOpen(true);
    };

    const handleToggleStatus = async (techId) => {
        try {
            await dispatch(toggleTechnicianStatus(techId)).unwrap();
            setSnackbar({
                open: true,
                message: 'Technician status updated successfully',
                severity: 'success'
            });
        } catch (err) {
            setSnackbar({
                open: true,
                message: err || 'Failed to update status',
                severity: 'error'
            });
        }
    };

    const handleAssignTaskSubmit = async (assignmentData) => {
        try {
            const { technicianId, taskIds } = assignmentData;

            for (const taskId of taskIds) {
                const task = tasks.find(t => (t.id || t.taskId) === taskId);
                if (task) {
                    await dispatch(taskSlice.updateTask({
                        id: taskId,
                        taskData: {
                            motorcycleId: task.motorcycleId,
                            technicianId: technicianId,
                            issueType: task.issueType,
                            description: task.description,
                            notes: task.notes,
                            laborHours: task.laborHours,
                            estimatedTime: task.estimatedTime,
                            dueTime: task.dueTime
                        }
                    })).unwrap();
                }
            }

            setSnackbar({
                open: true,
                message: `${taskIds.length} task(s) assigned successfully. Email notification sent to technician.`,
                severity: 'success'
            });
            setAssignOpen(false);
            loadData();
        } catch (err) {
            setSnackbar({
                open: true,
                message: err || 'Failed to assign tasks',
                severity: 'error'
            });
        }
    };

    const getFilteredTechnicians = () => {
        let filtered = [...technicians];

        if (filters.status !== 'all') {
            const statusBool = filters.status === 'online';
            filtered = filtered.filter(tech => tech.enabled === statusBool);
        }

        switch (filters.sortBy) {
            case 'name':
                filtered.sort((a, b) =>
                    (a.fullName || a.username).localeCompare(b.fullName || b.username)
                );
                break;
            case 'efficiency':
                filtered.sort((a, b) => {
                    const aTime = a.averageCompletionTimeHours || 999;
                    const bTime = b.averageCompletionTimeHours || 999;
                    return aTime - bTime;
                });
                break;
            case 'activeTasks':
                filtered.sort((a, b) => (b.activeTasks || 0) - (a.activeTasks || 0));
                break;
            case 'completedTasks':
                filtered.sort((a, b) => (b.completedTasks || 0) - (a.completedTasks || 0));
                break;
            default:
                break;
        }

        return filtered;
    };

    const filteredTechnicians = getFilteredTechnicians();

    if (status === 'loading' && technicians.length === 0) return <LoadingSpinner />

    return (
        <Box sx={{ width: '100%', p: 3, bgcolor: '#f5f5f5' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Technician Performance
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
                    {error}
                </Alert>
            )}

            <TechnicianFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
            />

            {performanceData.length > 0 && (
                <>
                    <TechnicianLeaderboard performance={performanceData} technicians={technicians} />
                </>
            )}

            <TechnicianTable
                technicians={filteredTechnicians}
                loading={status === 'loading'}
                onViewDetails={handleViewDetails}
                onAssignTask={handleAssignTask}
                onToggleStatus={handleToggleStatus}
                performanceData={performanceData}
            />

            <TechnicianDetailsDialog
                open={detailsOpen}
                technician={selectedTechnician}
                details={technicianDetails}
                onClose={() => setDetailsOpen(false)}
            />

            <AssignTaskDialog
                open={assignOpen}
                technician={selectedTechnician}
                onClose={() => setAssignOpen(false)}
                onAssign={handleAssignTaskSubmit}
                allTasks={tasks}
                technicianTasks={technicianTasks}
                loading={status === 'loading'}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TechniciansPage;