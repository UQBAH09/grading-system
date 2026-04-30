from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database.base import Base


class PersonalAnswerPart(Base):
    __tablename__ = "personal_answer_parts"

    pap_id = Column(Integer, primary_key=True, autoincrement=True)
    submission_id = Column(Integer, ForeignKey("personal_submissions.submission_id"), nullable=False)
    question_number = Column(Integer, nullable=False)
    part = Column(String, nullable=True)
    extracted_text = Column(String, nullable=False)

    submission = relationship("PersonalSubmission", back_populates="answer_parts")
    grading_results = relationship("PersonalGradingResult", back_populates="answer_part")

    def get_results(self):
        return self.grading_results