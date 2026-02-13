import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../config/apiConfig';
import { handleApiError } from '../../components/handleApiError';

const initialState = {
    invoices: [],
    currentInvoice: null,
    isLoading: false,
    error: null
};

// Generate invoice
export const generateInvoice = createAsyncThunk(
    'invoice/generateInvoice',
    async (invoiceData, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/invoices', invoiceData);
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

// Update invoice
export const updateInvoice = createAsyncThunk(
    'invoice/updateInvoice',
    async ({ invoiceId, invoiceData }, { rejectWithValue }) => {
        try {
            const response = await apiClient.put(`/invoices/${invoiceId}`, invoiceData);
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

// Fetch invoice by ID
export const fetchInvoiceById = createAsyncThunk(
    'invoice/fetchInvoiceById',
    async (invoiceId, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/invoices/${invoiceId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

// Fetch invoice for a specific task
export const fetchTaskInvoices = createAsyncThunk(
    'invoice/fetchTaskInvoices',
    async (taskId, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/invoices/task/${taskId}`);
            // assuming API returns either invoice object or 404 if none
            return response.data;
        } catch (error) {
            // If no invoice found -> return null (fulfilled) instead of rejecting with an error message.
            if (error.response && error.response.status === 404) {
                return null;
            }
            return rejectWithValue(handleApiError(error));
        }
    }
);

const invoiceSlice = createSlice({
    name: 'invoice',
    initialState,
    reducers: {
        clearInvoiceError: (state) => {
            state.error = null;
        },
        clearCurrentInvoice: (state) => {
            state.currentInvoice = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Generate Invoice
            .addCase(generateInvoice.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(generateInvoice.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentInvoice = action.payload;
                state.error = null;
                // Add to invoices list if not already present
                const exists = state.invoices.some(inv => inv.invoiceId === action.payload.invoiceId);
                if (!exists) {
                    state.invoices.push(action.payload);
                }
            })
            .addCase(generateInvoice.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Update Invoice
            .addCase(updateInvoice.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateInvoice.fulfilled, (state, action) => {
                state.isLoading = false;
                const updatedInvoice = action.payload;

                // Update in invoices list
                const index = state.invoices.findIndex(i => i.invoiceId === updatedInvoice.invoiceId);
                if (index !== -1) {
                    state.invoices[index] = updatedInvoice;
                }

                // Update current invoice
                if (state.currentInvoice?.invoiceId === updatedInvoice.invoiceId) {
                    state.currentInvoice = updatedInvoice;
                }
                state.error = null;
            })
            .addCase(updateInvoice.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Fetch Invoice By ID
            .addCase(fetchInvoiceById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchInvoiceById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentInvoice = action.payload;
                state.error = null;
            })
            .addCase(fetchInvoiceById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Fetch Task Invoices
            .addCase(fetchTaskInvoices.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.currentInvoice = null;
            })
            .addCase(fetchTaskInvoices.fulfilled, (state, action) => {
                state.isLoading = false;
                // action.payload will be either invoice object or null (if none)
                state.currentInvoice = action.payload; // can be null
                state.error = null;
            })
            .addCase(fetchTaskInvoices.rejected, (state, action) => {
                state.isLoading = false;
                state.currentInvoice = null;
                state.error = action.payload;
            });
    }
});

export const { clearInvoiceError, clearCurrentInvoice } = invoiceSlice.actions;
export default invoiceSlice.reducer;
