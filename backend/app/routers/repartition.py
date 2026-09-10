from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import math
from ..database import get_db
from ..models import Student, Group, User
from ..schemas import RepartitionProposal, RepartitionApplyRequest
from .auth import get_current_user

router = APIRouter(prefix="/api/repartition", tags=["repartition"])

@router.get("/preview")
def preview_repartition(
    level: str,
    target_capacity: int = 15,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    students = db.query(Student).filter(
        Student.user_id == current_user.id,
        Student.level == level,
        Student.is_active == True
    ).order_by(Student.last_name.asc(), Student.first_name.asc()).all()
    
    total = len(students)
    if total == 0:
        return {
            "level": level,
            "total_students": 0,
            "target_capacity": target_capacity,
            "groups_needed": 0,
            "proposals": []
        }
        
    num_groups = max(1, math.ceil(total / target_capacity))
    
    # Calculate group sizes nicely
    # ex: 42 students, cap 15 -> 3 groups: 14, 14, 14 OR 15, 15, 12
    base_size = total // num_groups
    remainder = total % num_groups
    
    letters = ["A", "B", "C", "D", "E", "F", "G", "H"]
    proposals = []
    
    # Check existing groups for this level
    existing_groups = db.query(Group).filter(Group.user_id == current_user.id, Group.level == level).order_by(Group.name.asc()).all()
    
    curr_idx = 0
    for i in range(num_groups):
        letter = letters[i] if i < len(letters) else f"G{i+1}"
        # Give 1 extra to earlier groups if remainder
        group_size = base_size + (1 if i < remainder else 0)
        
        assigned_students = students[curr_idx:curr_idx + group_size]
        curr_idx += group_size
        
        # Match with existing group if name matches or exists
        matched_group = existing_groups[i] if i < len(existing_groups) else None
        
        group_name = matched_group.name if matched_group else f"{level} {letter}"
        group_id = matched_group.id if matched_group else None
        
        proposals.append({
            "group_id": group_id,
            "group_name": group_name,
            "level": level,
            "target_count": group_size,
            "capacity": target_capacity,
            "students": [
                {
                    "id": s.id,
                    "student_code": s.student_code,
                    "name": f"{s.first_name} {s.last_name}",
                    "current_group_id": s.group_id,
                    "current_group_name": s.group.name if s.group else "Non assigné"
                }
                for s in assigned_students
            ]
        })
        
    return {
        "level": level,
        "total_students": total,
        "target_capacity": target_capacity,
        "groups_needed": num_groups,
        "proposals": proposals
    }

@router.post("/apply")
def apply_repartition(
    data: RepartitionApplyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated_count = 0
    
    for item in data.assignments:
        student = db.query(Student).filter(Student.id == item.student_id, Student.user_id == current_user.id).first()
        if not student:
            continue
            
        target_group_id = item.group_id
        
        # If group_id is null but group_name provided, find or create the group
        if not target_group_id and item.group_name:
            group = db.query(Group).filter(Group.name == item.group_name, Group.level == data.level, Group.user_id == current_user.id).first()
            if not group:
                group = Group(
                    user_id=current_user.id,
                    name=item.group_name,
                    level=data.level,
                    subject="Mathématiques",
                    capacity=15
                )
                db.add(group)
                db.commit()
                db.refresh(group)
            target_group_id = group.id
            
        student.group_id = target_group_id
        updated_count += 1
        
    db.commit()
    return {
        "success": True,
        "message": f"Répartition appliquée avec succès pour {updated_count} élèves."
    }

