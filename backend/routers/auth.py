from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

router = APIRouter(prefix="/auth")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
class Login(BaseModel):
    username: str
    password: str

async def get_current_user(token: str = Depends(oauth2_scheme)):
    from services.auth_service import decode_token
    return decode_token(token)

@router.post("/login")
async def login(request: Login):
    pass

@router.get("/me")
async def me(current_user = Depends(get_current_user)):
    return current_user