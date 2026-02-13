import React from 'react';
import {
    Paper,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    InputAdornment
} from '@mui/material';
import { Search } from '@mui/icons-material';

const TechnicianFilters = ({ filters, onFilterChange, onSearch }) => {
    return (
        <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        placeholder="Search technicians..."
                        value={filters.searchTerm || ''}
                        onChange={(e) => onSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={filters.status}
                            label="Status"
                            onChange={(e) => onFilterChange('status', e.target.value)}
                        >
                            <MenuItem value="all">All Status</MenuItem>
                            <MenuItem value="online">Online</MenuItem>
                            <MenuItem value="offline">Offline</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Sort By</InputLabel>
                        <Select
                            value={filters.sortBy}
                            label="Sort By"
                            onChange={(e) => onFilterChange('sortBy', e.target.value)}
                        >
                            <MenuItem value="name">Name</MenuItem>
                            <MenuItem value="efficiency">Efficiency</MenuItem>
                            <MenuItem value="activeTasks">Active Tasks</MenuItem>
                            <MenuItem value="completedTasks">Completed Tasks</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default TechnicianFilters;