from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# ==============================================================================
# Các Schema Gọn Nhẹ - Dùng để lồng vào các schema khác, tránh lặp vô hạn
# ==============================================================================
class UserNested(BaseModel):
    id: int
    full_name: str
    student_code: Optional[str] = None
    
    class Config:
        orm_mode = True

class ClassNested(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True

# ==============================================================================
# Các Schema Chi Tiết
# ==============================================================================

# --- Log ---
class AttendanceLog(BaseModel):
    id: int
    user_id: int # <-- THÊM LẠI user_id
    session_id: int
    status: str
    timestamp: datetime
    user: UserNested # <-- SỬ DỤNG SCHEMA LỒNG NHAU
    session: Optional['AttendanceSessionNested'] = None 

    class Config:
        orm_mode = True

class AttendanceSessionNested(BaseModel):
    id: int
    start_time: datetime
    end_time: datetime
    class_obj: Optional[ClassNested] = None # Lồng thêm thông tin lớp

    class Config:
        orm_mode = True

AttendanceLog.model_rebuild()

# --- Session ---
class AttendanceSession(BaseModel):
    id: int
    class_id: int
    start_time: datetime
    end_time: datetime
    status: str
    logs: List[AttendanceLog] = []
    class_obj: Optional[ClassNested] = None # <-- SỬ DỤNG SCHEMA LỒNG NHAU

    class Config:
        orm_mode = True

# --- Class ---
class Class(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    teacher: Optional[UserNested] = None # <-- SỬ DỤNG SCHEMA LỒNG NHAU
    students: List[UserNested] = [] # <-- SỬ DỤNG SCHEMA LỒNG NHAU
    attendance_sessions: List[AttendanceSession] = []
    
    class Config:
        orm_mode = True

# --- User ---
class User(BaseModel):
    id: int
    email: str
    full_name: str
    student_code: Optional[str] = None
    role: str
    is_active: bool
    classes: List[ClassNested] = [] # <-- SỬ DỤNG SCHEMA LỒNG NHAU
    taught_classes: List[ClassNested] = [] # <-- SỬ DỤNG SCHEMA LỒNG NHAU
    
    class Config:
        orm_mode = True

# ==============================================================================
# Các Schema cho việc Tạo/Sửa (giữ nguyên)
# ==============================================================================
class UserCreate(BaseModel):
    email: str
    full_name: str
    password: str
    student_code: Optional[str] = None
    role: str = 'student'

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    student_code: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class ClassCreate(BaseModel):
    name: str
    description: Optional[str] = None
    teacher_id: int

class AttendanceSessionCreate(BaseModel):
    duration_minutes: int = 45

# ==============================================================================
# Các schema cũ khác (không thay đổi)
# ==============================================================================
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ImagePayload(BaseModel):
    image_base64: str