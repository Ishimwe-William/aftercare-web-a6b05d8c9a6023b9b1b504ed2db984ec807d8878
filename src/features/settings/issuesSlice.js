import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../config/apiConfig';
import { handleApiError } from '../../components/handleApiError';

const initialState = {
    issues: [],
    isLoading: false,
    error: null,
};

// Fetch all known issues
export const fetchIssues = createAsyncThunk(
    'issues/fetchIssues',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/known-issues');
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

// Create new issue
export const createIssue = createAsyncThunk(
    'issues/createIssue',
    async (issueData, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/known-issues', issueData);
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

// Update issue price
export const updateIssuePrice = createAsyncThunk(
    'issues/updateIssuePrice',
    async ({ id, price }, { rejectWithValue }) => {
        try {
            const response = await apiClient.put(`/known-issues/${id}`, { price });
            return response.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

// Delete issue
export const deleteIssue = createAsyncThunk(
    'issues/deleteIssue',
    async (id, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/known-issues/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    }
);

const issuesSlice = createSlice({
    name: 'issues',
    initialState,
    reducers: {
        clearIssuesError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch issues
            .addCase(fetchIssues.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchIssues.fulfilled, (state, action) => {
                state.isLoading = false;
                state.issues = action.payload;
            })
            .addCase(fetchIssues.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Create issue
            .addCase(createIssue.pending, (state) => {
                state.error = null;
            })
            .addCase(createIssue.fulfilled, (state, action) => {
                state.issues.push(action.payload);
            })
            .addCase(createIssue.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Update issue price
            .addCase(updateIssuePrice.fulfilled, (state, action) => {
                const index = state.issues.findIndex(issue => issue.id === action.payload.id);
                if (index !== -1) {
                    state.issues[index] = action.payload;
                }
            })
            .addCase(updateIssuePrice.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Delete issue
            .addCase(deleteIssue.fulfilled, (state, action) => {
                state.issues = state.issues.filter(issue => issue.id !== action.payload);
            })
            .addCase(deleteIssue.rejected, (state, action) => {
                state.error = action.payload;
            });
    }
});

export const { clearIssuesError } = issuesSlice.actions;
export default issuesSlice.reducer;
