export const ROUTES = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        RESET_PASSWORD: '/auth/reset-password',
        VERIFY_EMAIL: '/auth/verify-email',
    },
    APP: {
        DASHBOARD: '/dashboard',
        VEHICLES: '/vehicles',
        INVENTORY: '/inventory',
        MONITORING: '/monitoring',
        SETTINGS: '/settings/profile',
        SETTINGS_PROFILE: '/settings/profile',
        SETTINGS_ISSUES: '/settings/issues',
        TASKS: '/tasks',
        TASKS_CREATE: '/tasks/create',
        TASKS_EDIT: '/tasks/edit/:taskId',
        TECHNICIANS: '/technicians',
    },
    EXCEPTION: {
        NOT_FOUND: '/not-found',
        UNAUTHORIZED: '/unauthorized',
        NETWORK_ERROR: '/network-error',
        SERVER_ERROR: '/server-error',
    }
};

export const ROUTE_PERMISSIONS = {
    [ROUTES.APP.DASHBOARD]: ['ROLE_ADMIN', 'ROLE_SUPERVISOR', 'ROLE_STAFF', 'ROLE_TECHNICIAN', 'ROLE_MANAGER'],
    [ROUTES.APP.VEHICLES]: ['ROLE_ADMIN', 'ROLE_SUPERVISOR'],
    [ROUTES.APP.INVENTORY]: ['ROLE_ADMIN'],
    [ROUTES.APP.MONITORING]: ['ROLE_ADMIN', 'ROLE_SUPERVISOR'],
    [ROUTES.APP.SETTINGS]: ['ROLE_ADMIN'],
    [ROUTES.APP.SETTINGS_ISSUES]: ['ROLE_ADMIN', 'ROLE_SUPERVISOR'],
    [ROUTES.APP.SETTINGS_PROFILE]: ['ROLE_ADMIN', 'ROLE_SUPERVISOR', 'ROLE_STAFF', 'ROLE_TECHNICIAN', 'ROLE_MANAGER'],

    [ROUTES.APP.TASKS]: ['ROLE_ADMIN', 'ROLE_SUPERVISOR'],
    [ROUTES.APP.TASKS_CREATE]: ['ROLE_ADMIN', 'ROLE_SUPERVISOR'],
    [ROUTES.APP.TASKS_EDIT]: ['ROLE_ADMIN', 'ROLE_SUPERVISOR'],

    [ROUTES.APP.TECHNICIANS]: ['ROLE_ADMIN', 'ROLE_SUPERVISOR'],
};
