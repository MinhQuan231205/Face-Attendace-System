import React, { useState, useEffect } from 'react';

function ClassModal({ isOpen, onClose, onSave, classData, teachers }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        teacher_id: '',
    });

    useEffect(() => {
        if (classData) {
            setFormData({
                name: classData.name || '',
                description: classData.description || '',
                teacher_id: classData.teacher?.id || '',
            });
        } else {
            setFormData({ name: '', description: '', teacher_id: '' });
        }
    }, [classData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.teacher_id) {
            alert('Vui lòng chọn một giáo viên phụ trách.');
            return;
        }
        onSave({ ...formData, teacher_id: parseInt(formData.teacher_id) });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{classData ? 'Sửa thông tin Lớp học' : 'Thêm Lớp học mới'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tên Lớp học</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Mô tả (tùy chọn)</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="3"></textarea>
                    </div>
                    <div className="form-group">
                        <label>Giáo viên phụ trách</label>
                        <select name="teacher_id" value={formData.teacher_id} onChange={handleChange} required>
                            <option value="" disabled>-- Chọn giáo viên --</option>
                            {teachers.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.full_name} (ID: {teacher.id})
                                </option>
                            ))}
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

export default ClassModal;