from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoOut, TodoUpdate

# API CONTRACT
# GET  /api/todos
#   response: [{"id": number, "title": string, "completed": boolean}]
# POST /api/todos
#   request:  {"title": string}
#   response: {"id": number, "title": string, "completed": boolean}
# PATCH /api/todos/{id}
#   request:  {"title"?: string, "completed"?: boolean}
#   response: {"id": number, "title": string, "completed": boolean}
# DELETE /api/todos/{id}
#   response: 204 no body

router = APIRouter(prefix="/api/todos", tags=["todos"])


@router.get("", response_model=list[TodoOut])
async def list_todos(db: Session = Depends(get_db)) -> list[Todo]:
    print("GET /api/todos", flush=True)
    return db.query(Todo).order_by(Todo.id.asc()).all()


@router.post("", response_model=TodoOut, status_code=status.HTTP_201_CREATED)
async def create_todo(body: TodoCreate, db: Session = Depends(get_db)) -> Todo:
    print("POST /api/todos", flush=True)
    todo = Todo(title=body.title.strip(), completed=False)
    db.add(todo)
    db.flush()
    db.refresh(todo)
    return todo


@router.patch("/{todo_id}", response_model=TodoOut)
async def update_todo(todo_id: int, body: TodoUpdate, db: Session = Depends(get_db)) -> Todo:
    print(f"PATCH /api/todos/{todo_id}", flush=True)
    todo = db.get(Todo, todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="todo not found")
    if body.title is not None:
        todo.title = body.title.strip()
    if body.completed is not None:
        todo.completed = body.completed
    db.add(todo)
    db.flush()
    db.refresh(todo)
    return todo


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(todo_id: int, db: Session = Depends(get_db)) -> Response:
    print(f"DELETE /api/todos/{todo_id}", flush=True)
    todo = db.get(Todo, todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="todo not found")
    db.delete(todo)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
