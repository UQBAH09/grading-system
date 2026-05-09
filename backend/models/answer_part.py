from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database.base import Base


class AnswerPart(Base):
    __tablename__ = "answer_parts"

    ap_id = Column(Integer, primary_key=True, autoincrement=True)
    sheet_id = Column(Integer, ForeignKey("answer_sheets.sheet_id"), nullable=False)
    question_number = Column(Integer, nullable=False)
    part = Column(String, nullable=True)
    extracted_text = Column(String, nullable=False)

    sheet = relationship("AnswerSheet", back_populates="parts")
    results = relationship("GradingResult", back_populates="answer_part")

    def get_results(self):
        return self.results