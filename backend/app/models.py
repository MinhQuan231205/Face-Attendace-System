from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship, backref
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql import func
from .database import Base

class_members = Table(
    'class_members', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('class_id', Integer, ForeignKey('classes.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    student_code = Column(String, unique=True, index=True, nullable=True)
    full_name = Column(String, nullable=False)
    face_encoding = Column(ARRAY(Float), nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    role = Column(String, default='student', nullable=False)
    attendance_logs = relationship("AttendanceLog", back_populates="user", cascade="all, delete-orphan")

class Class(Base):
    __tablename__ = "classes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    teacher_id = Column(Integer, ForeignKey("users.id"))
    teacher = relationship("User", backref="taught_classes")
    students = relationship("User", secondary=class_members, backref="classes")

class AttendanceSession(Base):
    __tablename__ = "attendance_sessions"
    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(String, default='ongoing', nullable=False)
    class_obj = relationship("Class", backref=backref("attendance_sessions", cascade="all, delete-orphan"))
    logs = relationship("AttendanceLog", back_populates="session", cascade="all, delete-orphan")

class AttendanceLog(Base):
    __tablename__ = "attendance_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="present")
    session_id = Column(Integer, ForeignKey("attendance_sessions.id"), nullable=False)
    user = relationship("User", back_populates="attendance_logs")
    session = relationship("AttendanceSession", back_populates="logs")