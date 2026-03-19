import axios from 'axios';

// API base URL - uses environment variable in production, empty for development (uses Vite proxy)
const API_BASE = import.meta.env.VITE_API_URL || '';

// Create axios instance — session-based authentication, no Bearer token
const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor — handle 401 (session expired) with redirect
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Session expired or invalid — clear storage and redirect
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
export { API_BASE };
