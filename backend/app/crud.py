from sqlalchemy.orm import Session
from . import models, schemas, security
import face_recognition
import numpy as np
import io
from datetime import datetime, timedelta, timezone
from typing import Optional

# CRUD cho User (Người dùng)

def get_user_by_id(db: Session, user_id: int):
    """Tìm kiếm user dựa trên ID."""
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    """Tìm kiếm user dựa trên email."""
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách tất cả user (dùng cho Admin)."""
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    """Tạo một user mới (đã bao gồm băm mật khẩu)."""
    hashed_password = security.get_password_hash(user.password)
    student_code = user.student_code if user.student_code else None

    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        student_code=student_code,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    """Cập nhật thông tin của user, bao gồm cả mật khẩu nếu được cung cấp."""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None
    update_data = user_update.model_dump(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        hashed_password = security.get_password_hash(update_data["password"])
        db_user.hashed_password = hashed_password
    for key, value in update_data.items():
        if key != "password":
            setattr(db_user, key, value)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_face(db: Session, user_id: int, image_data: io.BytesIO):
    """Cập nhật hoặc thêm face encoding cho một user."""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None, "User not found"
    try:
        image = face_recognition.load_image_file(image_data)
        encodings = face_recognition.face_encodings(image)
    except Exception as e:
        return None, f"Could not process image: {e}"
    if len(encodings) == 0:
        return None, "No face found in the image."
    if len(encodings) > 1:
        return None, "More than one face found in the image."
    db_user.face_encoding = encodings[0].tolist()
    db.commit()
    db.refresh(db_user)
    return db_user, "Face updated successfully"

def delete_user_by_id(db: Session, user_id: int):
    """Xóa một user dựa trên ID."""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
        return db_user
    return None

# CRUD cho AttendanceLog (log điểm danh)

def create_attendance_log(db: Session, user_id: int, status: str = "present"):
    """Tạo một bản ghi điểm danh mới cho user."""
    new_log = models.AttendanceLog(user_id=user_id, status=status)
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

def get_user_attendance_logs(db: Session, user_id: int):
    """Lấy tất cả log điểm danh của một user cụ thể."""
    return db.query(models.AttendanceLog).filter(models.AttendanceLog.user_id == user_id).order_by(models.AttendanceLog.timestamp.desc()).all()

def get_all_attendance_logs(db: Session):
    """Lấy toàn bộ log điểm danh trong hệ thống (dùng cho Admin)."""
    return db.query(models.AttendanceLog).order_by(models.AttendanceLog.timestamp.desc()).all()

# CRUD cho Class (Lớp học)

def get_class_by_id(db: Session, class_id: int):
    """Lấy thông tin một lớp học bằng ID."""
    return db.query(models.Class).filter(models.Class.id == class_id).first()

def get_classes(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách tất cả các lớp học."""
    return db.query(models.Class).offset(skip).limit(limit).all()

def create_class(db: Session, class_in: schemas.ClassCreate):
    """Tạo một lớp học mới."""
    teacher = get_user_by_id(db, user_id=class_in.teacher_id)
    if not teacher or teacher.role != 'teacher':
        return None
    db_class = models.Class(name=class_in.name, description=class_in.description, teacher_id=class_in.teacher_id)
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class

def update_class(db: Session, class_id: int, class_update: schemas.ClassCreate):
    """Cập nhật thông tin một lớp học."""
    db_class = get_class_by_id(db, class_id)
    if not db_class:
        return None, "Class not found"

    if class_update.teacher_id != db_class.teacher_id:
        new_teacher = get_user_by_id(db, user_id=class_update.teacher_id)
        if not new_teacher or new_teacher.role != 'teacher':
            return None, "Invalid new teacher ID"
    
    db_class.name = class_update.name
    db_class.description = class_update.description
    db_class.teacher_id = class_update.teacher_id
    db.commit()
    db.refresh(db_class)
    return db_class, "Class updated successfully"

def delete_class_by_id(db: Session, class_id: int):
    """Xóa một lớp học."""
    db_class = get_class_by_id(db, class_id)
    if db_class:
        db.delete(db_class)
        db.commit()
        return db_class
    return None

def add_student_to_class(db: Session, class_id: int, user_id: int):
    """Thêm một sinh viên vào một lớp học."""
    db_class = get_class_by_id(db, class_id)
    student = get_user_by_id(db, user_id)
    if db_class and student and student.role == 'student' and student not in db_class.students:
        db_class.students.append(student)
        db.commit()
        return db_class
    return None

def remove_student_from_class(db: Session, class_id: int, user_id: int):
    """Xóa một sinh viên khỏi một lớp học."""
    db_class = get_class_by_id(db, class_id)
    student = get_user_by_id(db, user_id)
    if db_class and student and student in db_class.students:
        db_class.students.remove(student)
        db.commit()
        return db_class
    return None

def get_classes_by_teacher(db: Session, teacher_id: int):
    """Lấy danh sách các lớp học do một giáo viên phụ trách."""
    return db.query(models.Class).filter(models.Class.teacher_id == teacher_id).all()

def get_students_in_class(db: Session, class_id: int):
    """Lấy danh sách sinh viên của một lớp cụ thể."""
    db_class = get_class_by_id(db, class_id)
    if db_class:
        return db_class.students
    return []

# Hàm điểm danh
def recognize_and_create_log_for_session(db: Session, session_id: int, image_data: bytes):
    """
    Nhận diện khuôn mặt và tạo log điểm danh cho một buổi học cụ thể.
    Tự động xác định trạng thái 'present' hoặc 'late'.
    """
    db_session = get_session_by_id(db, session_id=session_id)
    if not db_session or db_session.status != 'ongoing':
        return None, "Session is not ongoing or not found"

    students_in_class = db_session.class_obj.students
    if not students_in_class:
        return None, "No students in this class"

    known_face_encodings = [s.face_encoding for s in students_in_class if s.face_encoding]
    if not known_face_encodings:
        return None, "No students have face data in this class"

    try:
        image = face_recognition.load_image_file(image_data)
        unknown_face_encodings = face_recognition.face_encodings(image)
    except Exception:
        return None, "Invalid image data"

    recognized_user = None
    for face_encoding in unknown_face_encodings:
        matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.5)
        if True in matches:
            best_match_index = np.argmin(face_recognition.face_distance(known_face_encodings, face_encoding))
            if matches[best_match_index]:
                student_with_encoding_list = [s for s in students_in_class if s.face_encoding]
                potential_user = student_with_encoding_list[best_match_index]
                
                existing_log = db.query(models.AttendanceLog).filter_by(session_id=session_id, user_id=potential_user.id).first()
                if not existing_log:
                    recognized_user = potential_user
                    break 

    if recognized_user:
        status = "present"
        new_log = create_attendance_log(db, user_id=recognized_user.id, session_id=session_id, status=status)
        return new_log, f"Successfully logged {status}"
    
    return None, "Face not recognized or student already logged"

def create_attendance_log(db: Session, user_id: int, session_id: int, status: str):
    """Tạo một bản ghi điểm danh mới cho user trong một session."""
    new_log = models.AttendanceLog(user_id=user_id, session_id=session_id, status=status)
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

def get_attendance_logs_for_class(db: Session, class_id: int, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None):
    """
    Lấy lịch sử điểm danh cho tất cả sinh viên trong một lớp.
    """
    students_in_class = get_students_in_class(db, class_id)
    if not students_in_class:
        return []
    
    student_ids = [student.id for student in students_in_class]
    
    query = db.query(models.AttendanceLog).filter(models.AttendanceLog.user_id.in_(student_ids))
    
    if start_date:
        query = query.filter(models.AttendanceLog.timestamp >= start_date)
    
    if end_date:
        end_date_inclusive = end_date + timedelta(days=1)
        query = query.filter(models.AttendanceLog.timestamp < end_date_inclusive)
        
    return query.order_by(models.AttendanceLog.timestamp.desc()).all()

def get_attendance_log_by_id(db: Session, log_id: int):
    """Lấy một bản ghi điểm danh bằng ID."""
    return db.query(models.AttendanceLog).filter(models.AttendanceLog.id == log_id).first()

def update_attendance_log_status(db: Session, log_id: int, new_status: str):
    """Cập nhật trạng thái của một bản ghi điểm danh."""
    db_log = get_attendance_log_by_id(db, log_id=log_id)
    if db_log:
        db_log.status = new_status
        db.commit()
        db.refresh(db_log)
    return db_log

# CRUD cho AttendanceSession

def create_attendance_session(db: Session, class_id: int, duration_minutes: int):
    """Tạo một buổi điểm danh mới."""
    start_time = datetime.now(timezone.utc)
    end_time = start_time + timedelta(minutes=duration_minutes)
    
    db_session = models.AttendanceSession(
        class_id=class_id,
        start_time=start_time,
        end_time=end_time,
        status='ongoing'
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def get_session_by_id(db: Session, session_id: int):
    """Lấy một buổi điểm danh bằng ID."""
    return db.query(models.AttendanceSession).filter(models.AttendanceSession.id == session_id).first()

def end_attendance_session(db: Session, session_id: int):
    """Kết thúc một buổi điểm danh và tự động ghi nhận vắng mặt."""
    db_session = get_session_by_id(db, session_id)
    if not db_session or db_session.status != 'ongoing':
        return None

    db_session.status = 'completed'
    
    students_in_class = db_session.class_obj.students
    attended_student_ids = {log.user_id for log in db_session.logs}
    
    for student in students_in_class:
        if student.id not in attended_student_ids:
            absent_log = models.AttendanceLog(
                user_id=student.id,
                session_id=session_id,
                status='absent',
                timestamp=datetime.now(timezone.utc) 
            )
            db.add(absent_log)
    
    db.commit()
    db.refresh(db_session)
    return db_session
    
def get_sessions_for_class(db: Session, class_id: int):
    """Lấy tất cả các buổi điểm danh của một lớp."""
    return db.query(models.AttendanceSession).filter(models.AttendanceSession.class_id == class_id).order_by(models.AttendanceSession.start_time.desc()).all()

def update_or_create_log_for_student(db: Session, session_id: int, user_id: int, new_status: str):
    db_session = get_session_by_id(db, session_id=session_id)
    db_user = get_user_by_id(db, user_id=user_id)
    if not db_session or not db_user:
        return None

    existing_log = db.query(models.AttendanceLog).filter_by(session_id=session_id, user_id=user_id).first()

    if existing_log:
        existing_log.status = new_status
        db.commit()
        db.refresh(existing_log)
        return existing_log
    else:
        new_log = models.AttendanceLog(
            user_id=user_id,
            session_id=session_id,
            status=new_status,
            timestamp=datetime.now(timezone.utc) 
        )
        db.add(new_log)
        db.commit()
        db.refresh(new_log)
        return new_log