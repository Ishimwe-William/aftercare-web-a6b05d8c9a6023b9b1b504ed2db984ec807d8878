import React from 'react';
import { Card, CardContent, Grid, TextField, MenuItem, InputAdornment, Button } from '@mui/material';
import { Search as SearchIcon, Add as AddIcon, GetApp as ExportIcon } from '@mui/icons-material';
import { useVehicleFilters } from '../hooks/useVehicleFilters';

const VehicleFilters = ({ onAdd, motorcycles, onFiltered }) => {
    const { searchQuery, setSearchQuery, statusFilter, setStatusFilter } = useVehicleFilters();

    const filteredMotorcycles = React.useMemo(() => {
        return motorcycles.filter((motorcycle) => {
            const search = searchQuery.toLowerCase();
            const matchesSearch =
                (motorcycle.qrCode?.toLowerCase().includes(search) || false) ||
                (motorcycle.model?.toLowerCase().includes(search) || false) ||
                (motorcycle.plateNumber?.toLowerCase().includes(search) || false) ||
                (motorcycle.ownerName?.toLowerCase().includes(search) || false);

            const matchesStatus = statusFilter === 'ALL' || motorcycle.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [motorcycles, searchQuery, statusFilter]);

    // Notify parent (VehiclesPage) whenever filtered data changes
    React.useEffect(() => {
        onFiltered(filteredMotorcycles);
    }, [filteredMotorcycles, onFiltered]);

    const handleExport = () => {
        const csvContent = [
            ['Barcode', 'Model', 'Plate Number', 'Owner Name', 'Owner Phone', 'Owner Email', 'Status', 'Needs Service', 'Last Service'],
            ...filteredMotorcycles.map(m => [
                m.qrCode || '',
                m.model || '',
                m.plateNumber || '-',
                m.ownerName || '-',
                m.ownerPhone || '-',
                m.ownerEmail || '-',
                m.status || '',
                m.needsService ? 'Yes' : 'No',
                m.lastServiceDate ? new Date(m.lastServiceDate).toLocaleDateString() : 'Never'
            ])
        ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `motorcycles_${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    return (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            placeholder="Search by barcode, model, plate, or owner..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            select
                            label="Status Filter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <MenuItem value="ALL">All Status</MenuItem>
                            <MenuItem value="ACTIVE">Active</MenuItem>
                            <MenuItem value="INACTIVE">Inactive</MenuItem>
                            <MenuItem value="IN_SERVICE">In Service</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={onAdd}
                        >
                            Add Motorcycle
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<ExportIcon />}
                            onClick={handleExport}
                            disabled={filteredMotorcycles.length === 0}
                        >
                            Export CSV ({filteredMotorcycles.length})
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default VehicleFilters;