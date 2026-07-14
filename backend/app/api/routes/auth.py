from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.dependencies import DatabaseSession
from app.core.security import TokenDecodeError, create_access_token, create_refresh_token, decode_token, hash_password
from app.models.user import User
from app.schemas.token import RefreshTokenRequest, TokenPair
from app.schemas.user import UserCreate, UserRead
from app.services.auth import authenticate_user, get_user_by_email, get_user_by_username

router = APIRouter(prefix="/auth", tags=["Authentication"])

def build_token_pair(user: User) -> TokenPair:
    return TokenPair(access_token=create_access_token(user.id), refresh_token=create_refresh_token(user.id))

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate, db: DatabaseSession) -> User:
    if get_user_by_email(db, str(payload.email)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.")
    
    if get_user_by_username(db, payload.username):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This username is already taken.")
    
    user = User(email=str(payload.email), username=payload.username, display_name=payload.display_name, hashed_password=hash_password(payload.password))

    db.add(user)

    try: 
        db.commit()
    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email or username is already in use.") from exc
    
    db.refresh(user)

    return user

@router.post("/token", response_model=TokenPair)
def login_for_tokens(db: DatabaseSession, form_data: OAuth2PasswordRequestForm = Depends()) -> TokenPair:
    user = authenticate_user(db, login=form_data.username, password=form_data.password)

    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email, username, or password.", headers={"WWW-Authenticate": "Bearer"})
    
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This account is inactive.")
    
    return build_token_pair(user)

@router.post("/refresh", response_model=TokenPair)
def refresh_tokens(payload: RefreshTokenRequest, db: DatabaseSession) -> TokenPair:
    try:
        user_id = decode_token(payload.refresh_token, expected_type="refresh")
    except TokenDecodeError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token is invalid or expired.") from exc
    
    user = db.get(User, user_id)

    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token user no longer exists.")
    
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This account is inactive.")
    
    return build_token_pair(user)