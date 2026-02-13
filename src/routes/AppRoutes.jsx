import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import React from 'react';
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import { SignupPage } from "../features/auth/SignupPage";
import { SignInPage } from "../features/auth/SignInPage";
import { ResetPasswordPage } from "../features/auth/ResetPasswordPage";
import { VerifyEmailPage } from "../features/auth/VerifyEmailPage";
import DashboardPage from "../features/dashboard/DashboardPage";
import VehiclesPage from "../features/vehicles/VehiclesPage";
import InventoryPage from "../features/inventory/InventoryPage";
import MonitoringPage from "../features/monitoring/MonitoringPage";
import SettingsPage from "../features/settings/SettingsPage";
import TechniciansPage from "../features/technicians/TechniciansPage";
import TaskAssignmentPage from "../features/tasks/TaskAssignmentPage";
import NotFoundPage from "../components/exceptionPages/NotFoundPage";
import UnauthorizedPage from "../components/exceptionPages/UnauthorizedPage";
import ServerErrorPage from "../components/exceptionPages/ServerErrorPage";
import NetworkErrorPage from "../components/exceptionPages/NetworkErrorPage";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { AuthGuard } from "../guards/AuthGuard";
import { ROUTES, ROUTE_PERMISSIONS } from "../config/routes.config";

const AppRoutes = () => {
    const isInitialized = useSelector((state) => state.auth.isInitialized);

    if (!isInitialized) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh'
            }}>
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/" element={<Navigate to={ROUTES.AUTH.LOGIN} replace />} />

            <Route path="/auth" element={<AuthLayout />}>
                <Route path="login" element={<SignInPage />} />
                <Route path="register" element={<SignupPage />} />
                <Route path="reset-password" element={<ResetPasswordPage />} />
                <Route path="verify-email" element={<VerifyEmailPage />} />
            </Route>

            <Route path="/login" element={<Navigate to={ROUTES.AUTH.LOGIN} replace />} />
            <Route path="/register" element={<Navigate to={ROUTES.AUTH.REGISTER} replace />} />

            <Route element={<MainLayout />}>
                <Route
                    path="/dashboard"
                    element={
                        <AuthGuard requiredRoles={ROUTE_PERMISSIONS[ROUTES.APP.DASHBOARD]}>
                            <DashboardPage />
                        </AuthGuard>
                    }
                />

                <Route
                    path="/vehicles"
                    element={
                        <AuthGuard requiredRoles={ROUTE_PERMISSIONS[ROUTES.APP.VEHICLES]}>
                            <VehiclesPage />
                        </AuthGuard>
                    }
                />

                <Route
                    path="/inventory"
                    element={
                        <AuthGuard requiredRoles={ROUTE_PERMISSIONS[ROUTES.APP.INVENTORY]}>
                            <InventoryPage />
                        </AuthGuard>
                    }
                />

                <Route
                    path="/monitoring"
                    element={
                        <AuthGuard requiredRoles={ROUTE_PERMISSIONS[ROUTES.APP.MONITORING]}>
                            <MonitoringPage />
                        </AuthGuard>
                    }
                />

                <Route
                    path="/settings/profile"
                    element={
                        <AuthGuard requiredRoles={ROUTE_PERMISSIONS[ROUTES.APP.SETTINGS_PROFILE]}>
                            <SettingsPage />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/settings/issues"
                    element={
                        <AuthGuard requiredRoles={ROUTE_PERMISSIONS[ROUTES.APP.SETTINGS_ISSUES]}>
                            <SettingsPage />
                        </AuthGuard>
                    }
                />

                <Route
                    path="/settings/*"
                    element={
                        <AuthGuard requiredRoles={ROUTE_PERMISSIONS[ROUTES.APP.SETTINGS]}>
                            <SettingsPage />
                        </AuthGuard>
                    }
                />

                <Route
                    path="/tasks/*"
                    element={
                        <AuthGuard requiredRoles={ROUTE_PERMISSIONS[ROUTES.APP.TASKS]}>
                            <Routes>
                                <Route index element={<TaskAssignmentPage />} />
                                <Route
                                    path="create"
                                    element={<TaskAssignmentPage />}
                                />
                                <Route
                                    path="edit/:taskId"
                                    element={<TaskAssignmentPage />}
                                />
                                <Route path="*" element={<NotFoundPage />} />
                            </Routes>
                        </AuthGuard>
                    }
                />

                <Route
                    path="/technicians"
                    element={
                        <AuthGuard requiredRoles={ROUTE_PERMISSIONS[ROUTES.APP.TECHNICIANS]}>
                            <TechniciansPage />
                        </AuthGuard>
                    }
                />

                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="/not-found" element={<NotFoundPage />} />
                <Route path="/server-error" element={<ServerErrorPage />} />
                <Route path="/network-error" element={<NetworkErrorPage />} />

                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;