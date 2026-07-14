from datetime import datetime

from pydantic import BaseModel, Field


class TodoCreate(BaseModel):
    text: str = Field(min_length=1, max_length=500)


class TodoUpdate(BaseModel):
    completed: bool


class TodoOut(BaseModel):
    id: int
    text: str
    completed: bool
    created_at: datetime

    model_config = {"from_attributes": True}
