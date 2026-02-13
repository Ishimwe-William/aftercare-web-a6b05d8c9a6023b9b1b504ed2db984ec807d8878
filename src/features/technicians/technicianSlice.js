import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../config/apiConfig';

// Fetch all technicians
export const fetchTechnicians = createAsyncThunk(
    'technicians/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/technicians');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch technicians');
        }
    }
);

// Fetch technician by ID
export const fetchTechnicianById = createAsyncThunk(
    'technicians/fetchOne',
    async (id, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/technicians/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch technician');
        }
    }
);

// Fetch available technicians
export const fetchAvailableTechnicians = createAsyncThunk(
    'technicians/fetchAvailable',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/technicians/available');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch available technicians');
        }
    }
);

// Fetch technicians by status
export const fetchTechniciansByStatus = createAsyncThunk(
    'technicians/fetchByStatus',
    async (status, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/technicians/status/${status}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch technicians by status');
        }
    }
);

// Fetch technicians ordered by workload
export const fetchTechniciansWorkload = createAsyncThunk(
    'technicians/fetchWorkload',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/technicians/workload');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch workload');
        }
    }
);

// Search technicians
export const searchTechnicians = createAsyncThunk(
    'technicians/search',
    async (searchTerm, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/technicians/search', {
                params: { q: searchTerm }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to search technicians');
        }
    }
);

// Fetch single technician performance
export const fetchTechnicianPerformance = createAsyncThunk(
    'technicians/fetchPerformance',
    async (id, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/technicians/${id}/performance`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch performance');
        }
    }
);

// Fetch all technicians performance
export const fetchAllTechniciansPerformance = createAsyncThunk(
    'technicians/fetchAllPerformance',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/technicians/performance/all');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch all performance');
        }
    }
);

// Fetch active task count
export const fetchActiveTaskCount = createAsyncThunk(
    'technicians/fetchActiveTaskCount',
    async (id, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/technicians/${id}/active-tasks/count`);
            return { id, count: response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch active task count');
        }
    }
);

// Fetch completed task count
export const fetchCompletedTaskCount = createAsyncThunk(
    'technicians/fetchCompletedTaskCount',
    async (id, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/technicians/${id}/completed-tasks/count`);
            return { id, count: response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch completed task count');
        }
    }
);

// Create technician (admin only)
export const createTechnician = createAsyncThunk(
    'technicians/create',
    async (technicianData, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/technicians', technicianData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create technician');
        }
    }
);

// Update technician (admin only)
export const updateTechnician = createAsyncThunk(
    'technicians/update',
    async ({ id, technicianData }, { rejectWithValue }) => {
        try {
            const response = await apiClient.put(`/technicians/${id}`, technicianData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update technician');
        }
    }
);

// Delete technician (admin only)
export const deleteTechnician = createAsyncThunk(
    'technicians/delete',
    async (id, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/technicians/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete technician');
        }
    }
);

// Toggle technician status (admin only)
export const toggleTechnicianStatus = createAsyncThunk(
    'technicians/toggleStatus',
    async (id, { rejectWithValue }) => {
        try {
            const response = await apiClient.patch(`/technicians/${id}/toggle-status`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to toggle status');
        }
    }
);

// Fetch technician details with history, parts, feedback
export const fetchTechnicianDetails = createAsyncThunk(
    'technicians/fetchDetails',
    async (id, { rejectWithValue }) => {
        try {
            const [techRes, perfRes, tasksRes, logsRes] = await Promise.all([
                apiClient.get(`/technicians/${id}`),
                apiClient.get(`/technicians/${id}/performance`),
                apiClient.get(`/service-tasks/technician/${id}`),
                apiClient.get(`/activity-logs/user/${id}`)
            ]);
            return {
                technician: techRes.data,
                performance: perfRes.data,
                tasks: tasksRes.data,
                logs: logsRes.data
            };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch details');
        }
    }
);

const technicianSlice = createSlice({
    name: 'technicians',
    initialState: {
        technicians: [],
        availableTechnicians: [],
        workloadData: [],
        performanceData: [],
        currentTechnician: null,
        currentPerformance: null,
        technicianDetails: null,
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
    },
    reducers: {
        resetCurrentTechnician: (state) => {
            state.currentTechnician = null;
            state.currentPerformance = null;
            state.technicianDetails = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearTechnicians: (state) => {
            state.technicians = [];
            state.performanceData = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchTechnicians
            .addCase(fetchTechnicians.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchTechnicians.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.technicians = action.payload;
                state.error = null;
            })
            .addCase(fetchTechnicians.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // fetchTechnicianById
            .addCase(fetchTechnicianById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchTechnicianById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentTechnician = action.payload;
                state.error = null;
            })
            .addCase(fetchTechnicianById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // fetchAvailableTechnicians
            .addCase(fetchAvailableTechnicians.fulfilled, (state, action) => {
                state.availableTechnicians = action.payload;
            })
            // fetchTechniciansByStatus
            .addCase(fetchTechniciansByStatus.fulfilled, (state, action) => {
                state.technicians = action.payload;
            })
            // fetchTechniciansWorkload
            .addCase(fetchTechniciansWorkload.fulfilled, (state, action) => {
                state.workloadData = action.payload;
            })
            // searchTechnicians
            .addCase(searchTechnicians.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(searchTechnicians.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.technicians = action.payload;
            })
            .addCase(searchTechnicians.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // fetchTechnicianPerformance
            .addCase(fetchTechnicianPerformance.fulfilled, (state, action) => {
                state.currentPerformance = action.payload;
            })
            // fetchAllTechniciansPerformance
            .addCase(fetchAllTechniciansPerformance.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllTechniciansPerformance.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.performanceData = action.payload;
            })
            .addCase(fetchAllTechniciansPerformance.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // fetchTechnicianDetails
            .addCase(fetchTechnicianDetails.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTechnicianDetails.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.technicianDetails = action.payload;
            })
            .addCase(fetchTechnicianDetails.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // createTechnician
            .addCase(createTechnician.fulfilled, (state, action) => {
                state.technicians.push(action.payload);
            })
            // updateTechnician
            .addCase(updateTechnician.fulfilled, (state, action) => {
                const index = state.technicians.findIndex(t => t.id === action.payload.id);
                if (index !== -1) {
                    state.technicians[index] = action.payload;
                }
                if (state.currentTechnician?.id === action.payload.id) {
                    state.currentTechnician = action.payload;
                }
            })
            // deleteTechnician
            .addCase(deleteTechnician.fulfilled, (state, action) => {
                state.technicians = state.technicians.filter(t => t.id !== action.payload);
                if (state.currentTechnician?.id === action.payload) {
                    state.currentTechnician = null;
                }
            })
            // toggleTechnicianStatus
            .addCase(toggleTechnicianStatus.fulfilled, (state, action) => {
                const index = state.technicians.findIndex(t => t.id === action.payload.id);
                if (index !== -1) {
                    state.technicians[index] = action.payload;
                }
                if (state.currentTechnician?.id === action.payload.id) {
                    state.currentTechnician = action.payload;
                }
            })
            // fetchActiveTaskCount
            .addCase(fetchActiveTaskCount.fulfilled, (state, action) => {
                const { id, count } = action.payload;
                const tech = state.technicians.find(t => t.id === id);
                if (tech) {
                    tech.activeTasks = count;
                }
            })
            // fetchCompletedTaskCount
            .addCase(fetchCompletedTaskCount.fulfilled, (state, action) => {
                const { id, count } = action.payload;
                const tech = state.technicians.find(t => t.id === id);
                if (tech) {
                    tech.completedTasks = count;
                }
            });
    },
});

export const { resetCurrentTechnician, clearError, clearTechnicians } = technicianSlice.actions;
export default technicianSlice.reducer;