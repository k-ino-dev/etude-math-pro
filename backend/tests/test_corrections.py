"""
Unit & Integration Tests for Math Corrections, SymPy Math Verifier, and Handwriting Engine API.
"""

import pytest
import json
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.math_verifier import MathVerifier
from backend.app.services.math_solver import MathSolver

client = TestClient(app)

def test_sympy_derivative_verification():
    """Test SymPy verification on derivatives."""
    res = MathVerifier.verify_expression(
        expression_type="derivative",
        expression="x**3 - 3*x + 2",
        claimed_result="3*x**2 - 3"
    )
    assert res["is_valid"] is True
    assert res["match"] is True
    assert "3*x**2 - 3" in res["sympy_computed"]

def test_sympy_integral_verification():
    """Test SymPy verification on definite integrals."""
    res = MathVerifier.verify_expression(
        expression_type="integral",
        expression="3*x**2 + 2*x - 1",
        claimed_result="10",
        extra_params={"lower": "0", "upper": "2"}
    )
    assert res["is_valid"] is True
    assert res["match"] is True
    assert res["sympy_computed"] == "10"

def test_sympy_equation_solver():
    """Test SymPy solving quadratic equation."""
    res = MathVerifier.verify_expression(
        expression_type="equation",
        expression="2*x**2 - 7*x + 3 = 0"
    )
    assert res["is_valid"] is True
    assert "1/2" in res["sympy_computed"]
    assert "3" in res["sympy_computed"]

def test_math_solver_5_steps():
    """Test 5-step pedagogical math solving pipeline."""
    res = MathSolver.solve_question(
        question_text="Calculer la dérivée de f(x) = x^3 - 3x + 2",
        level="Bac",
        detail_level=4
    )
    assert "steps" in res
    assert len(res["steps"]) == 5
    assert res["steps"][0]["type"] == "data"
    assert res["steps"][1]["type"] == "method"
    assert res["steps"][2]["type"] == "calculation"
    assert res["steps"][3]["type"] == "simplification"
    assert res["steps"][4]["type"] == "result"
    assert res["sympy_verified"] is True

@pytest.fixture(scope="module")
def auth_headers():
    from backend.app.database import SessionLocal
    from backend.app.seed_data import seed_database
    with SessionLocal() as db:
        seed_database(db, reset=True)
    res = client.post("/api/auth/login", json={
        "email": "admin@mathprof.tn",
        "password": "password123"
    })
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_api_list_and_create_correction(auth_headers):
    """Test REST API for creating and listing corrections."""
    # List templates
    resp_temp = client.get("/api/corrections/templates", headers=auth_headers)
    assert resp_temp.status_code == 200
    templates = resp_temp.json()
    assert len(templates) >= 3

    # Create new correction project
    payload = {
        "title": "Examen Blanc Bac Math 2026",
        "subject": "Mathématiques",
        "level": "Bac",
        "chapter": "Analyse & Calcul Intégral",
        "teacher_name": "Prof. Mohamed",
        "school_name": "Lycée Pilote",
        "detail_level": 4,
        "language": "fr",
        "handwriting_style": "style_a_classique",
        "paper_style": "squared_5mm",
        "color_primary": "#1e3a8a",
        "color_correction": "#dc2626",
        "color_secondary": "#16a34a",
        "color_header": "#0f172a"
    }
    resp_create = client.post("/api/corrections", headers=auth_headers, json=payload)
    assert resp_create.status_code == 200
    created = resp_create.json()
    assert created["id"] is not None
    assert created["title"] == "Examen Blanc Bac Math 2026"

    # Get by ID
    proj_id = created["id"]
    resp_get = client.get(f"/api/corrections/{proj_id}", headers=auth_headers)
    assert resp_get.status_code == 200
    assert resp_get.json()["id"] == proj_id

    # Test PDF Export endpoint
    resp_pdf = client.get(f"/api/corrections/{proj_id}/export-pdf", headers=auth_headers)
    assert resp_pdf.status_code == 200
    assert resp_pdf.headers["content-type"] == "application/pdf"
    assert len(resp_pdf.content) > 1000

    # Duplicate
    resp_dup = client.post(f"/api/corrections/{proj_id}/duplicate", headers=auth_headers)
    assert resp_dup.status_code == 200
    assert "(Copie)" in resp_dup.json()["title"]

    # Delete
    resp_del = client.delete(f"/api/corrections/{proj_id}", headers=auth_headers)
    assert resp_del.status_code == 200

