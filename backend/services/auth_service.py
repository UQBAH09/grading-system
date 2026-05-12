from fastapi import HTTPException
from jose import jwt
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import hashlib
import hmac
import os

load_dotenv()
JWT_SECRET = os.getenv("JWT_SECRET")

class AuthService:
    def hash_password(self, password: str) -> str:
        import hashlib, os
        salt = os.urandom(32)
        key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
        return salt.hex() + ':' + key.hex()

    def verify_password(self, plain_password: str, stored_hash: str) -> bool:
        try:
            salt_hex, key_hex = stored_hash.split(':')
            salt = bytes.fromhex(salt_hex)
            key = bytes.fromhex(key_hex)
            new_key = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt, 100000)
            return hmac.compare_digest(key, new_key)
        except Exception:
            return False

    def create_token(self, user_id: int, role: str) -> str:
        expiry = datetime.now(timezone.utc) + timedelta(hours=24)
        payload = {"user_id": user_id, "role": role, "exp": expiry}
        return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

    def decode_token(self, token: str) -> dict:
        try:
            return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid or expired token")