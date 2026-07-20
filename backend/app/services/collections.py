from uuid import UUID

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.models.adventure import Adventure
from app.models.collection import Collection
from app.schemas.collection import CollectionCreate, CollectionUpdate

class CollectionTitleConflictError(Exception):
    pass

def collection_load_options():
    return selectinload(Collection.adventures).selectinload(Adventure.photos)

def get_owned_collection(db: Session, *, collection_id: UUID, user_id: UUID) -> Collection | None:
    statement = select(Collection).where(Collection.id == collection_id, Collection.user_id == user_id).options(collection_load_options())

    return db.scalar(statement)

def list_owned_collections(db: Session, *, user_id: UUID) -> list[Collection]:
    statement = select(Collection).where(Collection.user_id == user_id).options(collection_load_options()).order_by(Collection.created_at.desc())

    return list(db.scalars(statement).all())

def create_collection(db: Session, *, user_id: UUID, payload: CollectionCreate) -> Collection:
    collection = Collection(user_id=user_id, **payload.model_dump())

    db.add(collection)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()

        raise CollectionTitleConflictError("You already have a collection with this title.") from exc
    
    return get_owned_collection(db, collection_id=collection.id, user_id=user_id) or collection

def update_collection(db: Session, *, collection: Collection, payload: CollectionUpdate) -> Collection:
    update_data = payload.model_dump(exclude_unset=True)

    for field_name, value in update_data.items():
        setattr(collection, field_name, value)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()

        raise CollectionTitleConflictError("You already have a collection with this title.") from exc
    
    return get_owned_collection(db, collection_id=collection.id, user_id=collection.user_id) or collection

def delete_collection(db: Session, *, collection: Collection) -> None:
    db.delete(collection)
    db.commit()

def add_adventure_to_collection(db: Session, *, collection: Collection, adventure: Adventure) -> Collection:
    already_added = any(existing_adventure.id == adventure.id for existing_adventure in collection.adventures)

    if not already_added:
        collection.adventures.append(adventure)

        db.commit()

    return get_owned_collection(db, collection_id=collection.id, user_id=collection.user_id) or collection

def remove_adventure_from_collection(db: Session, *, collection: Collection, adventure: Adventure) -> bool: 
    matching_adventure = next(
        (existing_adventure for existing_adventure in collection.adventures if existing_adventure.id == adventure.id), None)
    
    if matching_adventure is None:
        return False
    
    collection.adventures.remove(matching_adventure)

    db.commit()

    return True