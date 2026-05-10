from fastapi import APIRouter, Depends, HTTPException
from routers.auth import get_current_user
from services.db_service import DBService
from models.submission import Submission

router = APIRouter(prefix="/grade")
db_service = DBService()

@router.get("/status/{id}")
async def get_status(id: int, current_user = Depends(get_current_user)):
    submissions = db_service.query(Submission, {"submission_id": id})
    if not submissions:
        raise HTTPException(status_code=404, detail="Submission not found")

    return {
        "submission_id": id,
        "status": submissions[0].status
    }