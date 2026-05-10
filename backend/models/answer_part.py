from sqlalchemy import Column, Integer, String, ForeignKey
from database.base import Base

class AnswerPart(Base):
    __tablename__ = "answer_parts"

    part_id = Column(Integer, primary_key=True, autoincrement=True)
    submission_id = Column(Integer, ForeignKey("submissions.submission_id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.question_id"), nullable=False)
    extracted_text = Column(String, nullable=False)