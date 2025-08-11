import React from 'react';
import { Link } from 'react-router-dom';

function ClassTable({ classes, onEdit, onDelete }) {
    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên Lớp học</th>
                        <th>Giáo viên phụ trách</th>
                        <th>Sĩ số</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {classes.length > 0 ? (
                        classes.map(cls => (
                            <tr key={cls.id}>
                                <td>{cls.id}</td>
                                <td>{cls.name}</td>
                                <td>{cls.teacher ? cls.teacher.full_name : 'Chưa có'}</td>
                                <td>{cls.students.length}</td>
                                <td className="action-buttons">
                                    <button className="edit-btn" onClick={() => onEdit(cls)}>Sửa</button>
                                    <Link to={`/admin/classes/${cls.id}`} className="action-link view-btn">
                                        Chi tiết
                                    </Link>
                                    <button className="delete-btn" onClick={() => onDelete(cls.id)}>Xóa</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center' }}>Chưa có lớp học nào.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default ClassTable;