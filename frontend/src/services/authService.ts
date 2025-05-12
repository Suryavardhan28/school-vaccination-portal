import api from "./api";

export interface User {
    id: number;
    username: string;
    role: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export const login = async (
    username: string,
    password: string
): Promise<User> => {
    try {
        const response = await api.post<LoginResponse>("/auth/login", {
            username,
            password,
        });

        // Store token and user info in localStorage
        localStorage.setItem("jwtToken", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        return response.data.user;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};

export const logout = (): void => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("user");
};

export const getCurrentUser = (): User | null => {
    const userJson = localStorage.getItem("user");
    if (!userJson) return null;
    try {
        return JSON.parse(userJson);
    } catch (error) {
        console.error("Error parsing user data:", error);
        // Clear invalid user data
        localStorage.removeItem("user");
        return null;
    }
};

export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem("jwtToken");
};

interface GetUsersResponse {
    users: User[];
    total: number;
    page: number;
    totalPages: number;
}

interface GetUsersParams {
    username?: string;
    role?: string;
    userId?: string;
    sortField?: string;
    sortDirection?: string;
}

export const getUsers = async (
    page: number,
    limit: number,
    params?: GetUsersParams
): Promise<GetUsersResponse> => {
    const response = await api.get("/users", {
        params: {
            page,
            limit,
            ...params,
        },
    });
    return response.data;
};

// Create a user
export const createUser = async (data: {
    username: string;
    password: string;
    role: string;
}): Promise<User> => {
    const response = await api.post("/users", data);
    return response.data;
};

// Update a user
export const updateUser = async (
    id: number,
    data: { username: string; password?: string; role: string }
): Promise<User> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
};

// Delete a user
export const deleteUser = async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
};
