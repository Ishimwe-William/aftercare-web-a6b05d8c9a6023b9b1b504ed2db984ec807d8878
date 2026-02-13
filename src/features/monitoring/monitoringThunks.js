import {createAsyncThunk} from '@reduxjs/toolkit';
import apiClient from '../../config/apiConfig';

export const fetchServiceCases = createAsyncThunk(
    'monitoring/fetchServiceCases',
    async ({
               status,
               technicianId,
               motorcycleId,
               startDate,
               endDate,
               page = 0,
               size = 10,
               sortBy = 'createdAt',
               sortDir = 'DESC'
           }, {rejectWithValue}) => {
        try {
            const params = {
                ...(status && {status}),
                technicianId,
                motorcycleId,
                ...(startDate && {startDate: startDate.toISOString()}),
                ...(endDate && {endDate: endDate.toISOString()}),
                page,
                size,
                sortBy,
                sortDir
            };
            const response = await apiClient.get('/monitoring/cases', {params});
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to load cases');
        }
    }
);

export const fetchCaseDetails = createAsyncThunk(
    'monitoring/fetchCaseDetails',
    async (taskId, {rejectWithValue}) => {
        try {
            const response = await apiClient.get(`/monitoring/cases/${taskId}`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to load case details');
        }
    }
);

export const reassignTask = createAsyncThunk(
    'monitoring/reassignTask',
    async ({taskId, newTechnicianId, reason}, {rejectWithValue}) => {

        // [DEBUG] Check what is actually being sent
        console.log("Sending Reassign POST Request:", { taskId, newTechnicianId, reason });

        if (!taskId || !newTechnicianId) {
            console.error("Reassign Aborted: Missing ID");
            return rejectWithValue("Cannot reassign: Missing Task ID or Technician ID");
        }

        try {
            const response = await apiClient.post('/monitoring/cases/reassign', {
                taskId,
                newTechnicianId,
                reason
            });
            return response.data;
        } catch (err) {
            // Fix for the "React Error #31" crash:
            // Ensure you return a String, not an Object
            const message = err.response?.data?.message || err.message || 'Reassign failed';
            return rejectWithValue(message);
        }
    }
);

export const fetchAlerts = createAsyncThunk(
    'monitoring/fetchAlerts',
    async (_, {rejectWithValue}) => {
        try {
            const response = await apiClient.get('/monitoring/alerts');
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to load alerts');
        }
    }
);

export const fetchStatistics = createAsyncThunk(
    'monitoring/fetchStatistics',
    async (_, {rejectWithValue}) => {
        try {
            const response = await apiClient.get('/monitoring/statistics');
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to load stats');
        }
    }
);

export const fetchTimeline = createAsyncThunk(
    'monitoring/fetchTimeline',
    async ({startDate, endDate}, {rejectWithValue}) => {
        try {
            const params = {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            };
            const response = await apiClient.get('/monitoring/timeline', {params});
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to load timeline');
        }
    }
);

export const fetchPeakHours = createAsyncThunk(
    'monitoring/fetchPeakHours',
    async ({startDate, endDate}, {rejectWithValue}) => {
        try {
            const params = {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            };
            const response = await apiClient.get('/monitoring/peak-hours', {params});
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to load peak hours');
        }
    }
);