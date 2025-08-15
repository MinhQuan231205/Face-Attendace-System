import React, { useState, useEffect } from 'react';

function UserModal({ isOpen, onClose, onSave, user }) {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        student_code: '',
        password: '',
        role: 'student',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                email: user.email || '',
                student_code: user.student_code || '',
                password: '', 
                role: user.role || 'student',
            });
        } else {
            setFormData({
                full_name: '', email: '', student_code: '', password: '', role: 'student',
            });
        }
    }, [user, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        if (formData.role === 'student' && !formData.student_code) {
            alert('Mã số sinh viên là bắt buộc đối với vai trò "Student".');
            return; 
        }
        e.preventDefault();
        const dataToSave = { ...formData };
        if (!dataToSave.student_code) {
            dataToSave.student_code = null; 
        }
        onSave(dataToSave);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{user ? 'Sửa thông tin người dùng' : 'Thêm người dùng mới'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Họ và tên</label>
                        <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Mã sinh viên (nếu có)</label>
                        <input type="text" name="student_code" value={formData.student_code} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Mật khẩu {user ? '(để trống nếu không đổi)' : ''}</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required={!user} />
                    </div>
                    <div className="form-group">
                        <label>Vai trò</label>
                        <select name="role" value={formData.role} onChange={handleChange}>
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="save-btn">Lưu</button>
                        <button type="button" onClick={onClose} className="cancel-btn">Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UserModal;