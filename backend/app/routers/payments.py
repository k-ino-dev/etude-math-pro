import os
import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from ..database import get_db
from ..models import Payment, Student, Group, User
from ..schemas import PaymentCreate, PaymentUpdate, PaymentOut
from ..services.pdf_generator import generate_payment_receipt_pdf, RECEIPTS_DIR
from .auth import get_current_user

router = APIRouter(prefix="/api/payments", tags=["payments"])

MONTHS_LIST = [
    "Septembre 2025", "Octobre 2025", "Novembre 2025", "Décembre 2025",
    "Janvier 2026", "Février 2026", "Mars 2026", "Avril 2026", "Mai 2026", "Juin 2026"
]

def build_payment_out(p: Payment, db: Session) -> dict:
    student = db.query(Student).filter(Student.id == p.student_id).first()
    student_name = f"{student.first_name} {student.last_name}" if student else "Élève inconnu"
    student_code = student.student_code if student else ""
    monthly_price = student.monthly_price if student else p.amount
    remaining_due = max(0.0, monthly_price - p.amount) if p.status != "paid" else 0.0

    return {
        "id": p.id,
        "student_id": p.student_id,
        "student_name": student_name,
        "student_code": student_code,
        "month": p.month,
        "amount": p.amount,
        "payment_date": p.payment_date,
        "payment_method": p.payment_method,
        "status": p.status,
        "receipt_number": p.receipt_number,
        "monthly_price": monthly_price,
        "remaining_due": remaining_due,
        "notes": p.notes,
        "created_at": p.created_at
    }

@router.get("", response_model=List[PaymentOut])
def list_payments(
    student_id: Optional[int] = None,
    month: Optional[str] = None,
    status: Optional[str] = None,
    group_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Payment).join(Student).filter(Student.user_id == current_user.id)
    
    if student_id:
        query = query.filter(Payment.student_id == student_id)
    if month and month != "all":
        query = query.filter(Payment.month == month)
    if status and status != "all":
        query = query.filter(Payment.status == status)
    if group_id and group_id > 0:
        query = query.filter(Student.group_id == group_id)
        
    payments = query.order_by(Payment.payment_date.desc(), Payment.id.desc()).all()
    return [build_payment_out(p, db) for p in payments]

@router.post("", response_model=PaymentOut)
def create_payment(
    data: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == data.student_id, Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Élève non trouvé")
        
    # Auto-generate receipt number if missing
    receipt_num = data.receipt_number
    if not receipt_num:
        year = datetime.date.today().year
        count = db.query(Payment).join(Student).filter(Student.user_id == current_user.id).count() + 1
        receipt_num = f"REC-{year}-{count:04d}"
        
    # Calculate status
    status_val = data.status
    if not status_val:
        if data.amount >= student.monthly_price:
            status_val = "paid"
        elif data.amount > 0:
            status_val = "partial"
        else:
            status_val = "unpaid"
            
    payment = Payment(
        student_id=data.student_id,
        month=data.month,
        amount=data.amount,
        payment_date=data.payment_date or datetime.date.today(),
        payment_method=data.payment_method or "Espèces",
        status=status_val,
        receipt_number=receipt_num,
        notes=data.notes
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return build_payment_out(payment, db)

@router.put("/{payment_id}", response_model=PaymentOut)
def update_payment(
    payment_id: int,
    data: PaymentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).join(Student).filter(Payment.id == payment_id, Student.user_id == current_user.id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Paiement non trouvé")
        
    if data.amount is not None:
        payment.amount = data.amount
    if data.payment_date is not None:
        payment.payment_date = data.payment_date
    if data.payment_method is not None:
        payment.payment_method = data.payment_method
    if data.status is not None:
        payment.status = data.status
    if data.notes is not None:
        payment.notes = data.notes
        
    db.commit()
    db.refresh(payment)
    return build_payment_out(payment, db)

@router.delete("/{payment_id}")
def delete_payment(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).join(Student).filter(Payment.id == payment_id, Student.user_id == current_user.id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Paiement non trouvé")
    db.delete(payment)
    db.commit()
    return {"success": True, "message": "Paiement supprimé"}

@router.get("/summary/matrix")
def get_payment_matrix(
    level: Optional[str] = None,
    group_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Student).filter(Student.user_id == current_user.id, Student.is_active == True)
    if level and level != "all":
        query = query.filter(Student.level == level)
    if group_id and group_id > 0:
        query = query.filter(Student.group_id == group_id)
        
    students = query.order_by(Student.last_name.asc(), Student.first_name.asc()).all()
    
    matrix_rows = []
    total_expected = 0.0
    total_collected = 0.0
    
    for s in students:
        s_payments = {p.month: p for p in db.query(Payment).filter(Payment.student_id == s.id).all()}
        months_data = {}
        for m in MONTHS_LIST:
            p = s_payments.get(m)
            if p:
                months_data[m] = {
                    "status": p.status,
                    "amount": p.amount,
                    "payment_id": p.id,
                    "date": str(p.payment_date)
                }
                total_collected += p.amount
            else:
                months_data[m] = {
                    "status": "unpaid",
                    "amount": 0.0,
                    "payment_id": None,
                    "date": None
                }
            total_expected += s.monthly_price
            
        matrix_rows.append({
            "student_id": s.id,
            "student_code": s.student_code,
            "student_name": f"{s.first_name} {s.last_name}",
            "group_name": s.group.name if s.group else "Sans groupe",
            "level": s.level,
            "monthly_price": s.monthly_price,
            "months": months_data
        })
        
    return {
        "months": MONTHS_LIST,
        "students_count": len(students),
        "total_collected": total_collected,
        "total_expected": total_expected,
        "total_due": max(0.0, total_expected - total_collected),
        "rows": matrix_rows
    }

@router.get("/{payment_id}/receipt")
def get_payment_receipt(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).join(Student).filter(Payment.id == payment_id, Student.user_id == current_user.id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Paiement non trouvé")
    
    student = db.query(Student).filter(Student.id == payment.student_id).first()
    group = db.query(Group).filter(Group.id == student.group_id).first() if student and student.group_id else None
    
    monthly_price = student.monthly_price if student else payment.amount
    is_fully_paid = (payment.status == "paid") or (payment.amount >= monthly_price and payment.amount > 0)
    remaining_due = max(0.0, monthly_price - payment.amount) if not is_fully_paid else 0.0
    status_display = "RÉGLÉ" if is_fully_paid else ("PARTIEL" if payment.status == "partial" else "EN ATTENTE")
    
    return {
        "receipt_number": payment.receipt_number,
        "date": payment.payment_date,
        "teacher_name": current_user.name or "Professeur de Mathématiques",
        "teacher_phone": current_user.phone or "",
        "school_year": current_user.school_year or "2025-2026",
        "student_name": f"{student.first_name} {student.last_name}" if student else "",
        "level": student.level if student else "",
        "group_name": group.name if group else "",
        "month": payment.month,
        "amount_paid": payment.amount,
        "monthly_price": monthly_price,
        "remaining_due": remaining_due,
        "is_fully_paid": is_fully_paid,
        "status_display": status_display,
        "payment_method": payment.payment_method,
        "status": payment.status,
        "currency": current_user.currency or "DT",
        "notes": payment.notes
    }

@router.get("/{payment_id}/pdf")
def get_payment_receipt_pdf(
    payment_id: int,
    download: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate and return an official receipt PDF."""
    receipt_data = get_payment_receipt(payment_id, current_user, db)
    
    clean_receipt_num = (receipt_data.get("receipt_number") or f"REC-{payment_id}").replace(" ", "_").replace("/", "_")
    pdf_filename = f"Recu_{clean_receipt_num}.pdf"
    pdf_path = os.path.join(RECEIPTS_DIR, pdf_filename)
    
    generate_payment_receipt_pdf(receipt_data, output_path=pdf_path)
    
    headers = {
        "Content-Disposition": f"{'attachment' if download else 'inline'}; filename={pdf_filename}"
    }
    return FileResponse(pdf_path, media_type="application/pdf", headers=headers)


