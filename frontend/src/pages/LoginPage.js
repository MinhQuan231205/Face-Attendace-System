import React, { useState, useContext } from 'react'; // Thêm useContext
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import apiClient from '../api/axios.js'; // <-- Sửa đường dẫn nếu cần
import { AuthContext } from '../context/AuthContext'; // <-- IMPORT AUTHCONTEXT

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext); // Lấy hàm login từ context

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const params = new URLSearchParams();
        params.append('username', email);

        params.append('password', password);

        try {
            // Dùng apiClient thay vì axios
            const response = await apiClient.post('/token', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const { access_token } = response.data;
            
            // Dùng hàm login từ context để cập nhật trạng thái toàn cục và lưu token
            login(access_token); 
            
            // Giải mã token để điều hướng
            const decodedToken = jwtDecode(access_token);
            if (decodedToken.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (decodedToken.role === 'teacher') { 
                navigate('/teacher/dashboard'); 
            } else {
                navigate('/student/dashboard');
            }

        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError('Email hoặc mật khẩu không chính xác.');
            } else {
                setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
            }
        }
    };

    // ... (phần JSX của form giữ nguyên)
    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Đăng Nhập</h2>
                {error && <p className="error-message">{error}</p>}
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Mật khẩu:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Đăng Nhập</button>
            </form>
        </div>
    );
}

export default LoginPage;