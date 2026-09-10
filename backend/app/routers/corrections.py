"""
Corrections Router — REST API for Math Exam Correction & Realistic Handwriting Engine
Provides full CRUD, OCR document analysis, step-by-step 5-stage pedagogical solving,
formal SymPy verification, question regeneration, and PDF export.
"""

import json
import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import CorrectionProject, HandwritingProfile, User
from ..schemas import (
    CorrectionProjectCreate, CorrectionProjectUpdate, CorrectionProjectOut,
    MathVerificationRequest, MathVerificationResponse, RegenerateQuestionRequest,
    HandwritingProfileCreate, HandwritingProfileOut
)
from ..services.math_verifier import MathVerifier
from ..services.math_solver import MathSolver
from ..services.correction_ocr import CorrectionOCRService
from ..services.pdf_export import PDFExportService
from .auth import get_current_user

router = APIRouter(
    prefix="/api/corrections",
    tags=["Corrections & Handwriting Engine"]
)

@router.get("", response_model=List[CorrectionProjectOut])
def list_corrections(
    skip: int = 0,
    limit: int = 50,
    level: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lists all math correction projects of the logged-in teacher with optional level filtering."""
    query = db.query(CorrectionProject).filter(CorrectionProject.user_id == current_user.id)
    if level:
        query = query.filter(CorrectionProject.level == level)
    return query.order_by(CorrectionProject.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/templates")
def get_template_exams():
    """Returns curated exam templates for instant testing."""
    return CorrectionOCRService.get_template_exams()

@router.post("/upload")
async def upload_and_process_exam(
    file: UploadFile = File(...),
    level: str = Form("Bac"),
    detail_level: int = Form(4),
    language: str = Form("fr"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Uploads an exam document (PDF, JPG, PNG), executes OCR/vision analysis,
    decomposes exercises, solves questions in 5 steps, and verifies with SymPy.
    """
    file_bytes = await file.read()
    filename = file.filename or "examen_math.pdf"
    
    # Process document
    result = CorrectionOCRService.process_document(
        file_bytes=file_bytes,
        filename=filename,
        level=level,
        detail_level=detail_level,
        language=language
    )
    
    # Save project in database
    new_project = CorrectionProject(
        user_id=current_user.id,
        title=result["title"],
        subject="Mathématiques",
        level=level,
        chapter="Analyse & Calcul Formel",
        teacher_name=current_user.name or "Prof. Mohamed",
        school_name="Académie des Sciences Mathématiques",
        exam_date=datetime.date.today().strftime("%d/%m/%Y"),
        detail_level=detail_level,
        language=language,
        handwriting_style="style_a_classique",
        paper_style="squared_5mm",
        color_primary="#1e3a8a",
        color_correction="#dc2626",
        color_secondary="#16a34a",
        color_header="#0f172a",
        structured_data=json.dumps(result["exercises"], ensure_ascii=False),
        status="completed"
    )
    
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    return {
        "project": new_project,
        "page_previews": result.get("page_previews", []),
        "exercises": result["exercises"]
    }

@router.post("", response_model=CorrectionProjectOut)
def create_correction(
    project_in: CorrectionProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Creates a new correction project manually or from template data."""
    # If structured_data is empty, use first template
    struct_data = project_in.structured_data
    if not struct_data:
        templates = CorrectionOCRService.get_template_exams()
        struct_data = json.dumps(templates[0]["exercises"], ensure_ascii=False)
        
    new_project = CorrectionProject(
        user_id=current_user.id,
        title=project_in.title,
        subject=project_in.subject,
        level=project_in.level,
        chapter=project_in.chapter,
        teacher_name=project_in.teacher_name or current_user.name or "Prof. Mohamed",
        school_name=project_in.school_name,
        exam_date=project_in.exam_date or datetime.date.today().strftime("%d/%m/%Y"),
        detail_level=project_in.detail_level,
        language=project_in.language,
        handwriting_style=project_in.handwriting_style,
        paper_style=project_in.paper_style,
        color_primary=project_in.color_primary,
        color_correction=project_in.color_correction,
        color_secondary=project_in.color_secondary,
        color_header=project_in.color_header,
        custom_font_settings=project_in.custom_font_settings,
        source_files=project_in.source_files,
        structured_data=struct_data,
        status="completed"
    )
    
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

@router.get("/{project_id}", response_model=CorrectionProjectOut)
def get_correction(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves a single correction project by ID."""
    proj = db.query(CorrectionProject).filter(CorrectionProject.id == project_id, CorrectionProject.user_id == current_user.id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Projet de correction introuvable")
    return proj

@router.put("/{project_id}", response_model=CorrectionProjectOut)
def update_correction(
    project_id: int,
    proj_update: CorrectionProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates correction details, styles, colors, or structured steps."""
    proj = db.query(CorrectionProject).filter(CorrectionProject.id == project_id, CorrectionProject.user_id == current_user.id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Projet de correction introuvable")
    
    update_data = proj_update.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(proj, field, val)
        
    db.commit()
    db.refresh(proj)
    return proj

@router.delete("/{project_id}")
def delete_correction(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes a correction project."""
    proj = db.query(CorrectionProject).filter(CorrectionProject.id == project_id, CorrectionProject.user_id == current_user.id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Projet de correction introuvable")
    
    db.delete(proj)
    db.commit()
    return {"message": "Projet de correction supprimé avec succès"}

@router.post("/{project_id}/duplicate", response_model=CorrectionProjectOut)
def duplicate_correction(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Duplicates an existing correction project."""
    proj = db.query(CorrectionProject).filter(CorrectionProject.id == project_id, CorrectionProject.user_id == current_user.id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Projet de correction introuvable")
    
    dup = CorrectionProject(
        user_id=current_user.id,
        title=f"{proj.title} (Copie)",
        subject=proj.subject,
        level=proj.level,
        chapter=proj.chapter,
        teacher_name=proj.teacher_name,
        school_name=proj.school_name,
        exam_date=proj.exam_date,
        detail_level=proj.detail_level,
        language=proj.language,
        handwriting_style=proj.handwriting_style,
        paper_style=proj.paper_style,
        color_primary=proj.color_primary,
        color_correction=proj.color_correction,
        color_secondary=proj.color_secondary,
        color_header=proj.color_header,
        custom_font_settings=proj.custom_font_settings,
        structured_data=proj.structured_data,
        status=proj.status
    )
    
    db.add(dup)
    db.commit()
    db.refresh(dup)
    return dup

@router.post("/solve-question")
def solve_single_question(req: RegenerateQuestionRequest):
    """Regenerates or solves a specific question on demand."""
    return MathSolver.solve_question(
        question_text=req.question_text,
        level=req.level,
        detail_level=req.detail_level,
        language=req.language,
        topic=req.topic
    )

@router.post("/verify-math", response_model=MathVerificationResponse)
def verify_math_expression(req: MathVerificationRequest):
    """Runs independent SymPy symbolic/numerical verification on any math formula."""
    res = MathVerifier.verify_expression(
        expression_type=req.expression_type,
        expression=req.expression,
        claimed_result=req.claimed_result,
        variable=req.variable,
        extra_params=req.extra_params
    )
    return MathVerificationResponse(**res)

@router.get("/{project_id}/export-pdf")
def export_correction_pdf(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generates and downloads a print-ready A4 PDF document."""
    proj = db.query(CorrectionProject).filter(CorrectionProject.id == project_id, CorrectionProject.user_id == current_user.id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Projet de correction introuvable")
    
    pdf_bytes = PDFExportService.generate_correction_pdf(proj.__dict__)
    filename = f"Correction_{proj.title.replace(' ', '_')}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# --- Custom Handwriting Profiles ---
@router.get("/profiles", response_model=List[HandwritingProfileOut])
def list_handwriting_profiles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lists saved custom teacher handwriting profiles."""
    return db.query(HandwritingProfile).filter(HandwritingProfile.user_id == current_user.id).all()

@router.post("/profiles", response_model=HandwritingProfileOut)
def save_handwriting_profile(
    profile_in: HandwritingProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Saves a new custom teacher handwriting profile."""
    prof = HandwritingProfile(
        user_id=current_user.id,
        name=profile_in.name,
        base_font=profile_in.base_font,
        slant_angle=profile_in.slant_angle,
        stroke_width=profile_in.stroke_width,
        jitter_intensity=profile_in.jitter_intensity,
        baseline_variance=profile_in.baseline_variance,
        letter_spacing=profile_in.letter_spacing,
        sample_images=profile_in.sample_images
    )
    db.add(prof)
    db.commit()
    db.refresh(prof)
    return prof

