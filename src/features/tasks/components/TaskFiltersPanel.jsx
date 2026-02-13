import React from 'react';
import {
    Paper,
    Grid,
    TextField,
    MenuItem,
    Button,
    Stack,
    Typography,
    FormControl
} from '@mui/material';
import {
    FilterList as FilterIcon,
    Add as AddIcon
} from '@mui/icons-material';

export const TaskFiltersPanel = ({filters, onFilterChange, technicians, openDialog}) => {
    const handleChange = (field, value) => {
        onFilterChange({[field]: value});
    };

    const handleClearFilters = () => {
        onFilterChange({
            status: 'all',
            priority: 'all',
            technicianId: '',
            motorcycleId: '',
            dateRange: 'all',
            plateNumber: ''
        });
    };

    return (
        <Paper sx={{p: 3, mb: 3, borderRadius: 2}}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <FilterIcon color="primary"/>
                <Typography variant="h6" fontWeight="bold">
                    Filters
                </Typography>
            </Stack>

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small" sx={{m: 1, minWidth: 120}}>
                        <TextField
                            select
                            fullWidth
                            label="Status"
                            value={filters.status}
                            onChange={(e) => handleChange('status', e.target.value)}
                            size="small"
                        >
                            <MenuItem value="all">All Statuses</MenuItem>
                            <MenuItem value="PENDING">Pending</MenuItem>
                            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                            <MenuItem value="PAUSED">Paused</MenuItem>
                            <MenuItem value="COMPLETED">Completed</MenuItem>
                            <MenuItem value="CANCELLED">Cancelled</MenuItem>
                        </TextField>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small" sx={{m: 1, minWidth: 120}}>
                        <TextField
                            select
                            fullWidth
                            label="Priority"
                            value={filters.priority}
                            onChange={(e) => handleChange('priority', e.target.value)}
                            size="small"
                        >
                            <MenuItem value="all">All Priorities</MenuItem>
                            <MenuItem value="HIGH">High</MenuItem>
                            <MenuItem value="MEDIUM">Medium</MenuItem>
                            <MenuItem value="LOW">Low</MenuItem>
                        </TextField>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small" sx={{m: 1, minWidth: 120}}>
                        <TextField
                            select
                            fullWidth
                            label="Technician"
                            value={filters.technicianId}
                            onChange={(e) => handleChange('technicianId', e.target.value)}
                            size="small"
                        >
                            <MenuItem value="">All Technicians</MenuItem>
                            {technicians?.map((tech) => (
                                <MenuItem key={tech.id} value={tech.id}>
                                    {tech.fullName}
                                </MenuItem>
                            ))}
                        </TextField>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small" sx={{m: 1, minWidth: 120}}>
                        <TextField
                            select
                            fullWidth
                            label="Date Range"
                            value={filters.dateRange}
                            onChange={(e) => handleChange('dateRange', e.target.value)}
                            size="small"
                        >
                            <MenuItem value="all">All Time</MenuItem>
                            <MenuItem value="today">Today</MenuItem>
                            <MenuItem value="week">This Week</MenuItem>
                            <MenuItem value="month">This Month</MenuItem>
                        </TextField>
                    </FormControl>
                </Grid>

                <Grid item xs={12}>
                    <FormControl fullWidth size="small" sx={{m: 1, minWidth: 120}}>
                        <TextField
                            fullWidth
                            label="Search by Motorcycle Plate Number"
                            value={filters.plateNumber}
                            onChange={(e) => handleChange('plateNumber', e.target.value)}
                            placeholder="Enter plate number..."
                            size="small"
                        />
                    </FormControl>
                </Grid>
            </Grid>
            <Button
                variant="outlined"
                sx={{mr: 3, mt: 1}}
                onClick={handleClearFilters}
            >
                Clear Filters
            </Button>

            <Button
                variant="contained"
                startIcon={<AddIcon/>}
                onClick={() => openDialog('create')}
                sx={{marginInline: 3, mt: 1}}
            >
                Create Task
            </Button>
        </Paper>
    );
};