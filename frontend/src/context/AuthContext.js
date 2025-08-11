import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// 1. Tạo Context
export const AuthContext = createContext();

// --- HÀM KHỞI TẠO TRẠNG THÁI BAN ĐẦU ---
// Hàm này sẽ chạy một lần duy nhất khi AuthProvider được tạo
const getInitialAuthState = () => {
    const token = localStorage.getItem('accessToken');

    if (token) {
        try {
            const decodedUser = jwtDecode(token);
            // Kiểm tra token hết hạn
            if (decodedUser.exp * 1000 > Date.now()) {
                // Token hợp lệ, trả về trạng thái đã đăng nhập
                return { token: token, user: decodedUser };
            }
        } catch (error) {
            // Token không hợp lệ
            console.error("Lỗi giải mã token ban đầu:", error);
        }
    }
    // Nếu không có token hoặc token không hợp lệ, trả về trạng thái mặc định
    localStorage.removeItem('accessToken'); // Dọn dẹp token hỏng
    return { token: null, user: null };
};


// 2. Tạo Provider Component
export const AuthProvider = ({ children }) => {
    // SỬ DỤNG HÀM KHỞI TẠO Ở ĐÂY
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