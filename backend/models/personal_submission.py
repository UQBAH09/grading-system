from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.base import Base


class PersonalSubmission(Base):
    __tablename__ = "personal_submissions"

    submission_id = Column(Integer, primary_key=True, autoincrement=True)
    personal_id = Column(Integer, ForeignKey("personals.personal_id"), nullable=False)
    answer_file_path = Column(String, nullable=False)
    scheme_file_path = Column(String, nullable=False)
    status = Column(String, default="pending")  # pending, extracting, grading, done, failed
    submitted_at = Column(DateTime, server_default=func.now())

    personal = relationship("Personal", back_populates="submissions")
    scheme_questions = relationship("PersonalSchemeQuestion", back_populates="submission")
    answer_parts = relationship("PersonalAnswerPart", back_populates="submission")

    def update_status(self, session, status):
        self.status = status
        session.commit()