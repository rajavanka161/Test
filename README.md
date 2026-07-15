# Todo (FastAPI + React)

This monorepo contains:

- `backend/` — FastAPI backend exposing CRUD endpoints for todos (PostgreSQL via `DATABASE_URL`).
- `frontend/` — React + Vite frontend for creating, editing, toggling, and deleting todos.

This app uses:
- **Backend**: FastAPI + SQLAlchemy (PostgreSQL)
- **Frontend**: React + Vite + Vitest/React Testing Library

## Repository structure

```text
./
  frontend/
  backend/
  README.md
```

## Prerequisites

- Node.js (for the frontend)
- Python 3.12+ (for the backend)
- PostgreSQL (for local development)

## Environment variables

### Backend

Backend reads `DATABASE_URL`.

Use `backend/.env.example` as a starting point.

`DATABASE_URL` (required)

- Example:

```bash
export DATABASE_URL=postgresql://user:password@localhost:5432/todos
```

### Frontend

The frontend can be configured to point at a backend base URL via `VITE_API_BASE_URL`.

`VITE_API_BASE_URL` (optional)

- Example:

```bash
export VITE_API_BASE_URL=http://localhost:8000
```

If you don’t set it, the frontend uses its default configuration.

## Quick start (local)

### 1) Start the backend (FastAPI)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# required
export DATABASE_URL=postgresql://user:password@localhost:5432/todos

uvicorn main:app --reload --port 8000
```

The backend creates the `todos` table automatically on startup.

### 2) Start the frontend (React)

```bash
cd frontend
npm ci

# optional (frontend default is configured inside the app)
export VITE_API_BASE_URL=http://localhost:8000

npm run dev
```

Open the URL printed by Vite.

## API summary

Base path: `/api/todos`.

**Todo fields**: `id`, `title`, `completed`.

### GET /api/todos

Returns a list of todos.

- **Auth**: none (public)

**Response** `200 OK`

```json
[
  {
    "id": 1,
    "title": "Buy milk",
    "completed": false
  }
]
```

### POST /api/todos

Creates a new todo.

- **Auth**: none (public)

**Request body**

```json
{ "title": "Buy milk" }
```

**Response** `201 Created`

```json
{
  "id": 1,
  "title": "Buy milk",
  "completed": false
}
```

**Errors**
- `422 Unprocessable Entity` — invalid request body (e.g., empty/invalid `title`)

### PATCH /api/todos/{id}

Updates an existing todo. At least one of `title` or `completed` must be provided.

- **Auth**: none (public)

**Request body**

```json
{ "title": "Buy oat milk" }
```

or

```json
{ "completed": true }
```

**Response** `200 OK`

```json
{
  "id": 1,
  "title": "Buy oat milk",
  "completed": true
}
```

**Errors**
- `404 Not Found` — todo id does not exist
- `422 Unprocessable Entity` — invalid request body

### DELETE /api/todos/{id}

Deletes an existing todo.

- **Auth**: none (public)

**Response** `204 No Content`

No response body.

**Errors**
- `404 Not Found` — todo id does not exist

## Linting and unit tests

### Backend

From `backend/`:

```bash
# lint
ruff check .

# tests
pytest
```

### Frontend

From `frontend/`:

```bash
# lint
npm run lint

# unit tests
npm test
```

## CI (GitHub Actions)

This repo uses GitHub Actions to run:

- Backend lint (`ruff check .`) and unit tests (`pytest`)
- Frontend lint (`npm run lint`) and unit tests (`npm test`)

The workflow is configured to run on:

- `push` to `main`
- `pull_request` targeting `main`
