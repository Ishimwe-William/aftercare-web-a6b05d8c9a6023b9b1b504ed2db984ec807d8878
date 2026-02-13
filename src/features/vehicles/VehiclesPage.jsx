import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Box, Typography, Alert} from '@mui/material';
import VehicleStatistics from './components/VehicleStatistics';
import VehicleCharts from './components/VehicleCharts';
import VehicleFilters from './components/VehicleFilters';
import VehicleTable from './components/VehicleTable';
import VehicleDialog from './components/VehicleDialog';
import useVehicleManagement from './hooks/useVehicleManagement';
import {VehicleFilterProvider} from './context/VehicleFilterContext';
import {fetchAllMotorcycles, fetchMotorcycleStatistics} from './motorcycleSlice';
import LoadingSpinner from "../../components/common/LoadingSpinner";

const VehiclesPage = () => {
    const dispatch = useDispatch();
    const {motorcycles, statistics, loading, error} = useSelector((state) => state.motorcycles);
    const [filteredMotorcycles, setFilteredMotorcycles] = useState(motorcycles);

    const {
        openDialog,
        dialogMode,
        selectedMotorcycle,
        handleOpenDialog,
        handleCloseDialog,
        handleDelete,
    } = useVehicleManagement();

    useEffect(() => {
        dispatch(fetchAllMotorcycles({page: 0, size: 1000}));
        dispatch(fetchMotorcycleStatistics());
    }, [dispatch]);

    // Keep filtered list in sync when raw data changes
    useEffect(() => {
        setFilteredMotorcycles(motorcycles);
    }, [motorcycles]);

    if (loading && motorcycles.length === 0) <LoadingSpinner/>

    return (
        <VehicleFilterProvider>
            <Box sx={{p: 3, bgcolor: '#f5f5f5', minHeight: '100vh'}}>
                <Box sx={{mb: 3}}>
                    <Typography variant="h4" gutterBottom>
                        Vehicles Management
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{mb: 3}}>
                        {typeof error === 'string' ? error : error.message || 'Failed to load motorcycles'}
                    </Alert>
                )}

                <VehicleStatistics statistics={statistics}/>
                <VehicleCharts statistics={statistics}/>

                {/* Filters + Actions */}
                <VehicleFilters
                    onAdd={() => handleOpenDialog('create')}
                    motorcycles={motorcycles}
                    onFiltered={setFilteredMotorcycles}
                />

                {/* Table Title + Count */}
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, mb: 1}}>
                    <Typography variant="h6">
                        Motorcycles List
                        ({filteredMotorcycles.length} {filteredMotorcycles.length === 1 ? 'item' : 'items'})
                    </Typography>
                </Box>

                {/* Table with filtered data */}
                <VehicleTable
                    motorcycles={filteredMotorcycles}
                    onEdit={(motorcycle) => handleOpenDialog('edit', motorcycle)}
                    onDelete={handleDelete}
                />

                <VehicleDialog
                    open={openDialog}
                    mode={dialogMode}
                    motorcycle={selectedMotorcycle}
                    onClose={handleCloseDialog}
                />
            </Box>
        </VehicleFilterProvider>
    );
};

export default VehiclesPage;