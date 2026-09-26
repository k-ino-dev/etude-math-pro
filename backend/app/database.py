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

def run_migrations():
    """Ensure newly added columns exist in existing database tables without data loss."""
    if is_sqlite and os.path.exists(DB_PATH):
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
                "notification_logs", "correction_projects", "handwriting_profiles"
            ]

            for tbl in user_id_tables:
                cur.execute(f"PRAGMA table_info({tbl})")
                tbl_cols = [r[1] for r in cur.fetchall()]
                if tbl_cols and "user_id" not in tbl_cols:
                    cur.execute(f"ALTER TABLE {tbl} ADD COLUMN user_id INTEGER DEFAULT 1")
                    cur.execute(f"UPDATE {tbl} SET user_id = 1 WHERE user_id IS NULL")
                    conn.commit()

            conn.close()
        except Exception as e:
            print(f"[DB MIGRATION NOTICE] SQLite migration check: {e}")

run_migrations()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

