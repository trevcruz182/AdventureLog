from fastapi.testclient import TestClient

from app.core.config import settings

def test_health_endpoint(client: TestClient) -> None:
    response = client.get(f"{settings.api_v1_prefix}/health")

    assert response.status_code == 200

    assert response.json() == {
        "status": "ok",
        "service": settings.app_name,
        "environment": settings.app_env
    }

def test_database_health_endpoint(client: TestClient) -> None:
    response = client.get(f"{settings.api_v1_prefix}/health/database")

    assert response.status_code == 200

    assert response.json() == {
        "status": "ok",
        "database": "connected"
    }