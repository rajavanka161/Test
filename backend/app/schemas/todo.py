from pydantic import BaseModel, Field, model_validator


class TodoCreate(BaseModel):
    title: str = Field(min_length=1)

    @model_validator(mode="after")
    def validate_title(self) -> "TodoCreate":
        if self.title.strip() == "":
            raise ValueError("title must not be empty")
        return self


class TodoUpdate(BaseModel):
    title: str | None = None
    completed: bool | None = None

    @model_validator(mode="after")
    def validate_update(self) -> "TodoUpdate":
        if self.title is not None and self.title.strip() == "":
            raise ValueError("title must not be empty")
        if self.title is None and self.completed is None:
            raise ValueError("at least one field must be provided")
        return self


class TodoOut(BaseModel):
    id: int
    title: str
    completed: bool

    model_config = {"from_attributes": True}
