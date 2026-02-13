import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../config/apiConfig';

export const fetchDashboardStats = createAsyncThunk(
    'dashboard/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const [taskStats, motorcycleStats, technicians, alerts, monitoring] = await Promise.all([
                apiClient.get('/service-tasks/statistics'),
                apiClient.get('/motorcycles/statistics'),
                apiClient.get('/technicians/workload'),
                apiClient.get('/spare-parts/alerts'),
                apiClient.get('/monitoring/statistics')
            ]);

            return {
                taskStats: taskStats.data,
                motorcycleStats: motorcycleStats.data,
                technicianWorkload: technicians.data,
                inventoryAlerts: alerts.data,
                monitoringStats: monitoring.data
            };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
        }
    }
);

export const fetchServiceTimeline = createAsyncThunk(
    'dashboard/fetchTimeline',
    async ({ startDate, endDate }, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/monitoring/timeline', {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch timeline');
        }
    }
);

export const fetchRecentActivity = createAsyncThunk(
    'dashboard/fetchActivity',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const params = { page: 0, size: 15, ...filters }; // Add filters like action, userId
            const response = await apiClient.get('/activity-logs/recent', { params });
            return response.data.content;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch activity');
        }
    }
);

export const fetchOverdueTasks = createAsyncThunk(
    'dashboard/fetchOverdue',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/service-tasks/overdue', {
                params: { page: 0, size: 10 }
            });
            return response.data.content; // Assuming paged
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch overdue tasks');
        }
    }
);

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState: {
        stats: null,
        timeline: [],
        recentActivity: [],
        overdueTasks: [],
        lastRefresh: new Date().toISOString(),
        status: 'idle',
        error: null,
        loading: {
            stats: false,
            timeline: false,
            activity: false,
        }
    },
    reducers: {
        setLastRefresh: (state) => {
            state.lastRefresh = new Date().toISOString();
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardStats.pending, (state) => {
                state.loading.stats = true;
                state.error = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.loading.stats = false;
                state.stats = action.payload;
                state.lastRefresh = new Date().toISOString();
                state.status = 'succeeded';
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.loading.stats = false;
                state.error = action.payload;
                state.status = 'failed';
            })
            .addCase(fetchServiceTimeline.pending, (state) => {
                state.loading.timeline = true;
            })
            .addCase(fetchServiceTimeline.fulfilled, (state, action) => {
                state.loading.timeline = false;
                state.timeline = action.payload;
            })
            .addCase(fetchServiceTimeline.rejected, (state, action) => {
                state.loading.timeline = false;
                state.error = action.payload;
            })
            .addCase(fetchRecentActivity.pending, (state) => {
                state.loading.activity = true;
            })
            .addCase(fetchRecentActivity.fulfilled, (state, action) => {
                state.loading.activity = false;
                state.recentActivity = action.payload;
            })
            .addCase(fetchRecentActivity.rejected, (state, action) => {
                state.loading.activity = false;
                state.error = action.payload;
            })
            .addCase(fetchOverdueTasks.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchOverdueTasks.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.overdueTasks = action.payload;
            })
            .addCase(fetchOverdueTasks.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    }
});

export const { setLastRefresh, clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;