# Face Attendace System

Hệ thống dịch vụ web điểm danh tự động bằng nhận diện khuôn mặt theo thời gian thực dành cho môi trường giáo dục.

Dự án này là thành quả của nhóm trong bài tập lớn của môn Thực hành phát triển hệ thống Trí tuệ Nhân tạo (2425H_AIT3004_60). Nhóm xin gửi lời cảm ơn chân thành đến thầy Đào Việt Anh đã tận tình hướng dẫn, đồng hành với chúng em trong suốt quá trình thực hiện dự án.

Thành viên nhóm:

Đàm Lê Minh Quân - 23020416

Nguyễn Trần Huy - 23020378

## Mô tả dự án

Dự án được xây dựng là một Hệ thống Điểm danh Thông minh bằng cách ứng dụng công nghệ nhận diện khuôn mặt. Hệ thống hướng đến việc tự động hóa hoàn toàn quy trình điểm danh, cung cấp dữ liệu chính xác và tức thì về sự hiện diện của sinh viên, từ đó giúp giáo viên giảm bớt các công việc thủ công liên quan và cung cấp cho ban quản lý một công cụ mạnh mẽ để theo dõi và phân tích dữ liệu chuyên cần.

## Yêu cầu
[Docker](https://www.docker.com/get-started) và [Docker Compose](https://docs.docker.com/compose/install/) đã được cài đặt.

## Hướng dẫn khởi chạy hệ thống với Clone repository

1.  **Clone repository:**
    ```bash
    git clone https://github.com/MinhQuan231205/Face-Attendace-System
    cd Face-Attendace-System
    ```

2.  **Khởi chạy hệ thống bằng Docker Compose:**
    ```bash
    docker-compose up --build
    ```

3.  **Truy cập ứng dụng:**
    - Mở trình duyệt và truy cập `http://localhost`.

4.  **Dừng hệ thống:**
    - Để dừng các container, nhấn `Ctrl + C` trong cửa sổ terminal đang chạy.
    - Để dừng và xóa các container, network (giữ lại data):
      ```bash
      docker-compose down
      ```
    - Để dừng và xóa mọi thứ, bao gồm cả dữ liệu trong database:
      ```bash
      docker-compose down -v
      ```

## Hướng dẫn Khởi chạy hệ thống với Docker Hub

**Liên kết đến các image:** 
- **Backend:** [Xem trên Docker Hub](https://hub.docker.com/r/minhquan2312/face-attendance-system-frontend)
- **Frontend:** [Xem trên Docker Hub](https://hub.docker.com/r/minhquan2312/face-attendance-system-backend)

1.  **Tải về file `docker-compose.yml`:**
    - Tải về file [docker-compose.yml](./dockerhub/docker-compose.yml) này.

3.  **Khởi chạy hệ thống:**
    - Mở terminal trong thư mục chứa file `docker-compose.yml`.
    - Chạy lệnh sau:
      ```bash
      docker-compose up -d
      ```

4.  **Truy cập ứng dụng:**
    - Mở trình duyệt và truy cập: `http://localhost`

5.  **Dừng hệ thống:**
    ```bash
    docker-compose down -v
    ```

## Hướng dẫn Sử dụng

1.  **Tài khoản Admin mặc định:**
    - Khi hệ thống được khởi chạy với một database trống, một tài khoản Admin mặc định sẽ được tạo.
    - **Email:** `admin@example.com`
    - **Mật khẩu:** `adminpassword`

2.  **Luồng làm việc cơ bản:**
    - Admin: Đăng nhập → Quản lý Người dùng → Tạo tài khoản Giáo viên & Sinh viên.
    - Admin: Quản lý Lớp học → Tạo lớp mới → Gán giáo viên.
    - Admin: Vào Chi tiết Lớp → Thêm sinh viên.
    - Admin: Cập nhật ảnh khuôn mặt cho từng sinh viên.
    - Teacher: Đăng nhập → Chọn lớp → Quản lý Buổi học.
    - Teacher: Tạo buổi học mới → Mở trang điểm danh → Bật camera.
    - Hệ thống: Tự động nhận diện & điểm danh sinh viên có mặt.

## Cấu trúc dự án

```
face-recognition-attendance/
├── backend/
│   ├── app/               # Logic chính của FastAPI
│   │   ├── __init__.py
│   │   ├── crud.py         # CRUD với DB
│   │   ├── database.py     # Kết nối SQLAlchemy
│   │   ├── main.py         # API endpoints
│   │   ├── models.py       # Models DB
│   │   ├── schemas.py      # Pydantic schemas
│   │   └── security.py     # Xác thực & phân quyền
│   ├── Dockerfile          # Build image backend
│   └── requirements.txt    # Thư viện Python
│
├── frontend/
│   ├── public/             # index.html & file tĩnh
│   ├── src/                # Mã nguồn React
│   │   ├── api/            # Axios config
│   │   ├── components/     # Component tái sử dụng
│   │   ├── context/        # AuthContext
│   │   ├── pages/          # Các trang
│   │   ├── App.js          # Routing
│   │   └── index.js        # Entry point React
│   ├── Dockerfile          # Build image frontend
│   ├── nginx.conf          # Config Nginx
│   └── package.json        # Script & dependencies JS
│
├── .gitignore              # Bỏ qua file/thư mục trong Git
├── docker-compose.yml      # Chạy toàn bộ hệ thống
└── README.md               # Hướng dẫn dự án
```
