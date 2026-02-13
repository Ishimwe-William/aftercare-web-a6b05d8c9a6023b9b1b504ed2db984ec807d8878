import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import apiClient from "../../config/apiConfig";

// Async thunks
export const fetchInventory = createAsyncThunk(
    'inventory/fetchInventory',
    async ({page = 0, size = 20}) => {
        const response = await apiClient.get('/spare-parts', {params: {page, size}});
        return response.data;
    }
);

export const searchParts = createAsyncThunk(
    'inventory/searchParts',
    async ({keyword, page = 0, size = 20}) => {
        const response = await apiClient.get('/spare-parts/search', {
            params: {keyword, page, size}
        });
        return response.data;
    }
);

// export const fetchLowStockParts = createAsyncThunk(
//     'inventory/fetchLowStockParts',
//     async ({ page = 0, size = 20 }) => {
//         const response = await apiClient.get('/spare-parts/low-stock', { params: { page, size } });
//         return response.data;
//     }
// );

// export const fetchOutOfStockParts = createAsyncThunk(
//     'inventory/fetchOutOfStockParts',
//     async ({ page = 0, size = 20 }) => {
//         const response = await apiClient.get('/spare-parts/out-of-stock', { params: { page, size } });
//         return response.data;
//     }
// );

export const fetchStockAlerts = createAsyncThunk(
    'inventory/fetchStockAlerts',
    async () => {
        const response = await apiClient.get('/spare-parts/alerts');
        return response.data;
    }
);

// export const fetchPartsBySupplier = createAsyncThunk(
//     'inventory/fetchPartsBySupplier',
//     async (supplierName) => {
//         const response = await apiClient.get(`/spare-parts/supplier/${supplierName}`);
//         return response.data;
//     }
// );

export const createPart = createAsyncThunk(
    'inventory/createPart',
    async (partData) => {
        const response = await apiClient.post('/spare-parts', partData);
        return response.data;
    }
);

export const updatePart = createAsyncThunk(
    'inventory/updatePart',
    async ({id, partData}) => {
        const response = await apiClient.put(`/spare-parts/${id}`, partData);
        return response.data;
    }
);

export const adjustStock = createAsyncThunk(
    'inventory/adjustStock',
    async ({id, adjustmentData}) => {
        const response = await apiClient.patch(`/spare-parts/${id}/stock`, adjustmentData);
        return response.data;
    }
);

export const deletePart = createAsyncThunk(
    'inventory/deletePart',
    async (id) => {
        await apiClient.delete(`/spare-parts/${id}`);
        return id;
    }
);

// export const logPartUsage = createAsyncThunk(
//     'inventory/logPartUsage',
//     async (usageData) => {
//         const response = await apiClient.post('/spare-parts/usage', usageData);
//         return response.data;
//     }
// );

export const fetchPartUsageHistory = createAsyncThunk(
    'inventory/fetchPartUsageHistory',
    async (partId) => {
        const response = await apiClient.get(`/spare-parts/usage/${partId}`);
        return response.data;
    }
);

// export const fetchTaskPartUsages = createAsyncThunk(
//     'inventory/fetchTaskPartUsages',
//     async (taskId) => {
//         const response = await apiClient.get(`/spare-parts/usage/task/${taskId}`);
//         return response.data;
//     }
// );

export const fetchMostUsedParts = createAsyncThunk(
    'inventory/fetchMostUsedParts',
    async () => {
        const response = await apiClient.get('/spare-parts/statistics/most-used');
        return response.data;
    }
);

export const exportInventoryReport = createAsyncThunk(
    'inventory/exportInventoryReport',
    async () => {
        const response = await apiClient.get('/spare-parts/export', {
            responseType: 'blob'
        });
        return response.data;
    }
);

export const checkSimilarParts = createAsyncThunk(
    'inventory/checkSimilarParts',
    async (name) => {
        if (name.length < 3) return [];
        const response = await apiClient.get('/spare-parts/check-similar', {params: {name}});
        return response.data;
    }
);

export const checkSimilarSuppliers = createAsyncThunk(
    'inventory/checkSimilarSuppliers',
    async (supplierName) => {
        if (supplierName.length < 3) return [];
        const response = await apiClient.get('/spare-parts/check-similar-suppliers', {params: {supplierName}});
        return response.data;
    }
);

const inventorySlice = createSlice({
    name: 'inventory',
    initialState: {
        parts: [],
        alerts: null,
        usageHistory: [],
        mostUsedParts: [],
        similarParts: [],
        similarSuppliers: [],
        usageLoading: false,
        checkingParts: false,
        checkingSuppliers: false,
        pagination: {
            totalPages: 0,
            totalElements: 0,
            currentPage: 0,
            size: 20
        },
        loading: false,
        error: null
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearUsageHistory: (state) => {
            state.usageHistory = [];
        },
        clearSimilarChecks: (state) => {
            state.similarParts = [];
            state.similarSuppliers = [];
            state.checkingParts = false;
            state.checkingSuppliers = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch inventory
            .addCase(fetchInventory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInventory.fulfilled, (state, action) => {
                state.loading = false;
                state.parts = action.payload.content;
                state.pagination = {
                    totalPages: action.payload.totalPages,
                    totalElements: action.payload.totalElements,
                    currentPage: action.payload.number,
                    size: action.payload.size
                };
            })
            .addCase(fetchInventory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Search parts
            .addCase(searchParts.fulfilled, (state, action) => {
                state.parts = action.payload.content;
                state.pagination = {
                    totalPages: action.payload.totalPages,
                    totalElements: action.payload.totalElements,
                    currentPage: action.payload.number,
                    size: action.payload.size
                };
            })
            // Stock alerts
            .addCase(fetchStockAlerts.fulfilled, (state, action) => {
                state.alerts = action.payload;
            })
            // Create part
            .addCase(createPart.fulfilled, (state, action) => {
                state.parts.unshift(action.payload);
            })
            // Update part
            .addCase(updatePart.fulfilled, (state, action) => {
                const index = state.parts.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.parts[index] = action.payload;
                }
            })
            // Adjust stock
            .addCase(adjustStock.fulfilled, (state, action) => {
                const index = state.parts.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.parts[index] = action.payload;
                }
            })
            // Delete part
            .addCase(deletePart.fulfilled, (state, action) => {
                state.parts = state.parts.filter(p => p.id !== action.payload);
            })
            // Usage history
            .addCase(fetchPartUsageHistory.fulfilled, (state, action) => {
                state.usageHistory = action.payload;
            })
            // Most used parts
            .addCase(fetchMostUsedParts.fulfilled, (state, action) => {
                state.mostUsedParts = action.payload;
            })
            // Check similar parts
            .addCase(checkSimilarParts.pending, (state) => {
                state.checkingParts = true;
            })
            .addCase(checkSimilarParts.fulfilled, (state, action) => {
                state.checkingParts = false;
                state.similarParts = action.payload;
            })
            .addCase(checkSimilarParts.rejected, (state) => {
                state.checkingParts = false;
                state.similarParts = [];
            })
            // Check similar suppliers
            .addCase(checkSimilarSuppliers.pending, (state) => {
                state.checkingSuppliers = true;
            })
            .addCase(checkSimilarSuppliers.fulfilled, (state, action) => {
                state.checkingSuppliers = false;
                state.similarSuppliers = action.payload;
            })
            .addCase(checkSimilarSuppliers.rejected, (state) => {
                state.checkingSuppliers = false;
                state.similarSuppliers = [];
            });
    }
});

export const {clearError, clearUsageHistory, clearSimilarChecks} = inventorySlice.actions;
export default inventorySlice.reducer;