import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/axios';

function ClassDetailPage() {
    const { classId } = useParams(); 
    const [classDetails, setClassDetails] = useState(null);
    const [allStudents, setAllStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [classRes, usersRes] = await Promise.all([
                apiClient.get(`/classes/${classId}`),
                apiClient.get('/users/')
            ]);

            setClassDetails(classRes.data);
            setAllStudents(usersRes.data.filter(u => u.role === 'student'));
            setError('');
        } catch (err) {
            setError('Không thể tải thông tin lớp học.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [classId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddStudent = async (studentId) => {
        try {
            await apiClient.post(`/classes/${classId}/students/${studentId}`);
            fetchData(); 
        } catch (err) {
            alert('Thêm sinh viên thất bại.');
        }
    };

    const handleRemoveStudent = async (studentId) => {
        try {
            await apiClient.delete(`/classes/${classId}/students/${studentId}`);
            fetchData(); 
        } catch (err) {
            alert('Xóa sinh viên thất bại.');
        }
    };

    if (isLoading) return <p>Đang tải...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!classDetails) return <p>Không tìm thấy lớp học.</p>;

    const studentsInClassIds = new Set(classDetails.students.map(s => s.id));
    const studentsNotInClass = allStudents.filter(s => !studentsInClassIds.has(s.id));

    return (
        <div className="class-detail-page">
            <Link to="/admin/dashboard" className="back-link"> &larr; Quay lại Dashboard</Link>
            <h1>Chi tiết Lớp: {classDetails.name}</h1>
            <p><strong>Giáo viên:</strong> {classDetails.teacher?.full_name}</p>
            <p><strong>Mô tả:</strong> {classDetails.description || 'Không có'}</p>

            <div className="member-management-layout">
                <div className="member-list-container">
                    <h3>Sinh viên trong lớp ({classDetails.students.length})</h3>
                    <ul className="member-list">
                        {classDetails.students.map(student => (
                            <li key={student.id}>
                                <span>{student.full_name} ({student.student_code})</span>
                                <button onClick={() => handleRemoveStudent(student.id)} className="remove-btn">-</button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="member-list-container">
                    <h3>Sinh viên chưa có trong lớp ({studentsNotInClass.length})</h3>
                    <ul className="member-list">
                        {studentsNotInClass.map(student => (
                            <li key={student.id}>
                                <span>{student.full_name} ({student.student_code})</span>
                                <button onClick={() => handleAddStudent(student.id)} className="add-btn">+</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default ClassDetailPage;