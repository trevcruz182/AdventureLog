from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import TokenDecodeError, decode_token
from app.db.session import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.api_v1_prefix}/auth/token")

DatabaseSession = Annotated[Session, Depends(get_db)]

AccessToken = Annotated[str, Depends(oauth2_scheme)]

def get_current_user(db: DatabaseSession, token: AccessToken) -> User:
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials.", headers={"WWW-Authenicate": "Bearer"})

    try:
        user_id = decode_token(token, expected_type="access")
    except TokenDecodeError as exc:
        raise credentials_exception from exc
    
    user = db.get(User, user_id)

    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This account is inactive.")
    
    return user

CurrentUser = Annotated[User, Depends(get_current_user)]