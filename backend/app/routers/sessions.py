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

def detect_group_conflict(group_id: int, day_of_week: int, start_time: str, end_time: str, db: Session, user_id: int) -> tuple[bool, Optional[str]]:
    other_groups = db.query(Group).filter(
        Group.user_id == user_id,
        Group.id != group_id,
        Group.day_of_week == day_of_week,
        Group.start_time.isnot(None),
        Group.end_time.isnot(None)
    ).all()
    for other in other_groups:
        if check_time_overlap(start_time, end_time, other.start_time, other.end_time):
            day_name = DAY_NAMES_FR[day_of_week] if 0 <= day_of_week < 7 else "ce jour"
            return True, f"Chevauchement avec {other.name} le {day_name} ({other.start_time} - {other.end_time})"
    return False, None

def build_recurring_session_out(group: Group, target_date: datetime.date, db: Session, user_id: int) -> dict:
    student_count = db.query(Student).filter(Student.group_id == group.id, Student.is_active == True).count()
    
    # Check if attendance is recorded for this group on this date
    session_rec = db.query(DBSession).filter(DBSession.group_id == group.id, DBSession.date == target_date).first()
    s_id = session_rec.id if session_rec else group.id
    attended_count = 0
    is_completed = False
    if session_rec:
        attended_count = db.query(Attendance).filter(Attendance.session_id == session_rec.id, Attendance.status.in_(["present", "late"])).count()
        is_completed = db.query(Attendance).filter(Attendance.session_id == session_rec.id).count() > 0

    return {
        "id": s_id,
        "group_id": group.id,
        "group_name": group.name,
        "group_color": group.color or "#4f46e5",
        "level": group.level or "",
        "date": target_date,
        "start_time": group.start_time or "10:00",
        "end_time": group.end_time or "12:00",
        "topic": session_rec.topic if session_rec else None,
        "location": group.location or "Salle 1",
        "notes": session_rec.notes if session_rec else None,
        "status": "scheduled",
        "student_count": student_count,
        "attended_count": attended_count,
        "is_completed": is_completed,
        "has_conflict": False,
        "conflict_details": None,
        "is_recurring": True,
        "is_exception": False,
        "is_virtual": False,
        "created_at": group.created_at
    }

@router.get("/timetable-summary")
def get_timetable_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tenant_id = get_tenant_admin_id(current_user)
    groups = db.query(Group).filter(
        Group.user_id == tenant_id,
        Group.day_of_week.isnot(None),
        Group.start_time.isnot(None),
        Group.end_time.isnot(None)
    ).order_by(Group.day_of_week.asc(), Group.start_time.asc()).all()

    items = []
    total_weekly_minutes = 0

    for g in groups:
        try:
            h1, m1 = map(int, g.start_time.split(":"))
            h2, m2 = map(int, g.end_time.split(":"))
            dur_min = (h2 * 60 + m2) - (h1 * 60 + m1)
            if dur_min <= 0: dur_min = 120
        except Exception:
            dur_min = 120
            
        total_weekly_minutes += dur_min
        student_count = db.query(Student).filter(Student.group_id == g.id, Student.is_active == True).count()

        items.append({
            "group_id": g.id,
            "group_name": g.name,
            "level": g.level,
            "day_of_week": g.day_of_week,
            "day_name_fr": DAY_NAMES_FR[g.day_of_week] if 0 <= g.day_of_week < 7 else "",
            "day_name_ar": DAY_NAMES_AR[g.day_of_week] if 0 <= g.day_of_week < 7 else "",
            "start_time": g.start_time,
            "end_time": g.end_time,
            "duration_minutes": dur_min,
            "location": g.location or "Salle 1",
            "color": g.color or "#4f46e5",
            "student_count": student_count,
            "capacity": g.capacity
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
        "active_scheduled_groups": len(items),
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

    query = db.query(Group).filter(
        Group.user_id == tenant_id,
        Group.day_of_week.isnot(None),
        Group.start_time.isnot(None),
        Group.end_time.isnot(None)
    )
    if group_id and group_id > 0:
        query = query.filter(Group.id == group_id)

    scheduled_groups = query.order_by(Group.day_of_week.asc(), Group.start_time.asc()).all()

    result_sessions = []
    for grp in scheduled_groups:
        cur_d = d_start
        while cur_d <= d_end:
            if cur_d.weekday() == grp.day_of_week:
                result_sessions.append(build_recurring_session_out(grp, cur_d, db, tenant_id))
            cur_d += datetime.timedelta(days=1)

    result_sessions.sort(key=lambda x: (x["date"], x["start_time"]))
    return result_sessions

@router.post("/set-group-recurring")
@router.post("/schedule")
def set_group_schedule(
    data: dict,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
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

    # Conflict check
    has_conflict, conflict_msg = detect_group_conflict(group.id, day_of_week, start_time, end_time, db, tenant_id)
    if has_conflict and not force:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"message": conflict_msg, "conflict_details": conflict_msg}
        )

    day_name = DAY_NAMES_FR[day_of_week] if 0 <= day_of_week < 7 else "Jour"
    old_sched = group.schedule

    group.day_of_week = day_of_week
    group.start_time = start_time
    group.end_time = end_time
    group.location = location
    group.schedule = f"{day_name} {start_time} - {end_time}"

    # Clean any old standalone DBSession rows for this group
    db.query(DBSession).filter(DBSession.group_id == group.id, DBSession.user_id == tenant_id).delete()

    db.commit()
    db.refresh(group)

    log_audit(
        db=db,
        user=admin_user,
        action="SCHEDULE_UPDATED",
        entity_type="group_schedule",
        entity_id=group.id,
        old_value={"schedule": old_sched},
        new_value={"schedule": group.schedule, "day_of_week": group.day_of_week, "start_time": group.start_time, "end_time": group.end_time}
    )

    return {
        "success": True,
        "message": f"Programmation hebdomadaire enregistrée : {group.name} chaque {group.schedule}",
        "group": {
            "id": group.id,
            "name": group.name,
            "day_of_week": group.day_of_week,
            "start_time": group.start_time,
            "end_time": group.end_time,
            "schedule": group.schedule,
            "location": group.location,
            "color": group.color
        }
    }

@router.post("", response_model=SessionOut)
@router.post("/resolve", response_model=SessionOut)
def save_or_update_session(
    data: SessionCreate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    tenant_id = get_tenant_admin_id(admin_user)
    group = db.query(Group).filter(Group.id == data.group_id, Group.user_id == tenant_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Groupe non trouvé")

    day_idx = data.date.weekday() if data.date else (group.day_of_week if group.day_of_week is not None else 0)
    day_name = DAY_NAMES_FR[day_idx] if 0 <= day_idx < 7 else "Jour"
    start_time = data.start_time or group.start_time or "10:00"
    end_time = data.end_time or group.end_time or "12:00"

    # Conflict check
    has_conflict, conflict_msg = detect_group_conflict(group.id, day_idx, start_time, end_time, db, tenant_id)
    if has_conflict and not data.force:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"message": conflict_msg, "conflict_details": conflict_msg}
        )

    group.day_of_week = day_idx
    group.start_time = start_time
    group.end_time = end_time
    group.location = data.location or group.location or "Salle 1"
    group.schedule = f"{day_name} {group.start_time} - {group.end_time}"

    target_date = data.date or datetime.date.today()
    sess = db.query(DBSession).filter(DBSession.group_id == group.id, DBSession.date == target_date).first()
    if not sess:
        sess = DBSession(
            group_id=group.id,
            user_id=tenant_id,
            date=target_date,
            start_time=group.start_time,
            end_time=group.end_time,
            topic=data.topic,
            location=group.location,
            notes=data.notes,
            status=data.status or "scheduled"
        )
        db.add(sess)
    else:
        sess.start_time = group.start_time
        sess.end_time = group.end_time
        sess.location = group.location
        if data.topic:
            sess.topic = data.topic
        if data.notes:
            sess.notes = data.notes

    db.commit()
    db.refresh(group)
    db.refresh(sess)

    res = build_recurring_session_out(group, target_date, db, tenant_id)
    res["id"] = sess.id
    return res

@router.delete("/group/{group_id}")
@router.delete("/by-date/{group_id}/{date_str}")
@router.delete("/{session_id}")
def delete_schedule(
    session_id: Optional[int] = None,
    group_id: Optional[int] = None,
    date_str: Optional[str] = None,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete a weekly recurring schedule completely for a group (ADMIN ONLY)."""
    tenant_id = get_tenant_admin_id(admin_user)
    
    target_group_id = group_id or session_id
    group = db.query(Group).filter(Group.id == target_group_id, Group.user_id == tenant_id).first()
    
    if not group and session_id:
        sess = db.query(DBSession).filter(DBSession.id == session_id, DBSession.user_id == tenant_id).first()
        if sess:
            group = db.query(Group).filter(Group.id == sess.group_id, Group.user_id == tenant_id).first()

    if not group:
        raise HTTPException(status_code=404, detail="Groupe non trouvé")

    old_sched = group.schedule
    group.day_of_week = None
    group.start_time = None
    group.end_time = None
    group.schedule = None

    db.query(DBSession).filter(DBSession.group_id == group.id, DBSession.user_id == tenant_id).delete()
    db.commit()

    log_audit(
        db=db,
        user=admin_user,
        action="SCHEDULE_DELETED",
        entity_type="group_schedule",
        entity_id=group.id,
        old_value={"schedule": old_sched}
    )

    return {
        "success": True,
        "message": f"Programmation hebdomadaire supprimée pour {group.name}."
    }
