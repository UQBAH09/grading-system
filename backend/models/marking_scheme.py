from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from database.base import Base

class MarkingScheme(Base):
    __tablename__ = "marking_schemes"

    scheme_id = Column(Integer, primary_key=True, autoincrement=True)
    file_path = Column(String, nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())