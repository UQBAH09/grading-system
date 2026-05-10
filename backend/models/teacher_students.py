from sqlalchemy import Column, Integer, ForeignKey
from database.base import Base

class TeacherStudent(Base):
    __tablename__ = "teacher_students"

    id = Column(Integer, primary_key=True, autoincrement=True)
    teacher_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)