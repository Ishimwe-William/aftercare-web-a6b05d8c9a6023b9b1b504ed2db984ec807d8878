import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../config/apiConfig';
import { handleApiError } from '../../components/handleApiError';

// Thunks
export const fetchAllTasks = createAsyncThunk(
    'tasks/fetchAll',
    async ({ page = 0, size = 100 }, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/service-tasks', {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

// Fetch parts used in a task
export const fetchTaskParts = createAsyncThunk(
    'tasks/fetchTaskParts',
    async (taskId, {rejectWithValue}) => {
        try {
            const response = await apiClient.get(`/spare-parts/usage/task/${taskId}`);
            return response.data || [];
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const fetchTaskById = createAsyncThunk(
    'tasks/fetchById',
    async (taskId, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/service-tasks/${taskId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const fetchTasksByTechnician = createAsyncThunk(
    'tasks/fetchByTechnician',
    async (technicianId, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/service-tasks/technician/${technicianId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const fetchTasksByMotorcycle = createAsyncThunk(
    'tasks/fetchByMotorcycle',
    async (motorcycleId, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/service-tasks/motorcycle/${motorcycleId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const fetchTasksByStatus = createAsyncThunk(
    'tasks/fetchByStatus',
    async (status, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/service-tasks/status/${status}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const fetchTaskStatistics = createAsyncThunk(
    'tasks/fetchStatistics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/service-tasks/statistics');
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const fetchOverdueTasks = createAsyncThunk(
    'tasks/fetchOverdue',
    async ({ page = 0, size = 20 }, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/service-tasks/overdue', {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const fetchCompletedTasksBetween = createAsyncThunk(
    'tasks/fetchCompletedBetween',
    async ({ startDate, endDate, page = 0, size = 20 }, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/service-tasks/completed', {
                params: { startDate, endDate, page, size }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const createTask = createAsyncThunk(
    'tasks/create',
    async (taskData, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/service-tasks', taskData);
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const updateTask = createAsyncThunk(
    'tasks/update',
    async ({ taskId, taskData }, { rejectWithValue }) => {
        try {
            const response = await apiClient.put(`/service-tasks/${taskId}`, taskData);
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const updateTaskStatus = createAsyncThunk(
    'tasks/updateStatus',
    async ({ taskId, statusData }, { rejectWithValue }) => {
        try {
            const response = await apiClient.patch(`/service-tasks/${taskId}/status`, statusData);
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const deleteTask = createAsyncThunk(
    'tasks/delete',
    async (taskId, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/service-tasks/${taskId}`);
            return taskId;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

// Update existing part usage
export const updatePartUsage = createAsyncThunk(
    'tasks/updatePartUsage',
    async ({usageId, usageData}, {rejectWithValue}) => {
        try {
            const response = await apiClient.patch(`/spare-parts/usage/${usageId}`, usageData);
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

// Log new part usage
export const logPartUsage = createAsyncThunk(
    'tasks/logPartUsage',
    async (usageData, {rejectWithValue}) => {
        try {
            const response = await apiClient.post('/spare-parts/usage', usageData);
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

export const reassignTask = createAsyncThunk(
    'tasks/reassign',
    async ({ taskId, newTechnicianId, reason }, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const task = state.tasks.taskQueue.find(t => t.id === taskId);

            if (!task) {
                throw new Error('Task not found');
            }

            const updateData = {
                motorcycleId: task.motorcycleId,
                technicianId: newTechnicianId,
                issueType: task.issueType,
                description: task.description,
                notes: reason ? `${task.notes || ''}\n[Reassignment] ${reason}` : task.notes,
                laborHours: task.laborHours || 0,
                estimatedTime: task.estimatedTime,
                dueTime: task.dueTime
            };

            const response = await apiClient.put(`/service-tasks/${taskId}`, updateData);
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

// Slice
const taskAssignmentSlice = createSlice({
    name: 'tasks',
    initialState: {
        taskQueue: [],
        selectedTask: null,
        currentTaskParts: [],
        statistics: null,
        loading: false,
        error: null,
        successMessage: null
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccessMessage: (state) => {
            state.successMessage = null;
        },
        clearSelectedTask: (state) => {
            state.selectedTask = null;
        },
        clearTaskParts: (state) => {
            state.currentTaskParts = [];
        },
        updateTaskInQueue: (state, action) => {
            const index = state.taskQueue.findIndex(t => t.id === action.payload.id);
            if (index !== -1) {
                state.taskQueue[index] = action.payload;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch all tasks
            .addCase(fetchAllTasks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllTasks.fulfilled, (state, action) => {
                state.loading = false;
                state.taskQueue = action.payload.content || action.payload;
            })
            .addCase(fetchAllTasks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch tasks';
            })

            // Fetch task parts -
            .addCase(fetchTaskParts.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchTaskParts.fulfilled, (state, action) => {
                state.currentTaskParts = action.payload;
            })
            .addCase(fetchTaskParts.rejected, (state, action) => {
                state.error = action.payload || 'Failed to fetch task parts';
            })

            // Fetch task by ID
            .addCase(fetchTaskById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTaskById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedTask = action.payload;
            })
            .addCase(fetchTaskById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch task';
            })

            // Fetch by technician
            .addCase(fetchTasksByTechnician.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTasksByTechnician.fulfilled, (state, action) => {
                state.loading = false;
                state.taskQueue = action.payload;
            })
            .addCase(fetchTasksByTechnician.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch technician tasks';
            })

            // Fetch by motorcycle
            .addCase(fetchTasksByMotorcycle.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTasksByMotorcycle.fulfilled, (state, action) => {
                state.loading = false;
                state.taskQueue = action.payload;
            })
            .addCase(fetchTasksByMotorcycle.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch motorcycle tasks';
            })

            // Fetch by status
            .addCase(fetchTasksByStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTasksByStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.taskQueue = action.payload;
            })
            .addCase(fetchTasksByStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch tasks by status';
            })

            // Fetch statistics
            .addCase(fetchTaskStatistics.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchTaskStatistics.fulfilled, (state, action) => {
                state.statistics = action.payload;
            })
            .addCase(fetchTaskStatistics.rejected, (state, action) => {
                state.error = action.payload || 'Failed to fetch statistics';
            })

            // Fetch overdue tasks
            .addCase(fetchOverdueTasks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOverdueTasks.fulfilled, (state, action) => {
                state.loading = false;
                state.taskQueue = action.payload.content || action.payload;
            })
            .addCase(fetchOverdueTasks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch overdue tasks';
            })

            // Fetch completed tasks between dates
            .addCase(fetchCompletedTasksBetween.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCompletedTasksBetween.fulfilled, (state, action) => {
                state.loading = false;
                state.taskQueue = action.payload.content || action.payload;
            })
            .addCase(fetchCompletedTasksBetween.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch completed tasks';
            })

            // Create task
            .addCase(createTask.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createTask.fulfilled, (state, action) => {
                state.loading = false;
                state.taskQueue.unshift(action.payload);
                state.successMessage = 'Task created and assigned successfully';
            })
            .addCase(createTask.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to create task';
            })

            // Update task
            .addCase(updateTask.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.taskQueue.findIndex(t => t.id === action.payload.id);
                if (index !== -1) {
                    state.taskQueue[index] = action.payload;
                }
                state.successMessage = 'Task updated successfully';
            })
            .addCase(updateTask.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to update task';
            })

            // Update task status
            .addCase(updateTaskStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateTaskStatus.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.taskQueue.findIndex(t => t.id === action.payload.id);
                if (index !== -1) {
                    state.taskQueue[index] = action.payload;
                }
                state.successMessage = 'Task status updated successfully';
            })
            .addCase(updateTaskStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to update task status';
            })

            // Delete task
            .addCase(deleteTask.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteTask.fulfilled, (state, action) => {
                state.loading = false;
                state.taskQueue = state.taskQueue.filter(t => t.id !== action.payload);
                state.successMessage = 'Task deleted successfully';
            })
            .addCase(deleteTask.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to delete task';
            })

            // Reassign task
            .addCase(reassignTask.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(reassignTask.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.taskQueue.findIndex(t => t.id === action.payload.id);
                if (index !== -1) {
                    state.taskQueue[index] = action.payload;
                }
                state.successMessage = 'Task reassigned successfully';
            })
            .addCase(reassignTask.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to reassign task';
            })

            // Part Usage Reducers
            .addCase(logPartUsage.rejected, (state, action) => {
                state.error = action.payload || "Failed to add part usage";
            })
            .addCase(updatePartUsage.rejected, (state, action) => {
                state.error = action.payload || "Failed to update part usage";
            });
    }
});

export const {
    clearError,
    clearSuccessMessage,
    clearSelectedTask,
    clearTaskParts,
    updateTaskInQueue
} = taskAssignmentSlice.actions;

export default taskAssignmentSlice.reducer;