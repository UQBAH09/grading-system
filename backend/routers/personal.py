import os
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from routers.auth import get_current_user
from services.db_service import DBService
from models.personal import Personal
from models.personal_submission import PersonalSubmission
from models.personal_answer_part import PersonalAnswerPart
from models.personal_grading_result import PersonalGradingResult
from models.personal_scheme_question import PersonalSchemeQuestion
from models.user import User
from models.teacher import Teacher
from models.student import Student
from models.assignment import Assignment
from models.marking_scheme import MarkingScheme
from models.scheme_question import SchemeQuestion
from models.answer_sheet import AnswerSheet
from models.answer_part import AnswerPart
from models.grading_result import GradingResult

router = APIRouter(prefix="/personal")
db_service = DBService()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', 'uploads')

@router.post("/submit", status_code=202)
async def submit(
    answer_file: UploadFile = File(...),
    scheme_file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    # Make sure user is a personal user
    user_id = current_user["user_id"]
    personals = db_service.query(Personal, {"user_id": user_id})
    if not personals:
        raise HTTPException(status_code=403, detail="Only personal users can use this endpoint")

    personal = personals[0]

    # Save answer file to disk
    answer_filename = f"personal_{personal.personal_id}_answer_{answer_file.filename}"
    answer_path = os.path.join(UPLOAD_DIR, answer_filename)
    with open(answer_path, "wb") as f:
        shutil.copyfileobj(answer_file.file, f)

    # Save scheme file to disk
    scheme_filename = f"personal_{personal.personal_id}_scheme_{scheme_file.filename}"
    scheme_path = os.path.join(UPLOAD_DIR, scheme_filename)
    with open(scheme_path, "wb") as f:
        shutil.copyfileobj(scheme_file.file, f)

    # Create PersonalSubmission row
    submission = PersonalSubmission(
        personal_id=personal.personal_id,
        answer_file_path=answer_path,
        scheme_file_path=scheme_path,
        status="pending"
    )
    saved_submission = db_service.save(submission)

    # Trigger pipeline
    from core.core import Core
    core = Core()
    await core.receive_upload(answer_path, scheme_path, saved_submission.submission_id, "personal")

    return {
        "submission_id": saved_submission.submission_id,
        "status": "pending"
    }

@router.get("/status/{id}")
async def get_status(id: int, current_user = Depends(get_current_user)):
    submissions = db_service.query(PersonalSubmission, {"submission_id": id})
    if not submissions:
        raise HTTPException(status_code=404, detail="Submission not found")

    return {
        "submission_id": id,
        "status": submissions[0].status
    }

@router.get("/results/{id}")
async def get_result(id: int, current_user = Depends(get_current_user)):
    submissions = db_service.query(PersonalSubmission, {"submission_id": id})
    if not submissions:
        raise HTTPException(status_code=404, detail="Submission not found")

    submission = submissions[0]

    if submission.status != "done":
        raise HTTPException(status_code=400, detail=f"Grading not complete. Current status: {submission.status}")

    # Fetch all answer parts
    parts = db_service.query(PersonalAnswerPart, {"submission_id": id})

    results = []
    for part in parts:
        grading = db_service.query(PersonalGradingResult, {"pap_id": part.pap_id})
        scheme = db_service.query(PersonalSchemeQuestion, {"psq_id": grading[0].psq_id}) if grading else []

        results.append({
            "question_number": part.question_number,
            "part": part.part,
            "extracted_text": part.extracted_text,
            "marks_awarded": grading[0].marks_awarded if grading else 0,
            "max_marks": scheme[0].max_marks if scheme else 0,
            "comments": grading[0].comments if grading else "",
            "improvement": grading[0].improvement if grading else "",
        })

    total = sum(r["marks_awarded"] for r in results)
    max_total = sum(r["max_marks"] for r in results)

    return {
        "submission_id": id,
        "status": submission.status,
        "total_marks": total,
        "max_marks": max_total,
        "parts": results
    }