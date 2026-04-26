from fastapi import HTTPException
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated='auto')
load_dotenv()
JWT_SECRET = os.getenv("JWT_SECRET")

def hash_password(password):
    return pwd_context.hash(password)    

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_token(user_id, role):
    expiry = datetime.now(timezone.utc) + timedelta(hours=24)
    payload = {"user_id":user_id, "role":role, "exp":expiry}

    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def decode_token(token):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")