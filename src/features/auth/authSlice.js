import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import apiClient from '../../config/apiConfig';

const initialState = {
    user: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
    isInitialized: false,
    lastActivity: null,
};

export const verifyEmail = createAsyncThunk(
    'auth/verifyEmail',
    async (token, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/auth/verify-email', null, {
                params: { token }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Email verification failed');
        }
    }
);

export const signInWithEmail = createAsyncThunk(
    'auth/signInWithEmail',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/auth/login', {
                usernameOrEmail: email.toLowerCase().trim(),
                password,
            });

            const {
                token, refreshToken, type, id, username, email: userEmail,
                roles, fullName, phoneNumber, photoUrl, updatedAt
            } = response.data;

            if (!token || !refreshToken || !id) {
                return rejectWithValue('Invalid response from server');
            }

            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('userId', id);
            localStorage.setItem('user', JSON.stringify(response.data));

            return {
                token, refreshToken, type, id, username, email: userEmail,
                roles, fullName, phoneNumber, photoUrl, updatedAt
            };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const signUpWithEmail = createAsyncThunk(
    'auth/signUpWithEmail',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/auth/register', {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email.toLowerCase().trim(),
                password: formData.password
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Registration failed');
        }
    }
);

export const signInWithGoogle = createAsyncThunk(
    'auth/signInWithGoogle',
    async (tokenResponse, { rejectWithValue }) => {
        try {
            if (!tokenResponse.code) {
                return rejectWithValue('Google token is required');
            }

            const response = await apiClient.post('/auth/web/google', {
                code: tokenResponse.code
            });

            if (response.status === 200) {
                const {
                    email, fullName, id, phoneNumber, photoUrl, refreshToken,
                    roles, token, type, username, updatedAt
                } = response.data;

                localStorage.setItem('token', token);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('userId', String(id));
                localStorage.setItem('user', JSON.stringify(response.data));

                return {
                    email, fullName, id, phoneNumber, photoUrl, refreshToken,
                    roles, token, type, username, updatedAt
                };
            } else {
                return rejectWithValue('Failed to authenticate with backend');
            }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Google login failed');
        }
    }
);

export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async (email, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/auth/forgot-password', {
                email: email.toLowerCase().trim(),
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Password reset failed');
        }
    }
);

export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async ({ token, newPassword }, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/auth/reset-password', {
                token,
                newPassword
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Password reset failed');
        }
    }
);

export const refreshToken = createAsyncThunk(
    'auth/refreshToken',
    async (_, { rejectWithValue }) => {
        const storedRefreshToken = localStorage.getItem('refreshToken');
        if (!storedRefreshToken) {
            return rejectWithValue('No refresh token available');
        }

        try {
            const response = await apiClient.post('/auth/refresh', {
                refreshToken: storedRefreshToken
            });

            const {
                token,
                refreshToken: newRefreshToken,
                type,
                id,
                username,
                email,
                roles,
                fullName,
                phoneNumber,
                photoUrl,
                updatedAt
            } = response.data;

            if (!token || !newRefreshToken) {
                return rejectWithValue('Invalid refresh response from server');
            }

            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', newRefreshToken);
            localStorage.setItem('user', JSON.stringify(response.data));

            return {
                token,
                refreshToken: newRefreshToken,
                type,
                id,
                username,
                email,
                roles,
                fullName,
                phoneNumber,
                photoUrl,
                updatedAt
            };
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('user');
            return rejectWithValue(error.response?.data?.message || 'Token refresh failed');
        }
    }
);

export const signOut = createAsyncThunk(
    'auth/signOut',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await apiClient.post('/auth/logout', null, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(error => {
                    console.warn('Logout API call failed:', error);
                });
            }
            return null;
        } catch (error) {
            console.warn('Logout error:', error);
            return rejectWithValue(error.message || 'Logout failed');
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('user');
        }
    }
);

export const restoreAuthState = createAsyncThunk(
    'auth/restoreAuthState',
    async (_, thunkAPI) => {
        try {
            const token = localStorage.getItem('token');
            const refreshToken = localStorage.getItem('refreshToken');
            const userId = localStorage.getItem('userId');
            const userData = JSON.parse(localStorage.getItem('user'));

            if (!token || !userId || !refreshToken || !userData) {
                return thunkAPI.rejectWithValue('No token or user data found');
            }

            const decoded = jwtDecode(token);
            if (decoded.exp * 1000 > Date.now()) {
                // Token is still valid
                return { ...userData, userId };
            } else {
                // Token expired, attempt refresh
                const refreshResult = await thunkAPI.dispatch(refreshToken()).unwrap();
                return refreshResult;
            }
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('user');
            return thunkAPI.rejectWithValue('Failed to restore auth state');
        }
    }
);

export const startTokenRefreshInterval = () => {
    return async (dispatch) => {
        await dispatch(restoreAuthState());
        const intervalId = setInterval(() => {
            dispatch(restoreAuthState());
        }, 1000 * 60);

        return () => clearInterval(intervalId);
    };
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setInitialized: (state) => {
            state.isInitialized = true;
        },
        updateLastActivity: (state) => {
            state.lastActivity = Date.now();
        },
        updateUserProfile: (state, action) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(verifyEmail.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(verifyEmail.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(verifyEmail.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(signInWithEmail.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(signInWithEmail.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.error = null;
                state.lastActivity = Date.now();
            })
            .addCase(signInWithEmail.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
                state.user = null;
            })
            .addCase(signUpWithEmail.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(signUpWithEmail.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(signUpWithEmail.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
                state.user = null;
            })
            .addCase(forgotPassword.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(forgotPassword.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(resetPassword.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(resetPassword.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(signInWithGoogle.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(signInWithGoogle.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.error = null;
                state.lastActivity = Date.now();
            })
            .addCase(signInWithGoogle.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
                state.user = null;
            })
            .addCase(signOut.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(signOut.fulfilled, (state) => {
                state.isLoading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = null;
                state.lastActivity = null;
            })
            .addCase(signOut.rejected, (state, action) => {
                state.isLoading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = action.payload;
                state.lastActivity = null;
            })
            .addCase(restoreAuthState.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(restoreAuthState.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.error = null;
                state.isInitialized = true;
                state.lastActivity = Date.now();
            })
            .addCase(restoreAuthState.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.user = null;
                state.isAuthenticated = false;
                state.isInitialized = true;
            })
            .addCase(refreshToken.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(refreshToken.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.error = null;
                state.lastActivity = Date.now();
            })
            .addCase(refreshToken.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.user = null;
                state.isAuthenticated = false;
            });
    },
});

export const { clearError, setInitialized, updateLastActivity, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;