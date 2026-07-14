from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoOut, TodoUpdate

# API CONTRACT
# GET  /api/todos
#   response: [{"id": number, "text": string, "completed": boolean}]
# POST /api/todos
#   request:  {"text": string}
#   response: {"id": number, "text": string, "completed": boolean}
# PATCH /api/todos/{id}
#   request:  {"text"?: string, "completed"?: boolean}
#   response: {"id": number, "text": string, "completed": boolean}
# DELETE /api/todos/{id}
#   response: 204 no body

router = APIRouter(prefix="/api/todos", tags=["todos"])


@router.get("", response_model=list[TodoOut])
async def list_todos(db: Session = Depends(get_db)) -> list[Todo]:
    return db.query(Todo).order_by(Todo.id.asc()).all()


@router.post("", response_model=TodoOut, status_code=status.HTTP_201_CREATED)
async def create_todo(body: TodoCreate, db: Session = Depends(get_db)) -> Todo:
    todo = Todo(text=body.text.strip(), completed=False)
    db.add(todo)
    db.flush()
    db.refresh(todo)
    return todo


@router.patch("/{todo_id}", response_model=TodoOut)
async def update_todo(todo_id: int, body: TodoUpdate, db: Session = Depends(get_db)) -> Todo:
    todo = db.get(Todo, todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="todo not found")
    if body.text is not None:
        todo.text = body.text.strip()
    if body.completed is not None:
        todo.completed = body.completed
    db.add(todo)
    db.flush()
    db.refresh(todo)
    return todo


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(todo_id: int, db: Session = Depends(get_db)) -> Response:
    todo = db.get(Todo, todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="todo not found")
    db.delete(todo)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
