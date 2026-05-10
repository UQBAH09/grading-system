from fastapi import APIRouter, Depends
from routers.auth import get_current_user

router = APIRouter(prefix="/upload")

@router.post("/scheme", status_code=201)
async def upload_scheme(current_user = Depends(get_current_user)):
    pass

@router.post("/sheet", status_code=202)
async def upload_sheet(current_user = Depends(get_current_user)):
    pass