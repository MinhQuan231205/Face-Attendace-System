import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import ClassCard from '../components/teacher/ClassCard';

function TeacherDashboardPage() {
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTaughtClasses = async () => {
            try {
                // Gọi API để lấy các lớp mà giáo viên này dạy
                const response = await apiClient.get('/teachers/me/classes/');
                setClasses(response.data);
            } catch (err) {
                setError('Không thể tải danh sách lớp học của bạn.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTaughtClasses();
    }, []);

    if (isLoading) return <p>Đang tải danh sách lớp học...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="teacher-dashboard">
            <h1>Các lớp học của tôi</h1>
            {classes.length > 0 ? (
                <div className="class-grid">
                    {classes.map(cls => (
                        <ClassCard key={cls.id} classData={cls} />
                    ))}
                </div>
            ) : (
                <p>Bạn chưa được phân công phụ trách lớp học nào.</p>
            )}
        </div>
    );
}

export default TeacherDashboardPage;