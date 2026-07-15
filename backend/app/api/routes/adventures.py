from typing import Annotated
from uuid import UUID
from datetime import date

from fastapi import APIRouter, HTTPException, Query, Response, status

from app.api.dependencies import CurrentUser, DatabaseSession
from app.models.adventure import Adventure
from app.models.enums import AdventureCategory, AdventureStatus
from app.schemas.adventure import AdventureCreate, AdventureListResponse, AdventureRead, AdventureUpdate
from app.services.adventures import create_adventure, delete_adventure, get_owned_adventure, list_owned_adventures, update_adventure

router = APIRouter(prefix="/adventures", tags=["Adventures"])

def require_owned_adventure(db: DatabaseSession, *, adventure_id: UUID, user_id: UUID) -> Adventure:
    adventure = get_owned_adventure(db, adventure_id=adventure_id, user_id=user_id)

    if adventure is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Adventure not found.")
    
    return adventure

@router.post("", response_model=AdventureRead, status_code=status.HTTP_201_CREATED)
def create_current_user_adventure(payload: AdventureCreate, db: DatabaseSession, current_user: CurrentUser) -> Adventure:
    return create_adventure(db, user_id=current_user.id, payload=payload)

@router.get("", response_model=AdventureListResponse)
def list_current_user_adventures(
    db: DatabaseSession, 
    current_user: CurrentUser, 
    category: AdventureCategory | None = None, 
    adventure_status: Annotated[AdventureStatus | None, Query(alias="status")] = None, 
    is_favorite: bool | None = None, 
    search: Annotated[str | None, Query(min_length=1, max_length=100)] = None,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20
    ) -> AdventureListResponse:
    items, total = list_owned_adventures(db, user_id=current_user.id, category=category, status=adventure_status, is_favorite=is_favorite, search=search, offset=offset, limit=limit)

    return AdventureListResponse(items=items, total=total, offset=offset, limit=limit)

@router.get("/{adventure_id}", response_model=AdventureRead)
def read_current_user_adventure(adventure_id: UUID, db: DatabaseSession, current_user: CurrentUser) -> Adventure:
    return require_owned_adventure(db, adventure_id=adventure_id, user_id=current_user.id)

@router.patch("/{adventure_id}", response_model=AdventureRead)
def update_current_user_adventure(adventure_id: UUID, payload: AdventureUpdate, db: DatabaseSession, current_user: CurrentUser) -> Adventure:
    adventure = require_owned_adventure(db, adventure_id=adventure_id, user_id=current_user.id)

    merged_status = (payload.status 
                     if payload.status is not None 
                     else adventure.status)
    
    merged_date = (
        payload.adventure_date
        if payload.adventure_date is not None
        else adventure.adventure_date
    )

    if(merged_status == AdventureStatus.COMPLETED and merged_date > date.today()):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="A completed adventure cannot be dated in the future.")
    
    payload_fields = payload.model_fields_set

    latitude = (
        payload.latitude
        if "latitude" in payload_fields
        else adventure.latitude
    )

    longitude = (
        payload.longitude
        if "longitude" in payload_fields
        else adventure.longitude
    )

    if(latitude is None) != (longitude is None):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Latitude and longitude must be provided together.")
    
    return update_adventure(db, adventure=adventure, payload=payload)

@router.delete("/{adventure_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_current_user_adventure(adventure_id: UUID, db: DatabaseSession, current_user: CurrentUser) -> Response:
    adventure = require_owned_adventure(db, adventure_id=adventure_id, user_id=current_user.id)

    delete_adventure(db, adventure=adventure)

    return Response(status_code=status.HTTP_204_NO_CONTENT)
