import React from "react";
import { Navigate } from "react-router-dom";
import AuthService from "../services/auth.service";

interface ProtectedAdminRouteProps {
    children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
    const user = AuthService.getCurrentUser();

    // Not logged in → redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Logged in but not admin → redirect to home
    if (!user.roles?.includes("ROLE_ADMIN")) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedAdminRoute;
