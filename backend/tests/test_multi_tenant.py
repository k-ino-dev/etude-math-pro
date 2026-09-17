import pytest
from fastapi.testclient import TestClient
import datetime

try:
    from backend.app.main import app
    from backend.app.database import SessionLocal
    from backend.app.models import User, Student, Group
    from backend.app.seed_data import seed_database
except ImportError:
    from app.main import app
    from app.database import SessionLocal
    from app.models import User, Student, Group
    from app.seed_data import seed_database

client = TestClient(app)

@pytest.fixture(autouse=True, scope="module")
def setup_multi_tenant_db():
    with SessionLocal() as db:
        seed_database(db, reset=True)
    yield

def test_multi_tenant_registration_and_data_isolation():
    # 1. Register Teacher A
    res_a = client.post("/api/auth/register", json={
        "name": "Professeur A",
        "email": "teacher_a@mathprof.tn",
        "password": "passwordA123",
        "phone": "+216 20 111 222",
        "currency": "DT",
        "school_year": "2025-2026"
    })
    assert res_a.status_code == 200
    token_a = res_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 2. Register Teacher B
    res_b = client.post("/api/auth/register", json={
        "name": "Professeur B",
        "email": "teacher_b@mathprof.tn",
        "password": "passwordB123",
        "phone": "+216 20 333 444",
        "currency": "DT",
        "school_year": "2025-2026"
    })
    assert res_b.status_code == 200
    token_b = res_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 3. Teacher A creates a group and a student
    grp_a = client.post("/api/groups", headers=headers_a, json={
        "name": "Groupe Alpha Teacher A",
        "level": "Bac",
        "capacity": 10
    })
    assert grp_a.status_code == 200
    grp_a_id = grp_a.json()["id"]

    st_a = client.post("/api/students", headers=headers_a, json={
        "first_name": "EleveA",
        "last_name": "DuProfA",
        "level": "Bac",
        "group_id": grp_a_id,
        "monthly_price": 95.0
    })
    assert st_a.status_code == 200
    st_a_id = st_a.json()["id"]

    # 4. Teacher B creates a group and a student
    grp_b = client.post("/api/groups", headers=headers_b, json={
        "name": "Groupe Beta Teacher B",
        "level": "2ème",
        "capacity": 8
    })
    assert grp_b.status_code == 200
    grp_b_id = grp_b.json()["id"]

    st_b = client.post("/api/students", headers=headers_b, json={
        "first_name": "EleveB",
        "last_name": "DuProfB",
        "level": "2ème",
        "group_id": grp_b_id,
        "monthly_price": 75.0
    })
    assert st_b.status_code == 200
    st_b_id = st_b.json()["id"]

    # 5. VERIFY ISOLATION: Teacher A should ONLY see their own groups and students
    list_st_a = client.get("/api/students", headers=headers_a).json()
    assert len(list_st_a) == 1
    assert list_st_a[0]["first_name"] == "EleveA"

    list_grp_a = client.get("/api/groups", headers=headers_a).json()
    assert len(list_grp_a) == 1
    assert list_grp_a[0]["name"] == "Groupe Alpha Teacher A"

    # 6. VERIFY ISOLATION: Teacher B should ONLY see their own groups and students
    list_st_b = client.get("/api/students", headers=headers_b).json()
    assert len(list_st_b) == 1
    assert list_st_b[0]["first_name"] == "EleveB"

    list_grp_b = client.get("/api/groups", headers=headers_b).json()
    assert len(list_grp_b) == 1
    assert list_grp_b[0]["name"] == "Groupe Beta Teacher B"

    # 7. Teacher A cannot read Teacher B's student detail
    cross_read = client.get(f"/api/students/{st_b_id}", headers=headers_a)
    assert cross_read.status_code in [404, 403]

    # 8. Teacher B cannot modify Teacher A's student
    cross_edit = client.put(f"/api/students/{st_a_id}", headers=headers_b, json={
        "first_name": "HackedName",
        "last_name": "Hacked",
        "level": "Bac"
    })
    assert cross_edit.status_code in [404, 403]
