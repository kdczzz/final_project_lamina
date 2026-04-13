from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .database import get_db
from .models import Item
from .schemas import ItemCreate, ItemUpdate, ItemResponse

router = APIRouter(prefix="/api/items", tags=["items"])


@router.get("", response_model=List[ItemResponse])
def list_items(db: Session = Depends(get_db)):
    return db.query(Item).order_by(Item.created_at.desc()).all()


@router.post("", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
def create_item(payload: ItemCreate, db: Session = Depends(get_db)):
    item = Item(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=ItemResponse)
def update_item(item_id: int, payload: ItemUpdate, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    update_data = payload.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    for field, value in update_data.items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
