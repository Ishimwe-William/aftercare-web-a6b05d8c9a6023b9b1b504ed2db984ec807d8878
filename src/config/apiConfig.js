import axios from 'axios';

const apiClient = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api`,
    withCredentials: true,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor with retry logic
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle network errors
        if (!error.response) {
            console.error('Network error:', error.message);
            // window.location.href = '/network-error';
            return Promise.reject(new Error('Network error. Please check your connection.'));
        }

        // Handle 401 - Unauthorized (Token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Dynamic imports to break cycle
                const storeModule = await import('../store');
                const authModule = await import('../features/auth/authSlice');

                await storeModule.store.dispatch(authModule.refreshToken()).unwrap();
                const newToken = localStorage.getItem('token');

                if (newToken) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                // Reuse the dynamic imports
                const storeModule = await import('../store');
                const authModule = await import('../features/auth/authSlice');
                storeModule.store.dispatch(authModule.signOut());
                window.location.href = '/auth/login';
                return Promise.reject(refreshError);
            }
        }

        // Handle 403 - Forbidden
        if (error.response?.status === 403) {
            console.error('Access forbidden - insufficient permissions');
            // window.location.href = '/unauthorized';
        }

        // Handle 404 - Not Found
        if (error.response?.status === 404) {
            console.error('Resource not found');
            // window.location.href = '/not-found';
        }

        // Handle 500 - Server Error
        if (error.response?.status >= 500) {
            console.error('Server error:', error.response.status);
            window.location.href = '/server-error';
        }

        return Promise.reject(error);
    }
);

export default apiClient;