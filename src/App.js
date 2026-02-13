import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/material';

import AppRoutes from './routes/AppRoutes';
import { restoreAuthState, startTokenRefreshInterval } from './features/auth/authSlice';
import { store } from './store';
import LoadingSpinner from "./components/common/LoadingSpinner";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
    return (
        <Provider store={store}>
            <ErrorBoundary>
                <AppContent />
            </ErrorBoundary>
        </Provider>
    );
}

export default App;

function AppContent() {
    const isLoading = useSelector((state) => state.auth.isLoading);
    const isInitialized = useSelector((state) => state.auth.isInitialized);
    const dispatch = useDispatch();

    useEffect(() => {
        // Restore auth state from localStorage
        dispatch(restoreAuthState());

        // Start token refresh interval
        let cleanup;
        dispatch(startTokenRefreshInterval()).then((fn) => {
            cleanup = fn;
        });

        return () => {
            if (cleanup) cleanup();
        };
    }, [dispatch]);

    // Don't render anything until auth is initialized
    if (!isInitialized) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh'
                }}
            >
                <LoadingSpinner />
            </Box>
        );
    }

    return (
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <Router>
                <AppRoutes />
            </Router>
        </GoogleOAuthProvider>
    );
}