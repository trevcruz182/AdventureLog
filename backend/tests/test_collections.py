from fastapi.testclient import TestClient

from app.core.config import settings


def create_authenticated_headers(client: TestClient, *, email: str, username: str) -> dict[str, str]:
    register_response = client.post(f"{settings.api_v1_prefix}/auth/register", json={
            "email": email,
            "username": username,
            "display_name": username,
            "password": "Adventure123",
        }
    )

    assert register_response.status_code == 201

    login_response = client.post(f"{settings.api_v1_prefix}/auth/token",data={
            "username": email,
            "password": "Adventure123",
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}"
    }


def create_adventure(client: TestClient, headers: dict[str, str]) -> dict[str, object]:
    response = client.post(f"{settings.api_v1_prefix}/adventures", headers=headers, json={
            "title": "Hudson River Walk",
            "description": "A quiet walk beside the river.",
            "category": "outdoors",
            "status": "completed",
            "adventure_date": "2026-06-28",
            "location_name": "Peekskill, New York",
            "latitude": 41.2901,
            "longitude": -73.9204,
            "rating": 4,
            "is_favorite": False,
            "photos": [],
        },
    )

    assert response.status_code == 201

    return response.json()


def create_collection(client: TestClient, headers: dict[str, str]) -> dict[str, object]:
    response = client.post(f"{settings.api_v1_prefix}/collections", headers=headers, json={
            "title": "Hudson Valley",
            "description": "Favorite nearby adventures.",
            "icon": "map-outline",
            "target_count": 5,
        }
    )

    assert response.status_code == 201

    return response.json()


def test_create_collection(client: TestClient) -> None:
    headers = create_authenticated_headers(client,email="collector@example.com", username="collection_owner")

    collection = create_collection(client, headers)

    assert collection["title"] == "Hudson Valley"

    assert collection["target_count"] == 5
    assert collection["adventure_count"] == 0
    assert collection["adventures"] == []


def test_add_and_remove_adventure(client: TestClient) -> None:
    headers = create_authenticated_headers(client, email="member@example.com", username="collection_member")

    adventure = create_adventure(client, headers)

    collection = create_collection(client, headers)

    add_response = client.post(f"{settings.api_v1_prefix}/collections/{collection['id']}/adventures/{adventure['id']}", headers=headers)

    assert add_response.status_code == 200

    updated_collection = add_response.json()

    assert updated_collection["adventure_count"] == 1

    assert len(updated_collection["adventures"]) == 1

    assert updated_collection["adventures"][0]["id"] == adventure["id"]

    remove_response = client.delete(f"{settings.api_v1_prefix}/collections/{collection['id']}/adventures/{adventure['id']}", headers=headers)

    assert remove_response.status_code == 204

    read_response = client.get(f"{settings.api_v1_prefix}/collections/{collection['id']}", headers=headers)

    assert read_response.status_code == 200

    refreshed_collection = read_response.json()

    assert refreshed_collection["adventure_count"] == 0

    assert refreshed_collection["adventures"] == []


def test_user_cannot_access_another_users_collection(client: TestClient) -> None:
    owner_headers = create_authenticated_headers(client,email="owner@example.com", username="collection_first")

    other_headers = create_authenticated_headers(client, email="other@example.com", username="collection_second")

    collection = create_collection(client, owner_headers)

    response = client.get(f"{settings.api_v1_prefix}/collections/{collection['id']}", headers=other_headers)

    assert response.status_code == 404

    assert response.json() == {
        "detail": "Collection not found."
    }


def test_user_cannot_add_another_users_adventure(client: TestClient) -> None:
    first_headers = create_authenticated_headers(client, email="first@example.com", username="membership_first")

    second_headers = create_authenticated_headers(client, email="second@example.com", username="membership_second")

    first_users_adventure = create_adventure(client, first_headers)

    second_users_collection = create_collection(client, second_headers)

    response = client.post(f"{settings.api_v1_prefix}/collections/{second_users_collection['id']}/adventures/{first_users_adventure['id']}", headers=second_headers)

    assert response.status_code == 404

    assert response.json() == {
        "detail": "Adventure not found."
    }