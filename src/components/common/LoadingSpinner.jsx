import React from 'react';
import {Box} from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';

const LoadingSpinner = () => {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <LinearProgress sx={{ width: 200 }} />
        </Box>
    );
};

export default LoadingSpinner;
