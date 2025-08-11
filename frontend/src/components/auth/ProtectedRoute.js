import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
    const { authState } = useContext(AuthContext);
    const location = useLocation();

    if (!authState.user) {
        // Chưa đăng nhập -> về trang login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (role && authState.user.role !== role) {
        // Đã đăng nhập nhưng sai vai trò -> về trang chủ
        return <Navigate to="/" replace />;
    }
    
    // Ok, cho qua
    return children;
};

export default ProtectedRoute;