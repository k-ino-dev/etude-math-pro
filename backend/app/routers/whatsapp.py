import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models import NotificationSetting, NotificationLog, User
from ..schemas import (
    NotificationSettingOut, NotificationSettingUpdate, NotificationLogOut,
    WhatsAppTestRequest, WhatsAppSendScheduleRequest
)
from ..services.whatsapp import (
    get_or_create_settings,
    dispatch_daily_schedule_whatsapp,
    send_whatsapp_payload,
    clean_phone_number
)
from .auth import get_current_user

router = APIRouter(prefix="/api/whatsapp", tags=["whatsapp"])

@router.get("/settings", response_model=NotificationSettingOut)
def get_whatsapp_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_or_create_settings(db, user_id=current_user.id)

@router.put("/settings", response_model=NotificationSettingOut)
def update_whatsapp_settings(
    data: NotificationSettingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    setting = get_or_create_settings(db, user_id=current_user.id)

    if data.whatsapp_phone is not None:
        setting.whatsapp_phone = data.whatsapp_phone.strip()
    if data.daily_schedule_time is not None:
        setting.daily_schedule_time = data.daily_schedule_time.strip()
    if data.timezone is not None:
        setting.timezone = data.timezone.strip()
    if data.provider is not None:
        setting.provider = data.provider.strip()
    if data.ultramsg_instance_id is not None:
        setting.ultramsg_instance_id = data.ultramsg_instance_id.strip() if data.ultramsg_instance_id else None
    if data.ultramsg_token is not None:
        setting.ultramsg_token = data.ultramsg_token.strip() if data.ultramsg_token else None
    if data.webhook_url is not None:
        setting.webhook_url = data.webhook_url.strip() if data.webhook_url else None
    if data.is_enabled is not None:
        setting.is_enabled = data.is_enabled

    db.commit()
    db.refresh(setting)
    return setting

@router.post("/send-schedule-now")
def send_schedule_now(
    payload: WhatsAppSendScheduleRequest = WhatsAppSendScheduleRequest(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Trigger immediate schedule notification dispatch for tomorrow or target date."""
    target_date = None
    if payload.target_date:
        try:
            target_date = datetime.date.fromisoformat(payload.target_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Format de date invalide (attendu: YYYY-MM-DD)")

    result = dispatch_daily_schedule_whatsapp(db, target_date=target_date, force=payload.force, user_id=current_user.id)
    return result

@router.post("/test")
def test_whatsapp_notification(
    payload: WhatsAppTestRequest = WhatsAppTestRequest(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send test message to configured phone."""
    setting = get_or_create_settings(db, user_id=current_user.id)
    phone = payload.phone.strip() if payload.phone else setting.whatsapp_phone
    test_msg = payload.message.strip() if payload.message else (
        "🔔 *Étude Math Pro — Test de Notification WhatsApp*\n"
        "✅ Votre système de notification est correctement configuré et opérationnel !\n"
        "📅 Vous recevrez votre planning chaque soir à l'heure configurée.\n"
        "━━━━━━━━━━━━━━━━━━━━\n"
        "_MathsProf — Étude Math Pro_"
    )

    res = send_whatsapp_payload(phone, test_msg, setting)

    log_entry = NotificationLog(
        user_id=current_user.id,
        type="test",
        recipient=phone,
        message=test_msg,
        status=res.get("status", "simulated"),
        error_message=res.get("error"),
        provider_response=str(res.get("response", {})),
        sent_at=datetime.datetime.utcnow()
    )
    db.add(log_entry)
    db.commit()

    return {
        "success": res.get("success", True),
        "status": res.get("status", "simulated"),
        "message": f"Test WhatsApp {res.get('status', 'envoyé')} vers {phone} !",
        "details": res
    }

@router.get("/logs", response_model=List[NotificationLogOut])
def list_notification_logs(
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(NotificationLog).filter(
        NotificationLog.user_id == current_user.id
    ).order_by(NotificationLog.sent_at.desc()).limit(limit).all()
