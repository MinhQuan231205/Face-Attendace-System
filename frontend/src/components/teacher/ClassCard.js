import React from 'react';
import { Link } from 'react-router-dom';
import './ClassCard.css'; // File CSS này vẫn được sử dụng

function ClassCard({ classData }) {
    // Logic tính sĩ số vẫn giữ nguyên
    const studentCount = classData.students?.length || 0;

    return (
        <div className="class-card">
            <div className="card-header">
                <h3 className="card-title">{classData.name}</h3>
                <span className="student-count">{studentCount} sinh viên</span>
            </div>
            <div className="card-body">
                <p>{classData.description || 'Không có mô tả.'}</p>
            </div>
            
            {/* --- THAY ĐỔI CHÍNH NẰM Ở ĐÂY --- */}
            <div className="card-footer">
                {/* 
                  Chỉ còn một nút duy nhất. 
                  Nút này sẽ dẫn đến trang quản lý tất cả các buổi học của lớp.
                  URL này khớp với Route chúng ta đã định nghĩa trong App.js.
                */}
                <Link to={`/teacher/class/${classData.id}/sessions`} className="action-button">
                    Quản lý Buổi học
                </Link>
            </div>
        </div>
    );
}

export default ClassCard;