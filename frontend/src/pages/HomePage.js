import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
    return (
        <div>
            <h1>Chào mừng đến với Hệ thống Điểm danh</h1>
            <Link to="/login">Đi đến trang Đăng nhập</Link>
        </div>
    );
}
export default HomePage;