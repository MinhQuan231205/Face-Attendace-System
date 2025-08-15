from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

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

class AttendanceLog(BaseModel):
    id: int
    user_id: int 
    session_id: int
    status: str
    timestamp: datetime
    user: UserNested 
    session: Optional['AttendanceSessionNested'] = None 

    class Config:
        orm_mode = True

class AttendanceSessionNested(BaseModel):
    id: int
    start_time: datetime
    end_time: datetime
    class_obj: Optional[ClassNested] = None 

    class Config:
        orm_mode = True

AttendanceLog.model_rebuild()

class AttendanceSession(BaseModel):
    id: int
    class_id: int
    start_time: datetime
    end_time: datetime
    status: str
    logs: List[AttendanceLog] = []
    class_obj: Optional[ClassNested] = None 

    class Config:
        orm_mode = True

class Class(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    teacher: Optional[UserNested] = None 
    students: List[UserNested] = [] 
    attendance_sessions: List[AttendanceSession] = []
    
    class Config:
        orm_mode = True

class User(BaseModel):
    id: int
    email: str
    full_name: str
    student_code: Optional[str] = None
    role: str
    is_active: bool
    classes: List[ClassNested] = [] 
    taught_classes: List[ClassNested] = [] 
    
    class Config:
        orm_mode = True

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

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ImagePayload(BaseModel):
    image_base64: str