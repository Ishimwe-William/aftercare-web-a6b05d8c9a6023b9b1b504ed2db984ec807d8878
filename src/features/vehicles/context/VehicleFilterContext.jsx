import React, { createContext, useContext, useState } from 'react';

const VehicleFilterContext = createContext();

export const VehicleFilterProvider = ({ children }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const value = {
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
    };

    return (
        <VehicleFilterContext.Provider value={value}>
            {children}
        </VehicleFilterContext.Provider>
    );
};

export const useVehicleFilters = () => {
    const context = useContext(VehicleFilterContext);
    if (!context) {
        throw new Error('useVehicleFilters must be used within VehicleFilterProvider');
    }
    return context;
};

export default VehicleFilterContext;