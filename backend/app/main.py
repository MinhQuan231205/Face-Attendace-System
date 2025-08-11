import io
import base64
from datetime import date, timedelta
from typing import List, Optional
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import các module của project
from . import crud, models, schemas, security
from .database import SessionLocal, engine

# Tạo các bảng trong DB nếu chúng chưa tồn tại
models.Base.metadata.create_all(bind=engine)

# # --- Logic để tạo Admin đầu tiên khi khởi động ---
# def create_first_admin():
#     db = SessionLocal()
#     if not db.query(models.User).first():
#         print("Không tìm thấy user nào, đang tạo tài khoản admin mặc định...")
#         admin_user = schemas.UserCreate(
#             email="admin@example.com",
#             password="adminpassword",
#             full_name="Default Admin",
#             role="admin"
#         )
#         crud.create_user(db=db, user=admin_user)
#         print(f"Tài khoản admin đã được tạo: Email='{admin_user.email}', Password='{admin_user.password}'")
#     db.close()

# create_first_admin()

# # Khởi tạo ứng dụng FastAPI
# app = FastAPI(
#     title="Face Recognition Attendance API",
#     description="API cho hệ thống điểm danh bằng nhận diện khuôn mặt.",
#     version="2.0.0", # Nâng cấp phiên bản
# )
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Code được chạy khi ứng dụng khởi động
    print("Application startup: Creating database tables and first admin...")
    # Tạo bảng (an toàn hơn khi đặt ở đây)
    models.Base.metadata.create_all(bind=engine)
    
    # Logic tạo Admin đầu tiên
    db = SessionLocal()
    try:
        first_user = db.query(models.User).first()
        if not first_user:
            print("No users found, creating default admin account...")
            admin_user = schemas.UserCreate(
                email="admin@example.com",
                password="adminpassword",
                full_name="Default Admin",
                role="admin"
            )
            crud.create_user(db=db, user=admin_user)
            print(f"Admin account created: {admin_user.email} / {admin_user.password}")
    finally:
        db.close()
    
    yield
    # Code được chạy khi ứng dụng tắt (nếu có)
    print("Application shutdown.")


# Khởi tạo FastAPI với lifespan event
app = FastAPI(lifespan=lifespan)


origins = [
    "http://localhost",
    "http://localhost:3000", # Cổng mặc định của React dev server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True, # Cho phép gửi cookie/credentials
    allow_methods=["*"],    # Cho phép tất cả các phương thức (GET, POST, etc.)
    allow_headers=["*"],    # Cho phép tất cả các header
)

# Dependency để lấy database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# === API XÁC THỰC ===
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token")

@app.post("/token", response_model=schemas.Token, tags=["Authentication"])
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    """Đăng nhập để nhận JWT access token."""
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email, "role": user.role}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# === API CHUNG CHO USER ĐÃ ĐĂNG NHẬP ===

@app.get("/users/me/", response_model=schemas.User, tags=["Users"])
def read_current_user(current_user: models.User = Depends(security.get_current_active_user)):
    """Lấy thông tin của user hiện tại đang đăng nhập."""
    return current_user

@app.get("/users/me/attendance-logs/", response_model=List[schemas.AttendanceLog], tags=["Attendance"])
def read_my_logs(
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lấy lịch sử điểm danh của user hiện tại."""
    return crud.get_user_attendance_logs(db, user_id=current_user.id)

# === API CHO STUDENT ===

@app.post("/sessions/{session_id}/recognize/", response_model=schemas.AttendanceLog)
def recognize_for_session(
    session_id: int,
    payload: schemas.ImagePayload,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_active_user)
):
    """
    Thực hiện nhận diện và điểm danh cho một buổi học đang diễn ra.
    """
    db_session = crud.get_session_by_id(db, session_id=session_id)
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Kiểm tra quyền: Admin hoặc giáo viên của lớp đó
    if current_user.role == 'student':
        raise HTTPException(status_code=403, detail="Students are not allowed to perform this action")
    if current_user.role == 'teacher' and db_session.class_obj.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized for this session")

    try:
        header, encoded = payload.image_base64.split(",", 1)
        image_data_bytes = base64.b64decode(encoded)
        image_data_io = io.BytesIO(image_data_bytes)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 string")
    
    new_log, message = crud.recognize_and_create_log_for_session(
        db=db, session_id=session_id, image_data=image_data_io
    )

    if not new_log:
        raise HTTPException(status_code=404, detail=message)
    
    return new_log

# === API CHO ADMIN ===

@app.post("/users/", response_model=schemas.User, status_code=status.HTTP_201_CREATED, tags=["Admin"])
def create_new_user(
    user: schemas.UserCreate, 
    admin_user: models.User = Depends(security.require_admin), # BẢO VỆ
    db: Session = Depends(get_db)
):
    """[Admin] Tạo một user mới."""
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    if user.role == 'student' and not user.student_code:
        raise HTTPException(
            status_code=422, # 422 Unprocessable Entity là mã lỗi chuẩn cho validation
            detail="Student code is required for the 'student' role."
        )
    return crud.create_user(db=db, user=user)

@app.get("/users/", response_model=List[schemas.User], tags=["Admin"])
def read_all_users(
    skip: int = 0, limit: int = 100, 
    admin_user: models.User = Depends(security.require_admin), # BẢO VỆ
    db: Session = Depends(get_db)
):
    """[Admin] Lấy danh sách tất cả user."""
    return crud.get_users(db, skip=skip, limit=limit)

@app.put("/users/{user_id}", response_model=schemas.User)
def update_user_by_admin(
    user_id: int,
    user_update: schemas.UserUpdate, # Dùng lại schema tạo user để nhận dữ liệu
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(security.require_admin) # BẢO VỆ
):
    """Cập nhật thông tin của một user (chỉ admin)."""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Kiểm tra xem email mới có bị trùng với người khác không
    if user_update.email != db_user.email:
        existing_user_with_email = crud.get_user_by_email(db, email=user_update.email)
        if existing_user_with_email:
            raise HTTPException(status_code=400, detail="Email already registered by another user.")
    
    final_role = user_update.role if user_update.role is not None else db_user.role
    final_student_code = user_update.student_code if user_update.student_code is not None else db_user.student_code

    if final_role == 'student' and not final_student_code:
        raise HTTPException(
            status_code=422,
            detail="Student code cannot be empty for the 'student' role."
        )

    updated_user = crud.update_user(db=db, user_id=user_id, user_update=user_update)
    return updated_user

@app.put("/users/{user_id}/face", response_model=schemas.User, tags=["Admin"])
def update_user_face_endpoint(
    user_id: int,
    file: UploadFile = File(...),
    admin_user: models.User = Depends(security.require_admin), # BẢO VỆ
    db: Session = Depends(get_db)
):
    """[Admin] Cập nhật ảnh khuôn mặt cho một user."""
    image_data = io.BytesIO(file.file.read())
    updated_user, message = crud.update_user_face(db, user_id=user_id, image_data=image_data)
    if not updated_user:
        raise HTTPException(status_code=400, detail=message)
    return updated_user

@app.get("/attendance/logs/", response_model=List[schemas.AttendanceLog], tags=["Admin"])
def read_all_logs(
    admin_user: models.User = Depends(security.require_admin), # BẢO VỆ
    db: Session = Depends(get_db)
):
    """[Admin] Lấy tất cả lịch sử điểm danh."""
    return crud.get_all_attendance_logs(db)

@app.delete("/users/{user_id}", response_model=schemas.User)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(security.require_admin) # BẢO VỆ
):
    """Xóa một user (chỉ admin)."""
    # Ngăn admin tự xóa chính mình
    if user_id == admin_user.id:
        raise HTTPException(status_code=400, detail="Admins cannot delete themselves.")

    deleted_user = crud.delete_user_by_id(db, user_id=user_id)
    if deleted_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    return deleted_user

# ==============================================================================
# API cho Quản lý Lớp học (Admin)
# ==============================================================================

@app.post("/classes/", response_model=schemas.Class, status_code=status.HTTP_201_CREATED)
def create_new_class(
    class_in: schemas.ClassCreate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(security.require_admin)
):
    """Tạo một lớp học mới (chỉ admin)."""
    created_class = crud.create_class(db=db, class_in=class_in)
    if not created_class:
        raise HTTPException(status_code=400, detail="Invalid teacher ID or teacher is not a 'teacher'.")
    return created_class

@app.get("/classes/", response_model=List[schemas.Class])
def read_all_classes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(security.require_admin)
):
    """Lấy danh sách tất cả các lớp học (chỉ admin)."""
    classes = crud.get_classes(db, skip=skip, limit=limit)
    return classes

@app.get("/classes/{class_id}", response_model=schemas.Class)
def read_class_details(
    class_id: int,
    db: Session = Depends(get_db),
    # Thay đổi dependency để chấp nhận bất kỳ user nào đã đăng nhập
    current_user: models.User = Depends(security.get_current_active_user)
):
    """
    Lấy thông tin chi tiết của một lớp học.
    Admin có thể xem bất kỳ lớp nào.
    Teacher chỉ có thể xem lớp họ phụ trách.
    """
    db_class = crud.get_class_by_id(db, class_id=class_id)
    if db_class is None:
        raise HTTPException(status_code=404, detail="Class not found")

    # Logic phân quyền thủ công
    if current_user.role == 'teacher' and db_class.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this class")
    
    # Admin và giáo viên của lớp sẽ đi qua được đây
    return db_class

@app.put("/classes/{class_id}", response_model=schemas.Class)
def update_a_class(
    class_id: int,
    class_in: schemas.ClassCreate, # Tái sử dụng schema tạo lớp
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(security.require_admin)
):
    """Cập nhật thông tin một lớp học (chỉ admin)."""
    updated_class, message = crud.update_class(db, class_id=class_id, class_update=class_in)
    if not updated_class:
        raise HTTPException(status_code=404, detail=message)
    return updated_class

@app.delete("/classes/{class_id}", response_model=schemas.Class)
def delete_a_class(
    class_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(security.require_admin)
):
    """Xóa một lớp học (chỉ admin)."""
    deleted_class = crud.delete_class_by_id(db, class_id=class_id)
    if deleted_class is None:
        raise HTTPException(status_code=404, detail="Class not found")
    return deleted_class

@app.post("/classes/{class_id}/students/{user_id}", response_model=schemas.Class)
def add_student_to_a_class(
    class_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(security.require_admin)
):
    """Thêm một sinh viên vào một lớp học (chỉ admin)."""
    updated_class = crud.add_student_to_class(db, class_id=class_id, user_id=user_id)
    if updated_class is None:
        raise HTTPException(status_code=404, detail="Class or Student not found, or student is already in the class.")
    return updated_class
    
@app.delete("/classes/{class_id}/students/{user_id}", response_model=schemas.Class)
def remove_student_from_a_class(
    class_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(security.require_admin)
):
    """Xóa một sinh viên khỏi một lớp học (chỉ admin)."""
    updated_class = crud.remove_student_from_class(db, class_id=class_id, user_id=user_id)
    if updated_class is None:
        raise HTTPException(status_code=404, detail="Class or Student not found, or student is not in the class.")
    return updated_class

# ==============================================================================
# API cho Giáo viên (Teacher)
# ==============================================================================

@app.get("/teachers/me/classes/", response_model=List[schemas.Class])
def read_my_taught_classes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.require_teacher)
):
    """Lấy danh sách các lớp học mà giáo viên đang đăng nhập phụ trách."""
    return crud.get_classes_by_teacher(db, teacher_id=current_user.id)

@app.get("/classes/{class_id}/students/", response_model=List[schemas.User])
def read_students_in_a_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.require_teacher)
):
    """Lấy danh sách sinh viên trong một lớp học cụ thể mà giáo viên dạy."""
    db_class = crud.get_class_by_id(db, class_id=class_id)
    if not db_class or db_class.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this class")
    return db_class.students

@app.get("/classes/{class_id}/attendance-logs/", response_model=List[schemas.AttendanceLog])
def read_class_attendance_logs(
    class_id: int,
    start_date: Optional[date] = None, # Nhận tham số query ?start_date=YYYY-MM-DD
    end_date: Optional[date] = None,   # Nhận tham số query ?end_date=YYYY-MM-DD
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.require_teacher)
):
    """
    Lấy lịch sử điểm danh của một lớp. 
    Chỉ giáo viên phụ trách lớp mới có thể truy cập.
    """
    db_class = crud.get_class_by_id(db, class_id=class_id)
    # Kiểm tra quyền: phải là giáo viên của lớp này
    if not db_class or db_class.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this class's logs")
    
    logs = crud.get_attendance_logs_for_class(db, class_id=class_id, start_date=start_date, end_date=end_date)
    return logs

class AttendanceStatusUpdate(BaseModel):
    status: str

@app.put("/attendance-logs/{log_id}", response_model=schemas.AttendanceLog)
def update_attendance_log(
    log_id: int,
    update_data: AttendanceStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.require_teacher)
):
    """Cập nhật trạng thái của một bản ghi điểm danh."""
    db_log = crud.get_attendance_log_by_id(db, log_id=log_id)
    
    # Kiểm tra 1: Log có tồn tại không?
    if not db_log:
        raise HTTPException(status_code=404, detail="Attendance log not found")
    
    # Kiểm tra 2: Giáo viên có quyền sửa log này không?
    # Lấy lớp học của sinh viên được điểm danh
    student_in_log = db_log.user
    teacher_classes = current_user.taught_classes
    
    # Kiểm tra xem sinh viên đó có thuộc bất kỳ lớp nào mà giáo viên này dạy không
    is_authorized = any(student_in_log in cls.students for cls in teacher_classes)
    
    if not is_authorized:
        raise HTTPException(status_code=403, detail="Not authorized to modify this attendance log")
        
    updated_log = crud.update_attendance_log_status(db, log_id=log_id, new_status=update_data.status)
    return updated_log

# ==============================================================================
# API cho Quản lý Buổi học (Teacher)
# ==============================================================================

@app.post("/classes/{class_id}/sessions/start", response_model=schemas.AttendanceSession)
def start_new_session(
    class_id: int,
    session_data: schemas.AttendanceSessionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.require_teacher)
):
    """Bắt đầu một buổi điểm danh mới cho một lớp."""
    db_class = crud.get_class_by_id(db, class_id=class_id)
    if not db_class or db_class.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to start a session for this class")

    # (Tùy chọn) Kiểm tra xem có session nào đang diễn ra cho lớp này không
    # for s in db_class.attendance_sessions:
    #     if s.status == 'ongoing':
    #         raise HTTPException(status_code=400, detail="An attendance session is already ongoing for this class.")

    return crud.create_attendance_session(db, class_id=class_id, duration_minutes=session_data.duration_minutes)

@app.post("/sessions/{session_id}/end", response_model=schemas.AttendanceSession)
def end_a_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.require_teacher)
):
    """Kết thúc một buổi điểm danh đang diễn ra."""
    db_session = crud.get_session_by_id(db, session_id=session_id)
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Kiểm tra quyền: Giáo viên phải là người phụ trách lớp của session này
    if db_session.class_obj.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to end this session")
        
    ended_session = crud.end_attendance_session(db, session_id=session_id)
    if not ended_session:
         raise HTTPException(status_code=400, detail="Session is not ongoing or already completed")

    return ended_session

@app.get("/classes/{class_id}/sessions/", response_model=List[schemas.AttendanceSession])
def get_class_sessions(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.require_teacher)
):
    """Lấy lịch sử các buổi điểm danh của một lớp."""
    db_class = crud.get_class_by_id(db, class_id=class_id)
    if not db_class or db_class.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view sessions for this class")
    
    return crud.get_sessions_for_class(db, class_id=class_id)

@app.get("/sessions/{session_id}", response_model=schemas.AttendanceSession)
def get_session_details(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_active_user)
):
    """Lấy thông tin chi tiết của một buổi học."""
    db_session = crud.get_session_by_id(db, session_id=session_id)
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Kiểm tra quyền (Admin hoặc giáo viên của lớp)
    is_admin = current_user.role == 'admin'
    is_teacher_of_class = (current_user.role == 'teacher' and 
                           db_session.class_obj.teacher_id == current_user.id)
    
    if not (is_admin or is_teacher_of_class):
        raise HTTPException(status_code=403, detail="Not authorized to view this session")
        
    return db_session

# trong main.py
class ManualAttendanceUpdate(BaseModel):
    status: str # 'present', 'late', 'absent'

@app.put("/sessions/{session_id}/users/{user_id}/status", response_model=schemas.AttendanceLog)
def manually_update_attendance(
    session_id: int,
    user_id: int,
    update_data: ManualAttendanceUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.require_teacher)
):
    """Cập nhật thủ công trạng thái điểm danh của một sinh viên trong một buổi học."""
    # ... (thêm logic kiểm tra quyền: giáo viên phải dạy lớp của session này) ...

    updated_log = crud.update_or_create_log_for_student(
        db, 
        session_id=session_id, 
        user_id=user_id, 
        new_status=update_data.status
    )
    if not updated_log:
        raise HTTPException(status_code=404, detail="Session or User not found")
    return updated_log