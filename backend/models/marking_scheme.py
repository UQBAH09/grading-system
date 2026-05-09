from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from database.base import Base


class MarkingScheme(Base):
    __tablename__ = "marking_schemes"

    scheme_id = Column(Integer, primary_key=True, autoincrement=True)
    assignment_id = Column(Integer, ForeignKey("assignments.assignment_id"), nullable=False)
    total_marks = Column(Integer, nullable=False)

    assignment = relationship("Assignment", back_populates="marking_scheme")
    questions = relationship("SchemeQuestion", back_populates="scheme")

    def get_questions(self):
        return self.questions