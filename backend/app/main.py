import os
import datetime
from fastapi import FastAPI, Depends, Query, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional

from .database import engine, Base, SessionLocal, get_db
from .models import (
    User, Student, Group, Session as DBSession, Attendance, Payment, StudentNote,
    MonthlyReport, CorrectionProject, HandwritingProfile, NotificationSetting, NotificationLog
)
import threading
from .seed_data import seed_database, init_virgin_database
from .routers import (
    auth, dashboard, students, groups, sessions, attendance,
    payments, repartition, reports, corrections
)
from .services.scheduler import start_scheduler, shutdown_scheduler

def normalize_legacy_db_records(db: Session):
    """Normalize any legacy levels and payment methods safely into structured Tunisian values."""
    try:
        from .schemas import normalize_school_level, normalize_payment_method

        # Normalize students
        students_list = db.query(Student).all()
        for s in students_list:
            s.level = normalize_school_level(s.level)

        # Normalize groups
        groups_list = db.query(Group).all()
        for g in groups_list:
            g.level = normalize_school_level(g.level)

        # Normalize payments
        payments_list = db.query(Payment).all()
        for p in payments_list:
            pm = (p.payment_method or "").strip().lower()
            if "vir" in pm:
                p.payment_method = "Virement bancaire"
            else:
                p.payment_method = "Espèces"

        # Normalize users currency
        users_list = db.query(User).all()
        for u in users_list:
            u.currency = "DT"

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[MIGRATION NOTICE] Error normalizing legacy records: {e}")

# Initialize database tables
Base.metadata.create_all(bind=engine)

# Seed virgin initial setup if database is completely new & normalize legacy records
with SessionLocal() as db_session:
    if db_session.query(User).count() == 0:
        init_virgin_database(db_session)
    else:
        normalize_legacy_db_records(db_session)

app = FastAPI(
    title="Étude Math Pro API",
    description="API commerciale de gestion de cours de mathématiques pour Professeur — MathsProf",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup & Shutdown lifecycle
@app.on_event("startup")
def on_app_startup():
    try:
        with SessionLocal() as db:
            normalize_legacy_db_records(db)
    except Exception as e:
        print(f"[STARTUP NOTICE] Normalization error: {e}")
    try:
        threading.Thread(target=start_scheduler, daemon=True, name="SchedulerStarter").start()
    except Exception as e:
        print(f"[STARTUP NOTICE] Scheduler start error: {e}")

@app.on_event("shutdown")
def on_app_shutdown():
    try:
        shutdown_scheduler()
    except Exception as e:
        print(f"[SHUTDOWN NOTICE] Scheduler stop error: {e}")

# Mount API routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(students.router)
app.include_router(groups.router)
app.include_router(sessions.router)
app.include_router(attendance.router)
app.include_router(payments.router)
app.include_router(repartition.router)
app.include_router(reports.router)
app.include_router(corrections.router)


from .routers.auth import get_current_user

# Global Search Endpoint
@app.get("/api/search")
def global_search(
    q: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    search_term = f"%{q.strip()}%"
    
    # 1. Search Students
    matched_students = db.query(Student).filter(
        Student.user_id == current_user.id,
        (
            (Student.first_name.ilike(search_term)) |
            (Student.last_name.ilike(search_term)) |
            ((Student.first_name + " " + Student.last_name).ilike(search_term)) |
            (Student.student_code.ilike(search_term)) |
            (Student.student_phone.ilike(search_term)) |
            (Student.father_phone.ilike(search_term)) |
            (Student.mother_phone.ilike(search_term))
        )
    ).limit(8).all()
    
    student_results = [
        {
            "type": "student",
            "id": s.id,
            "title": f"{s.first_name} {s.last_name}",
            "subtitle": f"Code: {s.student_code} • {s.level} • {s.group.name if s.group else 'Sans groupe'}",
            "phone": s.student_phone or s.father_phone,
            "badge": s.level
        }
        for s in matched_students
    ]
    
    # 2. Search Groups
    matched_groups = db.query(Group).filter(
        Group.user_id == current_user.id,
        (
            (Group.name.ilike(search_term)) |
            (Group.level.ilike(search_term)) |
            (Group.location.ilike(search_term))
        )
    ).limit(5).all()
    
    group_results = [
        {
            "type": "group",
            "id": g.id,
            "title": g.name,
            "subtitle": f"Niveau: {g.level} • {g.schedule or 'Horaire non défini'} • {g.location}",
            "badge": f"{len(g.students)}/{g.capacity} élèves"
        }
        for g in matched_groups
    ]
    
    # 3. Search Sessions
    matched_sessions = db.query(DBSession).filter(
        DBSession.user_id == current_user.id,
        (
            (DBSession.topic.ilike(search_term)) |
            (DBSession.notes.ilike(search_term))
        )
    ).limit(5).all()
    
    session_results = [
        {
            "type": "session",
            "id": s.id,
            "title": s.topic or f"Séance {s.group.name if s.group else ''}",
            "subtitle": f"{s.date} ({s.start_time} - {s.end_time}) • {s.group.name if s.group else ''}",
            "badge": s.group.name if s.group else "Séance"
        }
        for s in matched_sessions
    ]
    
    return {
        "query": q,
        "results": {
            "students": student_results,
            "groups": group_results,
            "sessions": session_results,
            "total_matches": len(student_results) + len(group_results) + len(session_results)
        }
    }

# Profile & Account aliases
from .routers.auth import update_profile as auth_update_profile, get_current_user_profile as auth_get_profile
from .schemas import UserOut, UserUpdate

@app.get("/api/user/profile", response_model=UserOut)
@app.get("/api/settings/account", response_model=UserOut)
def get_user_profile_alias(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return auth_get_profile(current_user=current_user, db=db)

@app.put("/api/user/profile", response_model=UserOut)
@app.post("/api/user/profile", response_model=UserOut)
@app.put("/api/settings/account", response_model=UserOut)
@app.post("/api/settings/account", response_model=UserOut)
def update_user_profile_alias(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return auth_update_profile(data=data, current_user=current_user, db=db)

# Reset demo data endpoint
@app.post("/api/settings/reset-demo")
def reset_demo_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    seed_database(db, reset=True)
    return {"success": True, "message": "Données de démonstration réinitialisées avec succès ! (30 élèves, 5 groupes, présences et paiements restaurés)"}

# Clear all data for fresh customer deployment
@app.post("/api/settings/clear-data")
def clear_all_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Wipe out students, groups, sessions, attendance, payments and logs for this teacher account."""
    try:
        user_id = current_user.id
        # Student IDs for this user
        student_ids = [s.id for s in db.query(Student.id).filter(Student.user_id == user_id).all()]
        session_ids = [s.id for s in db.query(DBSession.id).filter(DBSession.user_id == user_id).all()]

        if student_ids:
            db.query(Attendance).filter(Attendance.student_id.in_(student_ids)).delete(synchronize_session=False)
            db.query(Payment).filter(Payment.student_id.in_(student_ids)).delete(synchronize_session=False)
            db.query(StudentNote).filter(StudentNote.student_id.in_(student_ids)).delete(synchronize_session=False)
        if session_ids:
            db.query(Attendance).filter(Attendance.session_id.in_(session_ids)).delete(synchronize_session=False)

        db.query(DBSession).filter(DBSession.user_id == user_id).delete(synchronize_session=False)
        db.query(Student).filter(Student.user_id == user_id).delete(synchronize_session=False)
        db.query(Group).filter(Group.user_id == user_id).delete(synchronize_session=False)
        db.query(MonthlyReport).filter(MonthlyReport.user_id == user_id).delete(synchronize_session=False)
        db.query(NotificationLog).filter(NotificationLog.user_id == user_id).delete(synchronize_session=False)
        db.query(CorrectionProject).filter(CorrectionProject.user_id == user_id).delete(synchronize_session=False)
        db.commit()
        return {"success": True, "message": "Base de données nettoyée avec succès ! Votre compte est maintenant vierge et prêt."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur lors du nettoyage : {str(e)}")

# Export full database endpoint
@app.get("/api/settings/export")
def export_database(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = current_user
    students = db.query(Student).filter(Student.user_id == user.id).all()
    groups = db.query(Group).filter(Group.user_id == user.id).all()
    sessions_list = db.query(DBSession).filter(DBSession.user_id == user.id).all()
    
    student_ids = [s.id for s in students]
    payments_list = db.query(Payment).filter(Payment.student_id.in_(student_ids)).all() if student_ids else []
    
    return {
        "version": "2.0.0",
        "app": "Étude Math Pro",
        "export_date": str(datetime.date.today()),
        "user": {
            "name": user.name if user else "",
            "email": user.email if user else "",
            "phone": user.phone if user else "",
            "currency": user.currency if user else "DT",
            "school_year": user.school_year if user else "2025-2026",
            "avatar": user.avatar if user else None
        } if user else {},
        "groups": [{"id": g.id, "name": g.name, "level": g.level, "capacity": g.capacity, "schedule": g.schedule, "color": g.color, "location": g.location} for g in groups],
        "students": [{
            "id": s.id, "code": s.student_code, "first_name": s.first_name, "last_name": s.last_name,
            "level": s.level, "phone": s.student_phone,
            "father_phone": s.father_phone, "mother_phone": s.mother_phone,
            "price": s.monthly_price, "group_id": s.group_id, "is_active": s.is_active, "notes": s.notes
        } for s in students],
        "sessions": [{"id": s.id, "group_id": s.group_id, "date": str(s.date), "start_time": s.start_time, "end_time": s.end_time, "topic": s.topic, "location": s.location, "status": s.status} for s in sessions_list],
        "payments": [{"id": p.id, "student_id": p.student_id, "month": p.month, "amount": p.amount, "status": p.status, "date": str(p.payment_date), "method": p.payment_method, "receipt_number": p.receipt_number} for p in payments_list]
    }

# Import full database endpoint
@app.post("/api/settings/import")
def import_database(
    payload: Dict[str, Any] = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Restore database from exported JSON file for the authenticated teacher."""
    try:
        user_id = current_user.id
        # 1. Clear current user's tables
        student_ids = [s.id for s in db.query(Student.id).filter(Student.user_id == user_id).all()]
        session_ids = [s.id for s in db.query(DBSession.id).filter(DBSession.user_id == user_id).all()]

        if student_ids:
            db.query(Attendance).filter(Attendance.student_id.in_(student_ids)).delete(synchronize_session=False)
            db.query(Payment).filter(Payment.student_id.in_(student_ids)).delete(synchronize_session=False)
            db.query(StudentNote).filter(StudentNote.student_id.in_(student_ids)).delete(synchronize_session=False)
        if session_ids:
            db.query(Attendance).filter(Attendance.session_id.in_(session_ids)).delete(synchronize_session=False)

        db.query(DBSession).filter(DBSession.user_id == user_id).delete(synchronize_session=False)
        db.query(Student).filter(Student.user_id == user_id).delete(synchronize_session=False)
        db.query(Group).filter(Group.user_id == user_id).delete(synchronize_session=False)
        db.commit()

        # 2. Restore user profile if present
        user_data = payload.get("user")
        if user_data:
            if user_data.get("name"): current_user.name = user_data["name"]
            if user_data.get("phone"): current_user.phone = user_data["phone"]
            if user_data.get("currency"): current_user.currency = user_data["currency"]
            if user_data.get("school_year"): current_user.school_year = user_data["school_year"]
            if user_data.get("avatar"): current_user.avatar = user_data["avatar"]

        # Helper to normalize incoming level strings
        def clean_level(raw_lvl: str) -> str:
            val = (raw_lvl or "").strip().lower()
            if "bac" in val: return "Bac"
            if "2" in val: return "2ème"
            if "3" in val: return "3ème"
            if "9" in val or "1" in val: return "1ère"
            return "Bac"

        # 3. Restore groups (mapping old id to new id)
        group_id_map = {}
        for g_data in payload.get("groups", []):
            old_id = g_data.get("id")
            new_group = Group(
                user_id=user_id,
                name=g_data.get("name", "Groupe"),
                level=clean_level(g_data.get("level")),
                capacity=g_data.get("capacity", 15),
                schedule=g_data.get("schedule", ""),
                color=g_data.get("color", "#7c3aed"),
                location=g_data.get("location", "Salle 1")
            )
            db.add(new_group)
            db.flush()
            if old_id:
                group_id_map[old_id] = new_group.id

        # 4. Restore students
        student_id_map = {}
        for s_data in payload.get("students", []):
            old_id = s_data.get("id")
            old_grp_id = s_data.get("group_id")
            mapped_grp_id = group_id_map.get(old_grp_id) if old_grp_id else None

            new_student = Student(
                user_id=user_id,
                student_code=s_data.get("code") or s_data.get("student_code") or f"ST-{datetime.datetime.utcnow().timestamp()}",
                first_name=s_data.get("first_name") or s_data.get("name", "Élève").split(" ")[0],
                last_name=s_data.get("last_name") or (" ".join(s_data.get("name", "").split(" ")[1:]) if " " in s_data.get("name", "") else ""),
                level=clean_level(s_data.get("level")),
                student_phone=s_data.get("phone") or s_data.get("student_phone"),
                father_phone=s_data.get("father_phone"),
                mother_phone=s_data.get("mother_phone"),
                monthly_price=float(s_data.get("price") or s_data.get("monthly_price") or 70.0),
                notes=s_data.get("notes"),
                group_id=mapped_grp_id,
                is_active=s_data.get("is_active", True)
            )
            db.add(new_student)
            db.flush()
            if old_id:
                student_id_map[old_id] = new_student.id

        # 5. Restore sessions
        for sess_data in payload.get("sessions", []):
            old_grp_id = sess_data.get("group_id")
            mapped_grp_id = group_id_map.get(old_grp_id)
            date_val = None
            if sess_data.get("date"):
                try:
                    date_val = datetime.date.fromisoformat(sess_data["date"])
                except Exception:
                    date_val = datetime.date.today()

            new_session = DBSession(
                user_id=user_id,
                group_id=mapped_grp_id,
                date=date_val or datetime.date.today(),
                start_time=sess_data.get("start_time", "08:00"),
                end_time=sess_data.get("end_time", "10:00"),
                topic=sess_data.get("topic", "Cours de Mathématiques"),
                location=sess_data.get("location", "Salle 1"),
                status=sess_data.get("status", "scheduled")
            )
            db.add(new_session)

        # 6. Restore payments
        for pay_data in payload.get("payments", []):
            old_st_id = pay_data.get("student_id")
            mapped_st_id = student_id_map.get(old_st_id)
            if mapped_st_id:
                pay_date_val = None
                if pay_data.get("date") or pay_data.get("payment_date"):
                    try:
                        pay_date_val = datetime.date.fromisoformat(pay_data.get("date") or pay_data.get("payment_date"))
                    except Exception:
                        pay_date_val = datetime.date.today()

                raw_method = pay_data.get("method") or pay_data.get("payment_method") or "Espèces"
                cleaned_method = "Virement bancaire" if "vir" in str(raw_method).lower() else "Espèces"

                new_pay = Payment(
                    student_id=mapped_st_id,
                    month=pay_data.get("month", "Septembre 2025"),
                    amount=float(pay_data.get("amount", 70.0)),
                    status=pay_data.get("status", "paid"),
                    payment_date=pay_date_val or datetime.date.today(),
                    payment_method=cleaned_method,
                    receipt_number=pay_data.get("receipt_number") or f"REC-{datetime.datetime.utcnow().strftime('%Y%m')}-001"
                )
                db.add(new_pay)

        db.commit()
        return {
            "success": True,
            "message": f"Sauvegarde importée avec succès ({len(payload.get('students', []))} élèves, {len(payload.get('groups', []))} groupes restaurés) !"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Erreur lors de l'importation de la sauvegarde : {str(e)}")

# Serve frontend static assets
import sys

if getattr(sys, 'frozen', False):
    BUNDLE_DIR = getattr(sys, '_MEIPASS', os.path.dirname(sys.executable))
    FRONTEND_DIR = os.path.join(BUNDLE_DIR, "frontend")
    if not os.path.exists(FRONTEND_DIR):
        FRONTEND_DIR = os.path.join(os.path.dirname(sys.executable), "frontend")
else:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

if os.path.exists(FRONTEND_DIR):
    css_dir = os.path.join(FRONTEND_DIR, "css")
    js_dir = os.path.join(FRONTEND_DIR, "js")
    if os.path.exists(css_dir):
        app.mount("/css", StaticFiles(directory=css_dir), name="css")
    if os.path.exists(js_dir):
        app.mount("/js", StaticFiles(directory=js_dir), name="js")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        file_path = os.path.join(FRONTEND_DIR, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
