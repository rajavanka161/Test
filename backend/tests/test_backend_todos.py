import os

os.environ.setdefault("DATABASE_URL", "postgresql://localhost/test")

import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture()
def client() -> TestClient:
    with TestClient(app) as test_client:
        yield test_client


def test_get_todos_returns_bare_array(client: TestClient) -> None:
    response = client.get("/api/todos")

    assert response.status_code == 200
    assert response.json() == []


def test_post_todo_creates_todo_with_exact_contract_fields(client: TestClient) -> None:
    response = client.post("/api/todos", json={"title": "Buy milk"})

    assert response.status_code == 201
    data = response.json()
    assert data == {"id": 1, "title": "Buy milk", "completed": False}


def test_patch_todo_updates_title_and_completed(client: TestClient) -> None:
    created = client.post("/api/todos", json={"title": "Initial"}).json()

    response = client.patch(
        f"/api/todos/{created['id']}",
        json={"title": "Updated", "completed": True},
    )

    assert response.status_code == 200
    assert response.json() == {"id": created["id"], "title": "Updated", "completed": True}


def test_delete_todo_returns_204(client: TestClient) -> None:
    created = client.post("/api/todos", json={"title": "Delete me"}).json()

    response = client.delete(f"/api/todos/{created['id']}")

    assert response.status_code == 204
    assert response.content == b""


@pytest.mark.parametrize(
    ("payload", "expected_status"),
    [
        ({}, 422),
        ({"title": "   "}, 422),
        ({"title": "One", "completed": True}, 422),
    ],
)
def test_post_todo_rejects_malformed_payloads(client: TestClient, payload: dict, expected_status: int) -> None:
    response = client.post("/api/todos", json=payload)

    assert response.status_code == expected_status


@pytest.mark.parametrize(
    ("payload", "expected_status"),
    [
        ({}, 422),
        ({"title": "   "}, 422),
    ],
)
def test_patch_todo_rejects_malformed_payloads(client: TestClient, payload: dict, expected_status: int) -> None:
    created = client.post("/api/todos", json={"title": "Initial"}).json()
    response = client.patch(f"/api/todos/{created['id']}", json=payload)

    assert response.status_code == expected_status


def test_missing_todo_id_returns_404(client: TestClient) -> None:
    response = client.patch("/api/todos/999999", json={"completed": True})

    assert response.status_code == 404
    assert response.json()["detail"] == "todo not found"


def test_delete_missing_todo_id_returns_404(client: TestClient) -> None:
    response = client.delete("/api/todos/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "todo not found"
