from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# URL kết nối tới PostgreSQL.
# Cấu trúc: "postgresql://<user>:<password>@<host>:<port>/<dbname>"
# VÌ CHÚNG TA SẼ DÙNG DOCKER, host sẽ là tên service của database (ví dụ: 'db').
# Hiện tại, để phát triển trên máy local, bạn có thể dùng 'localhost'.
# LƯU Ý: Hãy thay đổi username, password, dbname cho phù hợp với cấu hình PostgreSQL của bạn.
# Nếu bạn chưa cài PostgreSQL trên máy, cứ để tạm như vậy, chúng ta sẽ dùng Docker sau.
SQLALCHEMY_DATABASE_URL = "postgresql://user:password@db/face_attendance_db"

# Tạo "engine" - điểm vào chính của SQLAlchemy tới database.
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Mỗi instance của SessionLocal sẽ là một session database mới.
# Session là "khu vực làm việc" cho tất cả các truy vấn.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class để các model của chúng ta kế thừa.
Base = declarative_base()