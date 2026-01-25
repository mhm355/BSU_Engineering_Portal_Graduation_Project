import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');

        if (storedUser && token) {
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
                    localStorage.removeItem('access_token');
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            // No stored credentials - clear any partial data
            localStorage.removeItem('user');
            localStorage.removeItem('access_token');
            setLoading(false);
        }
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('user', JSON.stringify(userData));
        if (token) {
            localStorage.setItem('access_token', token);
        }
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
