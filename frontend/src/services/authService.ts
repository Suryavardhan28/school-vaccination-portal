import api from './api';

export interface User {
    id: number;
    username: string;
    role: string;
}

interface LoginResponse {
    token: string;
    user: User;
}

export const login = async (username: string, password: string): Promise<User> => {
    try {
        const response = await api.post<LoginResponse>('/auth/login', { username, password });

        // Store token and user info in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        return response.data.user;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
};

export const getCurrentUser = (): User | null => {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
};

export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem('token');
}; 