import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import AttendanceTaker from '../components/teacher/AttendanceTaker';
import StudentList from '../components/teacher/StudentList';
import SessionTimer from '../components/teacher/SessionTimer'; // Component mới

function AttendancePage() {
    const { sessionId } = useParams(); // Lấy sessionId từ URL
    const navigate = useNavigate();
    const [sessionDetails, setSessionDetails] = useState(null);
    const [students, setStudents] = useState([]);
    const [attendedStudentLogs, setAttendedStudentLogs] = useState({}); // Dùng object để lưu log
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchSessionData = useCallback(async () => {
        setIsLoading(true);
        try {
            // API lấy chi tiết session thường đã bao gồm thông tin lớp và ds sinh viên
            // Để đơn giản, ta vẫn gọi các API riêng
            const sessionRes = await apiClient.get(`/sessions/${sessionId}`); // API này cần được tạo
            const classStudentsRes = await apiClient.get(`/classes/${sessionRes.data.class_id}/students/`);
            
            setSessionDetails(sessionRes.data);
            setStudents(classStudentsRes.data);

            // Chuyển đổi logs ban đầu (nếu có) thành một object để tra cứu
            const initialLogs = sessionRes.data.logs.reduce((acc, log) => {
                acc[log.user_id] = log;
                return acc;
            }, {});
            setAttendedStudentLogs(initialLogs);

        } catch (err) {
            setError('Không thể tải thông tin buổi học.');
        } finally {
            setIsLoading(false);
        }
    }, [sessionId]);

    useEffect(() => {
        fetchSessionData();
    }, [fetchSessionData]);

    const handleRecognitionSuccess = useCallback((recognizedUserLog) => {
        // Cập nhật log của sinh viên vừa được nhận diện
        setAttendedStudentLogs(prevLogs => ({
            ...prevLogs,
            [recognizedUserLog.user_id]: recognizedUserLog,
        }));
    }, []);
    
    const handleEndSession = async () => {
        if (window.confirm('Bạn có chắc muốn kết thúc buổi học này?')) {
            try {
                await apiClient.post(`/sessions/${sessionId}/end`);
                alert('Buổi học đã kết thúc.');
                // Điều hướng đến trang báo cáo (sẽ làm sau)
                navigate(`/teacher/class/${sessionDetails.class_id}/sessions`);
            } catch (err) {
                alert('Không thể kết thúc buổi học.');
            }
        }
    };

    if (isLoading) return <p>Đang tải trang điểm danh...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="attendance-page">
            <Link to={`/teacher/class/${sessionDetails?.class_id}/sessions`} className="back-link">&larr; Quay lại</Link>
            <h1>Điểm danh: {sessionDetails?.class_obj?.name}</h1>
            
            <SessionTimer endTime={sessionDetails?.end_time} onEnd={handleEndSession} />

            <div className="attendance-layout">
                <div className="camera-section">
                    <AttendanceTaker 
                        sessionId={sessionId} 
                        onRecognitionSuccess={handleRecognitionSuccess} 
                    />
                </div>
                <div className="student-list-section">
                    <StudentList 
                        students={students} 
                        attendedStudentLogs={attendedStudentLogs} 
                    />
                </div>
            </div>

            <div className="session-controls">
                <button onClick={handleEndSession} className="end-session-btn">
                    Kết thúc & Lưu Buổi học
                </button>
            </div>
        </div>
    );
}

export default AttendancePage;