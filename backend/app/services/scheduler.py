import os
import datetime
import threading
import time
import pytz
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models import (
    User, Student, Group, Session as DBSession, Payment, Attendance, MonthlyReport,
    NotificationSetting, NotificationLog
)
from .pdf_generator import (
    generate_monthly_pdf_report,
    REPORTS_DIR,
    generate_daily_schedule_pdf,
    format_date_long_fr,
    DAILY_REPORTS_DIR
)

MONTHS_NAMES_FR = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
]

_scheduler_thread = None
_scheduler_stop_event = threading.Event()

def build_schedule_data_for_date(db: Session, target_date: datetime.date, user_id: Optional[int] = None) -> Dict[str, Any]:
    query = db.query(DBSession).join(Group).filter(
        DBSession.date == target_date,
        DBSession.status != 'cancelled'
    )
    if user_id:
        query = query.filter(Group.user_id == user_id)
        
    sessions = query.order_by(DBSession.start_time).all()
    
    formatted_sessions = []
    total_minutes = 0
    
    for s in sessions:
        group_name = s.group.name if s.group else "Sans groupe"
        level = s.group.level if s.group and s.group.level else "---"
        student_count = len([st for st in s.group.students if st.is_active]) if s.group else 0
        location = s.location or "Salle 1"
        topic = s.topic or None
        
        start_str = s.start_time or "00:00"
        end_str = s.end_time or "00:00"
        
        try:
            sh, sm = map(int, start_str.split(":"))
            eh, em = map(int, end_str.split(":"))
            diff = (eh * 60 + em) - (sh * 60 + sm)
            if diff > 0:
                total_minutes += diff
        except Exception:
            total_minutes += 90
        
        formatted_sessions.append({
            "start_time": start_str,
            "end_time": end_str,
            "group_name": group_name,
            "level": level,
            "student_count": student_count,
            "location": location,
            "topic": topic
        })
        
    hours = int(total_minutes // 60)
    minutes = int(total_minutes % 60)
    total_duration_str = f"{hours}h{minutes:02d}" if minutes > 0 else f"{hours}h00"
    date_long_fr = format_date_long_fr(target_date)
    
    return {
        "target_date": target_date.isoformat(),
        "date_long_fr": date_long_fr,
        "sessions": formatted_sessions,
        "total_sessions": len(formatted_sessions),
        "total_duration_str": total_duration_str
    }

def generate_and_save_daily_pdf(db: Session, target_date: datetime.date, user_id: Optional[int] = None) -> str:
    schedule_data = build_schedule_data_for_date(db, target_date, user_id=user_id)
    os.makedirs(DAILY_REPORTS_DIR, exist_ok=True)
    suffix = f"_{user_id}" if user_id else ""
    output_path = os.path.join(DAILY_REPORTS_DIR, f"Planning_{target_date.isoformat()}{suffix}.pdf")
    generate_daily_schedule_pdf(schedule_data, output_path=output_path)
    return output_path

def compile_monthly_data(db: Session, target_date: Optional[datetime.date] = None, user_id: Optional[int] = None) -> Dict[str, Any]:
    if target_date is None:
        target_date = datetime.date.today()

    year = target_date.year
    month_num = target_date.month
    month_name = f"{MONTHS_NAMES_FR[month_num - 1]} {year}"
    month_key = f"{year}-{month_num:02d}"

    user = None
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = db.query(User).first()
    currency = user.currency if user else "DT"

    st_query = db.query(Student).filter(Student.is_active == True)
    if user_id:
        st_query = st_query.filter(Student.user_id == user_id)
    students = st_query.order_by(Student.last_name.asc()).all()
    total_students = len(students)

    st_ids = [s.id for s in students]
    payments = []
    if st_ids:
        payments = db.query(Payment).filter(
            Payment.student_id.in_(st_ids),
            Payment.month.ilike(f"%{month_name[:4]}%")
        ).all()

    payments_by_student = {p.student_id: p for p in payments}

    paid_students = []
    unpaid_students = []

    total_collected = 0.0
    total_expected = 0.0

    for s in students:
        total_expected += s.monthly_price
        p = payments_by_student.get(s.id)
        group_name = s.group.name if s.group else "Sans groupe"
        contact_phone = s.student_phone or s.father_phone or s.mother_phone or "---"

        if p and p.status == "paid":
            total_collected += p.amount
            paid_students.append({
                "id": s.id,
                "name": f"{s.first_name} {s.last_name}",
                "group": group_name,
                "level": s.level,
                "amount": p.amount,
                "date": p.payment_date,
                "method": p.payment_method,
                "receipt_number": p.receipt_number or "---"
            })
        elif p and p.status == "partial":
            total_collected += p.amount
            remaining = max(0.0, s.monthly_price - p.amount)
            unpaid_students.append({
                "id": s.id,
                "name": f"{s.first_name} {s.last_name}",
                "group": group_name,
                "level": s.level,
                "expected": s.monthly_price,
                "paid": p.amount,
                "remaining": remaining,
                "phone": contact_phone
            })
        else:
            unpaid_students.append({
                "id": s.id,
                "name": f"{s.first_name} {s.last_name}",
                "group": group_name,
                "level": s.level,
                "expected": s.monthly_price,
                "paid": 0.0,
                "remaining": s.monthly_price,
                "phone": contact_phone
            })

    total_remaining = max(0.0, total_expected - total_collected)
    paid_count = len(paid_students)
    unpaid_count = len(unpaid_students)

    return {
        "month_key": month_key,
        "month_name": month_name,
        "year": year,
        "month_num": month_num,
        "currency": currency,
        "teacher_name": user.name if user else "Professeur",
        "total_students": total_students,
        "paid_count": paid_count,
        "unpaid_count": unpaid_count,
        "total_collected": total_collected,
        "total_remaining": total_remaining,
        "total_expected": total_expected,
        "paid_students": paid_students,
        "unpaid_students": unpaid_students
    }

def startup_catchup_check():
    """Verify if today's scheduled notification was missed while server was restarting."""
    from .whatsapp import dispatch_daily_schedule_whatsapp, get_or_create_settings
    try:
        with SessionLocal() as db:
            users = db.query(User).all()
            for user in users:
                setting = get_or_create_settings(db, user_id=user.id)
                if not setting.is_enabled:
                    continue

                try:
                    tz = pytz.timezone(setting.timezone or "Africa/Tunis")
                except Exception:
                    tz = pytz.timezone("Africa/Tunis")

                now_tz = datetime.datetime.now(tz)
                today = now_tz.date()
                tomorrow = today + datetime.timedelta(days=1)

                target_time_str = setting.daily_schedule_time or "20:00"
                target_hour, target_min = map(int, target_time_str.split(":"))

                if now_tz.hour > target_hour or (now_tz.hour == target_hour and now_tz.minute >= target_min):
                    cleaned_phone = setting.whatsapp_phone.replace(" ", "").replace("+", "")
                    idempotency_key = f"daily_schedule_{user.id}_{tomorrow.isoformat()}_{cleaned_phone}"
                    existing = db.query(NotificationLog).filter(NotificationLog.idempotency_key == idempotency_key).first()

                    if not existing or existing.status not in ["sent", "simulated"]:
                        print(f"[STARTUP CATCH-UP] Rattrapage notification prof {user.id} pour {tomorrow.isoformat()}...")
                        dispatch_daily_schedule_whatsapp(db, target_date=tomorrow, force=False, user_id=user.id)
    except Exception as e:
        print(f"[STARTUP CATCH-UP] Notice: {e}")

def _scheduler_loop():
    """Background loop checking scheduled time every 30s."""
    from .whatsapp import dispatch_daily_schedule_whatsapp, get_or_create_settings

    while not _scheduler_stop_event.is_set():
        try:
            with SessionLocal() as db:
                users = db.query(User).all()
                for user in users:
                    setting = get_or_create_settings(db, user_id=user.id)
                    if setting.is_enabled:
                        try:
                            tz = pytz.timezone(setting.timezone or "Africa/Tunis")
                        except Exception:
                            tz = pytz.timezone("Africa/Tunis")

                        now_tz = datetime.datetime.now(tz)
                        today = now_tz.date()
                        tomorrow = today + datetime.timedelta(days=1)

                        target_time_str = setting.daily_schedule_time or "20:00"
                        target_hour, target_min = map(int, target_time_str.split(":"))

                        # If in the exact minute of scheduled time
                        if now_tz.hour == target_hour and now_tz.minute == target_min:
                            cleaned_phone = setting.whatsapp_phone.replace(" ", "").replace("+", "")
                            idempotency_key = f"daily_schedule_{user.id}_{tomorrow.isoformat()}_{cleaned_phone}"
                            existing = db.query(NotificationLog).filter(NotificationLog.idempotency_key == idempotency_key).first()

                            if not existing or existing.status not in ["sent", "simulated"]:
                                print(f"[SCHEDULER] Envoi programmé du planning prof {user.id} pour {tomorrow.isoformat()} ({target_time_str})...")
                                dispatch_daily_schedule_whatsapp(db, target_date=tomorrow, force=False, user_id=user.id)
        except Exception as e:
            print(f"[SCHEDULER ERROR] {e}")

        # Sleep in 10s increments checking stop event
        for _ in range(3):
            if _scheduler_stop_event.is_set():
                break
            time.sleep(10)

def start_scheduler():
    """Start background scheduler and run catch-up check."""
    global _scheduler_thread, _scheduler_stop_event
    _scheduler_stop_event.clear()
    
    # Catch-up check
    startup_catchup_check()

    # Start loop
    if _scheduler_thread is None or not _scheduler_thread.is_alive():
        _scheduler_thread = threading.Thread(target=_scheduler_loop, daemon=True, name="MathsProfScheduler")
        _scheduler_thread.start()
        print("[SCHEDULER] Background scheduler started.")

def shutdown_scheduler():
    """Stop background scheduler cleanly."""
    global _scheduler_stop_event
    _scheduler_stop_event.set()
    print("[SCHEDULER] Background scheduler signaled to stop.")

