from fastapi.testclient import TestClient
from app.api.routes.auth import refresh_tokens

from app.core.config import settings

REGISTER_PAYLOAD = {
    "email": "explorer@example.com",
    "username": "trail_explorer",
    "display_name": "Trail Explorer",
    "password": "Adventure123"
}

def register_user(client: TestClient) -> dict[str, object]:
    response = client.post(f"{settings.api_v1_prefix}/auth/register", json=REGISTER_PAYLOAD)

    assert response.status_code == 201

    return response.json()

def login_user(client: TestClient, *, password: str = "Adventure123") -> dict[str, str]:
    response = client.post(f"{settings.api_v1_prefix}/auth/token", data={
        "username": REGISTER_PAYLOAD["email"],
        "password": password
    })

    assert response.status_code == 200

    return response.json()

def test_register_user(client: TestClient) -> None:
    user = register_user(client)

    assert user["email"] == REGISTER_PAYLOAD["email"]

    assert user["username"] == REGISTER_PAYLOAD["username"]

    assert user["display_name"] == REGISTER_PAYLOAD["display_name"]

    assert user["is_active"] is True
    assert "id" in user
    assert "hashed_password" not in user

def test_duplicate_email_is_rejected(client: TestClient) -> None:
    register_user(client)

    duplicate_response = client.post(f"{settings.api_v1_prefix}/auth/register", json={
        **REGISTER_PAYLOAD,
        "username": "another_explorer"
    })

    assert duplicate_response.status_code == 409

    assert duplicate_response.json() == {
        "detail": "An account with this email already exists."
    }

def test_valid_login_returns_tokens(client: TestClient) -> None:
    register_user(client)

    tokens = login_user(client)

    assert tokens["token_type"] == "bearer"
    assert tokens["access_token"]
    assert tokens["refresh_token"]

def test_invalid_password_is_rejected(client: TestClient) -> None:
    register_user(client)

    response = client.post(f"{settings.api_v1_prefix}/auth/token", data={
        "username": REGISTER_PAYLOAD["email"],
        "password": "WrongPassword123"
    })

    assert response.status_code == 401

    assert response.json() == {
        "detail": "Incorrect email, username, or password."
    }

def test_protected_route_requires_token(client: TestClient) -> None:
    response = client.get(f"{settings.api_v1_prefix}/users/me")

    assert response.status_code == 401

def test_access_token_returns_current_user(client: TestClient) -> None:
    registered_user = register_user(client)
    tokens = login_user(client)

    response = client.get(f"{settings.api_v1_prefix}/users/me", headers={
        "Authorization": f"Bearer {tokens["access_token"]}"
    })

    assert response.status_code == 200

    current_user = response.json()

    assert current_user["id"] == registered_user["id"]

    assert current_user["email"] == registered_user["email"]

def test_refresh_token_returns_new_tokens(client: TestClient) -> None:
    register_user(client)
    original_tokens = login_user(client)

    response = client.post(f"{settings.api_v1_prefix}/auth/refresh", json={
        "refresh_token": original_tokens["refresh_token"]
    })

    assert response.status_code == 200

    refreshed_tokens = response.json()

    assert refreshed_tokens["token_type"] == "bearer"

    assert refreshed_tokens["access_token"]
    assert refreshed_tokens["refresh_token"]

    assert refreshed_tokens["access_token"] != original_tokens["access_token"]