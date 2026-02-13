import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({ errorInfo });

        // TODO: Log to error reporting service (e.g., Sentry)
        // logErrorToService(error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/dashboard';
    };

    render() {
        if (this.state.hasError) {
            return (
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    p: 3,
                    backgroundColor: '#f5f5f5'
                }}>
                    <ErrorOutlineIcon sx={{ fontSize: 80, color: '#ff6b6b', mb: 2 }} />

                    <Typography variant="h3" gutterBottom fontWeight="bold">
                        Oops! Something went wrong
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        gutterBottom
                        textAlign="center"
                        maxWidth="600px"
                    >
                        We're sorry for the inconvenience. An unexpected error has occurred.
                        Our team has been notified and we're working to fix it.
                    </Typography>

                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <Box sx={{
                            mt: 3,
                            p: 2,
                            backgroundColor: '#fff',
                            borderRadius: 1,
                            border: '1px solid #ddd',
                            maxWidth: '800px',
                            overflow: 'auto'
                        }}>
                            <Typography variant="subtitle2" color="error" gutterBottom>
                                Error Details (Development Only):
                            </Typography>
                            <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
                                {this.state.error.toString()}
                            </Typography>
                        </Box>
                    )}

                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            onClick={this.handleReload}
                            size="large"
                        >
                            Reload Page
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={this.handleGoHome}
                            size="large"
                        >
                            Go to Dashboard
                        </Button>
                    </Box>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;