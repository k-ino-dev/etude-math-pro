import os
from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional, List, Any
import json
from jose import JWTError, jwt
from passlib.context import CryptContext
from ..database import get_db
from ..models import User, NotificationSetting, AuditLog
from ..schemas import (
    UserLogin, UserRegister, Token, UserOut, UserUpdate,
    StaffCreate, StaffUpdate, StaffOut
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

SECRET_KEY = os.getenv("SECRET_KEY", "math-prof-secret-super-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 30 # 30 days for mobile & web convenience

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # Fallback for plain text demo password if needed
        return plain_password == hashed_password

def get_password_hash(password: str) -> str:
    try:
        return pwd_context.hash(password)
    except Exception:
        return password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Dependency to retrieve authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Session expirée ou non authentifiée. Veuillez vous connecter.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = None
    if auth_header and auth_header.credentials:
        token = auth_header.credentials
    
    if not token:
        # Fallback: if database has only 1 user (local standalone mode) and no token is passed, allow fallback
        user_count = db.query(User).count()
        if user_count == 1:
            return db.query(User).first()
        raise credentials_exception
        
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        email = payload.get("sub")
        if user_id is None and email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = None
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
    elif email:
        user = db.query(User).filter(User.email.ilike(email)).first()
        if not user and email.lower() in ("admin@mathprof.tn", "sofienlafi333@gmail.com"):
            user = db.query(User).filter(User.email.in_(["sofienlafi333@gmail.com", "admin@mathprof.tn"])).first()
        
    if user is None:
        raise credentials_exception
    if not getattr(user, "is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Votre compte a été désactivé. Veuillez contacter l'administrateur."
        )
    return user

def get_tenant_admin_id(user: User) -> int:
    """Returns the effective tenant ID (the admin's user ID)."""
    if getattr(user, "role", "ADMIN") == "STAFF" and getattr(user, "admin_id", None):
        return user.admin_id
    return user.id

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Ensure the user has ADMIN role, otherwise raise 403 Forbidden."""
    if getattr(current_user, "role", "ADMIN") != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès interdit. Cette action est réservée à l'administrateur."
        )
    return current_user

def log_audit(
    db: Session,
    user: User,
    action: str,
    entity_type: str,
    entity_id: Any = None,
    old_value: Any = None,
    new_value: Any = None,
    old_values: Any = None,
    new_values: Any = None,
    details: Any = None,
    **kwargs
):
    """Record an audit trail event in the audit_logs table."""
    try:
        tenant_id = get_tenant_admin_id(user)
        ov = old_value if old_value is not None else old_values
        nv = new_value if new_value is not None else (new_values if new_values is not None else details)
        old_str = json.dumps(ov, default=str, ensure_ascii=False) if isinstance(ov, (dict, list)) else (str(ov) if ov is not None else None)
        new_str = json.dumps(nv, default=str, ensure_ascii=False) if isinstance(nv, (dict, list)) else (str(nv) if nv is not None else None)

        log_entry = AuditLog(
            admin_id=tenant_id,
            user_id=user.id,
            user_name=user.name,
            role=getattr(user, "role", "ADMIN"),
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id is not None else None,
            old_value=old_str,
            new_value=new_str,
            created_at=datetime.utcnow()
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        print(f"[AUDIT LOG WARNING] Failed to record audit log: {e}")

@router.post("/register", response_model=Token)
def register(data: UserRegister, db: Session = Depends(get_db)):
    clean_email = data.email.strip().lower()
    existing = db.query(User).filter(User.email.ilike(clean_email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un compte avec cette adresse email existe déjà. Veuillez vous connecter."
        )
    
    user = User(
        name=data.name.strip(),
        email=clean_email,
        password_hash=get_password_hash(data.password.strip()),
        phone=data.phone.strip() if data.phone else None,
        currency=data.currency or "DT",
        school_year=data.school_year or "2025-2026",
        role="ADMIN",
        is_active=True,
        created_at=datetime.utcnow()
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize default notification settings for new teacher
    notif_setting = NotificationSetting(
        user_id=user.id,
        whatsapp_phone=user.phone or "+216 98 123 456",
        daily_schedule_time="20:00",
        timezone="Africa/Tunis",
        provider="simulation",
        is_enabled=True
    )
    db.add(notif_setting)
    db.commit()

    access_token = create_access_token(data={"sub": user.email, "user_id": user.id, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "avatar": user.avatar,
            "currency": user.currency,
            "school_year": user.school_year,
            "role": user.role,
            "admin_id": user.admin_id,
            "is_active": user.is_active
        }
    }

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    clean_email = credentials.email.strip().lower()
    user = db.query(User).filter(User.email.ilike(clean_email)).first()
    if not user and clean_email in ("admin@mathprof.tn", "sofienlafi333@gmail.com"):
        user = db.query(User).filter(User.email.in_(["sofienlafi333@gmail.com", "admin@mathprof.tn"])).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants invalides (Email ou mot de passe incorrect)"
        )
    if not getattr(user, "is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Votre compte a été désactivé. Veuillez contacter l'administrateur."
        )
    
    access_token = create_access_token(data={"sub": user.email, "user_id": user.id, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "avatar": user.avatar,
            "currency": user.currency,
            "school_year": user.school_year,
            "role": user.role,
            "admin_id": user.admin_id,
            "is_active": user.is_active
        }
    }

@router.get("/me", response_model=UserOut)
@router.get("/profile", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserOut)
@router.post("/profile", response_model=UserOut)
def update_profile(data: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if data.name is not None:
        current_user.name = data.name.strip()
    if data.email is not None:
        clean_email = data.email.strip().lower()
        # Ensure email not taken by another user
        existing = db.query(User).filter(User.email.ilike(clean_email), User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Cette adresse email est déjà utilisée par un autre compte.")
        current_user.email = clean_email
    if data.phone is not None:
        current_user.phone = data.phone.strip() if data.phone else None
    if data.avatar is not None:
        current_user.avatar = data.avatar
    if data.currency is not None:
        current_user.currency = data.currency
    if data.school_year is not None:
        current_user.school_year = data.school_year.strip()
    if data.password:
        current_user.password_hash = get_password_hash(data.password)
    
    db.commit()
    db.refresh(current_user)
    return current_user

# ── STAFF ACCOUNTS MANAGEMENT (ADMIN ONLY) ──

@router.get("/staff", response_model=List[StaffOut])
def list_staff_accounts(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """List all Staff accounts managed by the authenticated Admin."""
    return db.query(User).filter(
        User.admin_id == admin_user.id,
        User.role == "STAFF"
    ).order_by(User.created_at.desc()).all()

@router.post("/staff", response_model=StaffOut)
def create_staff_account(
    data: StaffCreate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new Staff account attached to the authenticated Admin."""
    clean_email = data.email.strip().lower()
    existing = db.query(User).filter(User.email.ilike(clean_email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un compte avec cette adresse email existe déjà."
        )
    
    staff = User(
        name=data.name.strip(),
        email=clean_email,
        password_hash=get_password_hash(data.password.strip()),
        phone=data.phone.strip() if data.phone else None,
        role="STAFF",
        admin_id=admin_user.id,
        currency=admin_user.currency or "DT",
        school_year=admin_user.school_year or "2025-2026",
        is_active=True,
        created_at=datetime.utcnow()
    )
    db.add(staff)
    db.commit()
    db.refresh(staff)

    log_audit(
        db=db,
        user=admin_user,
        action="STAFF_CREATED",
        entity_type="staff",
        entity_id=staff.id,
        new_value={"name": staff.name, "email": staff.email}
    )

    return staff

@router.put("/staff/{staff_id}", response_model=StaffOut)
def update_staff_account(
    staff_id: int,
    data: StaffUpdate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update a Staff account's information or status."""
    staff = db.query(User).filter(
        User.id == staff_id,
        User.admin_id == admin_user.id,
        User.role == "STAFF"
    ).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Compte Staff non trouvé.")
    
    old_info = {"name": staff.name, "email": staff.email, "is_active": staff.is_active}

    if data.name is not None:
        staff.name = data.name.strip()
    if data.email is not None:
        clean_email = data.email.strip().lower()
        existing = db.query(User).filter(User.email.ilike(clean_email), User.id != staff.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Cette adresse email est déjà utilisée.")
        staff.email = clean_email
    if data.phone is not None:
        staff.phone = data.phone.strip() if data.phone else None
    if data.password:
        staff.password_hash = get_password_hash(data.password.strip())
    if data.is_active is not None:
        staff.is_active = data.is_active

    db.commit()
    db.refresh(staff)

    log_audit(
        db=db,
        user=admin_user,
        action="STAFF_UPDATED",
        entity_type="staff",
        entity_id=staff.id,
        old_value=old_info,
        new_value={"name": staff.name, "email": staff.email, "is_active": staff.is_active}
    )

    return staff

@router.delete("/staff/{staff_id}")
def delete_staff_account(
    staff_id: int,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete a Staff account."""
    staff = db.query(User).filter(
        User.id == staff_id,
        User.admin_id == admin_user.id,
        User.role == "STAFF"
    ).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Compte Staff non trouvé.")
    
    staff_name = staff.name
    db.delete(staff)
    db.commit()

    log_audit(
        db=db,
        user=admin_user,
        action="STAFF_DELETED",
        entity_type="staff",
        entity_id=staff_id,
        old_value={"name": staff_name}
    )

    return {"success": True, "message": "Compte Staff supprimé avec succès."}


