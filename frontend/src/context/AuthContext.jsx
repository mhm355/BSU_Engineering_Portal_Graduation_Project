import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');

        if (storedUser) {
            // Validate session with backend
            api.get('/api/auth/profile/')
                .then(res => {
                    setUser(res.data);
                    // Update localStorage with fresh data
                    localStorage.setItem('user', JSON.stringify(res.data));
                })
                .catch(() => {
                    // Session invalid - clear localStorage
                    localStorage.removeItem('user');
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            // No stored credentials - clear any partial data
            localStorage.removeItem('user');
            setLoading(false);
        }
    }, []);

    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = async () => {
        try {
            // Invalidate session on backend
            await api.post('/api/auth/logout/');
        } catch {
            // Continue logout even if backend call fails
        }
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
