import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import apiClient from '../../config/apiConfig';
import {handleApiError} from '../../components/handleApiError';

const initialState = {
    laborRate: null,
    isLoading: false,
    error: null,
};

// Fetch recent rate
export const fetchRecentLaborRate = createAsyncThunk(
    'laborRate/fetchRecentLaborRate',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(
                `/labor-rates/recent`
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

const laborRateSlice = createSlice({
    name: 'laborRate',
    initialState,
    reducers: {
        clearLaborRateError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRecentLaborRate.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchRecentLaborRate.fulfilled, (state, action) => {
                state.isLoading = false;
                state.laborRate = action.payload;
            })
            .addCase(fetchRecentLaborRate.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const {clearLaborRateError} = laborRateSlice.actions;
export default laborRateSlice.reducer;