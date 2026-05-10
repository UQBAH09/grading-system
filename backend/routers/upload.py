import os
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from routers.auth import get_current_user
from services.db_service import DBService
from models.user import User
from models.assignment import Assignment
from models.marking_scheme import MarkingScheme
from models.submission import Submission
from models.question import Question
from models.answer_part import AnswerPart

router = APIRouter(prefix="/upload")
db_service = DBService()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', 'uploads')

@router.post("/assignment", status_code=201)
async def create_assignment(
    title: str = Form(...),
    current_user = Depends(get_current_user)
):
    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can create assignments")

    assignment = Assignment(
        teacher_id=current_user["user_id"],
        title=title
    )
    saved = db_service.save(assignment)

    return {
        "assignment_id": saved.assignment_id,
        "title": saved.title,
        "created_at": str(saved.created_at)
    }

@router.post("/scheme", status_code=201)
async def upload_scheme(
    assignment_id: int = Form(...),
    scheme_file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can upload marking schemes")

    # Verify assignment belongs to this teacher
    assignments = db_service.query(Assignment, {"assignment_id": assignment_id, "teacher_id": current_user["user_id"]})
    if not assignments:
        raise HTTPException(status_code=404, detail="Assignment not found")

    # Save scheme file
    scheme_filename = f"scheme_{assignment_id}_{scheme_file.filename}"
    scheme_path = os.path.join(UPLOAD_DIR, scheme_filename)
    with open(scheme_path, "wb") as f:
        shutil.copyfileobj(scheme_file.file, f)

    # Save marking scheme record
    scheme = MarkingScheme(
        file_path=scheme_path,
        uploaded_by=current_user["user_id"]
    )
    saved_scheme = db_service.save(scheme)

    # Link scheme to assignment
    session = db_service.get_session()
    try:
        assignment = session.query(Assignment).filter(
            Assignment.assignment_id == assignment_id
        ).first()
        assignment.scheme_id = saved_scheme.scheme_id
        session.commit()
    finally:
        session.close()

    return {
        "scheme_id": saved_scheme.scheme_id,
        "assignment_id": assignment_id
    }

@router.post("/sheet", status_code=202)
async def upload_sheet(
    assignment_id: int = Form(...),
    answer_file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students can upload answer sheets")

    # Verify assignment exists
    assignments = db_service.query(Assignment, {"assignment_id": assignment_id})
    if not assignments:
        raise HTTPException(status_code=404, detail="Assignment not found")

    assignment = assignments[0]

    # Check scheme is uploaded
    if not assignment.scheme_id:
        raise HTTPException(status_code=400, detail="Teacher has not uploaded marking scheme yet")

    # Save answer file
    answer_filename = f"sheet_{assignment_id}_{current_user['user_id']}_{answer_file.filename}"
    answer_path = os.path.join(UPLOAD_DIR, answer_filename)
    with open(answer_path, "wb") as f:
        shutil.copyfileobj(answer_file.file, f)

    # Get scheme file path
    schemes = db_service.query(MarkingScheme, {"scheme_id": assignment.scheme_id})
    scheme_path = schemes[0].file_path

    # Create submission
    submission = Submission(
        user_id=current_user["user_id"],
        assignment_id=assignment_id,
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
        assignment.scheme_id,
        "student"
    )

    return {
        "submission_id": saved_submission.submission_id,
        "status": "pending"
    }