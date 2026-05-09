from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.base import Base


class AnswerSheet(Base):
    __tablename__ = "answer_sheets"

    sheet_id = Column(Integer, primary_key=True, autoincrement=True)
    assignment_id = Column(Integer, ForeignKey("assignments.assignment_id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False)
    file_path = Column(String, nullable=False)
    status = Column(String, default="pending")  # pending, extracting, grading, done, failed
    submitted_at = Column(DateTime, server_default=func.now())

    assignment = relationship("Assignment", back_populates="answer_sheets")
    student = relationship("Student", back_populates="answer_sheets")
    parts = relationship("AnswerPart", back_populates="sheet")

    def get_parts(self):
        return self.parts

    def update_status(self, session, status):
        self.status = status
        session.commit()