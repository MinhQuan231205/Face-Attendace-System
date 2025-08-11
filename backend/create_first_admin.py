# backend/create_first_admin.py
import requests
import json

# Thông tin tài khoản admin bạn muốn tạo
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "adminpassword"
ADMIN_FULL_NAME = "Admin User"

# URL của API (chúng ta sẽ tạo sau)
# Tạm thời, chúng ta sẽ chạy script này sau khi API /users/ đã được tạo và bảo vệ
# Đây là một cách tiếp cận đơn giản hơn: sửa trực tiếp DB hoặc tạo API riêng

# --> CÁCH TIẾP CẬN ĐƠN GIẢN HƠN VÀ NGAY LẬP TỨC:
# Chúng ta sẽ thêm logic tạo admin vào file main.py khi khởi động
# Mở file backend/app/main.py và thêm đoạn sau: