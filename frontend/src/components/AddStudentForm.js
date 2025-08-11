import React, { useState } from 'react';
import axios from 'axios';

function AddStudentForm() {
    // State để lưu trữ dữ liệu từ form
    const [fullName, setFullName] = useState('');
    const [studentCode, setStudentCode] = useState('');
    const [imageFile, setImageFile] = useState(null);

    // State để quản lý thông báo và trạng thái loading
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Hàm xử lý khi submit form
    const handleSubmit = async (event) => {
        event.preventDefault(); // Ngăn trang reload khi submit
        
        // Kiểm tra dữ liệu đầu vào
        if (!fullName || !studentCode || !imageFile) {
            setMessage('Vui lòng điền đầy đủ thông tin và chọn ảnh.');
            return;
        }

        setIsLoading(true);
        setMessage('');

        // Tạo đối tượng FormData để gửi file và text
        const formData = new FormData();
        formData.append('full_name', fullName);
        formData.append('student_code', studentCode);
        formData.append('file', imageFile);

        try {
            // Gọi API bằng axios, URL sẽ được proxy tự động nối với http://localhost:8001
            const response = await axios.post('/students/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Xử lý khi thành công
            setMessage(`Thêm sinh viên ${response.data.full_name} thành công!`);
            // Reset form
            setFullName('');
            setStudentCode('');
            setImageFile(null);
            document.getElementById('image-input').value = null; // Reset input file

        } catch (error) {
            // Xử lý khi có lỗi
            if (error.response && error.response.data && error.response.data.detail) {
                setMessage(`Lỗi: ${error.response.data.detail}`);
            } else {
                setMessage('Đã có lỗi xảy ra. Vui lòng thử lại.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>Thêm Sinh Viên Mới</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="fullName">Họ và tên:</label>
                    <input
                        type="text"
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="studentCode">Mã sinh viên:</label>
                    <input
                        type="text"
                        id="studentCode"
                        value={studentCode}
                        onChange={(e) => setStudentCode(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="image">Ảnh chân dung:</label>
                    <input
                        type="file"
                        id="image-input"
                        accept="image/jpeg, image/png"
                        onChange={(e) => setImageFile(e.target.files[0])}
                        required
                    />
                </div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Đang xử lý...' : 'Thêm Sinh Viên'}
                </button>
            </form>
            {message && <p className="message">{message}</p>}
        </div>
    );
}

export default AddStudentForm;