import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protects dashboard routes by checking authentication and role.
 * Redirects to /login if unauthenticated.
 * Redirects to /change-password if first_login_required.
 * Redirects to / if the user's role does not match the allowed roles.
 *
 * Usage:
 *   <Route element={<ProtectedRoute roles={['ADMIN']} />}>
 *     <Route path="admin/dashboard" element={<AdminDashboard />} />
 *   </Route>
 */
const ProtectedRoute = ({ children, roles }) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Force password change on first login (except when already on change-password page)
    if (user.first_login_required && location.pathname !== '/change-password') {
        return <Navigate to="/change-password" replace />;
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
