import React, {useState} from 'react';
import {Paper, Grid, FormControl, InputLabel, Select, MenuItem, TextField, Button} from '@mui/material';
import {CalendarToday} from '@mui/icons-material';
import DateRangePicker from '../../../utils/DateRangePicker';

const FilterPanel = ({filters, setFilters, technicians}) => {
    const [datePickerOpen, setDatePickerOpen] = useState(false);

    const handleDateApply = (range) => {
        setFilters({
            ...filters,
            startDate: range.startDate,
            endDate: range.endDate,
            dateRange: ''
        });
        setDatePickerOpen(false);
    };

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'});
    };

    return (
        <Paper sx={{p: 2, mb: 3}}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small" sx={{m: 1, minWidth: 120}}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={filters.status || ''}
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
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small" sx={{m: 1, minWidth: 120}}>
                        <InputLabel>Technician</InputLabel>
                        <Select
                            value={filters.technicianId || ''}
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
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Motorcycle ID"
                        value={filters.motorcycleId || ''}
                        onChange={(e) => setFilters({...filters, motorcycleId: e.target.value})}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<CalendarToday/>}
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
            </Grid>

            <DateRangePicker
                open={datePickerOpen}
                onClose={() => setDatePickerOpen(false)}
                onApply={handleDateApply}
                initialRange={{startDate: filters.startDate, endDate: filters.endDate}}
            />
        </Paper>
    );
};

export default FilterPanel;