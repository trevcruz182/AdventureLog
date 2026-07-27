from fastapi.testclient import TestClient

from app.core.config import settings


ADVENTURE_PAYLOAD = {
    "title": "Bear Mountain Sunset",
    "description": "Reached the overlook before sunset.",
    "category": "hiking",
    "status": "completed",
    "adventure_date": "2026-07-01",
    "location_name": "Bear Mountain, New York",
    "latitude": 41.3127123,
    "longitude": -73.9882458,
    "rating": 5,
    "is_favorite": False,
    "photos": [],
}


def create_authenticated_headers(client: TestClient, *, email: str, username: str) -> dict[str, str]:
    register_response = client.post(f"{settings.api_v1_prefix}/auth/register",
        json={
            "email": email,
            "username": username,
            "display_name": username,
            "password": "Adventure123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(f"{settings.api_v1_prefix}/auth/token", data={
            "username": email,
            "password": "Adventure123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()[
        "access_token"
    ]

    return {
        "Authorization": f"Bearer {access_token}"
    }


def create_adventure(client: TestClient, headers: dict[str, str]) -> dict[str, object]:
    response = client.post(f"{settings.api_v1_prefix}/adventures", json=ADVENTURE_PAYLOAD, headers=headers)

    assert response.status_code == 201

    return response.json()


def test_create_and_read_adventure(client: TestClient) -> None:
    headers = create_authenticated_headers(client, email="owner@example.com", username="adventure_owner")

    created_adventure = create_adventure(client, headers)

    assert created_adventure["title"] == ADVENTURE_PAYLOAD["title"]

    assert created_adventure["category"] == "hiking"

    assert created_adventure["status"] == "completed"

    assert created_adventure["photos"] == []

    assert float(created_adventure["latitude"]) == 41.312712

    assert float(created_adventure["longitude"]) == -73.988246

    adventure_id = created_adventure["id"]

    read_response = client.get(f"{settings.api_v1_prefix}/adventures/{adventure_id}", headers=headers)

    assert read_response.status_code == 200
    assert read_response.json()["id"] == adventure_id


def test_update_adventure(client: TestClient) -> None:
    headers = create_authenticated_headers(client, email="editor@example.com", username="adventure_editor")

    adventure = create_adventure(client, headers)

    response = client.patch(f"{settings.api_v1_prefix}/adventures/{adventure['id']}", json={
            "title": "Updated Mountain Sunset",
            "is_favorite": True,
        },
        headers=headers,
    )

    assert response.status_code == 200

    updated_adventure = response.json()

    assert updated_adventure["title"] == "Updated Mountain Sunset"

    assert updated_adventure["is_favorite"] is True


def test_delete_adventure(client: TestClient) -> None:
    headers = create_authenticated_headers(client, email="deleter@example.com", username="adventure_deleter")

    adventure = create_adventure(client, headers)

    delete_response = client.delete(f"{settings.api_v1_prefix}/adventures/{adventure['id']}", headers=headers)

    assert delete_response.status_code == 204

    read_response = client.get(f"{settings.api_v1_prefix}/adventures/{adventure['id']}", headers=headers)

    assert read_response.status_code == 404


def test_user_cannot_read_another_users_adventure(client: TestClient) -> None:
    owner_headers = create_authenticated_headers(client, email="first@example.com", username="first_explorer")

    other_user_headers = create_authenticated_headers(client, email="second@example.com", username="second_explorer")

    adventure = create_adventure(client, owner_headers)

    response = client.get(f"{settings.api_v1_prefix}/adventures/{adventure['id']}", headers=other_user_headers)

    assert response.status_code == 404

    assert response.json() == {
        "detail": "Adventure not found."
    }