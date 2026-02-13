import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import userReducer from '../features/settings/userSlice';
import settingsReducer from '../features/settings/settingsSlice';
import inventoryReducer from '../features/inventory/inventorySlice';
import taskReducer from '../features/tasks/taskAssignmentSlice';
import motorcycleReducer from '../features/vehicles/motorcycleSlice';
import technicianReducer from '../features/technicians/technicianSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import monitoringReducer from '../features/monitoring/monitoringSlice';
import invoiceReducer from './slices/invoiceSlice';
import laborRateReducer from '../features/settings/laborRateSlice';
import issuesReducer from '../features/settings/issuesSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        users: userReducer,
        settings: settingsReducer,
        inventory: inventoryReducer,
        tasks: taskReducer,
        motorcycles: motorcycleReducer,
        technicians: technicianReducer,
        dashboard: dashboardReducer,
        monitoring: monitoringReducer,
        invoice: invoiceReducer,
        laborRate: laborRateReducer,
        issues: issuesReducer,
    },

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types for blob data
                ignoredActions: ['inventory/exportInventoryReport/fulfilled'],
                // Ignore these paths in the state
                ignoredPaths: ['inventory.exportData'],
            },
        }),
});