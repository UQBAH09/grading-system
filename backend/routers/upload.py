from fastapi import APIRouter, UploadFile, File, Form, Depends
from routers.auth import get_current_user

router = APIRouter(prefix="/upload")

@router.post("/scheme", status_code=201)
async def upload_scheme(
    file: UploadFile = File(...),
    assignment_id: int = Form(...),
    current_user = Depends(get_current_user)
):
    pass

@router.post("/sheet", status_code=202)
async def upload_sheet(
    file: UploadFile = File(...),
    assignment_id: int = Form(...),
    current_user = Depends(get_current_user)
):
    pass