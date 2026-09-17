import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(30), nullable=True)
    avatar = Column(Text, nullable=True) # Avatar url, preset key or base64 data URI
    currency = Column(String(10), default="DT")
    school_year = Column(String(20), default="2025-2026")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    groups = relationship("Group", back_populates="user", cascade="all, delete-orphan")
    students = relationship("Student", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    monthly_reports = relationship("MonthlyReport", back_populates="user", cascade="all, delete-orphan")
    correction_projects = relationship("CorrectionProject", back_populates="user", cascade="all, delete-orphan")
    handwriting_profiles = relationship("HandwritingProfile", back_populates="user", cascade="all, delete-orphan")
    notification_settings = relationship("NotificationSetting", back_populates="user", cascade="all, delete-orphan", uselist=False)
    notification_logs = relationship("NotificationLog", back_populates="user", cascade="all, delete-orphan")

class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, default=1)
    name = Column(String(100), nullable=False)  # ex: "Bac Math A"
    level = Column(String(50), nullable=False, default="Bac")  # Strict levels: "1ère", "2ème", "3ème", "Bac"
    subject = Column(String(50), default="Mathématiques")
    capacity = Column(Integer, default=15)
    schedule = Column(String(100), nullable=True)  # ex: "Samedi 10:00 - 12:00"
    day_of_week = Column(Integer, nullable=True)   # 0: Lundi, 5: Samedi, 6: Dimanche
    start_time = Column(String(10), nullable=True) # "10:00"
    end_time = Column(String(10), nullable=True)   # "12:00"
    location = Column(String(100), default="Salle 1")
    color = Column(String(20), default="#4f46e5")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="groups")
    students = relationship("Student", back_populates="group")
    sessions = relationship("Session", back_populates="group", cascade="all, delete-orphan")

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, default=1)
    student_code = Column(String(50), index=True, nullable=False) # "2026-001"
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    level = Column(String(50), nullable=False, default="Bac")  # Strict levels: "1ère", "2ème", "3ème", "Bac"
    student_phone = Column(String(30), nullable=True)
    father_phone = Column(String(30), nullable=True)
    mother_phone = Column(String(30), nullable=True)
    monthly_price = Column(Float, default=80.0)
    group_id = Column(Integer, ForeignKey("groups.id", ondelete="SET NULL"), nullable=True)
    registration_date = Column(Date, default=datetime.date.today)
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="students")
    group = relationship("Group", back_populates="students")
    attendance = relationship("Attendance", back_populates="student", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="student", cascade="all, delete-orphan")
    observations = relationship("StudentNote", back_populates="student", cascade="all, delete-orphan")

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, default=1)
    group_id = Column(Integer, ForeignKey("groups.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    start_time = Column(String(10), nullable=False) # "17:00"
    end_time = Column(String(10), nullable=False)   # "18:30"
    topic = Column(String(200), nullable=True)      # "Fonctions exponentielles & Logarithmes"
    location = Column(String(100), default="Salle 1")
    notes = Column(Text, nullable=True)
    status = Column(String(20), default="scheduled") # "scheduled", "completed", "cancelled"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="sessions")
    group = relationship("Group", back_populates="sessions")
    attendance_records = relationship("Attendance", back_populates="session", cascade="all, delete-orphan")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    session_id = Column(Integer, ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(20), default="present") # "present", "absent", "late"
    notes = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("Student", back_populates="attendance")
    session = relationship("Session", back_populates="attendance_records")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    month = Column(String(30), nullable=False) # "Septembre 2025", "Octobre 2025", etc.
    amount = Column(Float, nullable=False)
    payment_date = Column(Date, default=datetime.date.today)
    payment_method = Column(String(30), default="Espèces") # "Espèces", "Virement bancaire"
    status = Column(String(20), default="paid") # "paid", "partial", "unpaid"
    receipt_number = Column(String(50), nullable=True)
    notes = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("Student", back_populates="payments")

class StudentNote(Base):
    __tablename__ = "student_notes"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("Student", back_populates="observations")

class MonthlyReport(Base):
    __tablename__ = "monthly_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, default=1)
    month_key = Column(String(20), index=True, nullable=False) # "2026-08"
    month_name = Column(String(50), nullable=False) # "Août 2026"
    year = Column(Integer, nullable=False)
    month_num = Column(Integer, nullable=False)
    total_students = Column(Integer, default=0)
    paid_count = Column(Integer, default=0)
    unpaid_count = Column(Integer, default=0)
    total_collected = Column(Float, default=0.0)
    total_remaining = Column(Float, default=0.0)
    total_expected = Column(Float, default=0.0)
    pdf_filename = Column(String(100), nullable=True)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="monthly_reports")

class CorrectionProject(Base):
    __tablename__ = "correction_projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True, default=1)
    title = Column(String(200), nullable=False) # "Examen National Bac Math - Session Principale"
    subject = Column(String(100), default="Mathématiques")
    level = Column(String(50), default="Bac") # "Collège", "Lycée", "Bac", "Université", "Prépa", "Licence", "Ingénieur"
    chapter = Column(String(200), nullable=True) # "Analyse, Nombres Complexes & Probabilités"
    teacher_name = Column(String(100), default="Prof. Mohamed")
    school_name = Column(String(150), default="Académie des Sciences Mathématiques")
    exam_date = Column(String(50), default=lambda: datetime.date.today().strftime("%d/%m/%Y"))
    detail_level = Column(Integer, default=4) # 1 (Très court) à 5 (Très détaillé)
    language = Column(String(10), default="fr") # "fr", "ar", "en"
    handwriting_style = Column(String(50), default="style_a_classique") # "style_a_classique", "style_b_cahier", "style_c_pedagogique", "style_d_minimaliste", "style_custom"
    paper_style = Column(String(50), default="squared_5mm") # "seyes", "squared_5mm", "lined", "blank"
    color_primary = Column(String(30), default="#1e3a8a") # Bleu encre
    color_correction = Column(String(30), default="#dc2626") # Rouge prof
    color_secondary = Column(String(30), default="#16a34a") # Vert méthode/résultat
    color_header = Column(String(30), default="#0f172a") # Noir/bleu nuit
    custom_font_settings = Column(Text, nullable=True) # JSON config for custom style
    source_files = Column(Text, nullable=True) # JSON list of uploaded file paths
    structured_data = Column(Text, nullable=False) # JSON list of exercises, questions, steps, verification info
    status = Column(String(30), default="completed") # "draft", "analyzing", "solving", "verified", "completed"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="correction_projects")

class HandwritingProfile(Base):
    __tablename__ = "handwriting_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True, default=1)
    name = Column(String(100), nullable=False) # "Mon Écriture Professeur"
    base_font = Column(String(50), default="Caveat")
    slant_angle = Column(Float, default=3.5) # -5.0 to +15.0 deg
    stroke_width = Column(Float, default=1.8) # 1.0 to 3.0
    jitter_intensity = Column(Float, default=0.8) # 0.0 to 2.0
    baseline_variance = Column(Float, default=0.7) # px
    letter_spacing = Column(Float, default=0.5) # px
    sample_images = Column(Text, nullable=True) # JSON list of sample uploads
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="handwriting_profiles")

class NotificationSetting(Base):
    __tablename__ = "notification_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, default=1)
    whatsapp_phone = Column(String(30), default="+216 98 123 456")
    daily_schedule_time = Column(String(10), default="20:00")
    timezone = Column(String(50), default="Africa/Tunis")
    provider = Column(String(30), default="simulation") # "simulation", "ultramsg", "webhook"
    ultramsg_instance_id = Column(String(100), nullable=True)
    ultramsg_token = Column(String(100), nullable=True)
    webhook_url = Column(String(255), nullable=True)
    is_enabled = Column(Boolean, default=True)
    last_daily_sent_date = Column(Date, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notification_settings")

class NotificationLog(Base):
    __tablename__ = "notification_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, default=1)
    type = Column(String(50), nullable=False) # "daily_schedule", "test", "manual"
    recipient = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(30), default="sent") # "sent", "simulated", "failed"
    idempotency_key = Column(String(150), index=True, nullable=True)
    error_message = Column(Text, nullable=True)
    provider_response = Column(Text, nullable=True)
    sent_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notification_logs")


