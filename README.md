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
- **Backend:** [Xem trên Docker Hub](https://hub.docker.com/repository/docker/minhquan2312/face-attendance-system-backend/general)
- **Frontend:** [Xem trên Docker Hub](https://hub.docker.com/repository/docker/minhquan2312/face-attendance-system-frontend/general)

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
    - **Bước 1 (Admin):** Đăng nhập bằng tài khoản Admin.
    - **Bước 2 (Admin):** Vào "Quản lý Người dùng" để tạo các tài khoản cho **Giáo viên** và **Sinh viên**.
    - **Bước 3 (Admin):** Vào "Quản lý Lớp học", tạo một lớp học mới và gán một giáo viên phụ trách.
    - **Bước 4 (Admin):** Vào trang "Chi tiết Lớp học" để thêm các sinh viên vào lớp.
    - **Bước 5 (Admin):** Quay lại "Quản lý Người dùng" và **cập nhật ảnh khuôn mặt** cho từng sinh viên.
    - **Bước 6 (Teacher):** Đăng xuất và đăng nhập bằng tài khoản Giáo viên.
    - **Bước 7 (Teacher):** Trên Teacher Dashboard, chọn lớp học và vào "Quản lý Buổi học".
    - **Bước 8 (Teacher):** Bắt đầu một buổi học mới, sau đó vào trang điểm danh và bật camera.
    - **Bước 9 (Teacher):** Hệ thống sẽ tự động điểm danh cho các sinh viên có mặt trong lớp.



