import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedLayout from "../components/ProtectedLayout";
import { useAuth } from "../contexts/AuthContext";

// Pages
import Dashboard from "../pages/Dashboard/Dashboard";
import Login from "../pages/Login/Login";
import Reports from "../pages/Reports/Reports";
import Students from "../pages/Students/Students";
import Users from "../pages/Users/Users";
import VaccinationDrives from "../pages/VaccinationDrives/VaccinationDrives";
import Vaccinations from "../pages/Vaccinations/Vaccinations";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const LoginRoute = () => {
    const { user } = useAuth();
    return user ? <Navigate to="/" replace /> : <Login />;
};

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginRoute />} />

            {/* Protected routes */}
            <Route
                element={
                    <ProtectedRoute>
                        <ProtectedLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/" element={<Dashboard />} />
                <Route path="/students" element={<Students />} />
                <Route path="/users" element={<Users />} />
                <Route
                    path="/vaccination-drives"
                    element={<VaccinationDrives />}
                />
                <Route path="/vaccinations" element={<Vaccinations />} />
                <Route path="/reports" element={<Reports />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
