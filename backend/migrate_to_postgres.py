"""
Étude Math Pro — Script de Migration SQLite vers PostgreSQL (Cloud)
------------------------------------------------------------------
Ce script transfère l'intégralité des données (utilisateurs, élèves, groupes, séances,
présences, paiements, fiches pédagogiques, corrections d'examens, notifications)
depuis votre base SQLite locale (data/math_prof.db) vers votre base PostgreSQL Cloud
(Render, Supabase, Neon, Railway, Docker, etc.).

Usage :
    python migrate_to_postgres.py "postgresql://user:password@host:port/dbname"
Ou avec variable d'environnement :
    set TARGET_DATABASE_URL=postgresql://user:password@host:port/dbname
    python migrate_to_postgres.py
"""

import sys
import os
import argparse
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add app package to sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from app.models import (
    Base, User, NotificationSetting, Group, Student, StudentNote,
    Session as DBSession, Attendance, Payment, MonthlyReport,
    NotificationLog, HandwritingProfile, CorrectionProject
)

def migrate(sqlite_path: str, pg_url: str):
    print("=" * 65)
    print("🚀 ÉTUDE MATH PRO — MIGRATION VERS POSTGRESQL CLOUD")
    print("=" * 65)
    
    if not os.path.exists(sqlite_path):
        print(f"❌ Erreur : Fichier SQLite introuvable à l'emplacement : {sqlite_path}")
        sys.exit(1)

    print(f"📂 Source SQLite     : {sqlite_path}")
    # Hide password in logs
    masked_url = pg_url
    if "@" in pg_url and "://" in pg_url:
        protocol, rest = pg_url.split("://", 1)
        creds, host_part = rest.split("@", 1)
        if ":" in creds:
            user, _ = creds.split(":", 1)
            masked_url = f"{protocol}://{user}:****@{host_part}"
    print(f"🌐 Cible PostgreSQL : {masked_url}")
    print("-" * 65)

    # 1. Connect to SQLite
    sqlite_engine = create_engine(f"sqlite:///{sqlite_path}")
    SqliteSession = sessionmaker(bind=sqlite_engine)
    sqlite_db = SqliteSession()

    # 2. Connect to PostgreSQL
    if pg_url.startswith("postgres://"):
        pg_url = pg_url.replace("postgres://", "postgresql://", 1)

    try:
        pg_engine = create_engine(pg_url, pool_pre_ping=True)
        # Create all tables on PostgreSQL
        Base.metadata.create_all(bind=pg_engine)
        PgSession = sessionmaker(bind=pg_engine)
        pg_db = PgSession()
    except Exception as e:
        print(f"❌ Erreur de connexion à PostgreSQL : {e}")
        sys.exit(1)

    try:
        print("📦 1/12 Migration des Utilisateurs (Enseignants)...")
        users = sqlite_db.query(User).all()
        for u in users:
            existing = pg_db.query(User).filter(User.id == u.id).first()
            if not existing:
                pg_db.add(User(
                    id=u.id,
                    name=u.name,
                    email=u.email,
                    password_hash=u.password_hash,
                    phone=u.phone,
                    avatar=u.avatar,
                    currency=u.currency,
                    school_year=u.school_year,
                    created_at=u.created_at
                ))
        pg_db.commit()
        print(f"   ✅ {len(users)} utilisateur(s) transféré(s)")

        print("📦 2/12 Migration des Paramètres de Notification...")
        settings = sqlite_db.query(NotificationSetting).all()
        for s in settings:
            existing = pg_db.query(NotificationSetting).filter(NotificationSetting.id == s.id).first()
            if not existing:
                pg_db.add(NotificationSetting(
                    id=s.id,
                    user_id=s.user_id or 1,
                    whatsapp_phone=s.whatsapp_phone,
                    daily_schedule_time=s.daily_schedule_time,
                    timezone=s.timezone,
                    provider=s.provider,
                    ultramsg_instance_id=s.ultramsg_instance_id,
                    ultramsg_token=s.ultramsg_token,
                    webhook_url=s.webhook_url,
                    is_enabled=s.is_enabled,
                    last_daily_sent_date=s.last_daily_sent_date
                ))
        pg_db.commit()
        print(f"   ✅ {len(settings)} paramètre(s) transféré(s)")

        print("📦 3/12 Migration des Groupes...")
        groups = sqlite_db.query(Group).all()
        for g in groups:
            existing = pg_db.query(Group).filter(Group.id == g.id).first()
            if not existing:
                pg_db.add(Group(
                    id=g.id,
                    user_id=g.user_id or 1,
                    name=g.name,
                    level=g.level,
                    subject=g.subject,
                    capacity=g.capacity,
                    schedule=g.schedule,
                    day_of_week=g.day_of_week,
                    start_time=g.start_time,
                    end_time=g.end_time,
                    location=g.location,
                    color=g.color
                ))
        pg_db.commit()
        print(f"   ✅ {len(groups)} groupe(s) transféré(s)")

        print("📦 4/12 Migration des Élèves...")
        students = sqlite_db.query(Student).all()
        for st in students:
            existing = pg_db.query(Student).filter(Student.id == st.id).first()
            if not existing:
                pg_db.add(Student(
                    id=st.id,
                    user_id=st.user_id or 1,
                    student_code=st.student_code,
                    first_name=st.first_name,
                    last_name=st.last_name,
                    level=st.level,
                    student_phone=st.student_phone,
                    father_phone=st.father_phone,
                    mother_phone=st.mother_phone,
                    monthly_price=st.monthly_price,
                    group_id=st.group_id,
                    registration_date=st.registration_date,
                    notes=st.notes,
                    is_active=st.is_active
                ))
        pg_db.commit()
        print(f"   ✅ {len(students)} élève(s) transféré(s)")

        print("📦 5/12 Migration des Notes Pédagogiques...")
        notes = sqlite_db.query(StudentNote).all()
        for n in notes:
            existing = pg_db.query(StudentNote).filter(StudentNote.id == n.id).first()
            if not existing:
                pg_db.add(StudentNote(
                    id=n.id,
                    student_id=n.student_id,
                    content=n.content,
                    created_at=n.created_at
                ))
        pg_db.commit()
        print(f"   ✅ {len(notes)} note(s) transférée(s)")

        print("📦 6/12 Migration des Séances...")
        sessions = sqlite_db.query(DBSession).all()
        for sess in sessions:
            existing = pg_db.query(DBSession).filter(DBSession.id == sess.id).first()
            if not existing:
                pg_db.add(DBSession(
                    id=sess.id,
                    user_id=sess.user_id or 1,
                    group_id=sess.group_id,
                    date=sess.date,
                    start_time=sess.start_time,
                    end_time=sess.end_time,
                    topic=sess.topic,
                    location=sess.location,
                    notes=sess.notes,
                    status=sess.status
                ))
        pg_db.commit()
        print(f"   ✅ {len(sessions)} séance(s) transférée(s)")

        print("📦 7/12 Migration des Présences...")
        attendances = sqlite_db.query(Attendance).all()
        for att in attendances:
            existing = pg_db.query(Attendance).filter(Attendance.id == att.id).first()
            if not existing:
                pg_db.add(Attendance(
                    id=att.id,
                    session_id=att.session_id,
                    student_id=att.student_id,
                    status=att.status
                ))
        pg_db.commit()
        print(f"   ✅ {len(attendances)} présence(s) transférée(s)")

        print("📦 8/12 Migration des Paiements...")
        payments = sqlite_db.query(Payment).all()
        for p in payments:
            existing = pg_db.query(Payment).filter(Payment.id == p.id).first()
            if not existing:
                pg_db.add(Payment(
                    id=p.id,
                    student_id=p.student_id,
                    month=p.month,
                    amount=p.amount,
                    payment_date=p.payment_date,
                    payment_method=p.payment_method,
                    status=p.status,
                    receipt_number=p.receipt_number,
                    notes=p.notes
                ))
        pg_db.commit()
        print(f"   ✅ {len(payments)} paiement(s) transféré(s)")

        print("📦 9/12 Migration des Rapports Mensuels...")
        reports = sqlite_db.query(MonthlyReport).all()
        for r in reports:
            existing = pg_db.query(MonthlyReport).filter(MonthlyReport.id == r.id).first()
            if not existing:
                pg_db.add(MonthlyReport(
                    id=r.id,
                    user_id=r.user_id or 1,
                    month=r.month,
                    year=r.year,
                    report_type=r.report_type,
                    data_json=r.data_json,
                    pdf_path=r.pdf_path,
                    created_at=r.created_at
                ))
        pg_db.commit()
        print(f"   ✅ {len(reports)} rapport(s) mensuel(s) transféré(s)")

        print("📦 10/12 Migration des Logs de Notification...")
        logs = sqlite_db.query(NotificationLog).all()
        for l in logs:
            existing = pg_db.query(NotificationLog).filter(NotificationLog.id == l.id).first()
            if not existing:
                pg_db.add(NotificationLog(
                    id=l.id,
                    user_id=l.user_id or 1,
                    type=l.type,
                    recipient=l.recipient,
                    message=l.message,
                    status=l.status,
                    idempotency_key=l.idempotency_key,
                    error_message=l.error_message,
                    provider_response=l.provider_response,
                    sent_at=l.sent_at
                ))
        pg_db.commit()
        print(f"   ✅ {len(logs)} log(s) transféré(s)")

        print("📦 11/12 Migration des Profils d'Écriture Manuscrite...")
        profiles = sqlite_db.query(HandwritingProfile).all()
        for hp in profiles:
            existing = pg_db.query(HandwritingProfile).filter(HandwritingProfile.id == hp.id).first()
            if not existing:
                pg_db.add(HandwritingProfile(
                    id=hp.id,
                    user_id=hp.user_id or 1,
                    name=hp.name,
                    slant=hp.slant,
                    pressure=hp.pressure,
                    irregularity=hp.irregularity,
                    spacing=hp.spacing,
                    baseline_drift=hp.baseline_drift,
                    sample_text=hp.sample_text,
                    created_at=hp.created_at
                ))
        pg_db.commit()
        print(f"   ✅ {len(profiles)} profil(s) manuscrit(s) transféré(s)")

        print("📦 12/12 Migration des Projets de Correction...")
        corrections = sqlite_db.query(CorrectionProject).all()
        for cp in corrections:
            existing = pg_db.query(CorrectionProject).filter(CorrectionProject.id == cp.id).first()
            if not existing:
                pg_db.add(CorrectionProject(
                    id=cp.id,
                    user_id=cp.user_id or 1,
                    title=cp.title,
                    subject=cp.subject,
                    level=cp.level,
                    chapter=cp.chapter,
                    teacher_name=cp.teacher_name,
                    school_name=cp.school_name,
                    exam_date=cp.exam_date,
                    detail_level=cp.detail_level,
                    language=cp.language,
                    handwriting_style=cp.handwriting_style,
                    paper_style=cp.paper_style,
                    color_primary=cp.color_primary,
                    color_correction=cp.color_correction,
                    color_secondary=cp.color_secondary,
                    color_header=cp.color_header,
                    raw_exam_text=cp.raw_exam_text,
                    structured_data=cp.structured_data,
                    pdf_path=cp.pdf_path,
                    status=cp.status,
                    created_at=cp.created_at,
                    updated_at=cp.updated_at
                ))
        pg_db.commit()
        print(f"   ✅ {len(corrections)} projet(s) de correction transféré(s)")

        # Update PostgreSQL sequence counters
        print("-" * 65)
        print("🔄 Réinitialisation des séquences PostgreSQL (Auto-increment)...")
        tables = [
            ("users", "id"),
            ("notification_settings", "id"),
            ("groups", "id"),
            ("students", "id"),
            ("student_notes", "id"),
            ("sessions", "id"),
            ("attendances", "id"),
            ("payments", "id"),
            ("monthly_reports", "id"),
            ("notification_logs", "id"),
            ("handwriting_profiles", "id"),
            ("correction_projects", "id")
        ]
        with pg_engine.connect() as conn:
            for tbl, pk in tables:
                try:
                    conn.execute(text(f"SELECT setval(pg_get_serial_sequence('{tbl}', '{pk}'), coalesce(max({pk}), 1)) FROM {tbl};"))
                    conn.commit()
                except Exception:
                    pass

        print("=" * 65)
        print("🎉 MIGRATION COMPLÈTE RÉUSSIE AVEC SUCCÈS !")
        print("Votre application « Étude Math Pro » est prête à fonctionner sur votre PostgreSQL Cloud !")
        print("=" * 65)

    except Exception as e:
        pg_db.rollback()
        print(f"\n❌ Erreur pendant le transfert des données : {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        sqlite_db.close()
        pg_db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migrer Étude Math Pro de SQLite vers PostgreSQL")
    parser.add_argument("target_url", nargs="?", default=os.getenv("TARGET_DATABASE_URL") or os.getenv("DATABASE_URL"), help="URL de connexion PostgreSQL cible")
    parser.add_argument("--sqlite", default=os.path.join(CURRENT_DIR, "data", "math_prof.db"), help="Chemin du fichier SQLite source")

    args = parser.parse_args()

    if not args.target_url:
        print("❌ Spécifiez l'URL PostgreSQL cible :")
        print("   python migrate_to_postgres.py postgresql://user:password@host:port/dbname")
        print("   OU définissez TARGET_DATABASE_URL=postgresql://...")
        sys.exit(1)

    migrate(args.sqlite, args.target_url)
