import React, { useState } from 'react';
import {
    Paper,
    Grid,
    TextField,
    MenuItem,
    Button,
    Stack,
    Typography,
    Box,
} from '@mui/material';
import {
    FilterList as FilterIcon,
    Add as AddIcon,
    CalendarToday
} from '@mui/icons-material';
import DateRangePicker from '../../../utils/DateRangePicker';
import { SpecialityChip } from '../../../utils/specialityUtils';

export const TaskFiltersPanel = ({ filters, onFilterChange, technicians, openDialog }) => {
    const [datePickerOpen, setDatePickerOpen] = useState(false);

    const handleDateApply = (range) => {
        onFilterChange({
            startDate: range.startDate,
            endDate: range.endDate
        });
        setDatePickerOpen(false);
    };

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleChange = (field, value) => {
        onFilterChange({ [field]: value });
    };

    const handleClearFilters = () => {
        onFilterChange({
            status: 'all',
            priority: 'all',
            technicianId: '',
            plateNumber: '',
            startDate: null,
            endDate: null
        });
    };

    return (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <FilterIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                    Filters
                </Typography>
            </Stack>

            <Grid container spacing={2}>
                {/* Status */}
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        select
                        fullWidth
                        size="small"
                        label="Status"
                        value={filters.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                    >
                        <MenuItem value="all">All Statuses</MenuItem>
                        <MenuItem value="PENDING">Pending</MenuItem>
                        <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                        <MenuItem value="PAUSED">Paused</MenuItem>
                        <MenuItem value="COMPLETED">Completed</MenuItem>
                        <MenuItem value="CANCELLED">Cancelled</MenuItem>
                    </TextField>
                </Grid>

                {/* Priority — already working perfectly */}
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        select
                        fullWidth
                        size="small"
                        label="Priority"
                        value={filters.priority}
                        onChange={(e) => handleChange('priority', e.target.value)}
                    >
                        <MenuItem value="all">All Priorities</MenuItem>
                        <MenuItem value="HIGH">High</MenuItem>
                        <MenuItem value="MEDIUM">Medium</MenuItem>
                        <MenuItem value="LOW">Low</MenuItem>
                    </TextField>
                </Grid>

                {/* Technician */}
                <Grid item xs={12} sm={6} md={3} sx={{minWidth: 120}}>
                    <TextField
                        select
                        fullWidth
                        size="small"
                        label="Technician"
                        value={filters.technicianId}
                        onChange={(e) => handleChange('technicianId', e.target.value)}
                        SelectProps={{
                            renderValue: (selectedId) => {
                                if (!selectedId) return 'All Technicians';
                                const tech = technicians?.find(t => t.id === selectedId);
                                if (!tech) return '';
                                return (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <span>{tech.fullName}</span>
                                        {tech.speciality && (
                                            <SpecialityChip speciality={tech.speciality} sx={{ ml: 0.5 }} />
                                        )}
                                    </Box>
                                );
                            }
                        }}
                    >
                        <MenuItem value="">All Technicians</MenuItem>
                        {technicians?.map((tech) => (
                            <MenuItem key={tech.id} value={tech.id}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <span>{tech.fullName}</span>
                                        <Box
                                            sx={{
                                                width: 7, height: 7, borderRadius: '50%',
                                                bgcolor: tech.status ? 'success.main' : 'grey.400',
                                                flexShrink: 0
                                            }}
                                        />
                                    </Box>
                                    <SpecialityChip speciality={tech.speciality} />
                                </Box>
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                {/* Date Range Picker */}
                <Grid item xs={12} sm={6} md={3}>
                    <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<CalendarToday />}
                        onClick={() => setDatePickerOpen(true)}
                        sx={{
                            height: '40px',
                            justifyContent: 'flex-start',
                            color: (filters.startDate || filters.endDate) ? '#111' : '#666',
                            borderColor: '#c4c4c4',
                            textTransform: 'none'
                        }}
                    >
                        {(filters.startDate && filters.endDate)
                            ? `${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}`
                            : 'Select Date Range'}
                    </Button>
                </Grid>

                {/* Plate Number Search */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Search by Plate Number"
                        value={filters.plateNumber}
                        onChange={(e) => handleChange('plateNumber', e.target.value)}
                        placeholder="Enter plate number..."
                    />
                </Grid>
            </Grid>

            <Button variant="outlined" sx={{ mr: 3, mt: 2 }} onClick={handleClearFilters}>
                Clear Filters
            </Button>

            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => openDialog('create')}
                sx={{ mt: 2 }}
            >
                Create Task
            </Button>

            <DateRangePicker
                open={datePickerOpen}
                onClose={() => setDatePickerOpen(false)}
                onApply={handleDateApply}
                initialRange={{ startDate: filters.startDate, endDate: filters.endDate }}
            />
        </Paper>
    );
};