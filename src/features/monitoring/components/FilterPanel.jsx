import React from 'react';
import {Paper, Grid, FormControl, InputLabel, Select, MenuItem, TextField} from '@mui/material';

const FilterPanel = ({filters, setFilters, technicians}) => {
    return (
        <Paper sx={{p: 2, mb: 3}}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={2.5}>
                    <FormControl fullWidth size="small" sx={{m: 1, minWidth: 120}}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={filters.status}
                            onChange={(e) => setFilters({...filters, status: e.target.value})}
                            label="Status"
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="PENDING">Pending</MenuItem>
                            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                            <MenuItem value="COMPLETED">Completed</MenuItem>
                            <MenuItem value="CANCELLED">Cancelled</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2.5}>
                    <FormControl fullWidth size="small" sx={{m: 1, minWidth: 120}}>
                        <InputLabel>Technician</InputLabel>
                        <Select
                            value={filters.technicianId}
                            onChange={(e) => setFilters({...filters, technicianId: e.target.value})}
                            label="Technician"
                        >
                            <MenuItem value="">All</MenuItem>
                            {technicians.map(t => (
                                <MenuItem key={t.id} value={t.id}>{t.fullName}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2.5}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Motorcycle ID"
                        value={filters.motorcycleId}
                        onChange={(e) => setFilters({...filters, motorcycleId: e.target.value})}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2.5}>
                    <FormControl fullWidth size="small" sx={{m: 1, minWidth: 120}}>
                        <InputLabel>Date Range</InputLabel>
                        <Select
                            value={filters.dateRange}
                            onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                            label="Date Range"
                        >
                            <MenuItem value="">All Time</MenuItem>
                            <MenuItem value="today">Today</MenuItem>
                            <MenuItem value="week">This Week</MenuItem>
                            <MenuItem value="month">This Month</MenuItem>
                            <MenuItem value="year">This Year</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default FilterPanel;