from pydantic import BaseModel, Field
from typing import List

class StudentBase(BaseModel):
    student_code: str
    full_name: str

class StudentCreate(StudentBase):
    pass

class Student(StudentBase):
    id: int

    class Config:
        from_attributes = True 

class ImagePayload(BaseModel):
    image_base64: str = Field(..., example="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...")

class RecognizedStudent(BaseModel):
    student_code: str
    full_name: str