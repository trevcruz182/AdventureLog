from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.adventure import AdventureRead

CollectionIcon = Literal[
    "map-outline",
    "leaf-outline",
    "snow-outline",
    "restaurant-outline",
    "trophy-outline",
    "airplane-outline",
    "camera-outline",
    "compass-outline",
]

class CollectionBase(BaseModel):
    title: str = Field(min_length=2, max_length=60)

    description: str = Field(default="", max_length=300)

    icon: CollectionIcon = "map-outline"

    target_count: int = Field(default=5, ge=1, le=100)

    @field_validator("title", "description")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()
    
class CollectionCreate(CollectionBase):
    pass

class CollectionUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=60)

    description: str | None = Field(default=None, max_length=300)

    icon: CollectionIcon | None = None

    target_count: int | None = Field(default=None, ge=1, le=100)

    @field_validator("title", "description")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        
        return value.strip()
    
class CollectionRead(CollectionBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    adventure_count: int
    created_at: datetime
    updated_at: datetime

class CollectionDetailRead(CollectionRead):
    adventures: list[AdventureRead]