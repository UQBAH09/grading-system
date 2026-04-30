from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from database.base import Base


class Personal(Base):
    __tablename__ = "personals"

    personal_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)

    user = relationship("User")
    submissions = relationship("PersonalSubmission", back_populates="personal")