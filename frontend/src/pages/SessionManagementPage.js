import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import StartSessionModal from '../components/teacher/StartSessionModal'; 

function SessionManagementPage() {
    const { classId } = useParams();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [className, setClassName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchSessions = useCallback(async () => {
        try {
            const [sessionsRes, classRes] = await Promise.all([
                apiClient.get(`/classes/${classId}/sessions/`),
                apiClient.get(`/classes/${classId}`)
            ]);
            setSessions(sessionsRes.data);
            setClassName(classRes.data.name);
        } catch (err) {
            console.error("Lỗi tải dữ liệu session:", err);
        } finally {
            setIsLoading(false);
        }
    }, [classId]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    const ongoingSession = sessions.find(s => s.status === 'ongoing');

    const handleStartSession = async (duration_minutes) => {
        try {
            const response = await apiClient.post(`/classes/${classId}/sessions/start`, {
                duration_minutes
            });
            const newSession = response.data;
            setIsModalOpen(false);
            navigate(`/teacher/session/${newSession.id}/attendance`);
        } catch (err) {
            alert('Không thể bắt đầu buổi học. Vui lòng thử lại.');
            console.error(err);
        }
    };

    if (isLoading) return <p>Đang tải...</p>;

    return (
        <div className="session-management-page">
            <Link to="/teacher/dashboard" className="back-link">&larr; Quay lại Dashboard</Link>
            <div className="page-header">
                <h1>Quản lý Buổi học: {className}</h1>
                {ongoingSession ? (
                    <Link 
                        to={`/teacher/session/${ongoingSession.id}/attendance`} 
                        className="start-session-btn resume-btn"
                    >
                        Tiếp tục Điểm danh (Buổi {ongoingSession.id})
                    </Link>
                ) : (
                    <button onClick={() => setIsModalOpen(true)} className="start-session-btn">
                        Bắt đầu Buổi học mới
                    </button>
                )}
            </div>

            <div className="table-container">
                <h3>Lịch sử các buổi đã diễn ra</h3>
                <table>
                    <thead>
                        <tr>
                            <th>ID Buổi học</th>
                            <th>Thời gian bắt đầu</th>
                            <th>Thời gian kết thúc</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.length > 0 ? sessions.map(session => {
                            let displayStatus = session.status;
                            let statusClassName = session.status;
                            const endTime = new Date(session.end_time);

                            if (session.status === 'ongoing' && new Date() > endTime) {
                                displayStatus = 'expired'; 
                                statusClassName = 'expired'; 
                            }

                            return (
                                <tr key={session.id}>
                                    <td>{session.id}</td>
                                    <td>{new Date(session.start_time).toLocaleString('vi-VN')}</td>
                                    <td>{endTime.toLocaleString('vi-VN')}</td>
                                    <td>
                                        <span className={`status-badge ${statusClassName}`}>
                                            {displayStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <Link to={`/teacher/session/${session.id}/report`} className="action-link view-btn">
                                            Xem Báo cáo
                                        </Link>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center' }}>Chưa có buổi học nào.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <StartSessionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onStart={handleStartSession}
            />
        </div>
    );
}

export default SessionManagementPage;