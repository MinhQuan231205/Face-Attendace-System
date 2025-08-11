import axios from 'axios';

const apiClient = axios.create({
    baseURL: '/api', 
});

// =======================================================
// KHÔI PHỤC REQUEST INTERCEPTOR
// =======================================================
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// Response interceptor để xử lý lỗi 401 vẫn giữ nguyên
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Chỉ xóa token và reload nếu request không phải là từ trang login
            // để tránh vòng lặp vô hạn khi gõ sai mật khẩu
            if (window.location.pathname !== '/login') {
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;