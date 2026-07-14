import os

import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")

from main import app  # noqa: E402


@pytest.fixture()
def client():
    with TestClient(app) as test_client:
        yield test_client


# AC-5: The backend exposes working CRUD endpoints for todo items with appropriate success responses.
def test_get_todos_returns_bare_array(client):
    response = client.get("/api/todos")

    assert response.status_code == 200
    assert response.json() == []


# AC-5: The backend exposes working CRUD endpoints for todo items with appropriate success responses.
def test_post_todo_creates_todo_with_exact_contract_fields(client):
    response = client.post("/api/todos", json={"text": "Buy milk"})

    assert response.status_code == 201
    data = response.json()
    assert set(data) == {"id", "text", "completed", "created_at", "updated_at"}
    assert data["text"] == "Buy milk"
    assert data["completed"] is False


# AC-5: The backend exposes working CRUD endpoints for todo items with appropriate success responses.
def test_patch_todo_updates_text_and_completed(client):
    created = client.post("/api/todos", json={"text": "Initial"}).json()

    response = client.patch(f"/api/todos/{created['id']}", json={"text": "Updated", "completed": True})

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == created["id"]
    assert data["text"] == "Updated"
    assert data["completed"] is True


# AC-5: The backend exposes working CRUD endpoints for todo items with appropriate success responses.
def test_delete_todo_returns_204(client):
    created = client.post("/api/todos", json={"text": "Delete me"}).json()

    response = client.delete(f"/api/todos/{created['id']}")

    assert response.status_code == 204
    assert response.content == b""


# AC-6: Invalid backend requests return clear client error responses rather than unhandled server failures.
def test_post_todo_with_invalid_body_returns_422(client):
    response = client.post("/api/todos", json={})

    assert response.status_code == 422
    assert response.json()["detail"]


# AC-6: Invalid backend requests return clear client error responses rather than unhandled server failures.
def test_post_todo_with_empty_text_returns_422(client):
    response = client.post("/api/todos", json={"text": "   "})

    assert response.status_code == 422
    assert response.json()["detail"]


# AC-6: Invalid backend requests return clear client error responses rather than unhandled server failures.
def test_patch_todo_with_empty_body_returns_422(client):
    created = client.post("/api/todos", json={"text": "Initial"}).json()

    response = client.patch(f"/api/todos/{created['id']}", json={})

    assert response.status_code == 422


# AC-6: Invalid backend requests return clear client error responses rather than unhandled server failures.
def test_missing_todo_id_returns_404(client):
    response = client.patch("/api/todos/999999", json={"completed": True})

    assert response.status_code == 404
    assert response.json()["detail"] == "todo not found"


# AC-6: Invalid backend requests return clear client error responses rather than unhandled server failures.
def test_delete_missing_todo_id_returns_404(client):
    response = client.delete("/api/todos/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "todo not found"
