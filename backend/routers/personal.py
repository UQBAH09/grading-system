from fastapi import APIRouter, Depends, UploadFile, File
from routers.auth import get_current_user

router = APIRouter(prefix="/personal")

@router.post("/submit", status_code=202)
async def submit(
    answer_file: UploadFile = File(...),
    scheme_file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    pass

@router.get("/status/{id}")
async def get_status(id: int, current_user = Depends(get_current_user)):
    pass

@router.get("/results/{id}")
async def get_result(id: int, current_user = Depends(get_current_user)):
    pass