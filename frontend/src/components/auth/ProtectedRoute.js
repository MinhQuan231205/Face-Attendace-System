import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
    const { authState } = useContext(AuthContext);
    const location = useLocation();
    if (!authState.user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    if (role && authState.user.role !== role) {
        return <Navigate to="/" replace />;
    }
    return children;
};

export default ProtectedRoute;