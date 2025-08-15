# Face Attendace System

Hệ thống dịch vụ web điểm danh tự động bằng nhận diện khuôn mặt theo thời gian thực dành cho môi trường giáo dục.

Dự án này là thành quả của nhóm trong bài tập lớn của môn Thực hành phát triển hệ thống Trí tuệ Nhân tạo (2425H_AIT3004_60). Nhóm xin gửi lời cảm ơn chân thành đến thầy Đào Việt Anh đã tận tình hướng dẫn, đồng hành với chúng em trong suốt quá trình thực hiện dự án.

Thành viên nhóm:

Đàm Lê Minh Quân - 23020416

Nguyễn Trần Huy - 23020378

# Mô tả dự án

Dự án được xây dựng là một Hệ thống Điểm danh Thông minh bằng cách ứng dụng công nghệ nhận diện khuôn mặt. Hệ thống hướng đến việc tự động hóa hoàn toàn quy trình điểm danh, cung cấp dữ liệu chính xác và tức thì về sự hiện diện của sinh viên, từ đó giúp giáo viên giảm bớt các công việc thủ công liên quan và cung cấp cho ban quản lý một công cụ mạnh mẽ để theo dõi và phân tích dữ liệu chuyên cần.

## Hướng dẫn cài đặt và khởi chạy hệ thống

1.  **Clone repository:**
    ```bash
    git clone https://github.com/MinhQuan231205/Face-Attendace-System
    cd Face-Attendace-System
    ```

2.  **Khởi chạy hệ thống bằng Docker Compose:**
    Từ thư mục gốc của dự án (nơi chứa file `docker-compose.yml`), chạy lệnh:
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
# Liên kết Docker Hub

# Hướng dẫn chạy

clone về và khởi chạy docker, vào terminal di chuyển đến thư mục chứa docker-compose.yml

Chạy lệnh: docker-compose up --build

tài khoản admin:

admin@example.com

mật khẩu:

adminpassword


