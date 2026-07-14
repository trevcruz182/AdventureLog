from __future__ import annotations
from uuid import UUID, uuid4

from sqlalchemy import Boolean, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.mixins import TimestampMixin

class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)

    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)

    username: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)

    display_name: Mapped[str] = mapped_column(String(30), nullable=False)

    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")