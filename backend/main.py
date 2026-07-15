from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import todos

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


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Todo API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(todos.router)
