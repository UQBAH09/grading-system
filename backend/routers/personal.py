import os
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from routers.auth import get_current_user
from services.db_service import DBService
from models.user import User
from models.submission import Submission
from models.marking_scheme import MarkingScheme
from models.answer_part import AnswerPart
from models.grading_result import GradingResult
from models.question import Question

router = APIRouter(prefix="/personal")
db_service = DBService()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', 'uploads')

@router.post("/submit", status_code=202)
async def submit(
    answer_file: UploadFile = File(...),
    scheme_file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    user_id = current_user["user_id"]

    # Verify personal user
    users = db_service.query(User, {"user_id": user_id, "role": "personal"})
    if not users:
        raise HTTPException(status_code=403, detail="Only personal users can use this endpoint")

    # Save answer file
    answer_filename = f"personal_{user_id}_answer_{answer_file.filename}"
    answer_path = os.path.join(UPLOAD_DIR, answer_filename)
    with open(answer_path, "wb") as f:
        shutil.copyfileobj(answer_file.file, f)

    # Save scheme file
    scheme_filename = f"personal_{user_id}_scheme_{scheme_file.filename}"
    scheme_path = os.path.join(UPLOAD_DIR, scheme_filename)
    with open(scheme_path, "wb") as f:
        shutil.copyfileobj(scheme_file.file, f)

    # Save marking scheme record
    scheme = MarkingScheme(
        file_path=scheme_path,
        uploaded_by=user_id
    )
    saved_scheme = db_service.save(scheme)

    # Create submission
    submission = Submission(
        user_id=user_id,
        scheme_id=saved_scheme.scheme_id,
        answer_file_path=answer_path,
        status="pending"
    )
    saved_submission = db_service.save(submission)

    # Trigger pipeline
    from core.core import Core
    core = Core()
    await core.receive_upload(
        answer_path,
        scheme_path,
        saved_submission.submission_id,
        saved_scheme.scheme_id,
        "personal"
    )

    return {
        "submission_id": saved_submission.submission_id,
        "status": "pending"
    }

@router.get("/status/{id}")
async def get_status(id: int, current_user = Depends(get_current_user)):
    submissions = db_service.query(Submission, {"submission_id": id})
    if not submissions:
        raise HTTPException(status_code=404, detail="Submission not found")

    return {
        "submission_id": id,
        "status": submissions[0].status
    }

@router.get("/results/{id}")
async def get_result(id: int, current_user = Depends(get_current_user)):
    submissions = db_service.query(Submission, {"submission_id": id})
    if not submissions:
        raise HTTPException(status_code=404, detail="Submission not found")

    submission = submissions[0]

    if submission.status != "done":
        raise HTTPException(
            status_code=400,
            detail=f"Grading not complete. Current status: {submission.status}"
        )

    parts = db_service.query(AnswerPart, {"submission_id": id})

    results = []
    for part in parts:
        grading = db_service.query(GradingResult, {"part_id": part.part_id})
        question = db_service.query(Question, {"question_id": part.question_id})

        results.append({
            "question_id": part.question_id,
            "label": question[0].label if question else "",
            "extracted_text": part.extracted_text,
            "marks_awarded": grading[0].marks_awarded if grading else 0,
            "max_marks": question[0].max_marks if question else 0,
            "comments": grading[0].comments if grading else "",
            "improvement": grading[0].improvement if grading else "",
        })

    total = sum(r["marks_awarded"] for r in results)
    max_total = sum(r["max_marks"] for r in results if r["max_marks"])

    return {
        "submission_id": id,
        "status": submission.status,
        "total_marks": total,
        "max_marks": max_total,
        "parts": results
    }