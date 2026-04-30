from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database.base import Base


class PersonalSchemeQuestion(Base):
    __tablename__ = "personal_scheme_questions"

    psq_id = Column(Integer, primary_key=True, autoincrement=True)
    submission_id = Column(Integer, ForeignKey("personal_submissions.submission_id"), nullable=False)
    question_number = Column(Integer, nullable=False)
    part = Column(String, nullable=True)
    max_marks = Column(Integer, nullable=False)
    criteria_text = Column(String, nullable=False)

    submission = relationship("PersonalSubmission", back_populates="scheme_questions")
    grading_results = relationship("PersonalGradingResult", back_populates="scheme_question")