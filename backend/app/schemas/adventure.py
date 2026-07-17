from datetime import date, datetime
from decimal import Decimal
from pydoc import classname
from uuid import UUID
from decimal import Decimal, ROUND_HALF_UP

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from app.models import adventure

from app.models.enums import AdventureCategory, AdventureStatus


COORDINATE_PRECISION = Decimal("0.000001")

def normalize_coordinate(value: object) -> Decimal | None:
    if value is None:
        return None
    
    return Decimal(str(value)).quantize(COORDINATE_PRECISION, rounding=ROUND_HALF_UP)

class AdventurePhotoCreate(BaseModel):
    image_url: str = Field(min_length=1, max_length=2048)

class AdventurePhotoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    image_url: str
    position: int
    created_at: datetime
    updated_at: datetime

class AdventureBase(BaseModel):
    title: str = Field(min_length=3, max_length=80)

    description: str = Field(default="", max_length=600)

    category: AdventureCategory

    status: AdventureStatus = AdventureStatus.COMPLETED

    adventure_date: date

    location_name: str = Field(min_length=2, max_length=120)

    latitude: Decimal | None = Field(default=None, ge=Decimal("-90"), le=Decimal("90"))

    longitude: Decimal | None = Field(default=None, ge=Decimal("-180"), le=Decimal("180"))

    rating: int = Field(default=5, ge=1, le=5)

    is_favorite: bool = False

    @field_validator("title", "description", "location_name")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()

    @field_validator("latitude", "longitude", mode="before")
    @classmethod
    def round_coordinate(cls, value: object) -> Decimal | None:
        return normalize_coordinate(value)
    
    @model_validator(mode="after")
    def validate_coordinates(self) -> "AdventureBase":
        has_latitude = self.latitude is not None
        has_longitude = self.longitude is not None

        if has_latitude != has_longitude:
            raise ValueError("Latitude and longitude must be provided together.")
        
        return self
    
class AdventureCreate(AdventureBase):
    photos: list[AdventurePhotoCreate] = Field(default_factory=list, max_length=5)

    @model_validator(mode="after")
    def validate_date(self) -> "AdventureCreate":
        if(self.status == AdventureStatus.COMPLETED and self.adventure_date > date.today()):
            raise ValueError("A completed adventure cannot be dated in the future.")
        
        return self
    
class AdventureUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=80)

    description: str | None = Field(default=None, max_length=600)

    category: AdventureCategory | None = None
    status: AdventureStatus | None = None
    adventure_date: date | None = None

    location_name: str | None = Field(default=None, min_length=2, max_length=120)

    latitude: Decimal | None = Field(default=None, ge=Decimal("-90"), le=Decimal("90"), max_digits=9, decimal_places=6)

    longitude: Decimal | None = Field(default=None, ge=Decimal("-180"), le=Decimal("180"), max_digits=9, decimal_places=6)

    rating: int | None = Field(default=None, ge=1, le=5)

    is_favorite: bool | None = None

    photos: list[AdventurePhotoCreate] | None = Field(default=None, max_length=5)

    @field_validator("title", "description", "location_name")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        
        return value.strip()
    
    @field_validator("latitude", "longitude", mode="before")
    @classmethod
    def round_coordinate(cls, value: object) -> Decimal | None:
        return normalize_coordinate(value)
    
class AdventureRead(AdventureBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    photos: list[AdventurePhotoRead]
    created_at: datetime
    updated_at: datetime

class AdventureListResponse(BaseModel):
    items: list[AdventureRead]
    total: int
    offset: int
    limit: int