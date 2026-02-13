import React from 'react';
import { Paper, Typography, Box, Chip } from '@mui/material';

const MostUsedParts = ({ parts = [] }) => {
    if (parts.length === 0) return null;

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Most Used Parts</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {parts.slice(0, 8).map((p, i) => (
                    <Chip
                        key={i}
                        label={`${p.partName} (Used ${p.totalUsed})`}
                        variant="outlined"
                        size="small"
                    />
                ))}
            </Box>
        </Paper>
    );
};

export default MostUsedParts;