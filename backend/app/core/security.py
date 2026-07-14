from datetime import datetime, timedelta, timezone
from typing import Literal
from uuid import UUID, uuid4

import jwt
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash

from app.core.config import settings

password_hash = PasswordHash.recommended()

TokenType = Literal["access", "refresh"]

class TokenDecodeError(Exception):
    pass

def hash_password(password: str) -> str:
    return password_hash.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hash.verify(plain_password, hashed_password)

def create_token(*, user_id: UUID, token_type: TokenType, expires_delta: timedelta) -> str:
    now = datetime.now(timezone.utc)
    expires_at = now + expires_delta

    payload = {
        "sub": str(user_id),
        "type": token_type,
        "iat": now,
        "exp": expires_at,
        "jti": str(uuid4())
    }

    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)

def create_access_token(user_id: UUID) -> str:
    return create_token(user_id=user_id, token_type="access", expires_delta=timedelta(minutes=settings.access_token_expire_minutes))

def create_refresh_token(user_id: UUID) -> str:
    return create_token(user_id=user_id, token_type="refresh", expires_delta=timedelta(days=settings.refresh_token_expire_days))

def decode_token(token: str, *, expected_type: TokenType) -> UUID:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm], options={
            "require": ["sub", "type", "iat", "exp", "jti"]
        })
    except InvalidTokenError as exc:
        raise TokenDecodeError("Token could not be validated.") from exc
    
    if payload.get("type") != expected_type:
        raise TokenDecodeError("Incorrect token type.")
    
    subject = payload.get("sub")

    try:
        return UUID(subject)
    except (TypeError, ValueError) as exc:
        raise TokenDecodeError("Token subject is invalid.") from exc