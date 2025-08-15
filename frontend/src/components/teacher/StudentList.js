import React from 'react';
import './StudentList.css';

function StudentList({ students, attendedStudentLogs }) {
    const presentCount = Object.values(attendedStudentLogs).filter(
        log => log.status === 'present' || log.status === 'late'
    ).length;
    const totalCount = students.length;

    const getStatusInfo = (status) => {
        switch (status) {
            case 'present':
            case 'late': 
                return { text: 'Có mặt', className: 'present' };
            case 'absent':
                return { text: 'Vắng mặt', className: 'absent' };
            default:
                return { text: 'Chưa điểm danh', className: 'absent' };
        }
    };

    return (
        <div className="panel-card">
            <h2>Danh sách lớp ({presentCount}/{totalCount} có mặt)</h2>
            <div className="panel-content student-list-wrapper">
                <ul className="student-list">
                    {students.map(student => {
                        const log = attendedStudentLogs[student.id];
                        const statusInfo = getStatusInfo(log?.status);

                        return (
                            <li key={student.id} className={statusInfo.className}>
                                <span className="status-dot"></span>
                                <div className="student-info">
                                    <span className="student-name">{student.full_name}</span>
                                    <span className="student-code">{student.student_code}</span>
                                </div>
                                <span className="status-text">{statusInfo.text}</span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}

export default StudentList;