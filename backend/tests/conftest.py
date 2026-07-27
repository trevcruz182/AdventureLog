from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

import app.models
from app.db.base import Base
from app.db.session import get_db
from app.main import app

test_engine = create_engine("sqlite+pysqlite:///:memory:", connect_args={
    "check_same_thread": False,
}, poolclass=StaticPool)

TestingSessionLocal = sessionmaker(bind=test_engine, class_=Session, autoflush=False, expire_on_commit=False)

@pytest.fixture(autouse=True)
def reset_test_database() -> Generator[None, None, None]:
    Base.metadata.create_all(bind=test_engine)

    yield

    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture
def db_session() -> Generator[Session, None, None]:
    session = TestingSessionLocal()

    try:
        yield session
    finally:
        session.close()

@pytest.fixture
def client(db_session: Session) -> Generator[TestClient, None, None]:
    def override_get_db() -> Generator[Session, None, None]:
        yield db_session

    app.dependency_overrides[get_db] = (override_get_db)

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()