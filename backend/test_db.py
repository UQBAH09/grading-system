import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from database.session import engine
from database.base import Base

# Import all models so SQLAlchemy knows about them
from models.user import User
from models.teacher import Teacher
from models.student import Student
from models.personal import Personal
from models.assignment import Assignment
from models.marking_scheme import MarkingScheme
from models.scheme_question import SchemeQuestion
from models.answer_sheet import AnswerSheet
from models.answer_part import AnswerPart
from models.grading_result import GradingResult
from models.personal_submission import PersonalSubmission
from models.personal_scheme_question import PersonalSchemeQuestion
from models.personal_answer_part import PersonalAnswerPart
from models.personal_grading_result import PersonalGradingResult

print("Creating all tables...")
Base.metadata.create_all(bind=engine)
print("All tables created successfully!")