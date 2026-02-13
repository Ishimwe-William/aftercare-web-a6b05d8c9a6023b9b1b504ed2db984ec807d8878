import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../config/apiConfig';

// Fetch all motorcycles with pagination
export const fetchAllMotorcycles = createAsyncThunk(
    'motorcycles/fetchAll',
    async ({ page = 0, size = 1000 }, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/motorcycles', {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch motorcycles');
        }
    }
);

// Fetch motorcycles by status
export const fetchMotorcyclesByStatus = createAsyncThunk(
    'motorcycles/fetchByStatus',
    async (status, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/motorcycles/status/${status}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch motorcycles');
        }
    }
);

// Fetch motorcycle by ID
export const fetchMotorcycleById = createAsyncThunk(
    'motorcycles/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/motorcycles/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch motorcycle');
        }
    }
);

// Fetch motorcycle by QR code
export const fetchMotorcycleByQrCode = createAsyncThunk(
    'motorcycles/fetchByQrCode',
    async (qrCode, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/motorcycles/qr/${qrCode}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch motorcycle');
        }
    }
);

// Fetch motorcycles by owner phone
export const fetchMotorcyclesByOwnerPhone = createAsyncThunk(
    'motorcycles/fetchByOwnerPhone',
    async (phone, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/motorcycles/owner/phone/${phone}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch motorcycles');
        }
    }
);

// Fetch motorcycles by owner email
export const fetchMotorcyclesByOwnerEmail = createAsyncThunk(
    'motorcycles/fetchByOwnerEmail',
    async (email, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/motorcycles/owner/email/${email}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch motorcycles');
        }
    }
);

// Fetch motorcycles in service
export const fetchMotorcyclesInService = createAsyncThunk(
    'motorcycles/fetchInService',
    async ({ page = 0, size = 20 }, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/motorcycles/in-service', {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch motorcycles');
        }
    }
);

// Fetch motorcycles needing service
export const fetchMotorcyclesNeedingService = createAsyncThunk(
    'motorcycles/fetchNeedingService',
    async ({ page = 0, size = 20 }, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/motorcycles/needing-service', {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch motorcycles');
        }
    }
);

// Fetch motorcycle statistics
export const fetchMotorcycleStatistics = createAsyncThunk(
    'motorcycles/fetchStatistics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/motorcycles/statistics');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch statistics');
        }
    }
);

// Create motorcycle
export const createMotorcycle = createAsyncThunk(
    'motorcycles/create',
    async (motorcycleData, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/motorcycles', motorcycleData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to create motorcycle');
        }
    }
);

// Update motorcycle
export const updateMotorcycle = createAsyncThunk(
    'motorcycles/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await apiClient.put(`/motorcycles/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to update motorcycle');
        }
    }
);

// Update motorcycle status
export const updateMotorcycleStatus = createAsyncThunk(
    'motorcycles/updateStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const response = await apiClient.patch(`/motorcycles/${id}/status`, { status });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to update status');
        }
    }
);

// Delete motorcycle
export const deleteMotorcycle = createAsyncThunk(
    'motorcycles/delete',
    async (id, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/motorcycles/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to delete motorcycle');
        }
    }
);

const motorcycleSlice = createSlice({
    name: 'motorcycles',
    initialState: {
        motorcycles: [],
        selectedMotorcycle: null,
        statistics: null,
        loading: false,
        error: null,
        createLoading: false,
        createError: null,
        updateLoading: false,
        updateError: null,
        deleteLoading: false,
        deleteError: null,
        lastFetch: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
            state.createError = null;
            state.updateError = null;
            state.deleteError = null;
        },
        clearSelectedMotorcycle: (state) => {
            state.selectedMotorcycle = null;
        },
        setSelectedMotorcycle: (state, action) => {
            state.selectedMotorcycle = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all motorcycles
            .addCase(fetchAllMotorcycles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllMotorcycles.fulfilled, (state, action) => {
                state.loading = false;
                state.motorcycles = action.payload.content || action.payload;
                state.lastFetch = Date.now();
            })
            .addCase(fetchAllMotorcycles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch by status
            .addCase(fetchMotorcyclesByStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMotorcyclesByStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.motorcycles = action.payload;
            })
            .addCase(fetchMotorcyclesByStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch by ID
            .addCase(fetchMotorcycleById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMotorcycleById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedMotorcycle = action.payload;
            })
            .addCase(fetchMotorcycleById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch by QR code
            .addCase(fetchMotorcycleByQrCode.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedMotorcycle = action.payload;
            })

            // Fetch by owner phone
            .addCase(fetchMotorcyclesByOwnerPhone.fulfilled, (state, action) => {
                state.loading = false;
                state.motorcycles = action.payload;
            })

            // Fetch by owner email
            .addCase(fetchMotorcyclesByOwnerEmail.fulfilled, (state, action) => {
                state.loading = false;
                state.motorcycles = action.payload;
            })

            // Fetch in service
            .addCase(fetchMotorcyclesInService.fulfilled, (state, action) => {
                state.loading = false;
                state.motorcycles = action.payload.content || action.payload;
            })

            // Fetch needing service
            .addCase(fetchMotorcyclesNeedingService.fulfilled, (state, action) => {
                state.loading = false;
                state.motorcycles = action.payload.content || action.payload;
            })

            // Fetch statistics
            .addCase(fetchMotorcycleStatistics.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMotorcycleStatistics.fulfilled, (state, action) => {
                state.loading = false;
                state.statistics = action.payload;
            })
            .addCase(fetchMotorcycleStatistics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create motorcycle
            .addCase(createMotorcycle.pending, (state) => {
                state.createLoading = true;
                state.createError = null;
            })
            .addCase(createMotorcycle.fulfilled, (state, action) => {
                state.createLoading = false;
                state.motorcycles.push(action.payload);
            })
            .addCase(createMotorcycle.rejected, (state, action) => {
                state.createLoading = false;
                state.createError = action.payload;
            })

            // Update motorcycle
            .addCase(updateMotorcycle.pending, (state) => {
                state.updateLoading = true;
                state.updateError = null;
            })
            .addCase(updateMotorcycle.fulfilled, (state, action) => {
                state.updateLoading = false;
                const index = state.motorcycles.findIndex(m => m.id === action.payload.id);
                if (index !== -1) {
                    state.motorcycles[index] = action.payload;
                }
                if (state.selectedMotorcycle?.id === action.payload.id) {
                    state.selectedMotorcycle = action.payload;
                }
            })
            .addCase(updateMotorcycle.rejected, (state, action) => {
                state.updateLoading = false;
                state.updateError = action.payload;
            })

            // Update status
            .addCase(updateMotorcycleStatus.pending, (state) => {
                state.updateLoading = true;
                state.updateError = null;
            })
            .addCase(updateMotorcycleStatus.fulfilled, (state, action) => {
                state.updateLoading = false;
                const index = state.motorcycles.findIndex(m => m.id === action.payload.id);
                if (index !== -1) {
                    state.motorcycles[index] = action.payload;
                }
            })
            .addCase(updateMotorcycleStatus.rejected, (state, action) => {
                state.updateLoading = false;
                state.updateError = action.payload;
            })

            // Delete motorcycle
            .addCase(deleteMotorcycle.pending, (state) => {
                state.deleteLoading = true;
                state.deleteError = null;
            })
            .addCase(deleteMotorcycle.fulfilled, (state, action) => {
                state.deleteLoading = false;
                state.motorcycles = state.motorcycles.filter(m => m.id !== action.payload);
            })
            .addCase(deleteMotorcycle.rejected, (state, action) => {
                state.deleteLoading = false;
                state.deleteError = action.payload;
            });
    }
});

export const { clearError, clearSelectedMotorcycle, setSelectedMotorcycle } = motorcycleSlice.actions;
export default motorcycleSlice.reducer;