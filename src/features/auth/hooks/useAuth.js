import { useSelector } from 'react-redux';

export const useAuth = () => {
    const auth = useSelector(state => state.auth);

    const hasRole = (roles) => {
        const userRoles = auth.user?.roles || [];
        return roles.some(role => userRoles.includes(role));
    };

    const hasAnyRole = (roles) => hasRole(roles);

    const hasAllRoles = (roles) => {
        const userRoles = auth.user?.roles || [];
        return roles.every(role => userRoles.includes(role));
    };

    return {
        ...auth,
        hasRole,
        hasAnyRole,
        hasAllRoles,
    };
};