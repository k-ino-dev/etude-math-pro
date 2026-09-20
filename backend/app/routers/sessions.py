from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
from ..database import get_db
from ..models import Session as DBSession, Group, Student, Attendance, User
from ..schemas import SessionCreate, SessionUpdate, SessionOut
from .auth import get_current_user

router = APIRouter(prefix="/api/sessions", tags=["sessions"])

def check_time_overlap(start1: str, end1: str, start2: str, end2: str) -> bool:
    """Return True if time intervals [start1, end1] and [start2, end2] overlap."""
    return (start1 < end2) and (end1 > start2)

def detect_conflicts(session: DBSession, db: Session, user_id: Optional[int] = None) -> tuple[bool, Optional[str]]:
    """Check if session conflicts with another scheduled session of the same teacher on the same date."""
    query = db.query(DBSession).join(Group).filter(
        DBSession.date == session.date,
        DBSession.id != (session.id or 0),
        DBSession.status != "cancelled"
    )
    if user_id:
        query = query.filter(Group.user_id == user_id)
        
    other_sessions = query.all()
    
    for other in other_sessions:
        if check_time_overlap(session.start_time, session.end_time, other.start_time, other.end_time):
            other_group_name = other.group.name if other.group else "Autre groupe"
            return True, f"Chevauchement avec {other_group_name} ({other.start_time} - {other.end_time})"
            
    return False, None

def build_session_out(
    s: DBSession,
    db: Session,
    user_id: Optional[int] = None,
    is_recurring: bool = False,
    is_exception: bool = False
) -> dict:
    group = db.query(Group).filter(Group.id == s.group_id).first()
    group_name = group.name if group else "Groupe inconnu"
    level = group.level if group else ""
    uid = user_id or (group.user_id if group else None)
    
    student_count = db.query(Student).filter(Student.group_id == s.group_id, Student.is_active == True).count() if s.group_id else 0
    attended_count = db.query(Attendance).filter(Attendance.session_id == s.id, Attendance.status.in_(["present", "late"])).count()
    is_completed = db.query(Attendance).filter(Attendance.session_id == s.id).count() > 0
    
    has_conflict, conflict_details = detect_conflicts(s, db, user_id=uid)
    
    return {
        "id": s.id,
        "group_id": s.group_id,
        "group_name": group_name,
        "level": level,
        "date": s.date,
        "start_time": s.start_time,
        "end_time": s.end_time,
        "topic": s.topic,
        "location": s.location or (group.location if group else "Salle 1"),
        "notes": s.notes,
        "status": s.status,
        "student_count": student_count,
        "attended_count": attended_count,
        "is_completed": is_completed,
        "has_conflict": has_conflict,
        "conflict_details": conflict_details,
        "is_recurring": is_recurring,
        "is_exception": is_exception,
        "is_virtual": False,
        "created_at": s.created_at
    }

def synthesize_virtual_session(
    group: Group,
    target_date: datetime.date,
    db: Session,
    user_id: Optional[int] = None
) -> dict:
    student_count = db.query(Student).filter(Student.group_id == group.id, Student.is_active == True).count()
    return {
        "id": None,
        "group_id": group.id,
        "group_name": group.name,
        "level": group.level,
        "date": target_date,
        "start_time": group.start_time or "17:00",
        "end_time": group.end_time or "18:30",
        "topic": None,
        "location": group.location or "Salle 1",
        "notes": None,
        "status": "scheduled",
        "student_count": student_count,
        "attended_count": 0,
        "is_completed": False,
        "has_conflict": False,
        "conflict_details": None,
        "is_recurring": True,
        "is_exception": False,
        "is_virtual": True,
        "created_at": None
    }

@router.get("", response_model=List[SessionOut])
def list_sessions(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    group_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = datetime.date.today()
    if start_date:
        d_start = datetime.datetime.strptime(start_date, "%Y-%m-%d").date()
    else:
        # Default window: 4 weeks before today
        d_start = today - datetime.timedelta(days=28)
        
    if end_date:
        d_end = datetime.datetime.strptime(end_date, "%Y-%m-%d").date()
    else:
        # Default window: 12 weeks after today
        d_end = today + datetime.timedelta(days=84)

    # 1. Fetch real DBSession records in range
    db_query = db.query(DBSession).join(Group).filter(
        Group.user_id == current_user.id,
        DBSession.date >= d_start,
        DBSession.date <= d_end
    )
    if group_id and group_id > 0:
        db_query = db_query.filter(DBSession.group_id == group_id)
        
    db_sessions = db_query.all()
    db_sessions_map = {(s.group_id, s.date): s for s in db_sessions}

    # 2. Fetch recurring groups
    grp_query = db.query(Group).filter(
        Group.user_id == current_user.id,
        Group.day_of_week.isnot(None),
        Group.start_time.isnot(None),
        Group.end_time.isnot(None)
    )
    if group_id and group_id > 0:
        grp_query = grp_query.filter(Group.id == group_id)
        
    recurring_groups = grp_query.all()

    result_sessions = []
    processed_keys = set()

    # 3. For each recurring group, iterate through dates matching its day_of_week
    for grp in recurring_groups:
        cur_d = d_start
        while cur_d <= d_end:
            if cur_d.weekday() == grp.day_of_week:
                key = (grp.id, cur_d)
                processed_keys.add(key)
                
                if key in db_sessions_map:
                    s = db_sessions_map[key]
                    is_time_changed = (s.start_time != grp.start_time or s.end_time != grp.end_time)
                    is_cancelled = (s.status == "cancelled")
                    is_loc_changed = (s.location != grp.location)
                    is_exception = is_time_changed or is_cancelled or bool(s.topic) or is_loc_changed
                    result_sessions.append(build_session_out(s, db, user_id=current_user.id, is_recurring=True, is_exception=is_exception))
                else:
                    result_sessions.append(synthesize_virtual_session(grp, cur_d, db, user_id=current_user.id))
            cur_d += datetime.timedelta(days=1)

    # 4. Add standalone/non-recurring DBSessions
    for (gid, d), s in db_sessions_map.items():
        if (gid, d) not in processed_keys:
            result_sessions.append(build_session_out(s, db, user_id=current_user.id, is_recurring=False, is_exception=True))

    result_sessions.sort(key=lambda x: (x["date"], x["start_time"]))
    return result_sessions

@router.post("/resolve", response_model=SessionOut)
def resolve_or_create_session(
    data: SessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Given a group_id and date, either returns the existing DBSession (updating it)
    or creates/materializes it into a permanent DBSession with exception support.
    """
    group = db.query(Group).filter(Group.id == data.group_id, Group.user_id == current_user.id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Groupe non trouvé")
        
    existing = db.query(DBSession).filter(
        DBSession.group_id == data.group_id,
        DBSession.date == data.date
    ).first()
    
    if existing:
        existing.start_time = data.start_time or existing.start_time
        existing.end_time = data.end_time or existing.end_time
        if data.topic is not None: existing.topic = data.topic
        if data.location is not None: existing.location = data.location
        if data.notes is not None: existing.notes = data.notes
        if data.status is not None: existing.status = data.status
        db.commit()
        db.refresh(existing)
        return build_session_out(existing, db, user_id=current_user.id, is_recurring=True, is_exception=True)
    else:
        new_sess = DBSession(
            user_id=current_user.id,
            group_id=data.group_id,
            date=data.date,
            start_time=data.start_time or group.start_time or "17:00",
            end_time=data.end_time or group.end_time or "18:30",
            topic=data.topic,
            location=data.location or group.location or "Salle 1",
            notes=data.notes,
            status=data.status or "scheduled"
        )
        db.add(new_sess)
        db.commit()
        db.refresh(new_sess)
        return build_session_out(new_sess, db, user_id=current_user.id, is_recurring=True, is_exception=True)

@router.post("/revert-to-recurring")
def revert_to_recurring(
    group_id: int,
    date: datetime.date,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(DBSession).join(Group).filter(
        DBSession.group_id == group_id,
        DBSession.date == date,
        Group.user_id == current_user.id
    ).first()
    if session:
        db.delete(session)
        db.commit()
    return {"success": True, "message": "Horaire rétabli à l'horaire habituel du groupe."}

@router.post("", response_model=SessionOut)
def create_session(
    data: SessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    group = db.query(Group).filter(Group.id == data.group_id, Group.user_id == current_user.id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Groupe non trouvé")
        
    # Check conflicts
    temp_session = DBSession(
        group_id=data.group_id,
        date=data.date,
        start_time=data.start_time,
        end_time=data.end_time
    )
    has_conflict, conflict_details = detect_conflicts(temp_session, db, user_id=current_user.id)
    
    if has_conflict and not data.force:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "message": f"Conflit d'horaire détecté : {conflict_details}",
                "conflict_details": conflict_details
            }
        )
        
    # If a session already exists for this group on this date, update it as an override/exception
    existing = db.query(DBSession).filter(
        DBSession.group_id == data.group_id,
        DBSession.date == data.date
    ).first()
    
    if existing:
        existing.start_time = data.start_time
        existing.end_time = data.end_time
        existing.topic = data.topic
        existing.location = data.location or group.location
        existing.notes = data.notes
        existing.status = data.status
        db.commit()
        db.refresh(existing)
        return build_session_out(existing, db, user_id=current_user.id, is_recurring=True, is_exception=True)
        
    session = DBSession(
        user_id=current_user.id,
        group_id=data.group_id,
        date=data.date,
        start_time=data.start_time,
        end_time=data.end_time,
        topic=data.topic,
        location=data.location or group.location,
        notes=data.notes,
        status=data.status
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return build_session_out(session, db, user_id=current_user.id, is_recurring=True, is_exception=True)

@router.get("/{session_id}", response_model=SessionOut)
def get_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    s = db.query(DBSession).join(Group).filter(DBSession.id == session_id, Group.user_id == current_user.id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Séance non trouvée")
    return build_session_out(s, db, user_id=current_user.id)

@router.put("/{session_id}", response_model=SessionOut)
def update_session(
    session_id: int,
    data: SessionUpdate,
    force: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(DBSession).join(Group).filter(DBSession.id == session_id, Group.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Séance non trouvée")
        
    if data.group_id is not None:
        target_grp = db.query(Group).filter(Group.id == data.group_id, Group.user_id == current_user.id).first()
        if not target_grp:
            raise HTTPException(status_code=404, detail="Groupe non trouvé")
        session.group_id = data.group_id
    if data.date is not None:
        session.date = data.date
    if data.start_time is not None:
        session.start_time = data.start_time
    if data.end_time is not None:
        session.end_time = data.end_time
    if data.topic is not None:
        session.topic = data.topic
    if data.location is not None:
        session.location = data.location
    if data.notes is not None:
        session.notes = data.notes
    if data.status is not None:
        session.status = data.status
        
    # Check conflicts
    has_conflict, conflict_details = detect_conflicts(session, db, user_id=current_user.id)
    if has_conflict and not force:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "message": f"Conflit d'horaire détecté : {conflict_details}",
                "conflict_details": conflict_details
            }
        )
        
    db.commit()
    db.refresh(session)
    return build_session_out(session, db, user_id=current_user.id, is_recurring=True, is_exception=True)

@router.delete("/{session_id}")
def delete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(DBSession).join(Group).filter(DBSession.id == session_id, Group.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Séance non trouvée")
    db.delete(session)
    db.commit()
    return {"success": True, "message": "Séance supprimée / Exception retirée. L'horaire fixe du groupe s'applique à nouveau."}

