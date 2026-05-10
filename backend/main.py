from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, grade, personal, results, upload
from database.base import Base
from database.session import engine
from models.user import User
from models.teacher_students import TeacherStudent
from models.marking_scheme import MarkingScheme
from models.assignment import Assignment
from models.submission import Submission
from models.question import Question
from models.answer_part import AnswerPart
from models.grading_result import GradingResult

app = FastAPI(title="AI Grading System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")

app.include_router(auth.router)
app.include_router(grade.router)
app.include_router(personal.router)
app.include_router(results.router)
app.include_router(upload.router)

@app.get("/")
def root():
    return {"message": "AI Grading System is running"}