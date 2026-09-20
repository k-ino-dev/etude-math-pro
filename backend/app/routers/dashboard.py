from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
import datetime
from ..database import get_db
from ..models import Student, Group, Session as DBSession, Attendance, Payment, User
from ..schemas import DashboardStats, SessionOut
from .students import get_current_month_str, get_active_month
from .sessions import build_session_out
from .auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = datetime.date.today()
    now_time = datetime.datetime.now().strftime("%H:%M")
    
    # 1. Total Students
    total_students = db.query(Student).filter(Student.user_id == current_user.id, Student.is_active == True).count()
    
    # 2. Total Groups
    total_groups = db.query(Group).filter(Group.user_id == current_user.id).count()
    
    # 3. Sessions Today (Recurring + Exceptions)
    from .sessions import list_sessions
    all_today = list_sessions(start_date=today.isoformat(), end_date=today.isoformat(), current_user=current_user, db=db)
    today_sessions = [s for s in all_today if s.get("status") != "cancelled"]
    sessions_today_count = len(today_sessions)
    
    # 4. Students Present Today
    today_session_ids = [s["id"] for s in today_sessions if s.get("id")]
    students_present_today = 0
    if today_session_ids:
        students_present_today = db.query(Attendance).filter(
            Attendance.session_id.in_(today_session_ids),
            Attendance.status.in_(["present", "late"])
        ).count()
    
    # 5. Next Session
    upcoming_end = today + datetime.timedelta(days=14)
    upcoming_sessions = list_sessions(start_date=today.isoformat(), end_date=upcoming_end.isoformat(), current_user=current_user, db=db)
    valid_upcoming = [
        s for s in upcoming_sessions 
        if s.get("status") != "cancelled" and (s["date"] > today or (s["date"] == today and s["end_time"] >= now_time))
    ]
    next_session = valid_upcoming[0] if valid_upcoming else (today_sessions[0] if today_sessions else None)
    
    # 6. Current Month Payments
    active_month = get_active_month(db, user_id=current_user.id)
    teacher_student_ids = [s.id for s in db.query(Student.id).filter(Student.user_id == current_user.id).all()]
    
    paid_this_month = []
    all_payments_this_month = []
    if teacher_student_ids:
        paid_this_month = db.query(Payment).filter(
            Payment.student_id.in_(teacher_student_ids),
            Payment.month == active_month,
            Payment.status == "paid"
        ).all()
        
        all_payments_this_month = db.query(Payment).filter(
            Payment.student_id.in_(teacher_student_ids),
            Payment.month == active_month
        ).all()
    
    total_collected_this_month = sum(p.amount for p in all_payments_this_month)
    
    # Total expected: sum of monthly_price of all active students
    all_active_students = db.query(Student).filter(Student.user_id == current_user.id, Student.is_active == True).all()
    total_expected_this_month = sum(s.monthly_price for s in all_active_students)
    
    # Paid students IDs
    paid_student_ids = {p.student_id for p in paid_this_month}
    unpaid_students = [s for s in all_active_students if s.id not in paid_student_ids]
    pending_payments_count = len(unpaid_students)
    
    # 7. Internal Alerts
    alerts = []
    
    if pending_payments_count > 0:
        alerts.append({
            "type": "warning",
            "icon": "alert-triangle",
            "title": "Paiements en attente",
            "message": f"{pending_payments_count} élève(s) n'ont pas encore réglé leur mensualité pour {active_month}."
        })
        
    # Check full groups
    groups = db.query(Group).filter(Group.user_id == current_user.id).all()
    for g in groups:
        g_count = db.query(Student).filter(Student.group_id == g.id, Student.is_active == True).count()
        if g_count >= g.capacity:
            alerts.append({
                "type": "info",
                "icon": "users",
                "title": "Groupe complet",
                "message": f"Le groupe '{g.name}' ({g.level}) a atteint sa capacité maximale ({g_count}/{g.capacity} élèves)."
            })
            
    # Check for schedule conflicts
    for s_out in today_sessions:
        if s_out.get("has_conflict"):
            alerts.append({
                "type": "danger",
                "icon": "calendar-x",
                "title": "Conflit d'horaire détecté",
                "message": f"Séance {s_out.get('group_name')} ({s_out.get('start_time')} - {s_out.get('end_time')}) : {s_out.get('conflict_details')}"
            })
            
    return {
        "total_students": total_students,
        "total_groups": total_groups,
        "students_present_today": students_present_today,
        "sessions_today": sessions_today_count,
        "pending_payments_count": pending_payments_count,
        "total_collected_this_month": total_collected_this_month,
        "total_expected_this_month": total_expected_this_month,
        "next_session": next_session,
        "today_sessions": today_sessions,
        "recent_alerts": alerts
    }

