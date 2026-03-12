import React from 'react';
import {
    Paper,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    InputAdornment,
    Button
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import { SPECIALITY_OPTIONS } from '../../../utils/specialityUtils';

const TechnicianFilters = ({ filters, onFilterChange, onSearch, onClearFilters }) => {
    return (
        <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
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
                            value={filters.status || 'all'}
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
                        <InputLabel>Speciality</InputLabel>
                        <Select
                            value={filters.speciality || 'all'}
                            label="Speciality"
                            onChange={(e) => onFilterChange('speciality', e.target.value)}
                        >
                            <MenuItem value="all">All Specialities</MenuItem>
                            {SPECIALITY_OPTIONS.map(opt => (
                                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                {/* Replaced Sort By with Clear Filters Button */}
                <Grid item xs={12} sm={6} md={3}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        fullWidth
                        onClick={onClearFilters}
                        startIcon={<Clear />}
                        sx={{ height: '56px' }} // Matches the height of MUI TextFields
                    >
                        Clear Filters
                    </Button>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default TechnicianFilters;