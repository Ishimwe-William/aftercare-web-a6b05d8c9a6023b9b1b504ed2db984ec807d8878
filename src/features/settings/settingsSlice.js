import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../config/apiConfig';

const initialState = {
    profile: null,
    isLoading: false,
    error: null,
};

export const updateProfile = createAsyncThunk(
    'settings/updateProfile',
    async ({ userId, profileData, currentUser }, { rejectWithValue }) => {
        try {
            const payload = {
                username: currentUser.username,
                email: currentUser.email,
                fullName: profileData.fullName,
                phoneNumber: profileData.phoneNumber,
                roles: currentUser.roles,
                enabled: currentUser.enabled
            };
            const response = await apiClient.put('/profile', payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
        }
    }
);


const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(updateProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profile = action.payload;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
    },
});

export const { clearError } = settingsSlice.actions;
export default settingsSlice.reducer;