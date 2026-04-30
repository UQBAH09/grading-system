from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database.base import Base


class PersonalGradingResult(Base):
    __tablename__ = "personal_grading_results"

    result_id = Column(Integer, primary_key=True, autoincrement=True)
    pap_id = Column(Integer, ForeignKey("personal_answer_parts.pap_id"), nullable=False)
    psq_id = Column(Integer, ForeignKey("personal_scheme_questions.psq_id"), nullable=False)
    marks_awarded = Column(Integer, nullable=False)
    comments = Column(String, nullable=True)
    improvement = Column(String, nullable=True)
    agent_attempts = Column(Integer, default=1)

    answer_part = relationship("PersonalAnswerPart", back_populates="grading_results")
    scheme_question = relationship("PersonalSchemeQuestion", back_populates="grading_results")