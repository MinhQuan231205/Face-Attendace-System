import React from 'react';

function MyAttendanceHistory({ logs }) {
    const getStatusInfo = (status) => {
        switch (status) {
            case 'present':
                return { text: 'Có mặt', className: 'present' };
            case 'absent':
                return { text: 'Vắng mặt', className: 'absent' };
            default:
                return { text: 'Không rõ', className: 'absent' };
        }
    };
    const formatTime = (dateString) => new Date(dateString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');
    return (
        <div className="panel-card">
            <h2>Lịch sử điểm danh</h2>
            <div className="panel-content">
                {logs.length > 0 ? (
                    <ul className="history-list-detailed">
                        {logs.map(log => {
                            const statusInfo = getStatusInfo(log.status);
                            return (
                            <li key={log.id} className={statusInfo.className}>
                                <div className="log-main-info">
                                    <span className={`status-badge ${statusInfo.className}`}>
                                        {statusInfo.text}
                                    </span>
                                    <span className="log-class-name">
                                        {log.session?.class_obj?.name || 'Không rõ lớp'}
                                    </span>
                                </div>
                                <div className="log-sub-info">
                                    <span>
                                        Buổi {formatDate(log.session?.start_time)} 
                                        ({formatTime(log.session?.start_time)} - {formatTime(log.session?.end_time)})
                                    </span>
                                    {log.status !== 'absent' && 
                                        <span>Check-in lúc: {formatTime(log.timestamp)}</span>
                                    }
                                </div>
                            </li>
                        )})}
                    </ul>
                ) : (
                    <p>Bạn chưa có lịch sử điểm danh.</p>
                )}
            </div>
        </div>
    );
}
export default MyAttendanceHistory;