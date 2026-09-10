from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Group, Student, User
from ..schemas import GroupCreate, GroupUpdate, GroupOut, StudentOut
from .students import build_student_out
from .auth import get_current_user

router = APIRouter(prefix="/api/groups", tags=["groups"])

def build_group_out(group: Group, db: Session) -> dict:
    count = db.query(Student).filter(Student.group_id == group.id, Student.is_active == True).count()
    return {
        "id": group.id,
        "name": group.name,
        "level": group.level,
        "subject": group.subject,
        "capacity": group.capacity,
        "schedule": group.schedule,
        "day_of_week": group.day_of_week,
        "start_time": group.start_time,
        "end_time": group.end_time,
        "location": group.location,
        "color": group.color,
        "created_at": group.created_at,
        "student_count": count,
        "is_full": count >= group.capacity
    }

@router.get("", response_model=List[GroupOut])
def list_groups(
    level: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Group).filter(Group.user_id == current_user.id)
    if level and level != "all":
        query = query.filter(Group.level == level)
    groups = query.order_by(Group.level.asc(), Group.name.asc()).all()
    return [build_group_out(g, db) for g in groups]

@router.post("", response_model=GroupOut)
def create_group(
    data: GroupCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    group = Group(
        user_id=current_user.id,
        name=data.name.strip(),
        level=data.level,
        subject=data.subject or "Mathématiques",
        capacity=data.capacity or 15,
        schedule=data.schedule,
        day_of_week=data.day_of_week,
        start_time=data.start_time,
        end_time=data.end_time,
        location=data.location or "Salle 1",
        color=data.color or "#4f46e5"
    )
    db.add(group)
    db.commit()
    db.refresh(group)
    return build_group_out(group, db)

@router.get("/{group_id}", response_model=GroupOut)
def get_group(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    group = db.query(Group).filter(Group.id == group_id, Group.user_id == current_user.id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Groupe non trouvé")
    return build_group_out(group, db)

@router.get("/{group_id}/students", response_model=List[StudentOut])
def get_group_students(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    group = db.query(Group).filter(Group.id == group_id, Group.user_id == current_user.id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Groupe non trouvé")
    students = db.query(Student).filter(Student.group_id == group.id, Student.is_active == True, Student.user_id == current_user.id).order_by(Student.last_name.asc()).all()
    return [build_student_out(s, db) for s in students]

@router.put("/{group_id}", response_model=GroupOut)
def update_group(
    group_id: int,
    data: GroupUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    group = db.query(Group).filter(Group.id == group_id, Group.user_id == current_user.id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Groupe non trouvé")
        
    if data.name is not None:
        group.name = data.name.strip()
    if data.level is not None:
        group.level = data.level
    if data.subject is not None:
        group.subject = data.subject
    if data.capacity is not None:
        group.capacity = data.capacity
    if data.schedule is not None:
        group.schedule = data.schedule
    if data.day_of_week is not None:
        group.day_of_week = data.day_of_week
    if data.start_time is not None:
        group.start_time = data.start_time
    if data.end_time is not None:
        group.end_time = data.end_time
    if data.location is not None:
        group.location = data.location
    if data.color is not None:
        group.color = data.color
        
    db.commit()
    db.refresh(group)
    return build_group_out(group, db)

@router.delete("/{group_id}")
def delete_group(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    group = db.query(Group).filter(Group.id == group_id, Group.user_id == current_user.id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Groupe non trouvé")
        
    # Unassign students from this group
    db.query(Student).filter(Student.group_id == group.id).update({"group_id": None})
    db.delete(group)
    db.commit()
    return {"success": True, "message": "Groupe supprimé avec succès"}

