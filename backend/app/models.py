from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.dialects.postgresql import ARRAY 
from .database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_code = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    
    face_encoding = Column(ARRAY(Float), nullable=False)