import pytest
from fastapi.testclient import TestClient
import datetime

try:
    from backend.app.main import app
    from backend.app.database import SessionLocal
    from backend.app.seed_data import seed_database
except ImportError:
    from app.main import app
    from app.database import SessionLocal
    from app.seed_data import seed_database

client = TestClient(app)

@pytest.fixture(scope="module")
def auth_headers():
    with SessionLocal() as db:
        seed_database(db, reset=True)
    res = client.post("/api/auth/login", json={
        "email": "admin@mathprof.tn",
        "password": "password123"
    })
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_monthly_reports_list_and_data(auth_headers):
    res = client.get("/api/reports/monthly", headers=auth_headers)
    assert res.status_code == 200
    
    current_key = datetime.date.today().strftime("%Y-%m")
    data_res = client.get(f"/api/reports/monthly/{current_key}/data", headers=auth_headers)
    assert data_res.status_code == 200
    data = data_res.json()
    assert "month_name" in data
    assert "total_students" in data
    assert "total_collected" in data

def test_monthly_pdf_download(auth_headers):
    current_key = datetime.date.today().strftime("%Y-%m")
    pdf_res = client.get(f"/api/reports/monthly/{current_key}/pdf", headers=auth_headers)
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 1000

def test_daily_planning_pdf_endpoints(auth_headers):
    # 1. Tomorrow planning PDF
    res = client.get("/api/reports/daily/tomorrow/pdf", headers=auth_headers)
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert len(res.content) > 1000

    # 2. Specific date planning PDF
    tomorrow = (datetime.date.today() + datetime.timedelta(days=1)).isoformat()
    res_date = client.get(f"/api/reports/daily/{tomorrow}/pdf", headers=auth_headers)
    assert res_date.status_code == 200
    assert res_date.headers["content-type"] == "application/pdf"
    assert len(res_date.content) > 1000

    # 3. Daily PDFs list
    res_list = client.get("/api/reports/daily/list", headers=auth_headers)
    assert res_list.status_code == 200
    pdf_list = res_list.json()
    assert isinstance(pdf_list, list)
    assert len(pdf_list) >= 1

