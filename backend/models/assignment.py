from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from database.base import Base

class Assignment(Base):
    __tablename__ = "assignments"

    assignment_id = Column(Integer, primary_key=True, autoincrement=True)
    teacher_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    scheme_id = Column(Integer, ForeignKey("marking_schemes.scheme_id"), nullable=True)
    title = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())