import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/axios';

function ClassHistoryPage() {
    const { classId } = useParams();
    const [logs, setLogs] = useState([]);
    const [students, setStudents] = useState({}); // Dùng object để tra cứu nhanh
    const [className, setClassName] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Chỉ định nghĩa hàm fetchData một lần bằng useCallback
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [logsRes, classRes, studentsRes] = await Promise.all([
                apiClient.get(`/classes/${classId}/attendance-logs/`),
                apiClient.get(`/classes/${classId}`),
                apiClient.get(`/classes/${classId}/students/`)
            ]);
            
            setLogs(logsRes.data);
            setClassName(classRes.data.name);

            const studentMap = studentsRes.data.reduce((acc, student) => {
                acc[student.id] = student;
                return acc;
            }, {});
            setStudents(studentMap);

        } catch (err) {
            console.error("Lỗi tải lịch sử:", err);
        } finally {
            setIsLoading(false);
        }
    }, [classId]);
    
    // useEffect gọi hàm fetchData
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUpdateStatus = async (logId, currentStatus) => {
        const newStatus = prompt("Nhập trạng thái mới (vd: present, late, absent):", currentStatus);

        if (newStatus && newStatus !== currentStatus) {
            try {
                await apiClient.put(`/attendance-logs/${logId}`, { status: newStatus });
                
                setLogs(prevLogs => 
                    prevLogs.map(log => 
                        log.id === logId ? { ...log, status: newStatus } : log
                    )
                );
                alert("Cập nhật trạng thái thành công!");
            } catch (err) {
                alert("Cập nhật thất bại. Vui lòng thử lại.");
                console.error("Lỗi khi cập nhật log:", err);
            }
        }
    };

    if (isLoading) return <p>Đang tải lịch sử điểm danh...</p>;

    return (
        <div className="class-history-page">
            <Link to="/teacher/dashboard" className="back-link">&larr; Quay lại Dashboard</Link>
            <h1>Lịch sử điểm danh: {className}</h1>
            
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Họ và tên</th>
                            <th>Mã Sinh viên</th>
                            <th>Thời gian điểm danh</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length > 0 ? logs.map(log => {
                            // Lấy thông tin sinh viên từ map
                            const student = students[log.user_id];
                            return (
                                <tr key={log.id}>
                                    <td>{student?.full_name || 'Không rõ'}</td>
                                    <td>{student?.student_code || 'N/A'}</td>
                                    <td>{new Date(log.timestamp).toLocaleString('vi-VN')}</td>
                                    <td>{log.status}</td>
                                    <td>
                                        {/* === PHẦN SỬA LỖI QUAN TRỌNG === */}
                                        {/* Kết nối sự kiện onClick với hàm handleUpdateStatus */}
                                        <button 
                                            className="edit-btn" 
                                            onClick={() => handleUpdateStatus(log.id, log.status)}
                                        >
                                            Sửa
                                        </button>
                                    </td>
                                </tr>
                            )
                        }) : (
                            <tr>
                                <td colSpan="5" style={{textAlign: 'center'}}>Chưa có lịch sử điểm danh cho lớp này.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ClassHistoryPage;