from fastapi import APIRouter, Depends
from routers.auth import get_current_user
router = APIRouter(prefix="/results")

@router.get("/exam/{id}")
async def get_exam_id(id: int, current_user = Depends(get_current_user)):
    pass

@router.get("/student/{id}")
async def get_exam_student(id: int, current_user = Depends(get_current_user)):
    pass

@router.get("/stats/{id}")
async def get_exam_stats(id: int, current_user = Depends(get_current_user)):
    pass

@router.get("/marksheet/{id}")
async def get_exam_marksheet(id: int, current_user = Depends(get_current_user)):
    pass