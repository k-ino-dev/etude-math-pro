import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import Expense, Payment, Student, User
from ..schemas import ExpenseCreate, ExpenseUpdate, ExpenseOut, ExpenseSummary
from .auth import get_current_user, require_admin, get_tenant_admin_id, log_audit

router = APIRouter(prefix="/api/expenses", tags=["expenses"])

@router.get("", response_model=ExpenseSummary)
def list_expenses(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """List expenses and calculate global financial balance (ADMIN ONLY)."""
    tenant_id = get_tenant_admin_id(admin_user)
    
    # 1. Total income (all payments collected by this teacher)
    student_ids = [s.id for s in db.query(Student.id).filter(Student.user_id == tenant_id).all()]
    total_income = 0.0
    if student_ids:
        total_income = db.query(func.sum(Payment.amount)).filter(
            Payment.student_id.in_(student_ids)
        ).scalar() or 0.0
        
    # 2. Expenses
    expenses = db.query(Expense).filter(
        Expense.user_id == tenant_id
    ).order_by(Expense.date.desc(), Expense.id.desc()).all()
    
    total_expenses = sum(e.amount for e in expenses)
    net_balance = total_income - total_expenses
    
    # Enrich expenses with expense_date alias
    for e in expenses:
        setattr(e, "expense_date", e.date)

    return {
        "total_income": round(total_income, 2),
        "total_revenue": round(total_income, 2),
        "total_expenses": round(total_expenses, 2),
        "net_balance": round(net_balance, 2),
        "net_profit": round(net_balance, 2),
        "expenses": expenses
    }

@router.get("/summary", response_model=ExpenseSummary)
def get_expenses_summary(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Alias for expenses summary."""
    return list_expenses(admin_user=admin_user, db=db)

@router.post("", response_model=ExpenseOut)
def create_expense(
    data: ExpenseCreate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new expense (ADMIN ONLY). Must not exceed available net profit."""
    tenant_id = get_tenant_admin_id(admin_user)
    amount = float(data.amount)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Le montant de la dépense doit être supérieur à zéro.")

    # Calculate current net balance
    student_ids = [s.id for s in db.query(Student.id).filter(Student.user_id == tenant_id).all()]
    total_income = 0.0
    if student_ids:
        total_income = db.query(func.sum(Payment.amount)).filter(
            Payment.student_id.in_(student_ids)
        ).scalar() or 0.0
    
    total_expenses = db.query(func.sum(Expense.amount)).filter(
        Expense.user_id == tenant_id
    ).scalar() or 0.0
    
    net_balance = total_income - total_expenses

    if amount > net_balance:
        raise HTTPException(
            status_code=400,
            detail=f"Impossible d'ajouter cette dépense : le montant ({amount:.3f} DT) dépasse le bénéfice net disponible ({net_balance:.3f} DT)."
        )

    exp_date = data.date or data.expense_date or datetime.date.today()
    expense = Expense(
        user_id=tenant_id,
        title=data.title.strip(),
        amount=amount,
        date=exp_date,
        category=data.category or "Autre",
        notes=data.notes.strip() if data.notes else None
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    setattr(expense, "expense_date", expense.date)
    
    log_audit(
        db=db,
        user=admin_user,
        action="EXPENSE_CREATED",
        entity_type="expense",
        entity_id=expense.id,
        new_value={"title": expense.title, "amount": expense.amount, "date": str(expense.date)}
    )
    
    return expense

@router.put("/{expense_id}", response_model=ExpenseOut)
def update_expense(
    expense_id: int,
    data: ExpenseUpdate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update an existing expense (ADMIN ONLY). Must not exceed available net profit."""
    tenant_id = get_tenant_admin_id(admin_user)
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == tenant_id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Dépense non trouvée.")
        
    old_data = {"title": expense.title, "amount": expense.amount, "date": str(expense.date)}
    
    if data.amount is not None:
        new_amount = float(data.amount)
        if new_amount <= 0:
            raise HTTPException(status_code=400, detail="Le montant de la dépense doit être supérieur à zéro.")
        
        # Calculate available net balance considering current expense amount
        student_ids = [s.id for s in db.query(Student.id).filter(Student.user_id == tenant_id).all()]
        total_income = 0.0
        if student_ids:
            total_income = db.query(func.sum(Payment.amount)).filter(
                Payment.student_id.in_(student_ids)
            ).scalar() or 0.0
        
        total_expenses = db.query(func.sum(Expense.amount)).filter(
            Expense.user_id == tenant_id
        ).scalar() or 0.0
        
        available_net = (total_income - total_expenses) + expense.amount
        if new_amount > available_net:
            raise HTTPException(
                status_code=400,
                detail=f"Impossible de modifier cette dépense : le montant ({new_amount:.3f} DT) dépasse le bénéfice net disponible ({available_net:.3f} DT)."
            )
        expense.amount = new_amount

    if data.title is not None:
        expense.title = data.title.strip()
    if data.date is not None:
        expense.date = data.date
    if data.category is not None:
        expense.category = data.category
    if data.notes is not None:
        expense.notes = data.notes.strip() if data.notes else None
        
    db.commit()
    db.refresh(expense)
    
    log_audit(
        db=db,
        user=admin_user,
        action="EXPENSE_UPDATED",
        entity_type="expense",
        entity_id=expense.id,
        old_value=old_data,
        new_value={"title": expense.title, "amount": expense.amount, "date": str(expense.date)}
    )
    
    return expense

@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete an expense (ADMIN ONLY)."""
    tenant_id = get_tenant_admin_id(admin_user)
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == tenant_id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Dépense non trouvée.")
        
    title = expense.title
    amount = expense.amount
    db.delete(expense)
    db.commit()
    
    log_audit(
        db=db,
        user=admin_user,
        action="EXPENSE_DELETED",
        entity_type="expense",
        entity_id=expense_id,
        old_value={"title": title, "amount": amount}
    )
    
    return {"success": True, "message": "Dépense supprimée avec succès."}
