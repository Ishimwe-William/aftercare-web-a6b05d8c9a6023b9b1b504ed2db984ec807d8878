import DashboardIcon from "@mui/icons-material/Equalizer";
import MonitorIcon from "@mui/icons-material/Monitor";
import ElectricBikeIcon from '@mui/icons-material/ElectricBike';
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import SettingsIcon from "@mui/icons-material/Settings";
import TasksIcon from "@mui/icons-material/Assignment";
import { ROUTES } from './routes.config';

export const NAVIGATION = {
    MAIN: [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: DashboardIcon,
            path: ROUTES.APP.DASHBOARD,
            roles: ['ROLE_ADMIN', 'ROLE_SUPERVISOR', 'ROLE_STAFF', 'ROLE_TECHNICIAN', 'ROLE_MANAGER']
        },
        {
            id: 'monitoring',
            label: 'Monitoring',
            icon: MonitorIcon,
            path: ROUTES.APP.MONITORING,
            roles: ['ROLE_ADMIN','ROLE_SUPERVISOR', 'ROLE_MANAGER']
        },
        {
            id: 'technicians',
            label: 'Technicians',
            icon: PeopleIcon,
            path: ROUTES.APP.TECHNICIANS,
            roles: ['ROLE_ADMIN', 'ROLE_SUPERVISOR']
        },
        {
            id: 'inventory',
            label: 'Inventory',
            icon: InventoryIcon,
            path: ROUTES.APP.INVENTORY,
            roles: ['ROLE_ADMIN','ROLE_MANAGER']
        },
        {
            id: 'vehicles',
            label: 'Vehicles',
            icon: ElectricBikeIcon,
            path: ROUTES.APP.VEHICLES,
            roles: ['ROLE_ADMIN', 'ROLE_SUPERVISOR']
        },
    ],
    AFTERCARE: [
        {
            id: 'tasks',
            label: 'Tasks Management',
            icon: TasksIcon,
            path: ROUTES.APP.TASKS,
            roles: ['ROLE_ADMIN', 'ROLE_SUPERVISOR']
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: SettingsIcon,
            path: ROUTES.APP.SETTINGS,
            roles: ['ROLE_ADMIN', 'ROLE_SUPERVISOR', 'ROLE_STAFF', 'ROLE_TECHNICIAN', 'ROLE_MANAGER']
        },
    ]
};