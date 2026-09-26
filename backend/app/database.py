import sys
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load .env if present
load_dotenv()

if getattr(sys, 'frozen', False):
    BASE_DIR = os.path.dirname(sys.executable)
else:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)
DB_PATH = os.path.join(DATA_DIR, "math_prof.db")

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

DATABASE_URL = SQLALCHEMY_DATABASE_URL if SQLALCHEMY_DATABASE_URL else f"sqlite:///{DB_PATH}"

is_sqlite = DATABASE_URL.startswith("sqlite")

if is_sqlite:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def safe_migrate(engine):
    """Safe, non-destructive migration adding missing columns to users & other tables on PostgreSQL & SQLite."""
    # 1. Ensure all tables exist (creates missing tables like expenses/audit_logs without touching existing ones)
    try:
        from . import models  # noqa
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"[DB SAFE MIGRATION] create_all note: {e}")

    # 2. Add columns non-destructively
    if is_sqlite:
        if os.path.exists(DB_PATH):
            try:
                import sqlite3
                conn = sqlite3.connect(DB_PATH)
                cur = conn.cursor()

                # 1. users table
                cur.execute("PRAGMA table_info(users)")
                cols = [r[1] for r in cur.fetchall()]
                if cols:
                    if "avatar" not in cols:
                        cur.execute("ALTER TABLE users ADD COLUMN avatar TEXT")
                    if "role" not in cols:
                        cur.execute("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'ADMIN'")
                        cur.execute("UPDATE users SET role = 'ADMIN' WHERE role IS NULL")
                    if "admin_id" not in cols:
                        cur.execute("ALTER TABLE users ADD COLUMN admin_id INTEGER DEFAULT NULL")
                    if "is_active" not in cols:
                        cur.execute("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1")
                    conn.commit()

                # Tables requiring user_id
                user_id_tables = [
                    "groups", "students", "sessions", "monthly_reports", "notification_settings",
                    "notification_logs", "correction_projects", "handwriting_profiles", "expenses"
                ]

                for tbl in user_id_tables:
                    try:
                        cur.execute(f"PRAGMA table_info({tbl})")
                        tbl_cols = [r[1] for r in cur.fetchall()]
                        if tbl_cols and "user_id" not in tbl_cols:
                            cur.execute(f"ALTER TABLE {tbl} ADD COLUMN user_id INTEGER DEFAULT 1")
                            cur.execute(f"UPDATE {tbl} SET user_id = 1 WHERE user_id IS NULL")
                            conn.commit()
                    except Exception:
                        pass

                conn.close()
            except Exception as e:
                print(f"[DB SAFE MIGRATION] SQLite migration check note: {e}")
    else:
        # PostgreSQL on Render / Cloud
        try:
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'ADMIN';"))
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_id INTEGER;"))
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;"))
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;"))
                conn.execute(text("UPDATE users SET role = 'ADMIN' WHERE role IS NULL;"))
                conn.execute(text("UPDATE users SET is_active = TRUE WHERE is_active IS NULL;"))

                user_id_tables = [
                    "groups", "students", "sessions", "monthly_reports", "notification_settings",
                    "notification_logs", "correction_projects", "handwriting_profiles", "expenses"
                ]
                for tbl in user_id_tables:
                    try:
                        conn.execute(text(f"ALTER TABLE {tbl} ADD COLUMN IF NOT EXISTS user_id INTEGER DEFAULT 1;"))
                        conn.execute(text(f"UPDATE {tbl} SET user_id = 1 WHERE user_id IS NULL;"))
                    except Exception:
                        pass

                conn.commit()
        except Exception as e:
            print(f"[DB SAFE MIGRATION] PostgreSQL migration note: {e}")

# Run non-destructive migration on import
safe_migrate(engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

