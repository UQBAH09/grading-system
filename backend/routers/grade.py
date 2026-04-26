from fastapi import APIRouter, UploadFile, Depends
from routers.auth import get_current_user

router = APIRouter(prefix="/grade")

@router.get("/status/{id}")
async def get_status(id: int, current_user = Depends(get_current_user)):
    pass