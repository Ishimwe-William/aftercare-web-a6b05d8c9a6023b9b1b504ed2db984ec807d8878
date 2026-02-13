import React from 'react';
import {
    Paper,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button
} from '@mui/material';
import { Add } from '@mui/icons-material';

const InventoryFilters = ({ filters, onFilterChange, onAddNew }) => {
    return (
        <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        label="Search Parts"
                        value={filters.search}
                        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Stock Level</InputLabel>
                        <Select
                            value={filters.stockLevel}
                            label="Stock Level"
                            onChange={(e) => onFilterChange({ ...filters, stockLevel: e.target.value })}
                         variant='outlined'>
                            <MenuItem value="all">All Levels</MenuItem>
                            <MenuItem value="low">Low Stock</MenuItem>
                            <MenuItem value="out">Out of Stock</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Add />}
                        onClick={onAddNew}
                    >
                        Add New Part
                    </Button>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default InventoryFilters;