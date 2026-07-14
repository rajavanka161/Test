from datetime import datetime

from pydantic import BaseModel, Field, model_validator


class TodoCreate(BaseModel):
    text: str = Field(min_length=1)

    @model_validator(mode="after")
    def validate_text(self) -> "TodoCreate":
        if self.text.strip() == "":
            raise ValueError("text must not be empty")
        return self


class TodoUpdate(BaseModel):
    text: str | None = None
    completed: bool | None = None

    @model_validator(mode="after")
    def validate_update(self) -> "TodoUpdate":
        if self.text is not None and self.text.strip() == "":
            raise ValueError("text must not be empty")
        if self.text is None and self.completed is None:
            raise ValueError("at least one field must be provided")
        return self


class TodoOut(BaseModel):
    id: int
    text: str
    completed: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
