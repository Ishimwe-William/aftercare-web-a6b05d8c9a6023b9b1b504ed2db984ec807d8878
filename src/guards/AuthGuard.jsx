import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROUTES } from '../config/routes.config';

export const AuthGuard = ({ children, requiredRoles = [] }) => {
    const { isAuthenticated, user, isInitialized } = useSelector(
        (state) => state.auth
    );

    if (!isInitialized) return null;

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.AUTH.LOGIN} replace />;
    }

    if (requiredRoles.length > 0) {
        const userRoles = user?.roles || [];
        const hasAccess = requiredRoles.some(role => userRoles.includes(role));

        if (!hasAccess) {
            return <Navigate to={ROUTES.EXCEPTION.UNAUTHORIZED} replace />;
        }
    }

    return children;
};