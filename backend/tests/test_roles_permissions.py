import pytest
from fastapi.testclient import TestClient

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

@pytest.fixture(autouse=True, scope='module')
def setup_test_db():
    with SessionLocal() as db:
        seed_database(db, reset=True)
    yield

def test_roles_and_permissions_workflow():
    # 1. Register Admin
    res_admin = client.post('/api/auth/register', json={
        'name': 'Prof Admin Test',
        'email': 'admin_roles@mathprof.tn',
        'password': 'AdminPassword123!',
        'phone': '+216 99 000 111',
        'currency': 'DT',
        'school_year': '2025-2026'
    })
    assert res_admin.status_code == 200
    token_admin = res_admin.json()['access_token']
    headers_admin = {'Authorization': f'Bearer {token_admin}'}

    # Verify Admin me endpoint
    me_admin = client.get('/api/auth/me', headers=headers_admin)
    assert me_admin.status_code == 200
    assert me_admin.json()['role'] == 'ADMIN'

    # 2. Admin creates a Group
    res_grp = client.post('/api/groups', headers=headers_admin, json={
        'name': 'Groupe Bac Math',
        'level': 'Bac',
        'capacity': 12
    })
    assert res_grp.status_code == 200
    group_id = res_grp.json()['id']

    # 3. Admin creates a Staff member
    res_create_staff = client.post('/api/auth/staff', headers=headers_admin, json={
        'name': 'Staff Assistant Test',
        'email': 'assistant@mathprof.tn',
        'password': 'StaffPassword123!',
        'phone': '+216 22 333 444'
    })
    assert res_create_staff.status_code == 200
    staff_id = res_create_staff.json()['id']
    assert res_create_staff.json()['role'] == 'STAFF'

    # 4. Staff logs in
    res_staff_login = client.post('/api/auth/login', json={
        'email': 'assistant@mathprof.tn',
        'password': 'StaffPassword123!'
    })
    assert res_staff_login.status_code == 200
    token_staff = res_staff_login.json()['access_token']
    headers_staff = {'Authorization': f'Bearer {token_staff}'}

    me_staff = client.get('/api/auth/me', headers=headers_staff)
    assert me_staff.status_code == 200
    assert me_staff.json()['role'] == 'STAFF'

    # 5. Staff CANNOT create another staff member (403)
    res_staff_create_staff = client.post('/api/auth/staff', headers=headers_staff, json={
        'name': 'Rogue Staff',
        'email': 'rogue@mathprof.tn',
        'password': 'password123'
    })
    assert res_staff_create_staff.status_code == 403

    # 6. Staff CANNOT create a group (403)
    res_staff_grp = client.post('/api/groups', headers=headers_staff, json={
        'name': 'Forbidden Group',
        'level': '1\u00e8re',
        'capacity': 10
    })
    assert res_staff_grp.status_code == 403

    # 7. Staff CANNOT create a session / planning slot (403)
    res_staff_sess = client.post('/api/sessions', headers=headers_staff, json={
        'group_id': group_id,
        'title': 'Forbidden Session',
        'session_date': '2026-10-01',
        'start_time': '14:00',
        'end_time': '16:00'
    })
    assert res_staff_sess.status_code == 403

    # 8. Staff CAN create and edit a student
    res_st = client.post('/api/students', headers=headers_staff, json={
        'first_name': 'Yassine',
        'last_name': 'Trabelsi',
        'level': 'Bac',
        'group_id': group_id,
        'monthly_fee': 80.0
    })
    assert res_st.status_code == 200
    student_id = res_st.json()['id']

    res_st_edit = client.put(f'/api/students/{student_id}', headers=headers_staff, json={
        'first_name': 'Yassine',
        'last_name': 'Trabelsi Updated',
        'level': 'Bac',
        'group_id': group_id,
        'monthly_fee': 90.0
    })
    assert res_st_edit.status_code == 200
    assert res_st_edit.json()['last_name'] == 'Trabelsi Updated'

    # 9. Staff CAN create and modify a payment
    res_pay = client.post('/api/payments', headers=headers_staff, json={
        'student_id': student_id,
        'amount': 90.0,
        'payment_date': '2026-10-02',
        'month': 'Octobre 2026',
        'payment_method': 'Esp\u00e8ces',
        'status': 'Pay\u00e9',
        'notes': 'Initial payment by staff'
    })
    assert res_pay.status_code == 200
    payment_id = res_pay.json()['id']

    # Staff modifies payment
    res_pay_mod = client.put(f'/api/payments/{payment_id}', headers=headers_staff, json={
        'amount': 95.0,
        'payment_date': '2026-10-03',
        'payment_method': 'Virement bancaire',
        'status': 'Pay\u00e9',
        'notes': 'Adjusted amount with receipt'
    })
    assert res_pay_mod.status_code == 200
    assert res_pay_mod.json()['amount'] == 95.0
    assert res_pay_mod.json()['payment_method'] == 'Virement bancaire'

    # 10. Staff CANNOT delete a payment (403)
    res_pay_del = client.delete(f'/api/payments/{payment_id}', headers=headers_staff)
    assert res_pay_del.status_code == 403

    # 11. Staff CANNOT access monthly financial report (403)
    res_rep = client.get('/api/reports/monthly', headers=headers_staff)
    assert res_rep.status_code == 403

    # 12. Staff CANNOT access expenses (403)
    res_exp_get = client.get('/api/expenses', headers=headers_staff)
    assert res_exp_get.status_code == 403

    res_exp_post = client.post('/api/expenses', headers=headers_staff, json={
        'title': 'Unauthorized Expense',
        'amount': 50.0,
        'expense_date': '2026-10-01'
    })
    assert res_exp_post.status_code == 403

    # 13. Staff CANNOT view audit logs (403)
    res_audit_staff = client.get('/api/audit-logs', headers=headers_staff)
    assert res_audit_staff.status_code == 403

    # 14. Admin CAN manage expenses & view net balance
    res_exp_admin = client.post('/api/expenses', headers=headers_admin, json={
        'title': 'Local rent October',
        'amount': 35.0,
        'expense_date': '2026-10-01',
        'category': 'Loyer'
    })
    assert res_exp_admin.status_code == 200
    exp_id = res_exp_admin.json()['id']

    res_exp_summary = client.get('/api/expenses/summary', headers=headers_admin)
    assert res_exp_summary.status_code == 200
    summary_data = res_exp_summary.json()
    assert summary_data['total_revenue'] >= 95.0
    assert summary_data['total_expenses'] >= 35.0
    assert summary_data['net_profit'] == summary_data['total_revenue'] - summary_data['total_expenses']

    # 15. Admin CAN view audit logs
    res_audit_admin = client.get('/api/audit-logs', headers=headers_admin)
    assert res_audit_admin.status_code == 200
    logs = res_audit_admin.json()
    assert len(logs) > 0
    actions = [l['action'] for l in logs]
    assert 'STUDENT_CREATED' in actions
    assert 'STUDENT_UPDATED' in actions
    assert 'PAYMENT_CREATED' in actions
    assert 'PAYMENT_UPDATED' in actions
    assert 'EXPENSE_CREATED' in actions

    # 16. Admin can update & deactivate staff member
    res_deactivate = client.put(f'/api/auth/staff/{staff_id}', headers=headers_admin, json={
        'name': 'Staff Assistant Test',
        'email': 'assistant@mathprof.tn',
        'is_active': False
    })
    assert res_deactivate.status_code == 200
    assert res_deactivate.json()['is_active'] is False

    # Deactivated staff member cannot login
    res_login_disabled = client.post('/api/auth/login', json={
        'email': 'assistant@mathprof.tn',
        'password': 'StaffPassword123!'
    })
    assert res_login_disabled.status_code == 403
