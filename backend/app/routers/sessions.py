from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
from ..database import get_db
from ..models import Session as DBSession, Group, Student, Attendance, User
from ..schemas import SessionCreate, SessionUpdate, SessionOut
from .auth import get_current_user, require_admin, get_tenant_admin_id, log_audit

router = APIRouter(prefix="/api/sessions", tags=["sessions"])

DAY_NAMES_FR = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
DAY_NAMES_AR = ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"]

def check_time_overlap(start1: str, end1: str, start2: str, end2: str) -> bool:
    """Return True if time intervals [start1, end1] and [start2, end2] overlap."""
    return (start1 < end2) and (end1 > start2)

def detect_session_conflict(session_id: Optional[int], group_id: int, date: datetime.date, start_time: str, end_time: str, db: Session, user_id: int) -> tuple[bool, Optional[str]]:
    query = db.query(DBSession).filter(
        DBSession.user_id == user_id,
        DBSession.date == date
    )
    if session_id:
        query = query.filter(DBSession.id != session_id)
    
    other_sessions = query.all()
    for other in other_sessions:
        if check_time_overlap(start_time, end_time, other.start_time, other.end_time):
            other_grp_name = other.group.name if other.group else "un autre groupe"
            return True, f"Chevauchement d'horaire avec {other_grp_name} ({other.start_time} - {other.end_time})"
    return False, None

def build_session_out(session: DBSession, db: Session, user_id: int) -> dict:
    student_count = db.query(Student).filter(Student.group_id == session.group_id, Student.is_active == True).count()
    attended_count = db.query(Attendance).filter(Attendance.session_id == session.id, Attendance.status.in_(["present", "late"])).count()
    is_completed = db.query(Attendance).filter(Attendance.session_id == session.id).count() > 0

    return {
        "id": session.id,
        "group_id": session.group_id,
        "group_name": session.group.name if session.group else "",
        "group_color": session.group.color if session.group else "#4f46e5",
        "level": session.group.level if session.group else "",
        "date": session.date,
        "start_time": session.start_time,
        "end_time": session.end_time,
        "topic": session.topic,
        "location": session.location or "Salle 1",
        "notes": session.notes,
        "status": session.status or "scheduled",
        "student_count": student_count,
        "attended_count": attended_count,
        "is_completed": is_completed,
        "has_conflict": False,
        "conflict_details": None,
        "is_recurring": False,
        "is_exception": False,
        "is_virtual": False,
        "created_at": session.created_at
    }

@router.get("/timetable-summary")
def get_timetable_summary(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tenant_id = get_tenant_admin_id(current_user)
    today = datetime.date.today()

    if start_date:
        try:
            d_start = datetime.datetime.strptime(start_date, "%Y-%m-%d").date()
        except Exception:
            d_start = today - datetime.timedelta(days=today.weekday())
    else:
        d_start = today - datetime.timedelta(days=today.weekday())

    if end_date:
        try:
            d_end = datetime.datetime.strptime(end_date, "%Y-%m-%d").date()
        except Exception:
            d_end = d_start + datetime.timedelta(days=6)
    else:
        d_end = d_start + datetime.timedelta(days=6)

    sessions = db.query(DBSession).filter(
        DBSession.user_id == tenant_id,
        DBSession.date >= d_start,
        DBSession.date <= d_end
    ).order_by(DBSession.date.asc(), DBSession.start_time.asc()).all()

    items = []
    total_weekly_minutes = 0

    for s in sessions:
        try:
            h1, m1 = map(int, s.start_time.split(":"))
            h2, m2 = map(int, s.end_time.split(":"))
            dur_min = (h2 * 60 + m2) - (h1 * 60 + m1)
            if dur_min <= 0: dur_min = 120
        except Exception:
            dur_min = 120
            
        total_weekly_minutes += dur_min
        student_count = db.query(Student).filter(Student.group_id == s.group_id, Student.is_active == True).count()
        day_idx = s.date.weekday()

        items.append({
            "session_id": s.id,
            "group_id": s.group_id,
            "group_name": s.group.name if s.group else "",
            "level": s.group.level if s.group else "",
            "date": s.date,
            "day_of_week": day_idx,
            "day_name_fr": DAY_NAMES_FR[day_idx] if 0 <= day_idx < 7 else "",
            "day_name_ar": DAY_NAMES_AR[day_idx] if 0 <= day_idx < 7 else "",
            "start_time": s.start_time,
            "end_time": s.end_time,
            "duration_minutes": dur_min,
            "location": s.location or "Salle 1",
            "color": s.group.color if s.group else "#4f46e5",
            "student_count": student_count,
            "capacity": s.group.capacity if s.group else 15
        })

    total_hours = round(total_weekly_minutes / 60, 1)

    days_breakdown = []
    for day_idx in range(7):
        day_items = [it for it in items if it["day_of_week"] == day_idx]
        day_mins = sum(it["duration_minutes"] for it in day_items)
        day_hrs = round(day_mins / 60, 1)
        if day_mins == 0:
            formatted_hrs = "0h"
        elif day_mins % 60 == 0:
            formatted_hrs = f"{day_mins // 60}h"
        else:
            formatted_hrs = f"{day_mins // 60}h{day_mins % 60:02d}"

        days_breakdown.append({
            "day_of_week": day_idx,
            "day_name_fr": DAY_NAMES_FR[day_idx],
            "day_name_ar": DAY_NAMES_AR[day_idx],
            "sessions_count": len(day_items),
            "total_minutes": day_mins,
            "total_hours": day_hrs,
            "total_hours_formatted": formatted_hrs,
            "sessions": day_items
        })

    all_groups_count = db.query(Group).filter(Group.user_id == tenant_id).count()

    return {
        "total_groups": all_groups_count,
        "active_scheduled_groups": len(set(s.group_id for s in sessions)),
        "total_weekly_hours": total_hours,
        "total_weekly_minutes": total_weekly_minutes,
        "schedule_items": items,
        "days_breakdown": days_breakdown
    }

@router.get("", response_model=List[SessionOut])
def list_sessions(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    group_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tenant_id = get_tenant_admin_id(current_user)
    today = datetime.date.today()

    if start_date:
        try:
            d_start = datetime.datetime.strptime(start_date, "%Y-%m-%d").date()
        except Exception:
            d_start = today - datetime.timedelta(days=today.weekday())
    else:
        d_start = today - datetime.timedelta(days=today.weekday())

    if end_date:
        try:
            d_end = datetime.datetime.strptime(end_date, "%Y-%m-%d").date()
        except Exception:
            d_end = d_start + datetime.timedelta(days=6)
    else:
        d_end = d_start + datetime.timedelta(days=6)

    query = db.query(DBSession).filter(
        DBSession.user_id == tenant_id,
        DBSession.date >= d_start,
        DBSession.date <= d_end
    )
    if group_id and group_id > 0:
        query = query.filter(DBSession.group_id == group_id)

    db_sessions = query.order_by(DBSession.date.asc(), DBSession.start_time.asc()).all()
    return [build_session_out(s, db, tenant_id) for s in db_sessions]

@router.post("", response_model=SessionOut)
@router.post("/resolve", response_model=SessionOut)
def create_session(
    data: SessionCreate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    tenant_id = get_tenant_admin_id(admin_user)
    group = db.query(Group).filter(Group.id == data.group_id, Group.user_id == tenant_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Groupe non trouvé")

    target_date = data.date or datetime.date.today()
    start_time = data.start_time or "10:00"
    end_time = data.end_time or "12:00"

    # Conflict check
    has_conflict, conflict_msg = detect_session_conflict(None, group.id, target_date, start_time, end_time, db, tenant_id)
    if has_conflict and not getattr(data, 'force', False):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"message": conflict_msg, "conflict_details": conflict_msg}
        )

    sess = DBSession(
        user_id=tenant_id,
        group_id=group.id,
        date=target_date,
        start_time=start_time,
        end_time=end_time,
        topic=data.topic,
        location=data.location or "Salle 1",
        notes=data.notes,
        status=data.status or "scheduled"
    )
    db.add(sess)
    db.commit()
    db.refresh(sess)

    log_audit(
        db=db,
        user=admin_user,
        action="SESSION_CREATED",
        entity_type="session",
        entity_id=sess.id,
        new_value={"date": str(sess.date), "group_id": sess.group_id, "start_time": sess.start_time, "end_time": sess.end_time}
    )

    return build_session_out(sess, db, tenant_id)

@router.post("/set-group-recurring")
@router.post("/schedule")
def legacy_schedule_slot(
    data: dict,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Compatibility endpoint to schedule a session on the given day."""
    tenant_id = get_tenant_admin_id(admin_user)
    group_id = data.get("group_id")
    day_of_week = int(data.get("day_of_week", 0))
    start_time = str(data.get("start_time", "10:00")).strip()
    end_time = str(data.get("end_time", "12:00")).strip()
    location = str(data.get("location", "Salle 1")).strip() or "Salle 1"
    force = bool(data.get("force", False))

    group = db.query(Group).filter(Group.id == group_id, Group.user_id == tenant_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Groupe non trouvé")

    # Compute target date for this weekday in current week
    today = datetime.date.today()
    curr_mon = today - datetime.timedelta(days=today.weekday())
    target_date = curr_mon + datetime.timedelta(days=day_of_week)

    has_conflict, conflict_msg = detect_session_conflict(None, group.id, target_date, start_time, end_time, db, tenant_id)
    if has_conflict and not force:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"message": conflict_msg, "conflict_details": conflict_msg}
        )

    sess = DBSession(
        user_id=tenant_id,
        group_id=group.id,
        date=target_date,
        start_time=start_time,
        end_time=end_time,
        location=location,
        status="scheduled"
    )
    db.add(sess)
    db.commit()
    db.refresh(sess)

    return {
        "success": True,
        "message": f"Séance programmée pour {group.name} le {target_date} ({start_time} - {end_time})",
        "session_id": sess.id
    }

@router.put("/{session_id}", response_model=SessionOut)
@router.patch("/{session_id}", response_model=SessionOut)
def update_session(
    session_id: int,
    data: SessionUpdate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    tenant_id = get_tenant_admin_id(admin_user)
    sess = db.query(DBSession).filter(DBSession.id == session_id, DBSession.user_id == tenant_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="Séance non trouvée")

    target_date = data.date or sess.date
    start_time = data.start_time or sess.start_time
    end_time = data.end_time or sess.end_time
    group_id = data.group_id or sess.group_id

    # Conflict check
    has_conflict, conflict_msg = detect_session_conflict(sess.id, group_id, target_date, start_time, end_time, db, tenant_id)
    if has_conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"message": conflict_msg, "conflict_details": conflict_msg}
        )

    old_val = {"date": str(sess.date), "start_time": sess.start_time, "end_time": sess.end_time, "status": sess.status}

    if data.group_id: sess.group_id = data.group_id
    if data.date: sess.date = data.date
    if data.start_time: sess.start_time = data.start_time
    if data.end_time: sess.end_time = data.end_time
    if data.topic is not None: sess.topic = data.topic
    if data.location is not None: sess.location = data.location
    if data.notes is not None: sess.notes = data.notes
    if data.status: sess.status = data.status

    db.commit()
    db.refresh(sess)

    log_audit(
        db=db,
        user=admin_user,
        action="SESSION_UPDATED",
        entity_type="session",
        entity_id=sess.id,
        old_value=old_val,
        new_value={"date": str(sess.date), "start_time": sess.start_time, "end_time": sess.end_time, "status": sess.status}
    )

    return build_session_out(sess, db, tenant_id)

@router.delete("/group/{group_id}")
def delete_group_sessions(
    group_id: int,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    tenant_id = get_tenant_admin_id(admin_user)
    deleted_count = db.query(DBSession).filter(DBSession.group_id == group_id, DBSession.user_id == tenant_id).delete()
    db.commit()
    return {"success": True, "message": f"{deleted_count} séance(s) supprimée(s)."}

@router.delete("/by-date/{group_id}/{date_str}")
def delete_session_by_date(
    group_id: int,
    date_str: str,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    tenant_id = get_tenant_admin_id(admin_user)
    target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
    sess = db.query(DBSession).filter(DBSession.group_id == group_id, DBSession.date == target_date, DBSession.user_id == tenant_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="Séance non trouvée")

    db.delete(sess)
    db.commit()
    return {"success": True, "message": "Séance supprimée avec succès."}

@router.delete("/{session_id}")
def delete_session(
    session_id: int,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete a single session specifically (ADMIN ONLY)."""
    tenant_id = get_tenant_admin_id(admin_user)
    sess = db.query(DBSession).filter(DBSession.id == session_id, DBSession.user_id == tenant_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="Séance non trouvée")

    old_info = {"date": str(sess.date), "start_time": sess.start_time, "group_id": sess.group_id}
    db.delete(sess)
    db.commit()

    log_audit(
        db=db,
        user=admin_user,
        action="SESSION_DELETED",
        entity_type="session",
        entity_id=session_id,
        old_value=old_info
    )

    return {
        "success": True,
        "message": "Séance supprimée avec succès."
    }
