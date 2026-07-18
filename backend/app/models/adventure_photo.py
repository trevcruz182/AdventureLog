from __future__ import annotations
# from turtle import position

from uuid import UUID, uuid4

from sqlalchemy import CheckConstraint, ForeignKey, Index, String, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin

class AdventurePhoto(TimestampMixin, Base):
    __tablename__ = "adventure_photos"

    __table_args__ = (
        CheckConstraint("position >= 0 AND position <= 4", name="ck_adventure_photos_position_range"),
        UniqueConstraint("adventure_id", "position", name="uq_adventure_photos_adventure_position"),
        Index("ix_adventure_photos_adventure_id", "adventure_id")
    )

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)

    adventure_id: Mapped[UUID] = mapped_column(Uuid, ForeignKey("adventures.id", ondelete="CASCADE"), nullable=False)

    image_url: Mapped[str] = mapped_column(String(2048), nullable=False)

    public_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)

    position: Mapped[int] = mapped_column(nullable=False)

    adventure: Mapped["Adventure"] = relationship(back_populates="photos")