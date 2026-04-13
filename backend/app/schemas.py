from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None


class ItemCreate(ItemBase):
    pass


class ItemUpdate(ItemBase):
    name: Optional[str] = None


class ItemResponse(ItemBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
