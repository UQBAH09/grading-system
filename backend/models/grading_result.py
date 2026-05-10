from sqlalchemy import Column, Integer, String, ForeignKey
from database.base import Base

class GradingResult(Base):
    __tablename__ = "grading_results"

    result_id = Column(Integer, primary_key=True, autoincrement=True)
    part_id = Column(Integer, ForeignKey("answer_parts.part_id"), nullable=False)
    marks_awarded = Column(Integer, nullable=False)
    comments = Column(String, nullable=True)
    improvement = Column(String, nullable=True)
    agent_attempts = Column(Integer, default=1)