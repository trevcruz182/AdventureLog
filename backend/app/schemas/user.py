import re
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

USERNAME_PATTERN = re.compile(r"^[a-zA-Z0-9_]+$")

class UserCreate(BaseModel):
    email: EmailStr

    username: str = Field(min_length=3, max_length=30)

    display_name: str = Field(min_length=1, max_length=80)

    password: str = Field(min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).strip().lower()
    
    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        normalized = value.strip().lower()

        if not USERNAME_PATTERN.fullmatch(normalized):
            raise ValueError("Username may contain only letters, numbers, and underscores.")
        
        return normalized
    
    @field_validator("display_name")
    @classmethod
    def normalize_display_name(cls, value: str) -> str:
        return value.strip()
    
    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not any(character.isalpha() for character in value):
            raise ValueError("Password must contain at least one letter.")
        
        if not any(character.isdigit() for character in value):
            raise ValueError("Password must contain at least one number.")
        
        return value
    
class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    username: str
    display_name: str
    is_active: bool
    created_at: datetime
    updated_at: datetime