from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc
from typing import List, Optional
import datetime
from ..database import get_db
from ..models import Student, Group, Session as DBSession, Attendance, Payment, StudentNote, User
from ..schemas import (
    StudentCreate, StudentUpdate, StudentOut, StudentDetailOut,
    StudentNoteCreate, StudentNoteOut, PaymentOut, GroupOut
)
from .auth import get_current_user

router = APIRouter(prefix="/api/students", tags=["students"])

def get_current_month_str() -> str:
    now = datetime.date.today()
    months_fr = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ]
    return f"{months_fr[now.month - 1]} {now.year}"

def get_active_month(db: Session, user_id: Optional[int] = None) -> str:
    """Return the active school month with data, or current calendar month."""
    curr_cal = get_current_month_str()
    # If payments exist for current calendar month, use it
    query = db.query(Payment)
    if user_id:
        student_ids = [s.id for s in db.query(Student.id).filter(Student.user_id == user_id).all()]
        query = query.filter(Payment.student_id.in_(student_ids))
    has_curr = query.filter(Payment.month == curr_cal).first()
    if has_curr:
        return curr_cal
    
    # Otherwise, return the most recent month recorded across all payments
    latest_pay = query.order_by(Payment.payment_date.desc(), Payment.id.desc()).first()
    if latest_pay and latest_pay.month:
        return latest_pay.month
        
    return curr_cal

def build_student_out(student: Student, db: Session, active_month: Optional[str] = None) -> dict:
    group_name = student.group.name if student.group else None
    
    # Calculate attendance
    total_sessions = db.query(Attendance).filter(Attendance.student_id == student.id).count()
    present_sessions = db.query(Attendance).filter(
        Attendance.student_id == student.id,
        Attendance.status.in_(["present", "late"])
    ).count()
    
    attendance_rate = round((present_sessions / total_sessions * 100), 1) if total_sessions > 0 else 100.0
    attendance_count = f"{present_sessions}/{total_sessions}" if total_sessions > 0 else "0/0"
    
    if not active_month:
        active_month = get_active_month(db, user_id=student.user_id)
        
    # Query payment specifically for active_month
    payment = db.query(Payment).filter(
        Payment.student_id == student.id,
        Payment.month == active_month
    ).first()
    
    # Also check most recent payment overall for the student
    latest_p = db.query(Payment).filter(
        Payment.student_id == student.id
    ).order_by(Payment.payment_date.desc(), Payment.id.desc()).first()
    
    payment_status = "unpaid"
    if payment:
        payment_status = payment.status
    elif latest_p and latest_p.status in ["paid", "partial"]:
        payment_status = latest_p.status
    
    last_pay_month = latest_p.month if latest_p else None
    last_pay_date = latest_p.payment_date if latest_p else None
    last_pay_amount = latest_p.amount if latest_p else None
    
    # Total paid across all time
    payments = db.query(Payment).filter(Payment.student_id == student.id).all()
    total_paid = sum(p.amount for p in payments)
    
    return {
        "id": student.id,
        "student_code": student.student_code,
        "first_name": student.first_name,
        "last_name": student.last_name,
        "level": student.level,
        "student_phone": student.student_phone,
        "father_phone": student.father_phone,
        "mother_phone": student.mother_phone,
        "monthly_price": student.monthly_price,
        "group_id": student.group_id,
        "group_name": group_name,
        "registration_date": student.registration_date,
        "notes": student.notes,
        "is_active": student.is_active,
        "attendance_rate": attendance_rate,
        "attendance_count": attendance_count,
        "current_month_payment_status": payment_status,
        "last_payment_month": last_pay_month,
        "last_payment_date": last_pay_date,
        "last_payment_amount": last_pay_amount,
        "active_month": active_month,
        "total_paid": total_paid,
        "created_at": student.created_at
    }

@router.get("", response_model=List[StudentOut])
def list_students(
    search: Optional[str] = None,
    level: Optional[str] = None,
    group_id: Optional[int] = None,
    payment_status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Student).filter(Student.user_id == current_user.id, Student.is_active == True)
    
    if level and level != "all":
        query = query.filter(Student.level == level)
    
    if group_id and group_id > 0:
        query = query.filter(Student.group_id == group_id)
        
    if search:
        search_clean = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Student.first_name.ilike(search_clean),
                Student.last_name.ilike(search_clean),
                (Student.first_name + " " + Student.last_name).ilike(search_clean),
                Student.student_code.ilike(search_clean),
                Student.student_phone.ilike(search_clean),
                Student.father_phone.ilike(search_clean),
                Student.mother_phone.ilike(search_clean)
            )
        )
    
    students = query.order_by(Student.last_name.asc(), Student.first_name.asc()).all()
    active_m = get_active_month(db, user_id=current_user.id)
    results = [build_student_out(s, db, active_month=active_m) for s in students]
    
    if payment_status and payment_status != "all":
        results = [r for r in results if r["current_month_payment_status"] == payment_status]
        
    return results

@router.post("", response_model=StudentOut)
def create_student(
    data: StudentCreate,
    force: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Auto-generate student code if not provided
    student_code = data.student_code
    if not student_code:
        current_year = datetime.date.today().year
        count = db.query(Student).filter(Student.user_id == current_user.id).count() + 1
        if current_user.id == 1:
            student_code = f"{current_year}-{count:03d}"
        else:
            student_code = f"{current_year}-T{current_user.id}-{count:03d}"
        
        # ensure globally unique across database
        while db.query(Student).filter(Student.student_code == student_code).first():
            count += 1
            if current_user.id == 1:
                student_code = f"{current_year}-{count:03d}"
            else:
                student_code = f"{current_year}-T{current_user.id}-{count:03d}"
            
    # Check group capacity and ownership
    if data.group_id:
        group = db.query(Group).filter(Group.id == data.group_id, Group.user_id == current_user.id).first()
        if not group:
            raise HTTPException(status_code=404, detail="Groupe non trouvé")
        current_count = db.query(Student).filter(Student.group_id == group.id, Student.is_active == True).count()
        if current_count >= group.capacity and not force:
            raise HTTPException(
                status_code=400,
                detail=f"Le groupe '{group.name}' est complet ({current_count}/{group.capacity} élèves). Augmentez sa capacité pour ajouter d'autres élèves."
            )

    student = Student(
        user_id=current_user.id,
        student_code=student_code,
        first_name=data.first_name.strip(),
        last_name=data.last_name.strip(),
        level=data.level,
        student_phone=data.student_phone,
        father_phone=data.father_phone,
        mother_phone=data.mother_phone,
        monthly_price=data.monthly_price,
        group_id=data.group_id,
        registration_date=data.registration_date or datetime.date.today(),
        notes=data.notes,
        is_active=data.is_active
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    
    return build_student_out(student, db)

@router.get("/{student_id}", response_model=StudentDetailOut)
def get_student_detail(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == student_id, Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Élève non trouvé")
        
    base_info = build_student_out(student, db)
    
    # Detailed attendance history
    attendances = db.query(Attendance).filter(Attendance.student_id == student.id).all()
    attendance_history = []
    for att in attendances:
        session = db.query(DBSession).filter(DBSession.id == att.session_id).first()
        attendance_history.append({
            "id": att.id,
            "session_id": att.session_id,
            "date": session.date.strftime("%Y-%m-%d") if session else "",
            "start_time": session.start_time if session else "",
            "end_time": session.end_time if session else "",
            "topic": session.topic if session else "",
            "status": att.status, # "present", "absent", "late"
            "notes": att.notes
        })
    # sort attendance history descending by date
    attendance_history.sort(key=lambda x: x["date"], reverse=True)
    
    # Detailed payment history
    payments = db.query(Payment).filter(Payment.student_id == student.id).order_by(Payment.payment_date.desc()).all()
    payment_history = []
    for p in payments:
        payment_history.append({
            "id": p.id,
            "student_id": p.student_id,
            "student_name": f"{student.first_name} {student.last_name}",
            "student_code": student.student_code,
            "month": p.month,
            "amount": p.amount,
            "payment_date": p.payment_date,
            "payment_method": p.payment_method,
            "status": p.status,
            "receipt_number": p.receipt_number,
            "monthly_price": student.monthly_price,
            "remaining_due": max(0.0, student.monthly_price - p.amount) if p.status != "paid" else 0.0,
            "notes": p.notes,
            "created_at": p.created_at
        })
        
    # Observations / Notes
    observations = db.query(StudentNote).filter(StudentNote.student_id == student.id).order_by(StudentNote.created_at.desc()).all()
    
    # Group Info
    group_info = None
    if student.group:
        g_count = db.query(Student).filter(Student.group_id == student.group.id, Student.is_active == True).count()
        group_info = {
            "id": student.group.id,
            "name": student.group.name,
            "level": student.group.level,
            "subject": student.group.subject,
            "capacity": student.group.capacity,
            "schedule": student.group.schedule,
            "day_of_week": student.group.day_of_week,
            "start_time": student.group.start_time,
            "end_time": student.group.end_time,
            "location": student.group.location,
            "color": student.group.color,
            "student_count": g_count,
            "is_full": g_count >= student.group.capacity,
            "created_at": student.group.created_at
        }
        
    base_info["attendance_history"] = attendance_history
    base_info["payment_history"] = payment_history
    base_info["observations"] = observations
    base_info["group_info"] = group_info
    
    return base_info

@router.put("/{student_id}", response_model=StudentOut)
def update_student(
    student_id: int,
    data: StudentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == student_id, Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Élève non trouvé")
        
    if data.group_id is not None and data.group_id != student.group_id:
        if data.group_id > 0:
            group = db.query(Group).filter(Group.id == data.group_id, Group.user_id == current_user.id).first()
            if not group:
                raise HTTPException(status_code=404, detail="Groupe non trouvé")
            curr_count = db.query(Student).filter(Student.group_id == group.id, Student.is_active == True).count()
            if curr_count >= group.capacity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Le groupe '{group.name}' est complet ({curr_count}/{group.capacity})."
                )
            student.group_id = data.group_id
        else:
            student.group_id = None
            
    if data.first_name is not None:
        student.first_name = data.first_name.strip()
    if data.last_name is not None:
        student.last_name = data.last_name.strip()
    if data.level is not None:
        student.level = data.level
    if data.student_phone is not None:
        student.student_phone = data.student_phone
    if data.father_phone is not None:
        student.father_phone = data.father_phone
    if data.mother_phone is not None:
        student.mother_phone = data.mother_phone
    if data.monthly_price is not None:
        student.monthly_price = data.monthly_price
    if data.registration_date is not None:
        student.registration_date = data.registration_date
    if data.notes is not None:
        student.notes = data.notes
    if data.is_active is not None:
        student.is_active = data.is_active
        
    db.commit()
    db.refresh(student)
    return build_student_out(student, db)

@router.delete("/{student_id}")
def delete_student(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == student_id, Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Élève non trouvé")
    db.delete(student)
    db.commit()
    return {"success": True, "message": "Élève supprimé avec succès"}

@router.post("/{student_id}/notes", response_model=StudentNoteOut)
def add_student_note(
    student_id: int,
    data: StudentNoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == student_id, Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Élève non trouvé")
        
    note = StudentNote(student_id=student.id, content=data.content.strip())
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

@router.delete("/notes/{note_id}")
def delete_student_note(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    note = db.query(StudentNote).join(Student).filter(
        StudentNote.id == note_id,
        Student.user_id == current_user.id
    ).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note non trouvée")
    db.delete(note)
    db.commit()
    return {"success": True, "message": "Note supprimée"}

