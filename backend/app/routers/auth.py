import os
from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from ..database import get_db
from ..models import User, NotificationSetting
from ..schemas import UserLogin, UserRegister, Token, UserOut, UserUpdate

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
    """Dependency to retrieve authenticated teacher from JWT token."""
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
        
    if user is None:
        raise credentials_exception
    return user

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

    access_token = create_access_token(data={"sub": user.email, "user_id": user.id})
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
            "school_year": user.school_year
        }
    }

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    clean_email = credentials.email.strip().lower()
    user = db.query(User).filter(User.email.ilike(clean_email)).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants invalides (Email ou mot de passe incorrect)"
        )
    
    access_token = create_access_token(data={"sub": user.email, "user_id": user.id})
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
            "school_year": user.school_year
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

