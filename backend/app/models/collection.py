from __future__ import annotations

from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import CheckConstraint, Column, ForeignKey, ForeignKey, Index, String, Table, Text, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.adventure import Adventure
    from app.models.user import User

collection_adventures = Table(
    "collection_adventures",
    Base.metadata,
    Column(
        "collection_id",
        Uuid,
        ForeignKey("collections.id", ondelete="CASCADE"),
        primary_key=True
    ),
    Column(
        "adventure_id",
        Uuid,
        ForeignKey("adventures.id", ondelete="CASCADE"),
        primary_key=True
    ),
    Index("ix_collection_adventures_adventure_id", "adventure_id")
)

class Collection(TimestampMixin, Base):
    __tablename__ = "collections"

    __table_args__ = (
        CheckConstraint(
            "target_count >= 1 AND target_count <= 100",
            name="ck_collections_target_count_range"
        ),
        UniqueConstraint("user_id", "title", name="uq_collections_user_title"),
        Index("ix_collections_user_created", "user_id", "created_at")
    )

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)

    user_id: Mapped[UUID] = mapped_column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title: Mapped[str] = mapped_column(String(60), nullable=False)

    description: Mapped[str] = mapped_column(Text, nullable=False, default="", server_default="")

    icon: Mapped[str] = mapped_column(String(40), nullable=False, default="map-outline", server_default="map-outline")

    target_count: Mapped[int] = mapped_column(nullable=False, default=5, server_default="5")

    user: Mapped["User"] = relationship(back_populates="collections")

    adventures: Mapped[list["Adventure"]] = relationship(secondary=collection_adventures, back_populates="collections")

    @property
    def adventure_count(self) -> int:
        return len(self.adventures)