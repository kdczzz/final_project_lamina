import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import get_db, Base

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_list_items_empty():
    response = client.get("/api/items")
    assert response.status_code == 200
    assert response.json() == []


def test_create_item():
    response = client.post("/api/items", json={"name": "Test Item", "description": "A test"})
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Item"
    assert data["description"] == "A test"
    assert "id" in data


def test_update_item():
    create = client.post("/api/items", json={"name": "Original"})
    item_id = create.json()["id"]
    response = client.put(f"/api/items/{item_id}", json={"name": "Updated"})
    assert response.status_code == 200
    assert response.json()["name"] == "Updated"


def test_delete_item():
    create = client.post("/api/items", json={"name": "To Delete"})
    item_id = create.json()["id"]
    response = client.delete(f"/api/items/{item_id}")
    assert response.status_code == 204
    list_response = client.get("/api/items")
    assert all(i["id"] != item_id for i in list_response.json())
