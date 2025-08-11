import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/axios';

function SessionReportPage() {
    const { sessionId } = useParams();
    const [sessionDetails, setSessionDetails] = useState(null);
    const [classStudents, setClassStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchReportData = useCallback(async () => {
        try {
            const sessionRes = await apiClient.get(`/sessions/${sessionId}`);
            setSessionDetails(sessionRes.data);

            const studentsRes = await apiClient.get(`/classes/${sessionRes.data.class_id}/students/`);
            setClassStudents(studentsRes.data);

        } catch (err) {
            setError('Không thể tải báo cáo buổi học.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [sessionId]);

    useEffect(() => {
        fetchReportData();
    }, [fetchReportData]);

    const handleUpdateStatus = async (studentId, currentStatus) => {
        const validStatuses = ['present', 'absent'];
        const newStatus = prompt(
            `Nhập trạng thái mới (present, absent):`,
            currentStatus || 'absent'
        );

        if (newStatus && validStatuses.includes(newStatus.toLowerCase())) {
            try {
                await apiClient.put(`/sessions/${sessionId}/users/${studentId}/status`, { status: newStatus.toLowerCase() });
                fetchReportData();
                alert("Cập nhật thành công!");
            } catch (err) {
                alert("Cập nhật thất bại. Vui lòng thử lại.");
                console.error("Lỗi khi cập nhật trạng thái:", err);
            }
        } else if (newStatus !== null) {
            alert("Trạng thái không hợp lệ. Vui lòng chỉ nhập 'present' hoặc 'absent'.");
        }
    };

    // --- Logic phân loại đã được đơn giản hóa ---
    const presentStudentsLogs = [];
    const absentStudents = [];
    const manuallyMarkedAbsentLogs = [];

    if (sessionDetails && classStudents.length > 0) {
        const studentLogsMap = new Map(sessionDetails.logs.map(log => [log.user_id, log]));

        classStudents.forEach(student => {
            const log = studentLogsMap.get(student.id);
            if (log) {
                // Gộp cả 'late' (nếu còn tồn tại trong DB cũ) vào 'present'
                if (log.status === 'present' || log.status === 'late') {
                    presentStudentsLogs.push(log);
                } else if (log.status === 'absent') {
                    manuallyMarkedAbsentLogs.push(log);
                }
            } else {
                absentStudents.push(student);
            }
        });
    }

    if (isLoading) return <p>Đang tải báo cáo...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!sessionDetails) return <p>Không tìm thấy buổi học.</p>;

    return (
        <div className="report-page">
            <Link to={`/teacher/class/${sessionDetails.class_id}/sessions`} className="back-link">&larr; Quay lại Quản lý Buổi học</Link>
            <h1>Báo cáo Buổi học: {sessionDetails.class_obj?.name}</h1>
            <div className="report-summary">
                <p>
                    <strong>Thời gian:</strong> 
                    {new Date(sessionDetails.start_time).toLocaleTimeString('vi-VN')}
                    {' - '}
                    {new Date(sessionDetails.end_time).toLocaleTimeString('vi-VN')}
                    {' ngày '}
                    {new Date(sessionDetails.start_time).toLocaleDateString('vi-VN')}
                </p>
                <p><strong>Trạng thái:</strong> {sessionDetails.status}</p>
                <p>
                    <strong>Tổng kết:</strong> 
                    <span className="summary-chip present">{presentStudentsLogs.length} có mặt</span>
                    <span className="summary-chip absent">{absentStudents.length + manuallyMarkedAbsentLogs.length} vắng</span>
                </p>
            </div>
            
            <div className="report-details">
                {/* Danh sách có mặt */}
                <div className="report-section">
                    <h3>Có mặt ({presentStudentsLogs.length})</h3>
                    <ul>
                        {presentStudentsLogs.map(log => (
                            <li key={log.id}>
                                <span>{log.user.full_name} ({log.user.student_code}) - lúc {new Date(log.timestamp).toLocaleTimeString('vi-VN')}</span>
                                <button className="report-edit-btn" onClick={() => handleUpdateStatus(log.user.id, log.status)}>Sửa</button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Danh sách vắng mặt */}
                <div className="report-section">
                    <h3>Vắng mặt ({absentStudents.length + manuallyMarkedAbsentLogs.length})</h3>
                    <ul>
                        {manuallyMarkedAbsentLogs.map(log => (
                            <li key={`log-${log.id}`}>
                                <span>{log.user.full_name} ({log.user.student_code})</span>
                                <button 
                                    className="report-edit-btn" 
                                    onClick={() => handleUpdateStatus(log.user.id, log.status)}
                                >
                                    Sửa
                                </button>
                            </li>
                        ))}
                        {absentStudents.map(student => (
                            <li key={`student-${student.id}`}>
                                <span>{student.full_name} ({student.student_code})</span>
                                <button 
                                    className="report-edit-btn" 
                                    onClick={() => handleUpdateStatus(student.id, 'absent')}
                                >
                                    Sửa
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default SessionReportPage;