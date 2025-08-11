import React, { useRef } from 'react';

function UserTable({ users, onEdit, onDelete, onUpdateFace }) {
    const fileInputRefs = useRef({});

    const handleFileChange = (e, userId) => {
        const file = e.target.files[0];
        if (file) {
            onUpdateFace(userId, file);
        }
    };

    const triggerFileInput = (userId) => {
        fileInputRefs.current[userId].click();
    };

    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Họ và tên</th>
                        <th>Email</th>
                        <th>Mã Sinh viên</th>
                        <th>Vai trò</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.full_name}</td>
                            <td>{user.email}</td>
                            <td>{user.student_code || 'N/A'}</td>
                            <td>{user.role}</td>
                            <td className="action-buttons">
                                <button className="edit-btn" onClick={() => onEdit(user)}>Sửa</button>
                                <button className="face-btn" onClick={() => triggerFileInput(user.id)}>Cập nhật ảnh</button>
                                <input 
                                    type="file" 
                                    style={{ display: 'none' }} 
                                    ref={el => fileInputRefs.current[user.id] = el}
                                    onChange={(e) => handleFileChange(e, user.id)}
                                    accept="image/jpeg, image/png"
                                />
                                <button className="delete-btn" onClick={() => onDelete(user.id)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UserTable;