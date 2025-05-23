import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../services/authService";

const ProtectedRoute = () => {
    const authenticated = isAuthenticated();

    if (!authenticated) {
        // If not authenticated, redirect to login
        return <Navigate to="/login" replace />;
    }

    // If authenticated, render the child routes
    return <Outlet />;
};

export default ProtectedRoute;
