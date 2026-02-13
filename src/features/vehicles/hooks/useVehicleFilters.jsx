import { useState } from 'react';

// This hook can be expanded to use React Context if filters need to be shared across components
export const useVehicleFilters = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    return {
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
    };
};

export default useVehicleFilters;