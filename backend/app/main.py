import io
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import base64
from . import models, schemas, crud
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Face Recognition Attendance API",
    description="API cho hệ thống điểm danh bằng nhận diện khuôn mặt.",
    version="1.0.0",
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Chào mừng đến với API Điểm danh Nhận diện Khuôn mặt!"}

@app.post("/students/", response_model=schemas.Student, status_code=status.HTTP_201_CREATED)
def add_new_student(
    full_name: str = Form(...),
    student_code: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Thêm một sinh viên mới vào hệ thống.
    - **full_name**: Họ và tên sinh viên.
    - **student_code**: Mã số sinh viên.
    - **file**: Ảnh chân dung của sinh viên (định dạng jpg/png).
    """
    db_student = crud.get_student_by_code(db, student_code=student_code)
    if db_student:
        raise HTTPException(status_code=400, detail="Student code already registered")

    image_data = io.BytesIO(file.file.read())

    new_student, message = crud.create_student(
        db=db, 
        student_code=student_code, 
        full_name=full_name, 
        image_data=image_data
    )

    if not new_student:
        raise HTTPException(status_code=400, detail=message)
        
    return new_student

@app.post("/recognize/", response_model=List[schemas.RecognizedStudent])
def recognize_student_faces(
    payload: schemas.ImagePayload, 
    db: Session = Depends(get_db)
):
    """
    Nhận diện sinh viên từ một ảnh (dạng base64).
    - **image_base64**: Chuỗi base64 của ảnh cần nhận diện.
    """
    try:
        header, encoded = payload.image_base64.split(",", 1)
        image_data_bytes = base64.b64decode(encoded)
        image_data_io = io.BytesIO(image_data_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 string: {e}")

    recognized_students = crud.recognize_faces(db=db, image_data=image_data_io)

    if not recognized_students:
        return []

    return recognized_students