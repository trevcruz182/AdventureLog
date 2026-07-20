from __future__ import annotations
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.collection import Collection

from datetime import date
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import Boolean, CheckConstraint, Date, Enum, ForeignKey, ForeignKey, Index, Numeric, String, Text, Uuid, true
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import AdventureCategory, AdventureStatus
from app.models.mixins import TimestampMixin
from app.models.collection import collection_adventures

class Adventure(TimestampMixin, Base):
    __tablename__ = "adventures"

    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="ck_adventures_rating_range"),
        CheckConstraint(
            ("(latitude IS NULL AND longitude IS NULL) " 
             "OR " 
             "(latitude IS NOT NULL AND longitude IS NOT NULL)"), name="ck_adventures_coordinates_pair"),
        CheckConstraint("latitude IS NULL OR latitude BETWEEN -90 AND 90", name="ck_adventures_latitude_range"),
        CheckConstraint("longitude IS NULL OR longitude BETWEEN -180 AND 180", name="ck_adventures_longitude_range"),
        Index("ix_adventures_user_date", "user_id", "adventure_date"),
        Index("ix_adventures_user_category", "user_id", "category")
    )

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)

    user_id: Mapped[UUID] = mapped_column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title: Mapped[str] = mapped_column(String(80), nullable=False)

    description: Mapped[str] = mapped_column(Text, nullable=False, default="", server_default="")

    category: Mapped[AdventureCategory] = mapped_column(Enum(AdventureCategory, name="adventure_category", values_callable=lambda enum: [item.value for item in enum]), nullable=False)

    status: Mapped[AdventureStatus] = mapped_column(Enum(AdventureStatus, name="adventure_status", values_callable=lambda enum: [item.value for item in enum]), nullable=False, default=AdventureStatus.COMPLETED, server_default=AdventureStatus.COMPLETED.value)

    adventure_date: Mapped[date] = mapped_column(Date, nullable=False)

    location_name: Mapped[str] = mapped_column(String(120), nullable=False)

    latitude: Mapped[Decimal | None] = mapped_column(Numeric(precision=9, scale=6), nullable=True)

    longitude: Mapped[Decimal | None] = mapped_column(Numeric(precision=9, scale=6), nullable=True)

    rating: Mapped[int] = mapped_column(nullable=False, default=5, server_default="5")

    is_favorite: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")

    user: Mapped["User"] = relationship(back_populates="adventures")

    photos: Mapped[list["AdventurePhoto"]] = relationship(back_populates="adventure", cascade="all, delete-orphan", passive_deletes=True, order_by="AdventurePhoto.position")

    collections: Mapped[list["Collection"]] = relationship(secondary=collection_adventures, back_populates="adventures")