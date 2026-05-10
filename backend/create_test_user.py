import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.user import User
from models.teacher_students import TeacherStudent
from models.marking_scheme import MarkingScheme
from models.assignment import Assignment
from models.submission import Submission
from models.question import Question
from models.answer_part import AnswerPart
from models.grading_result import GradingResult

from services.db_service import DBService
from services.auth_service import AuthService

db = DBService()
auth = AuthService()

# Create teacher
teacher = User(
    username="teacher1",
    password_hash=auth.hash_password("password123"),
    role="teacher",
    name="Test Teacher"
)
saved_teacher = db.save(teacher)
print(f"Created teacher: {saved_teacher.username} id:{saved_teacher.user_id}")

# Create student
student = User(
    username="student1",
    password_hash=auth.hash_password("password123"),
    role="student",
    name="Test Student"
)
saved_student = db.save(student)
print(f"Created student: {saved_student.username} id:{saved_student.user_id}")

# Link student to teacher
link = TeacherStudent(
    teacher_id=saved_teacher.user_id,
    student_id=saved_student.user_id
)
db.save(link)
print(f"Linked student to teacher")

# Create personal user
personal = User(
    username="personal1",
    password_hash=auth.hash_password("password123"),
    role="personal",
    name="Test Personal"
)
saved_personal = db.save(personal)
print(f"Created personal: {saved_personal.username} id:{saved_personal.user_id}")