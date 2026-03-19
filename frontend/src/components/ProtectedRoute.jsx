import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protects dashboard routes by checking authentication and role.
 * Redirects to /login if unauthenticated.
 * Redirects to / if the user's role does not match the allowed roles.
 *
 * Usage:
 *   <Route element={<ProtectedRoute roles={['ADMIN']} />}>
 *     <Route path="admin/dashboard" element={<AdminDashboard />} />
 *   </Route>
 */
const ProtectedRoute = ({ children, roles }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
