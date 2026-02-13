import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteMotorcycle, fetchAllMotorcycles, fetchMotorcycleStatistics } from '../motorcycleSlice';

const useVehicleManagement = () => {
    const dispatch = useDispatch();
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('create');
    const [selectedMotorcycle, setSelectedMotorcycle] = useState(null);

    const handleOpenDialog = (mode, motorcycle = null) => {
        setDialogMode(mode);
        setSelectedMotorcycle(motorcycle);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedMotorcycle(null);
        setDialogMode('create');
    };

    const handleDelete = async (motorcycleId) => {
        if (!window.confirm('Are you sure you want to delete this motorcycle?')) return;

        try {
            await dispatch(deleteMotorcycle(motorcycleId)).unwrap();

            // Refresh data after successful deletion
            dispatch(fetchAllMotorcycles({ page: 0, size: 1000 }));
            dispatch(fetchMotorcycleStatistics());
        } catch (error) {
            const errorMessage = typeof error === 'string'
                ? error
                : error.message || 'Failed to delete motorcycle';
            alert(errorMessage);
        }
    };

    return {
        openDialog,
        dialogMode,
        selectedMotorcycle,
        handleOpenDialog,
        handleCloseDialog,
        handleDelete,
    };
};

export default useVehicleManagement;