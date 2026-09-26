from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import AuditLog, User
from ..schemas import AuditLogOut
from .auth import get_current_user, require_admin, get_tenant_admin_id

router = APIRouter(prefix="/api/audit-logs", tags=["audit_logs"])

@router.get("", response_model=List[AuditLogOut])
def list_audit_logs(
    action: Optional[str] = None,
    entity_type: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Retrieve audit history logs for the tenant account (ADMIN ONLY)."""
    tenant_id = get_tenant_admin_id(admin_user)
    query = db.query(AuditLog).filter(AuditLog.admin_id == tenant_id)
    
    if action:
        query = query.filter(AuditLog.action == action)
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
        
    return query.order_by(AuditLog.created_at.desc(), AuditLog.id.desc()).limit(limit).all()
