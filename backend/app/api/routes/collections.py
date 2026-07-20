from uuid import UUID

from fastapi import APIRouter, HTTPException, Response, status

from app.api.dependencies import CurrentUser, DatabaseSession
from app.api.routes.adventures import require_owned_adventure
from app.models.collection import Collection
from app.schemas.collection import CollectionCreate, CollectionDetailRead, CollectionRead, CollectionUpdate
from app.services.collections import CollectionTitleConflictError, add_adventure_to_collection, create_collection, delete_collection, get_owned_collection, list_owned_collections, remove_adventure_from_collection, update_collection

router = APIRouter(prefix="/collections", tags=["Collections"])

def require_owned_collection(db: DatabaseSession, *, collection_id: UUID, user_id: UUID) -> Collection:
    collection = get_owned_collection(db, collection_id=collection_id, user_id=user_id)

    if collection is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found.")
    
    return collection

@router.post("", response_model=CollectionDetailRead, status_code=status.HTTP_201_CREATED)
def create_current_user_collection(payload: CollectionCreate, db: DatabaseSession, current_user: CurrentUser) -> Collection: 
    try: 
        return create_collection(db, user_id=current_user.id, payload=payload)
    except CollectionTitleConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    
@router.get("", response_model=list[CollectionRead])
def list_current_user_collections(db: DatabaseSession, current_user: CurrentUser) -> list[Collection]:
    return list_owned_collections(db, user_id=current_user.id)

@router.get("/{collection_id}", response_model=CollectionDetailRead)
def read_current_user_collection(collection_id: UUID, db: DatabaseSession, current_user: CurrentUser) -> Collection:
    return require_owned_collection(db, collection_id=collection_id, user_id=current_user.id)

@router.patch("/{collection_id}", response_model=CollectionDetailRead)
def update_current_user_collection(collection_id: UUID, payload: CollectionUpdate, db: DatabaseSession, current_user: CurrentUser) -> Collection:
    collection = require_owned_collection(db, collection_id=collection_id, user_id=current_user.id)

    try:
        return update_collection(db, collection=collection, payload=payload)
    except CollectionTitleConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    
@router.delete("/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_current_user_collection(collection_id: UUID, db: DatabaseSession, current_user: CurrentUser) -> Response:
    collection = require_owned_collection(db, collection_id=collection_id, user_id=current_user.id)

    delete_collection(db, collection=collection)

    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.post("/{collection_id}/adventures/{adventure_id}", response_model=CollectionDetailRead)
def add_current_user_adventure(collection_id: UUID, adventure_id: UUID, db: DatabaseSession, current_user: CurrentUser) -> Collection:
    collection = require_owned_collection(db, collection_id=collection_id, user_id=current_user.id)

    adventure = require_owned_adventure(db, adventure_id=adventure_id, user_id=current_user.id)

    return add_adventure_to_collection(db, collection=collection, adventure=adventure)

@router.delete("/{collection_id}/adventures/{adventure_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_current_user_adventure(collection_id: UUID, adventure_id: UUID, db: DatabaseSession, current_user: CurrentUser) -> Response:
    collection = require_owned_collection(db, collection_id=collection_id, user_id=current_user.id)

    adventure = require_owned_adventure(db, adventure_id=adventure_id, user_id=current_user.id)

    was_removed = remove_adventure_from_collection(db, collection=collection, adventure=adventure)

    if not was_removed:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Adventure is not in this collection.")
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)