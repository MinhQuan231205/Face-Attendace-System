import React from 'react';
import { Link } from 'react-router-dom';
import './ClassCard.css'; 

function ClassCard({ classData }) {
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
            <div className="card-footer">
                <Link to={`/teacher/class/${classData.id}/sessions`} className="action-button">
                    Quản lý Buổi học
                </Link>
            </div>
        </div>
    );
}

export default ClassCard;