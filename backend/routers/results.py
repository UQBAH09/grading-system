from fastapi import APIRouter, Depends, HTTPException
from routers.auth import get_current_user
from services.db_service import DBService
from models.submission import Submission
from models.assignment import Assignment
from models.answer_part import AnswerPart
from models.grading_result import GradingResult
from models.question import Question
from models.teacher_students import TeacherStudent
from models.user import User
import csv
import io
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/results")
db_service = DBService()

@router.get("/assignments")
async def get_assignments(current_user = Depends(get_current_user)):
    role = current_user["role"]
    user_id = current_user["user_id"]

    if role == "teacher":
        assignments = db_service.query(Assignment, {"teacher_id": user_id})
    elif role == "student":
        # Get teacher_id for this student
        session = db_service.get_session()
        try:
            from sqlalchemy import select
            links = session.query(TeacherStudent).filter(
                TeacherStudent.student_id == user_id
            ).all()
            teacher_ids = [l.teacher_id for l in links]
            assignments = []
            for tid in teacher_ids:
                assignments += db_service.query(Assignment, {"teacher_id": tid})
        finally:
            session.close()
    else:
        assignments = []

    return {
        "assignments": [
            {
                "assignment_id": a.assignment_id,
                "title": a.title,
                "created_at": str(a.created_at),
                "has_scheme": a.scheme_id is not None
            }
            for a in assignments
        ]
    }

@router.get("/submission/{id}")
async def get_submission_results(id: int, current_user = Depends(get_current_user)):
    submissions = db_service.query(Submission, {"submission_id": id})
    if not submissions:
        raise HTTPException(status_code=404, detail="Submission not found")

    submission = submissions[0]

    if submission.status != "done":
        raise HTTPException(status_code=400, detail=f"Grading not complete. Status: {submission.status}")

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

@router.get("/stats/{assignment_id}")
async def get_stats(assignment_id: int, current_user = Depends(get_current_user)):
    # Get all submissions for this assignment
    submissions = db_service.query(Submission, {"assignment_id": assignment_id})
    done_submissions = [s for s in submissions if s.status == "done"]

    if not done_submissions:
        return {"assignment_id": assignment_id, "average": 0, "highest": 0, "lowest": 0, "total_students": 0, "students": []}

    student_scores = []
    for sub in done_submissions:
        parts = db_service.query(AnswerPart, {"submission_id": sub.submission_id})
        total = 0
        for part in parts:
            grading = db_service.query(GradingResult, {"part_id": part.part_id})
            if grading:
                total += grading[0].marks_awarded

        users = db_service.query(User, {"user_id": sub.user_id})
        student_name = users[0].name if users else "Unknown"

        student_scores.append({
            "submission_id": sub.submission_id,
            "student_name": student_name,
            "total_marks": total
        })

    scores = [s["total_marks"] for s in student_scores]

    return {
        "assignment_id": assignment_id,
        "total_students": len(student_scores),
        "average": round(sum(scores) / len(scores), 1),
        "highest": max(scores),
        "lowest": min(scores),
        "students": student_scores
    }

@router.get("/marksheet/{assignment_id}")
async def get_marksheet(assignment_id: int, current_user = Depends(get_current_user)):
    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can download mark sheets")

    submissions = db_service.query(Submission, {"assignment_id": assignment_id})
    done_submissions = [s for s in submissions if s.status == "done"]

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Student Name", "Total Marks"])

    for sub in done_submissions:
        parts = db_service.query(AnswerPart, {"submission_id": sub.submission_id})
        total = 0
        for part in parts:
            grading = db_service.query(GradingResult, {"part_id": part.part_id})
            if grading:
                total += grading[0].marks_awarded

        users = db_service.query(User, {"user_id": sub.user_id})
        name = users[0].name if users else "Unknown"
        writer.writerow([name, total])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=marksheet_{assignment_id}.csv"}
    )

@router.get("/my-submissions")
async def get_my_submissions(current_user = Depends(get_current_user)):
    user_id = current_user["user_id"]
    submissions = db_service.query(Submission, {"user_id": user_id})
    
    result = []
    for s in submissions:
        assignment_title = ""
        if s.assignment_id:
            assignments = db_service.query(Assignment, {"assignment_id": s.assignment_id})
            if assignments:
                assignment_title = assignments[0].title
        
        result.append({
            "submission_id": s.submission_id,
            "assignment_id": s.assignment_id,
            "assignment_title": assignment_title,
            "status": s.status,
            "submitted_at": str(s.submitted_at)
        })
    
    return {"submissions": result}