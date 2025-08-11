import React from 'react';

function MyProfile({ user }) {
    if (!user) return null;

    return (
        <div className="panel-card">
            <h2>Thông tin cá nhân</h2>
            <div className="panel-content profile-info">
                <p><strong>Họ và tên:</strong> {user.full_name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Mã sinh viên:</strong> {user.student_code || 'N/A'}</p>
                <p><strong>Vai trò:</strong> {user.role}</p>
                {/* KHÔNG CÓ BẤT KỲ LOGIC CAMERA HAY ĐIỂM DANH NÀO Ở ĐÂY */}
            </div>
        </div>
    );
}
export default MyProfile;