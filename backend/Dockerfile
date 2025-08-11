# Sử dụng một image Python 3.9 gọn nhẹ làm nền tảng
FROM python:3.9-slim

# Đặt thư mục làm việc bên trong container là /app
WORKDIR /app

# CẬP NHẬT QUAN TRỌNG: Cài đặt các dependencies của hệ điều hành Linux
# Đây là bước mà môi trường Windows của bạn thiếu, gây ra lỗi
RUN apt-get update && apt-get install -y cmake libsm6 libxext6 build-essential

# Copy file requirements vào trước để tận dụng cache của Docker
COPY ./requirements.txt .

# Cài đặt các thư viện Python
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ code trong thư mục 'app' của bạn vào thư mục làm việc /app trong container
COPY ./app /app

# Lệnh để chạy ứng dụng khi container khởi động
# Chạy trên host 0.0.0.0 để có thể truy cập từ bên ngoài container
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]