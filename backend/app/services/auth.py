from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.security import verify_password
from app.models.user import User

def get_user_by_email(db: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email.strip().lower())

    return db.scalar(statement)

def get_user_by_username(db: Session, username: str) -> User | None:
    statement = select(User).where(User.username == username.strip().lower())

    return db.scalar(statement)

def get_user_by_login(db: Session, login: str) -> User | None:
    normalized_login = login.strip().lower()

    statement = select(User).where(or_(User.email == normalized_login, User.username == normalized_login))

    return db.scalar(statement)

def authenticate_user(db: Session, login: str, password: str) -> User | None:
    user = get_user_by_login(db, login)

    if user is None: 
        return None
    
    if not verify_password(password, user.hashed_password):
        return None
    
    return user