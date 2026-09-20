import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import datetime

try:
    from backend.app.main import app
    from backend.app.database import Base, get_db
    from backend.app.seed_data import seed_database
except ImportError:
    from app.main import app
    from app.database import Base, get_db
    from app.seed_data import seed_database

client = TestClient(app)

@pytest.fixture(autouse=True, scope="module")
def setup_test_db():
    from backend.app.database import SessionLocal
    with SessionLocal() as db:
        seed_database(db, reset=True)
    yield

def test_auth_login():
    response = client.post("/api/auth/login", json={
        "email": "admin@mathprof.tn",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "admin@mathprof.tn"

def test_dashboard_stats():
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_students"] >= 30
    assert data["total_groups"] >= 5
    assert "today_sessions" in data
    assert "recent_alerts" in data

def test_list_and_search_students():
    # List all
    res = client.get("/api/students")
    assert res.status_code == 200
    students = res.json()
    assert len(students) >= 30

    # Search by name
    res_search = client.get("/api/students?search=Ahmed")
    assert res_search.status_code == 200
    results = res_search.json()
    assert len(results) >= 1
    assert "Ahmed" in results[0]["first_name"]

    # Filter by level
    res_level = client.get("/api/students?level=Bac")
    assert res_level.status_code == 200
    assert all(s["level"] == "Bac" for s in res_level.json())

def test_create_student_and_capacity_check():
    # First create a test small group with capacity 1
    grp_res = client.post("/api/groups", json={
        "name": "Test Group Cap 1",
        "level": "Bac",
        "capacity": 1
    })
    assert grp_res.status_code == 200
    grp = grp_res.json()
    grp_id = grp["id"]

    # Add 1st student (should succeed)
    st1 = client.post("/api/students", json={
        "first_name": "Test1",
        "last_name": "User",
        "level": "Bac",
        "group_id": grp_id,
        "monthly_price": 80.0
    })
    assert st1.status_code == 200

    # Add 2nd student to same group without force (should fail with 400 because group is full)
    st2 = client.post("/api/students", json={
        "first_name": "Test2",
        "last_name": "User",
        "level": "Bac",
        "group_id": grp_id,
        "monthly_price": 80.0
    })
    assert st2.status_code == 400
    assert "complet" in st2.json()["detail"].lower()

def test_conflict_detection_in_sessions():
    groups = client.get("/api/groups").json()
    g1_id = groups[0]["id"]
    g2_id = groups[1]["id"]
    
    # Use unique timestamp offset to avoid collision with previous test runs
    import time
    offset = 30 + int(time.time()) % 1000
    test_date = str(datetime.date.today() + datetime.timedelta(days=offset))
    
    # Create first session 14:00 - 16:00
    res1 = client.post("/api/sessions", json={
        "group_id": g1_id,
        "date": test_date,
        "start_time": "14:00",
        "end_time": "16:00",
        "topic": "Session 1"
    })
    assert res1.status_code == 200
    
    # Try to create overlapping session on same date 15:00 - 17:00 without force (should fail with 409)
    res2 = client.post("/api/sessions", json={
        "group_id": g2_id,
        "date": test_date,
        "start_time": "15:00",
        "end_time": "17:00",
        "topic": "Overlapping Session"
    })
    assert res2.status_code == 409
    
    # Create with force=True (should succeed)
    res3 = client.post("/api/sessions", json={
        "group_id": g2_id,
        "date": test_date,
        "start_time": "15:00",
        "end_time": "17:00",
        "topic": "Forced Overlapping Session",
        "force": True
    })
    assert res3.status_code == 200

def test_bulk_attendance_flow():
    sessions = client.get("/api/sessions").json()
    assert len(sessions) > 0
    target_session = sessions[0]
    
    if target_session["id"] is None:
        # Materialize virtual session via resolve endpoint
        res = client.post("/api/sessions/resolve", json={
            "group_id": target_session["group_id"],
            "date": target_session["date"],
            "start_time": target_session["start_time"],
            "end_time": target_session["end_time"]
        })
        assert res.status_code == 200
        session_id = res.json()["id"]
    else:
        session_id = target_session["id"]
    
    att_res = client.get(f"/api/attendance/session/{session_id}")
    assert att_res.status_code == 200
    att_data = att_res.json()
    
    records = []
    for idx, s in enumerate(att_data["students"]):
        status = "present" if idx % 2 == 0 else "absent"
        records.append({"student_id": s["student_id"], "status": status, "notes": ""})
        
    save_res = client.post("/api/attendance/bulk", json={
        "session_id": session_id,
        "topic": "Algèbre linéaire & Matrices",
        "notes": "Bonne séance",
        "records": records
    })
    assert save_res.status_code == 200
    assert save_res.json()["success"] == True

def test_recurring_group_schedules_and_exceptions():
    # 1. Create a group with fixed weekly schedule on Sunday (day_of_week=6), 10:00 -> 12:00
    grp_res = client.post("/api/groups", json={
        "name": "Groupe Dimanche Fixe",
        "level": "Bac",
        "capacity": 15,
        "day_of_week": 6,
        "start_time": "10:00",
        "end_time": "12:00",
        "schedule": "Dimanche 10:00 → 12:00"
    })
    assert grp_res.status_code == 200
    grp = grp_res.json()
    grp_id = grp["id"]
    assert grp["day_of_week"] == 6
    assert grp["start_time"] == "10:00"

    # 2. Query sessions for a 4-week window
    today = datetime.date.today()
    # Find next Sunday
    days_until_sunday = (6 - today.weekday()) % 7
    if days_until_sunday == 0:
        days_until_sunday = 7
    sun1 = today + datetime.timedelta(days=days_until_sunday)
    sun2 = sun1 + datetime.timedelta(days=7)
    
    res_list = client.get(f"/api/sessions?group_id={grp_id}&start_date={str(sun1)}&end_date={str(sun2)}").json()
    assert len(res_list) == 2
    assert res_list[0]["date"] == str(sun1)
    assert res_list[0]["start_time"] == "10:00"
    assert res_list[0]["end_time"] == "12:00"
    assert res_list[0]["is_virtual"] is True
    assert res_list[0]["is_recurring"] is True
    assert res_list[0]["is_exception"] is False

    # 3. Create an exceptional change for sun1 only (14:00 -> 16:00)
    res_exc = client.post("/api/sessions/resolve", json={
        "group_id": grp_id,
        "date": str(sun1),
        "start_time": "14:00",
        "end_time": "16:00",
        "topic": "Séance exceptionnelle déplacée"
    })
    assert res_exc.status_code == 200
    exc_data = res_exc.json()
    assert exc_data["id"] is not None
    assert exc_data["start_time"] == "14:00"
    assert exc_data["end_time"] == "16:00"
    assert exc_data["is_exception"] is True

    # 4. Check that sun1 has 14:00 -> 16:00 and sun2 is still 10:00 -> 12:00
    res_list2 = client.get(f"/api/sessions?group_id={grp_id}&start_date={str(sun1)}&end_date={str(sun2)}").json()
    assert len(res_list2) == 2
    # sun1 is overridden
    assert res_list2[0]["date"] == str(sun1)
    assert res_list2[0]["start_time"] == "14:00"
    assert res_list2[0]["is_exception"] is True
    assert res_list2[0]["id"] is not None
    # sun2 is untouched (recurring 10:00 -> 12:00)
    assert res_list2[1]["date"] == str(sun2)
    assert res_list2[1]["start_time"] == "10:00"
    assert res_list2[1]["is_virtual"] is True
    assert res_list2[1]["is_exception"] is False

    # 5. Revert exception on sun1
    revert_res = client.post("/api/sessions/revert-to-recurring", params={
        "group_id": grp_id,
        "date": str(sun1)
    })
    assert revert_res.status_code == 200

    # 6. Check that sun1 is back to default 10:00 -> 12:00
    res_list3 = client.get(f"/api/sessions?group_id={grp_id}&start_date={str(sun1)}&end_date={str(sun2)}").json()
    assert len(res_list3) == 2
    assert res_list3[0]["date"] == str(sun1)
    assert res_list3[0]["start_time"] == "10:00"
    assert res_list3[0]["is_virtual"] is True
    assert res_list3[0]["is_exception"] is False


def test_payments_and_receipt():
    students = client.get("/api/students").json()
    st_id = students[0]["id"]
    
    pay_res = client.post("/api/payments", json={
        "student_id": st_id,
        "month": "Novembre 2025",
        "amount": 90.0,
        "payment_method": "Espèces",
        "notes": "Paiement en mains propres"
    })
    assert pay_res.status_code == 200
    payment = pay_res.json()
    assert payment["status"] == "paid"
    assert payment["receipt_number"].startswith("REC-")
    
    # 1. Get receipt JSON
    rec_res = client.get(f"/api/payments/{payment['id']}/receipt")
    assert rec_res.status_code == 200
    receipt = rec_res.json()
    assert receipt["student_name"] is not None
    assert receipt["amount_paid"] == 90.0
    assert receipt["status_display"] == "RÉGLÉ"
    assert receipt["is_fully_paid"] == True
    assert "student_code" not in receipt
    assert receipt["receipt_number"] == payment["receipt_number"]

    # 2. Download receipt PDF
    pdf_res = client.get(f"/api/payments/{payment['id']}/pdf")
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 1000

    # 3. Verify student status in student detail & student list
    st_detail = client.get(f"/api/students/{st_id}").json()
    assert st_detail["current_month_payment_status"] == "paid"
    assert len(st_detail["payment_history"]) > 0

def test_repartition_smart_balancing():
    res = client.get("/api/repartition/preview?level=Bac&target_capacity=15")
    assert res.status_code == 200
    data = res.json()
    assert data["total_students"] > 0
    assert "proposals" in data
    assert len(data["proposals"]) >= 1

def test_global_search():
    res = client.get("/api/search?q=Bac")
    assert res.status_code == 200
    data = res.json()
    assert "results" in data
    assert data["results"]["total_matches"] > 0

def test_user_profile_update_and_settings():
    # 1. Get profile
    me_res = client.get("/api/auth/me")
    assert me_res.status_code == 200
    user = me_res.json()
    assert "name" in user
    assert "email" in user

    # 2. Update profile with avatar, phone, currency and password
    update_res = client.put("/api/auth/profile", json={
        "name": "Prof. Mohamed Ben Salem",
        "email": "admin@mathprof.tn",
        "phone": "+216 98 999 888",
        "avatar": "👨‍🏫",
        "currency": "DT",
        "school_year": "2025-2026",
        "password": "newpassword123"
    })
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["phone"] == "+216 98 999 888"
    assert updated["avatar"] == "👨‍🏫"

    # 3. Login with new password
    login_new = client.post("/api/auth/login", json={
        "email": "admin@mathprof.tn",
        "password": "newpassword123"
    })
    assert login_new.status_code == 200
    assert login_new.json()["user"]["avatar"] == "👨‍🏫"

    # 4. Export database
    export_res = client.get("/api/settings/export")
    assert export_res.status_code == 200
    export_data = export_res.json()
    assert "students" in export_data
    assert "groups" in export_data

    # 5. Restore original password for other tests
    client.put("/api/auth/profile", json={
        "password": "password123"
    })

def test_backup_and_restore_flow():
    # 1. Export database
    export_res = client.get("/api/settings/export")
    assert export_res.status_code == 200
    backup_data = export_res.json()
    assert len(backup_data["students"]) > 0

    # 2. Re-import database
    import_res = client.post("/api/settings/import", json=backup_data)
    assert import_res.status_code == 200
    assert import_res.json()["success"] is True

    # 3. Verify students exist
    st_res = client.get("/api/students")
    assert st_res.status_code == 200
    assert len(st_res.json()) > 0

def test_strict_levels_and_payment_methods():
    # 1. Test student creation with legacy/stream level
    st_res = client.post("/api/students", json={
        "first_name": "Test",
        "last_name": "Normalized",
        "phone": "+216 22 111 222",
        "parent_phone": "+216 98 111 222",
        "level": "Bac Sciences",  # Stream label
        "monthly_price": 85.0
    })
    assert st_res.status_code == 200
    st_data = st_res.json()
    assert st_data["level"] == "Bac — Sciences"  # Normalized to canonical level

    # 2. Test group creation with 2ème Informatique
    grp_res = client.post("/api/groups", json={
        "name": "Groupe Test 2ème Info",
        "level": "2ème Informatique",  # Stream label
        "capacity": 10,
        "schedule": "Mardi 18:00 - 19:30",
        "day_of_week": 2,
        "start_time": "18:00",
        "end_time": "19:30",
        "color": "#4f46e5"
    })
    assert grp_res.status_code == 200
    grp_data = grp_res.json()
    assert grp_data["level"] == "2ème — Informatique"  # Normalized to canonical level

    # 3. Test group creation with 1ère
    grp_res1 = client.post("/api/groups", json={
        "name": "Groupe 1ère Test",
        "level": "1ère Année",
        "capacity": 10
    })
    assert grp_res1.status_code == 200
    assert grp_res1.json()["level"] == "1ère"

    # 4. Test payment creation with strict payment method
    pay_res = client.post("/api/payments", json={
        "student_id": st_data["id"],
        "month": "Novembre 2025",
        "amount": 85.0,
        "payment_method": "Espèces",
        "payment_date": "2025-11-05"
    })
    assert pay_res.status_code == 200
    pay_data = pay_res.json()
    assert pay_data["payment_method"] == "Espèces"
    assert pay_data["status"] == "paid"


