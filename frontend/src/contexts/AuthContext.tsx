import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";
import {
    login as authLogin,
    logout as authLogout,
    getCurrentUser,
    User,
} from "../services/authService";

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const user = await authLogin(username, password);
            setUser(user);
            navigate("/");
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : t("auth.loginError");
            throw new Error(errorMessage);
        }
    };

    const logout = () => {
        authLogout();
        setUser(null);
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
