from sqlalchemy.orm import Session
from . import models, schemas
import face_recognition
import numpy as np
import base64
import io

def get_student_by_code(db: Session, student_code: str):
    """
    Hàm tìm kiếm sinh viên dựa trên mã sinh viên.
    """
    return db.query(models.Student).filter(models.Student.student_code == student_code).first()

def create_student(db: Session, student_code: str, full_name: str, image_data: bytes):
    """
    Hàm tạo sinh viên mới và xử lý ảnh.
    """
    image = face_recognition.load_image_file(image_data)
    encodings = face_recognition.face_encodings(image)

    if len(encodings) == 0:
        return None, "No face found in the image."
    if len(encodings) > 1:
        return None, "More than one face found in the image."

    face_encoding = encodings[0].tolist()

    db_student = models.Student(
        student_code=student_code,
        full_name=full_name,
        face_encoding=face_encoding
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    
    return db_student, "Student created successfully."

def get_all_students(db: Session):
    """
    Hàm lấy tất cả sinh viên từ database.
    """
    return db.query(models.Student).all()


def recognize_faces(db: Session, image_data: bytes):
    """
    Hàm nhận diện khuôn mặt từ một frame ảnh.
    """
    known_students = get_all_students(db)
    if not known_students:
        return [] 

    known_face_encodings = [student.face_encoding for student in known_students]
    known_student_data = [
        {"student_code": student.student_code, "full_name": student.full_name}
        for student in known_students
    ]

    try:
        image = face_recognition.load_image_file(image_data)
        unknown_face_locations = face_recognition.face_locations(image)
        unknown_face_encodings = face_recognition.face_encodings(image, unknown_face_locations)
    except Exception as e:
        print(f"Error processing image: {e}")
        return []

    recognized_students = []
    for face_encoding in unknown_face_encodings:
        matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.5)

        face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
        best_match_index = np.argmin(face_distances)
        
        if matches[best_match_index]:
            recognized_student_data = known_student_data[best_match_index]
            
            if recognized_student_data not in recognized_students:
                recognized_students.append(recognized_student_data)

    return recognized_students