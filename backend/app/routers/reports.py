import os
import datetime
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from ..database import get_db
from ..models import MonthlyReport, Payment, Student, User
from ..schemas import MonthlyReportOut
from ..services.scheduler import compile_monthly_data, build_schedule_data_for_date
from ..services.pdf_generator import generate_monthly_pdf_report, generate_daily_schedule_pdf, REPORTS_DIR, DAILY_REPORTS_DIR
from .auth import get_current_user

router = APIRouter(prefix="/api/reports", tags=["reports"])

# ── Monthly Reports ──

@router.get("/monthly", response_model=List[MonthlyReportOut])
def list_monthly_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(MonthlyReport).filter(MonthlyReport.user_id == current_user.id).order_by(MonthlyReport.year.desc(), MonthlyReport.month_num.desc()).all()

@router.get("/monthly/{month_key}/data")
def get_monthly_report_data(
    month_key: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_date = datetime.date.today()
    if month_key != "current":
        try:
            parts = month_key.split("-")
            target_date = datetime.date(int(parts[0]), int(parts[1]), 15)
        except Exception:
            raise HTTPException(status_code=400, detail="Format de mois invalide (attendu: YYYY-MM ou 'current')")
    return compile_monthly_data(db, target_date, user_id=current_user.id)

@router.get("/monthly/{month_key}/pdf")
def get_monthly_report_pdf(
    month_key: str,
    download: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_date = datetime.date.today()
    if month_key != "current":
        try:
            parts = month_key.split("-")
            target_date = datetime.date(int(parts[0]), int(parts[1]), 15)
        except Exception:
            raise HTTPException(status_code=400, detail="Format de mois invalide (attendu: YYYY-MM)")
    data = compile_monthly_data(db, target_date, user_id=current_user.id)
    pdf_filename = f"rapport_mensuel_{current_user.id}_{data['month_key']}.pdf"
    pdf_path = os.path.join(REPORTS_DIR, pdf_filename)
    generate_monthly_pdf_report(data, output_path=pdf_path)
    headers = {
        "Content-Disposition": f"{'attachment' if download else 'inline'}; filename=Rapport_Mensuel_{data['month_key']}.pdf"
    }
    return FileResponse(pdf_path, media_type="application/pdf", headers=headers)

# ── Daily Planning PDF ──

@router.get("/daily/tomorrow/pdf")
def get_tomorrow_planning_pdf(
    download: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate or serve the planning PDF for tomorrow."""
    import pytz
    
    tz = pytz.timezone("Africa/Tunis")
    now_tz = datetime.datetime.now(tz)
    tomorrow = (now_tz + datetime.timedelta(days=1)).date()
    
    schedule_data = build_schedule_data_for_date(db, tomorrow, user_id=current_user.id)
    pdf_filename = f"Planning_{current_user.id}_{tomorrow.isoformat()}.pdf"
    pdf_path = os.path.join(DAILY_REPORTS_DIR, pdf_filename)
    generate_daily_schedule_pdf(schedule_data, output_path=pdf_path)
    
    headers = {
        "Content-Disposition": f"{'attachment' if download else 'inline'}; filename=Planning_{tomorrow.isoformat()}.pdf"
    }
    return FileResponse(pdf_path, media_type="application/pdf", headers=headers)

@router.get("/daily/list")
def list_daily_pdfs(
    current_user: User = Depends(get_current_user)
):
    """List all generated daily planning PDFs."""
    if not os.path.exists(DAILY_REPORTS_DIR):
        return []
    
    pdfs = []
    prefix = f"Planning_{current_user.id}_"
    for f in sorted(os.listdir(DAILY_REPORTS_DIR), reverse=True):
        if f.endswith('.pdf') and f.startswith(prefix):
            date_str = f.replace(prefix, '').replace('.pdf', '')
            full_path = os.path.join(DAILY_REPORTS_DIR, f)
            pdfs.append({
                "filename": f,
                "date": date_str,
                "size_kb": round(os.path.getsize(full_path) / 1024, 1),
                "url": f"/api/reports/daily/{date_str}/pdf"
            })
    return pdfs

@router.get("/daily/{date_str}/pdf")
def get_daily_planning_pdf(
    date_str: str,
    download: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate or serve the daily planning PDF for a specific date."""
    try:
        target_date = datetime.date.fromisoformat(date_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="Format de date invalide (attendu: YYYY-MM-DD)")
    
    schedule_data = build_schedule_data_for_date(db, target_date, user_id=current_user.id)
    pdf_filename = f"Planning_{current_user.id}_{target_date.isoformat()}.pdf"
    pdf_path = os.path.join(DAILY_REPORTS_DIR, pdf_filename)
    generate_daily_schedule_pdf(schedule_data, output_path=pdf_path)
    
    headers = {
        "Content-Disposition": f"{'attachment' if download else 'inline'}; filename=Planning_{target_date.isoformat()}.pdf"
    }
    return FileResponse(pdf_path, media_type="application/pdf", headers=headers)

