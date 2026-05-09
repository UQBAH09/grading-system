from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Optional
from services.auth_service import AuthService
from services.db_service import DBService
from models.user import User
from models.teacher import Teacher
from models.student import Student
from models.personal import Personal

router = APIRouter(prefix="/auth")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
auth_service = AuthService()
db_service = DBService()

class LoginRequest(BaseModel):
    username: str
    password: str

class SignupRequest(BaseModel):
    username: str
    password: str
    name: str
    role: str  # 'teacher', 'student', 'personal'
    teacher_username: Optional[str] = None  # only required for students

async def get_current_user(token: str = Depends(oauth2_scheme)):
    return auth_service.decode_token(token)

@router.post("/login")
async def login(request: LoginRequest):
    users = db_service.query(User, {"username": request.username})

    if not users:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    user = users[0]

    if not auth_service.verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = auth_service.create_token(user.user_id, user.role)

    return {
        "token": token,
        "role": user.role,
        "user_id": user.user_id,
        "name": user.name
    }

@router.post("/signup", status_code=201)
async def signup(request: SignupRequest):
    # Validate role
    if request.role not in ["teacher", "student", "personal"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be teacher, student, or personal")

    # Check username is not already taken
    existing = db_service.query(User, {"username": request.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")

    # If student, validate teacher username
    teacher_id = None
    if request.role == "student":
        if not request.teacher_username:
            raise HTTPException(status_code=400, detail="Teacher username is required for students")

        teacher_users = db_service.query(User, {"username": request.teacher_username, "role": "teacher"})
        if not teacher_users:
            raise HTTPException(status_code=404, detail="Teacher not found")

        teachers = db_service.query(Teacher, {"user_id": teacher_users[0].user_id})
        if not teachers:
            raise HTTPException(status_code=404, detail="Teacher profile not found")

        teacher_id = teachers[0].teacher_id

    # Create user
    user = User(
        username=request.username,
        password_hash=auth_service.hash_password(request.password),
        role=request.role,
        name=request.name
    )
    saved_user = db_service.save(user)

    # Create role profile
    if request.role == "teacher":
        profile = Teacher(user_id=saved_user.user_id)
        db_service.save(profile)

    elif request.role == "student":
        profile = Student(
            user_id=saved_user.user_id,
            teacher_id=teacher_id
        )
        db_service.save(profile)

    elif request.role == "personal":
        profile = Personal(user_id=saved_user.user_id)
        db_service.save(profile)

    # Auto login after signup
    token = auth_service.create_token(saved_user.user_id, saved_user.role)

    return {
        "token": token,
        "role": saved_user.role,
        "user_id": saved_user.user_id,
        "name": saved_user.name
    }

@router.get("/me")
async def me(current_user = Depends(get_current_user)):
    return current_user