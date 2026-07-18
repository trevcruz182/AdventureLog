from uuid import UUID

from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session, selectinload
from sqlalchemy.exc import SQLAlchemyError

from app.models.adventure import Adventure
from app.models.adventure_photo import AdventurePhoto
from app.models.enums import AdventureCategory, AdventureStatus
from app.schemas.adventure import AdventureCreate, AdventureUpdate, AdventurePhotoCreate
from app.services.media import MediaDeleteError, delete_adventure_image

def get_owned_adventure(db: Session, *, adventure_id: UUID, user_id: UUID) -> Adventure | None:
    statement = select(Adventure).options(selectinload(Adventure.photos)).where(Adventure.id == adventure_id, Adventure.user_id == user_id)

    return db.scalar(statement)

def apply_adventure_filters(statement: Select[tuple[Adventure]], *, user_id: UUID, category: AdventureCategory | None, status: AdventureStatus | None, is_favorite: bool | None, search: str | None) -> Select[tuple[Adventure]]:
    statement = statement.where(Adventure.user_id == user_id)

    if category is not None:
        statement = statement.where(Adventure.category == category)

    if status is not None:
        statement = statement.where(Adventure.status == status)

    if is_favorite is not None:
        statement = statement.where(Adventure.is_favorite == is_favorite)


    if search:
        normalized_search = search.strip()

        if normalized_search:
            search_pattern = f"%{normalized_search}%"

            statement = statement.where(
                or_(Adventure.title.ilike(search_pattern),
                    Adventure.location_name.ilike(search_pattern),
                    Adventure.description.ilike(search_pattern))
            )

    return statement

def list_owned_adventures(db: Session, *, user_id: UUID, category: AdventureCategory | None, status: AdventureStatus | None, is_favorite: bool | None, search: str | None, offset: int, limit: int) -> tuple[list[Adventure], int]:
    item_statement = apply_adventure_filters(
        select(Adventure).options(selectinload(Adventure.photos)), 
        user_id=user_id,
        category=category,
        status=status,
        is_favorite=is_favorite,
        search=search
        )
    
    item_statement = item_statement.order_by(Adventure.adventure_date.desc(), Adventure.created_at.desc()).offset(offset).limit(limit)

    items = list(db.scalars(item_statement).all())

    count_statement = apply_adventure_filters(
        select(Adventure),
        user_id=user_id,
        category=category,
        status=status,
        is_favorite=is_favorite,
        search=search
    ).with_only_columns(func.count(Adventure.id)).order_by(None)

    total = db.scalar(count_statement) or 0

    return items, total

def replace_adventure_photos(db: Session, adventure: Adventure, photos: list[AdventurePhotoCreate]) -> None:
    for exisiting_photo in list(adventure.photos):
        db.delete(exisiting_photo)

    db.flush()

    adventure.photos = [
        AdventurePhoto(image_url=photo.image_url, public_id=photo.public_id, position=position)
            for position, photo in enumerate(photos)
    ]

def create_adventure(db: Session, *, user_id: UUID, payload: AdventureCreate) -> Adventure:
    adventure_data = payload.model_dump(exclude={"photos"})

    adventure = Adventure(user_id=user_id, **adventure_data)

    replace_adventure_photos(db, adventure, payload.photos)

    db.add(adventure)
    db.commit()
    db.refresh(adventure)

    return get_owned_adventure(db, adventure_id=adventure.id, user_id=user_id) or adventure

def update_adventure(db: Session, *, adventure: Adventure, payload: AdventureUpdate) -> Adventure:
    update_data = payload.model_dump(exclude_unset=True, exclude={"photos"})

    old_public_ids: list[str] = []

    if "photos" in payload.model_fields_set:
        old_public_ids = [photo.public_id for photo in adventure.photos]

        # replace_adventure_photos(db, adventure, payload.photos or [])

    for field_name, value in update_data.items():
        setattr(adventure, field_name, value)

    try:
        if "photos" in payload.model_fields_set:
            replace_adventure_photos(db, adventure, payload.photos or [])

        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise

    if "photos" in payload.model_fields_set:
        new_public_ids = {
            photo.public_id for photo in payload.photos or []
        }

        for public_id in old_public_ids:
            if public_id in new_public_ids:
                continue

            try: 
                delete_adventure_image(public_id=public_id, user_id=adventure.user_id)
            except MediaDeleteError:
                continue
    
    
    db.refresh(adventure)

    return get_owned_adventure(db, adventure_id=adventure.id, user_id=adventure.user_id) or adventure

def delete_adventure(db: Session, *, adventure: Adventure) -> None:
    public_ids = [photo.public_id for photo in adventure.photos]

    user_id = adventure.user_id
    
    db.delete(adventure)
    db.commit()

    for public_id in public_ids:
        try:
            delete_adventure_image(public_id=public_id, user_id=user_id)
        except MediaDeleteError:
            # The database deletion succeeded already.
            # A future cleanup job will retry failed media deletion soon
            continue