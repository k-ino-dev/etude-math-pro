from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Attendance, Session as DBSession, Student, Group, User
from ..schemas import AttendanceBulkCreate, AttendanceOut
from .auth import get_current_user

router = APIRouter(prefix="/api/attendance", tags=["attendance"])

@router.get("/session/{session_id}")
def get_session_attendance(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(DBSession).join(Group).filter(DBSession.id == session_id, Group.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Séance non trouvée")
        
    group = db.query(Group).filter(Group.id == session.group_id).first()
    students = db.query(Student).filter(Student.group_id == session.group_id, Student.is_active == True, Student.user_id == current_user.id).order_by(Student.last_name.asc(), Student.first_name.asc()).all()
    
    # Existing attendance records for this session
    existing_records = {
        att.student_id: att for att in db.query(Attendance).filter(Attendance.session_id == session.id).all()
    }
    
    student_list = []
    for s in students:
        att = existing_records.get(s.id)
        student_list.append({
            "student_id": s.id,
            "student_code": s.student_code,
            "student_name": f"{s.first_name} {s.last_name}",
            "status": att.status if att else "present",
            "attendance_id": att.id if att else None,
            "notes": att.notes if att else ""
        })
        
    return {
        "session_id": session.id,
        "date": session.date,
        "start_time": session.start_time,
        "end_time": session.end_time,
        "group_id": session.group_id,
        "group_name": group.name if group else "",
        "level": group.level if group else "",
        "topic": session.topic or "",
        "notes": session.notes or "",
        "is_recorded": len(existing_records) > 0,
        "students": student_list
    }

@router.post("/bulk")
def record_bulk_attendance(
    data: AttendanceBulkCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(DBSession).join(Group).filter(DBSession.id == data.session_id, Group.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Séance non trouvée")
        
    # Update session topic and notes
    if data.topic is not None:
        session.topic = data.topic
    if data.notes is not None:
        session.notes = data.notes
    session.status = "completed"
    
    # Process each record
    for rec in data.records:
        # Check student belongs to current_user
        student = db.query(Student).filter(Student.id == rec.student_id, Student.user_id == current_user.id).first()
        if not student:
            continue
            
        existing = db.query(Attendance).filter(
            Attendance.session_id == data.session_id,
            Attendance.student_id == rec.student_id
        ).first()
        
        if existing:
            existing.status = rec.status
            existing.notes = rec.notes
        else:
            new_att = Attendance(
                session_id=data.session_id,
                student_id=rec.student_id,
                status=rec.status,
                notes=rec.notes
            )
            db.add(new_att)
            
    db.commit()
    return {"success": True, "message": "Présences enregistrées avec succès"}

