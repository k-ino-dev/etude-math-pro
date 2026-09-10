from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr
import datetime

# --- Auth & User ---
class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None
    currency: Optional[str] = "DT"
    school_year: Optional[str] = "2025-2026"

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    avatar: Optional[str] = None
    currency: str = "DT"
    school_year: str = "2025-2026"

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    currency: Optional[str] = None
    school_year: Optional[str] = None
    password: Optional[str] = None

# --- Groups ---
class GroupBase(BaseModel):
    name: str
    level: str
    subject: str = "Mathématiques"
    capacity: int = 15
    schedule: Optional[str] = None
    day_of_week: Optional[int] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location: Optional[str] = "Salle 1"
    color: Optional[str] = "#4f46e5"

class GroupCreate(GroupBase):
    pass

class GroupUpdate(BaseModel):
    name: Optional[str] = None
    level: Optional[str] = None
    subject: Optional[str] = None
    capacity: Optional[int] = None
    schedule: Optional[str] = None
    day_of_week: Optional[int] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location: Optional[str] = None
    color: Optional[str] = None

class GroupOut(GroupBase):
    id: int
    created_at: datetime.datetime
    student_count: int = 0
    is_full: bool = False

    class Config:
        from_attributes = True

# --- Students ---
class StudentBase(BaseModel):
    first_name: str
    last_name: str
    level: str
    student_phone: Optional[str] = None
    father_phone: Optional[str] = None
    mother_phone: Optional[str] = None
    monthly_price: float = 80.0
    group_id: Optional[int] = None
    registration_date: Optional[datetime.date] = None
    notes: Optional[str] = None
    is_active: bool = True

class StudentCreate(StudentBase):
    student_code: Optional[str] = None # If not provided, auto-generated e.g. "2026-001"

class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    level: Optional[str] = None
    student_phone: Optional[str] = None
    father_phone: Optional[str] = None
    mother_phone: Optional[str] = None
    monthly_price: Optional[float] = None
    group_id: Optional[int] = None
    registration_date: Optional[datetime.date] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None

class StudentOut(StudentBase):
    id: int
    student_code: str
    group_name: Optional[str] = None
    attendance_rate: float = 100.0
    attendance_count: str = "0/0"
    current_month_payment_status: str = "unpaid" # "paid", "partial", "unpaid"
    last_payment_month: Optional[str] = None
    last_payment_date: Optional[datetime.date] = None
    last_payment_amount: Optional[float] = None
    active_month: Optional[str] = None
    total_paid: float = 0.0
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Student Notes ---
class StudentNoteCreate(BaseModel):
    content: str

class StudentNoteOut(BaseModel):
    id: int
    student_id: int
    content: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Attendance ---
class AttendanceRecord(BaseModel):
    student_id: int
    status: str = "present" # "present", "absent", "late"
    notes: Optional[str] = None

class AttendanceBulkCreate(BaseModel):
    session_id: int
    topic: Optional[str] = None
    notes: Optional[str] = None
    records: List[AttendanceRecord]

class AttendanceOut(BaseModel):
    id: int
    student_id: int
    student_name: Optional[str] = None
    session_id: int
    status: str
    notes: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Sessions ---
class SessionBase(BaseModel):
    group_id: int
    date: datetime.date
    start_time: str # "17:00"
    end_time: str   # "18:30"
    topic: Optional[str] = None
    location: Optional[str] = "Salle 1"
    notes: Optional[str] = None
    status: str = "scheduled"

class SessionCreate(SessionBase):
    force: bool = False # If true, ignore conflict warnings

class SessionUpdate(BaseModel):
    group_id: Optional[int] = None
    date: Optional[datetime.date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    topic: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class SessionOut(SessionBase):
    id: int
    group_name: str
    level: str
    student_count: int = 0
    attended_count: int = 0
    is_completed: bool = False
    has_conflict: bool = False
    conflict_details: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Payments ---
class PaymentBase(BaseModel):
    student_id: int
    month: str # "Septembre 2025"
    amount: float
    payment_date: Optional[datetime.date] = None
    payment_method: str = "Espèces" # "Espèces", "Virement", "Chèque", "Autre"
    status: str = "paid" # "paid", "partial", "unpaid"
    notes: Optional[str] = None

class PaymentCreate(PaymentBase):
    receipt_number: Optional[str] = None

class PaymentUpdate(BaseModel):
    amount: Optional[float] = None
    payment_date: Optional[datetime.date] = None
    payment_method: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class PaymentOut(PaymentBase):
    id: int
    student_name: str
    student_code: str
    receipt_number: Optional[str] = None
    monthly_price: float = 80.0
    remaining_due: float = 0.0
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Detailed Profiles ---
class StudentDetailOut(StudentOut):
    attendance_history: List[Dict[str, Any]] = []
    payment_history: List[PaymentOut] = []
    observations: List[StudentNoteOut] = []
    group_info: Optional[GroupOut] = None

# --- Dashboard & Stats ---
class DashboardStats(BaseModel):
    total_students: int
    total_groups: int
    students_present_today: int
    sessions_today: int
    pending_payments_count: int
    total_collected_this_month: float
    total_expected_this_month: float
    next_session: Optional[SessionOut] = None
    today_sessions: List[SessionOut] = []
    recent_alerts: List[Dict[str, Any]] = []

# --- Smart Repartition ---
class RepartitionProposalGroup(BaseModel):
    group_name: str
    level: str
    target_count: int
    students: List[Dict[str, Any]]

class RepartitionProposal(BaseModel):
    level: str
    total_students: int
    target_capacity: int
    groups: List[RepartitionProposalGroup]

class RepartitionApplyItem(BaseModel):
    student_id: int
    group_id: Optional[int]
    group_name: Optional[str]

class RepartitionApplyRequest(BaseModel):
    level: str
    assignments: List[RepartitionApplyItem]

# --- Monthly Reports ---
class MonthlyReportOut(BaseModel):
    id: int
    month_key: str
    month_name: str
    year: int
    month_num: int
    total_students: int
    paid_count: int
    unpaid_count: int
    total_collected: float
    total_remaining: float
    total_expected: float
    pdf_filename: Optional[str] = None
    generated_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Math Correction & Handwriting Platform Schemas ---
class MathStep(BaseModel):
    step_num: int = 1
    type: str = "calculation" # "data", "method", "calculation", "simplification", "result", "annotation", "geometry"
    title: str = "Étape 1 : Données utiles"
    content: str # Explanation in French/Math
    latex: Optional[str] = None # Mathematical formula
    is_verified: bool = True
    sympy_check: Optional[str] = None
    annotation_tag: Optional[str] = None # "✓ Correct", "✗ Attention", "À retenir", etc.
    color_role: str = "primary" # "primary", "correction", "secondary", "header"

class QuestionItem(BaseModel):
    question_number: str = "1. a)"
    question_text: str
    detail_level: int = 4
    steps: List[MathStep] = []
    sympy_verified: bool = True
    verification_notes: Optional[str] = None
    geometry_svg: Optional[str] = None

class ExerciseItem(BaseModel):
    exercise_number: int = 1
    title: str = "Exercice 1 : Étude de fonction et calcul intégral"
    points: Optional[str] = "6 points"
    topic: Optional[str] = "Analyse & Intégrales"
    statement: Optional[str] = None
    questions: List[QuestionItem] = []

class CorrectionProjectBase(BaseModel):
    title: str = "Correction d'Examen de Mathématiques"
    subject: str = "Mathématiques"
    level: str = "Bac"
    chapter: Optional[str] = None
    teacher_name: str = "Prof. Mohamed"
    school_name: str = "Académie des Sciences Mathématiques"
    exam_date: Optional[str] = None
    detail_level: int = 4
    language: str = "fr"
    handwriting_style: str = "style_a_classique"
    paper_style: str = "squared_5mm"
    color_primary: str = "#1e3a8a"
    color_correction: str = "#dc2626"
    color_secondary: str = "#16a34a"
    color_header: str = "#0f172a"
    custom_font_settings: Optional[str] = None

class CorrectionProjectCreate(CorrectionProjectBase):
    source_files: Optional[str] = None
    structured_data: Optional[str] = None

class CorrectionProjectUpdate(BaseModel):
    title: Optional[str] = None
    level: Optional[str] = None
    chapter: Optional[str] = None
    teacher_name: Optional[str] = None
    school_name: Optional[str] = None
    exam_date: Optional[str] = None
    detail_level: Optional[int] = None
    language: Optional[str] = None
    handwriting_style: Optional[str] = None
    paper_style: Optional[str] = None
    color_primary: Optional[str] = None
    color_correction: Optional[str] = None
    color_secondary: Optional[str] = None
    color_header: Optional[str] = None
    custom_font_settings: Optional[str] = None
    structured_data: Optional[str] = None
    status: Optional[str] = None

class CorrectionProjectOut(CorrectionProjectBase):
    id: int
    user_id: Optional[int] = None
    source_files: Optional[str] = None
    structured_data: str
    status: str
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

class MathVerificationRequest(BaseModel):
    expression_type: str = "equation" # "equation", "derivative", "integral", "limit", "simplification", "matrix"
    expression: str
    claimed_result: Optional[str] = None
    variable: str = "x"
    extra_params: Optional[Dict[str, Any]] = None

class MathVerificationResponse(BaseModel):
    is_valid: bool
    sympy_computed: str
    claimed_result: Optional[str]
    match: bool
    details: str
    latex_proof: Optional[str] = None

class RegenerateQuestionRequest(BaseModel):
    question_text: str
    level: str = "Bac"
    detail_level: int = 4
    language: str = "fr"
    topic: Optional[str] = None

class HandwritingProfileBase(BaseModel):
    name: str = "Mon Écriture Professeur"
    base_font: str = "Caveat"
    slant_angle: float = 3.5
    stroke_width: float = 1.8
    jitter_intensity: float = 0.8
    baseline_variance: float = 0.7
    letter_spacing: float = 0.5

class HandwritingProfileCreate(HandwritingProfileBase):
    sample_images: Optional[str] = None

class HandwritingProfileOut(HandwritingProfileBase):
    id: int
    user_id: Optional[int] = None
    sample_images: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Notification & WhatsApp Schemas ---
class NotificationSettingOut(BaseModel):
    id: int
    whatsapp_phone: str
    daily_schedule_time: str
    timezone: str
    provider: str
    ultramsg_instance_id: Optional[str] = None
    ultramsg_token: Optional[str] = None
    webhook_url: Optional[str] = None
    is_enabled: bool
    last_daily_sent_date: Optional[datetime.date] = None

    class Config:
        from_attributes = True

class NotificationSettingUpdate(BaseModel):
    whatsapp_phone: Optional[str] = None
    daily_schedule_time: Optional[str] = None
    timezone: Optional[str] = None
    provider: Optional[str] = None
    ultramsg_instance_id: Optional[str] = None
    ultramsg_token: Optional[str] = None
    webhook_url: Optional[str] = None
    is_enabled: Optional[bool] = None

class NotificationLogOut(BaseModel):
    id: int
    type: str
    recipient: str
    message: str
    status: str
    idempotency_key: Optional[str] = None
    error_message: Optional[str] = None
    provider_response: Optional[str] = None
    sent_at: datetime.datetime

    class Config:
        from_attributes = True

class WhatsAppTestRequest(BaseModel):
    phone: Optional[str] = None
    message: Optional[str] = None

class WhatsAppSendScheduleRequest(BaseModel):
    target_date: Optional[str] = None # ISO format YYYY-MM-DD
    force: bool = False



