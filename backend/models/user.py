from sqlalchemy import Column, Integer, String
from database.base import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # 'personal', 'teacher', 'student'
    name = Column(String, nullable=False)