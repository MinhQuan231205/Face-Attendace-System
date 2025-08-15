import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

const getInitialAuthState = () => {
    const token = localStorage.getItem('accessToken');

    if (token) {
        try {
            const decodedUser = jwtDecode(token);
            if (decodedUser.exp * 1000 > Date.now()) {
                return { token: token, user: decodedUser };
            }
        } catch (error) {
            console.error("Lỗi giải mã token ban đầu:", error);
        }
    }
    localStorage.removeItem('accessToken'); 
    return { token: null, user: null };
};

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState(getInitialAuthState);
    
    const login = (token) => {
        localStorage.setItem('accessToken', token);
        const decodedUser = jwtDecode(token);
        setAuthState({
            token: token,
            user: decodedUser,
        });
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        setAuthState({
            token: null,
            user: null,
        });
    };

    return (
        <AuthContext.Provider value={{ authState, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};