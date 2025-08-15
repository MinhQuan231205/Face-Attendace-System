import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axios';
import UserTable from '../components/admin/UserTable';
import UserModal from '../components/admin/UserModal';
import ClassTable from '../components/admin/ClassTable';
import ClassModal from '../components/admin/ClassModal';

function AdminDashboardPage() {
    const [users, setUsers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [activeTab, setActiveTab] = useState('users');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [currentClass, setCurrentClass] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [usersResponse, classesResponse] = await Promise.all([
                apiClient.get('/users/'),
                apiClient.get('/classes/')
            ]);
            setUsers(usersResponse.data);
            setClasses(classesResponse.data);
            setError('');
        } catch (err) {
            setError('Không thể tải dữ liệu từ server.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenUserModal = (user = null) => {
        setCurrentUser(user);
        setIsUserModalOpen(true);
    };
    const handleCloseUserModal = () => {
        setIsUserModalOpen(false);
        setCurrentUser(null);
    };
    const handleSaveUser = async (userData) => {
        const dataToSend = { ...userData };
        if (!dataToSend.password) {
            delete dataToSend.password;
        }
        try {
            if (currentUser && currentUser.id) {
                await apiClient.put(`/users/${currentUser.id}`, dataToSend);
                alert(`Đã cập nhật thành công người dùng: ${currentUser.full_name}`);
            } else {
                await apiClient.post('/users/', dataToSend);
                alert(`Đã tạo thành công người dùng mới: ${dataToSend.full_name}`);
            }
            handleCloseUserModal();
            fetchData();
        } catch (err) {
            const errorMsg = err.response?.data?.detail || 'Thao tác thất bại.';
            alert(`Lỗi: ${errorMsg}`);
        }
    };
    const handleDeleteUser = async (userId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            try {
                await apiClient.delete(`/users/${userId}`);
                alert(`Đã xóa thành công người dùng có ID: ${userId}`);
                fetchData();
            } catch (err) {
                const errorMsg = err.response?.data?.detail || 'Không thể xóa người dùng.';
                alert(`Lỗi: ${errorMsg}`);
            }
        }
    };
    const handleUpdateFace = async (userId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            await apiClient.put(`/users/${userId}/face`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Cập nhật ảnh khuôn mặt thành công!');
        } catch (err) {
            alert('Cập nhật ảnh thất bại.');
        }
    };

    const handleOpenClassModal = (classData = null) => {
        setCurrentClass(classData);
        setIsClassModalOpen(true);
    };
    const handleCloseClassModal = () => {
        setIsClassModalOpen(false);
        setCurrentClass(null);
    };
    const handleSaveClass = async (classData) => {
        try {
            if (currentClass && currentClass.id) {
                await apiClient.put(`/classes/${currentClass.id}`, classData);
                alert(`Cập nhật lớp học '${classData.name}' thành công!`);
            } else {
                await apiClient.post('/classes/', classData);
                alert('Tạo lớp học mới thành công!');
            }
            handleCloseClassModal();
            fetchData(); 
        } catch (err) {
            const errorMsg = err.response?.data?.detail || 'Thao tác thất bại.';
            alert(`Lỗi: ${errorMsg}`);
            console.error('Lỗi khi lưu lớp học:', err);
        }
    };
    const handleDeleteClass = async (classId) => {
        if (window.confirm('Bạn có chắc muốn xóa lớp học này? Tất cả sinh viên sẽ được gỡ khỏi lớp.')) {
            try {
                await apiClient.delete(`/classes/${classId}`);
                alert('Xóa lớp học thành công!');
                fetchData(); 
            } catch (err) {
                const errorMsg = err.response?.data?.detail || 'Không thể xóa lớp học.';
                alert(`Lỗi: ${errorMsg}`);
                console.error('Lỗi khi xóa lớp học:', err);
            }
        }
    };

    const teachers = users?.filter(user => user.role === 'teacher') || [];

    if (isLoading) return <p style={{ padding: '20px' }}>Đang tải dữ liệu...</p>;
    if (error) return <p className="error-message" style={{ margin: '20px' }}>{error}</p>;

    return (
        <div className="admin-dashboard">
            <h1>Bảng điều khiển của Admin</h1>
            
            <div className="tab-navigation">
                <button 
                    className={`tab-button ${activeTab === 'users' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('users')}>
                    Quản lý Người dùng
                </button>
                <button 
                    className={`tab-button ${activeTab === 'classes' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('classes')}>
                    Quản lý Lớp học
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'users' && (
                    <>
                        <div className="dashboard-header">
                            <h2>Danh sách Người dùng</h2>
                            <button className="add-new-btn" onClick={() => handleOpenUserModal()}>
                                + Thêm mới
                            </button>
                        </div>
                        <UserTable 
                            users={users} 
                            onEdit={handleOpenUserModal} 
                            onDelete={handleDeleteUser}
                            onUpdateFace={handleUpdateFace}
                        />
                    </>
                )}

                {activeTab === 'classes' && (
                    <>
                        <div className="dashboard-header">
                            <h2>Danh sách Lớp học</h2>
                            <button className="add-new-btn" onClick={() => handleOpenClassModal()}>
                                + Thêm Lớp học
                            </button>
                        </div>
                        <ClassTable 
                            classes={classes} 
                            onEdit={handleOpenClassModal} 
                            onDelete={handleDeleteClass}
                        />
                    </>
                )}
            </div>

            {isUserModalOpen && (
                <UserModal
                    isOpen={isUserModalOpen}
                    onClose={handleCloseUserModal}
                    onSave={handleSaveUser}
                    user={currentUser}
                />
            )}

            {isClassModalOpen && (
                <ClassModal
                    isOpen={isClassModalOpen}
                    onClose={handleCloseClassModal}
                    onSave={handleSaveClass}
                    classData={currentClass}
                    teachers={teachers}
                />
            )}
        </div>
    );
}

export default AdminDashboardPage;