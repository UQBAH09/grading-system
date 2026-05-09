from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.base import Base


class Assignment(Base):
    __tablename__ = "assignments"

    assignment_id = Column(Integer, primary_key=True, autoincrement=True)
    teacher_id = Column(Integer, ForeignKey("teachers.teacher_id"), nullable=False)
    title = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    teacher = relationship("Teacher", back_populates="assignments")
    marking_scheme = relationship("MarkingScheme", back_populates="assignment", uselist=False)
    answer_sheets = relationship("AnswerSheet", back_populates="assignment")