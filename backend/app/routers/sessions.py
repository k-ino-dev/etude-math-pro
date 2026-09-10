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

def build_session_out(s: DBSession, db: Session, user_id: Optional[int] = None) -> dict:
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
        "created_at": s.created_at
    }

@router.get("", response_model=List[SessionOut])
def list_sessions(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    group_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(DBSession).join(Group).filter(Group.user_id == current_user.id)
    
    if start_date:
        query = query.filter(DBSession.date >= datetime.datetime.strptime(start_date, "%Y-%m-%d").date())
    if end_date:
        query = query.filter(DBSession.date <= datetime.datetime.strptime(end_date, "%Y-%m-%d").date())
    if group_id and group_id > 0:
        query = query.filter(DBSession.group_id == group_id)
        
    sessions = query.order_by(DBSession.date.asc(), DBSession.start_time.asc()).all()
    return [build_session_out(s, db, user_id=current_user.id) for s in sessions]

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
        
    session = DBSession(
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
    return build_session_out(session, db, user_id=current_user.id)

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
    return build_session_out(session, db, user_id=current_user.id)

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
    return {"success": True, "message": "Séance supprimée"}

