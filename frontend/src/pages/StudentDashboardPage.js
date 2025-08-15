import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axios';
import MyProfile from '../components/student/MyProfile';
import MyAttendanceHistory from '../components/student/MyAttendanceHistory';

function StudentDashboardPage() {
    const [currentUser, setCurrentUser] = useState(null);
    const [attendanceLogs, setAttendanceLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [userResponse, logsResponse] = await Promise.all([
                apiClient.get('/users/me/'),
                apiClient.get('/users/me/attendance-logs/')
            ]);
            setCurrentUser(userResponse.data);
            setAttendanceLogs(logsResponse.data);
        } catch (err) {
            setError('Không thể tải dữ liệu của bạn. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (isLoading) return <p>Đang tải trang của bạn...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="student-dashboard">
            <h1>Chào mừng, {currentUser?.full_name}!</h1>
            <div className="student-dashboard-layout">
                <div className="profile-panel">
                    <MyProfile user={currentUser} />
                </div>
                <div className="history-panel">
                    <MyAttendanceHistory logs={attendanceLogs} />
                </div>
            </div>
        </div>
    );
}

export default StudentDashboardPage;