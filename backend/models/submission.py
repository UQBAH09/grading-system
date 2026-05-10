from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from database.base import Base

class Submission(Base):
    __tablename__ = "submissions"

    submission_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    assignment_id = Column(Integer, ForeignKey("assignments.assignment_id"), nullable=True)
    scheme_id = Column(Integer, ForeignKey("marking_schemes.scheme_id"), nullable=True)
    answer_file_path = Column(String, nullable=False)
    status = Column(String, default="pending")  # pending, extracting, grading, done, failed
    submitted_at = Column(DateTime, server_default=func.now())

    def update_status(self, session, status):
        self.status = status
        session.commit()