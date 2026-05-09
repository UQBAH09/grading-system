from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, grade, personal, results, upload
from database.base import Base
from database.session import engine
from models import (
    user, teacher, student, personal as personal_model,
    assignment, marking_scheme, scheme_question,
    answer_sheet, answer_part, grading_result,
    personal_submission, personal_scheme_question,
    personal_answer_part, personal_grading_result
)

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