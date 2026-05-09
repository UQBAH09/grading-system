from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database.base import Base


class GradingResult(Base):
    __tablename__ = "grading_results"

    result_id = Column(Integer, primary_key=True, autoincrement=True)
    ap_id = Column(Integer, ForeignKey("answer_parts.ap_id"), nullable=False)
    sq_id = Column(Integer, ForeignKey("scheme_questions.sq_id"), nullable=False)
    marks_awarded = Column(Integer, nullable=False)
    comments = Column(String, nullable=True)
    improvement = Column(String, nullable=True)
    agent_attempts = Column(Integer, default=1)

    answer_part = relationship("AnswerPart", back_populates="results")
    scheme_question = relationship("SchemeQuestion", back_populates="grading_results")