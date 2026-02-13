import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import apiClient from '../../config/apiConfig';

export const fetchUsers = createAsyncThunk(
    'users/fetchAll',
    async (_, {rejectWithValue}) => {
        try {
            const response = await apiClient.get('/admin/users');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
        }
    }
);

export const fetchUserById = createAsyncThunk(
    'users/fetchOne',
    async (id, {rejectWithValue}) => {
        try {
            const response = await apiClient.get(`/admin/users/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
        }
    }
);

export const createUser = createAsyncThunk(
    'users/create',
    async (userData, {rejectWithValue}) => {
        try {
            const response = await apiClient.post('/admin/users', userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create user');
        }
    }
);

export const updateUser = createAsyncThunk(
    'users/update',
    async ({id, userData}, {rejectWithValue}) => {
        try {
            const response = await apiClient.put(`/admin/users/${id}`, userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update user');
        }
    }
);

export const deleteUser = createAsyncThunk(
    'users/delete',
    async (id, {rejectWithValue}) => {
        try {
            await apiClient.delete(`/admin/users/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
        }
    }
);

export const toggleUserStatus = createAsyncThunk(
    'users/toggleStatus',
    async (id, {rejectWithValue}) => {
        try {
            const response = await apiClient.put(`/admin/users/${id}/toggle-status`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to toggle user status');
        }
    }
);

export const fetchUsersByRole = createAsyncThunk(
    'users/fetchByRole',
    async (role, {rejectWithValue}) => {
        try {
            const response = await apiClient.get(`/admin/users/role/${role}`);
            return {role, data: response.data};
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch users');
        }
    }
);

const userSlice = createSlice({
    name: 'users',
    initialState: {
        users: [],
        currentUser: null,
        status: 'idle',
        error: null,
    },
    reducers: {
        resetCurrentUser: (state) => {
            state.currentUser = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchUsers
            .addCase(fetchUsers.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.users = action.payload;
                state.error = null;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // fetchUserById
            .addCase(fetchUserById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentUser = action.payload;
                state.error = null;
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // createUser
            .addCase(createUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.users.push(action.payload);
                state.error = null;
            })
            .addCase(createUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // updateUser
            .addCase(updateUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.users.findIndex(user => user.id === action.payload.id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
                if (state.currentUser?.id === action.payload.id) {
                    state.currentUser = action.payload;
                }
                state.error = null;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // deleteUser
            .addCase(deleteUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.users = state.users.filter(user => user.id !== action.payload);
                if (state.currentUser?.id === action.payload) {
                    state.currentUser = null;
                }
                state.error = null;
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // toggleUserStatus
            .addCase(toggleUserStatus.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(toggleUserStatus.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.users.findIndex(user => user.id === action.payload.id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
                if (state.currentUser?.id === action.payload.id) {
                    state.currentUser = action.payload;
                }
                state.error = null;
            })
            .addCase(toggleUserStatus.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(fetchUsersByRole.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsersByRole.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.role === 'TECHNICIAN') {
                    state.technicians = action.payload.data;
                }
            })
            .addCase(fetchUsersByRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const {resetCurrentUser} = userSlice.actions;
export default userSlice.reducer;