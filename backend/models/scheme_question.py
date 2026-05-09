from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database.base import Base


class SchemeQuestion(Base):
    __tablename__ = "scheme_questions"

    sq_id = Column(Integer, primary_key=True, autoincrement=True)
    scheme_id = Column(Integer, ForeignKey("marking_schemes.scheme_id"), nullable=False)
    question_number = Column(Integer, nullable=False)
    part = Column(String, nullable=True)
    max_marks = Column(Integer, nullable=False)
    criteria_text = Column(String, nullable=False)

    scheme = relationship("MarkingScheme", back_populates="questions")
    grading_results = relationship("GradingResult", back_populates="scheme_question")