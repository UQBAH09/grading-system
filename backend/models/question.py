from sqlalchemy import Column, Integer, String, ForeignKey
from database.base import Base

class Question(Base):
    __tablename__ = "questions"

    question_id = Column(Integer, primary_key=True, autoincrement=True)
    scheme_id = Column(Integer, ForeignKey("marking_schemes.scheme_id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("questions.question_id"), nullable=True)
    label = Column(String, nullable=False)  # e.g. "1", "1a", "2b"
    max_marks = Column(Integer, nullable=True)  # only on leaf questions
    criteria_text = Column(String, nullable=True)  # only on leaf questions