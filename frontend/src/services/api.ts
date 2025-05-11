import axios from "axios";

// Create an axios instance with base URL and default headers
const api = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("jwtToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response } = error;

        // Handle authentication errors
        if (response && response.status === 401) {
            // Only redirect to login if not already on the login page
            const currentPath = window.location.pathname;
            if (currentPath !== "/login") {
                localStorage.removeItem("jwtToken");
                localStorage.removeItem("user");
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default api;
