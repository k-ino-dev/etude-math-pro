import os
import re
import datetime
import json
import urllib.request
import urllib.parse
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from ..models import NotificationSetting, NotificationLog, User
from .pdf_generator import format_date_long_fr

def get_or_create_settings(db: Session, user_id: Optional[int] = None) -> NotificationSetting:
    query = db.query(NotificationSetting)
    if user_id:
        query = query.filter(NotificationSetting.user_id == user_id)
    setting = query.first()
    if not setting:
        user_query = db.query(User)
        if user_id:
            user = user_query.filter(User.id == user_id).first()
        else:
            user = user_query.first()
        phone = user.phone if (user and user.phone) else "+216 98 123 456"
        setting = NotificationSetting(
            user_id=user.id if user else user_id,
            whatsapp_phone=phone,
            daily_schedule_time="20:00",
            timezone="Africa/Tunis",
            provider="simulation",
            is_enabled=True
        )
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return setting

def clean_phone_number(phone_str: str) -> str:
    """Format phone number: remove +, spaces, dashes, leading 00."""
    if not phone_str:
        return "21698123456"
    
    cleaned = re.sub(r"[^\d]", "", phone_str)
    if cleaned.startswith("00"):
        cleaned = cleaned[2:]
    
    # If 8 digits (Tunisia standard local), prepend 216
    if len(cleaned) == 8:
        cleaned = "216" + cleaned
        
    return cleaned

def format_schedule_whatsapp_message(schedule_data: Dict[str, Any], teacher_name: str = "Prof. Mohamed") -> str:
    """Build a clean, high-impact WhatsApp message for daily schedule."""
    date_str = schedule_data.get("date_long_fr", "")
    sessions = schedule_data.get("sessions", [])
    total_sessions = schedule_data.get("total_sessions", 0)
    total_duration = schedule_data.get("total_duration_str", "0h00")

    if total_sessions == 0:
        return (
            f"📅 *Étude Math Pro — Programme de Demain*\n"
            f"🗓️ *Date :* {date_str}\n"
            f"👨‍🏫 *Enseignant :* {teacher_name}\n"
            f"━━━━━━━━━━━━━━━━━━━━\n"
            f"🏖️ *Aucune séance planifiée pour cette journée.*\n"
            f"━━━━━━━━━━━━━━━━━━━━\n"
            f"_MathsProf — Étude Math Pro_"
        )

    lines = [
        f"📅 *Étude Math Pro — Programme de Demain*",
        f"🗓️ *Date :* {date_str}",
        f"👨‍🏫 *Enseignant :* {teacher_name}",
        f"━━━━━━━━━━━━━━━━━━━━"
    ]

    for s in sessions:
        lines.append(f"🕐 *{s['start_time']} ➔ {s['end_time']}*")
        lines.append(f"👥 *{s['group_name']}* ({s['level']})")
        lines.append(f"📍 {s['location']} • 👥 {s['student_count']} élève(s)")
        if s.get("topic"):
            lines.append(f"📝 _{s['topic']}_")
        lines.append("────────────────────")

    lines.append(f"📊 *Bilan :* {total_sessions} séance(s) • {total_duration} de cours")
    lines.append("━━━━━━━━━━━━━━━━━━━━")
    lines.append("_MathsProf — Étude Math Pro_")

    return "\n".join(lines)

def send_whatsapp_payload(to_phone: str, message: str, setting: NotificationSetting) -> Dict[str, Any]:
    """Execute WhatsApp dispatch via configured provider (simulation, ultramsg, webhook)."""
    cleaned_to = clean_phone_number(to_phone)
    provider = (setting.provider or "simulation").lower()

    if provider == "ultramsg":
        instance_id = (setting.ultramsg_instance_id or "").strip()
        token = (setting.ultramsg_token or "").strip()
        
        if not instance_id or not token:
            # Fallback to simulation if credentials missing
            return {
                "success": True,
                "status": "simulated",
                "provider": "simulation_fallback",
                "message": "UltraMsg non configuré (Token/Instance manquants). Mode simulation actif.",
                "response": {"info": "Simulation fallback"}
            }

        url = f"https://api.ultramsg.com/{instance_id}/messages/chat"
        payload_data = {
            "token": token,
            "to": cleaned_to,
            "body": message
        }

        try:
            data_bytes = urllib.parse.urlencode(payload_data).encode("utf-8")
            req = urllib.request.Request(url, data=data_bytes, method="POST")
            req.add_header("Content-Type", "application/x-www-form-urlencoded")
            
            with urllib.request.urlopen(req, timeout=10) as response:
                res_body = response.read().decode("utf-8")
                res_json = json.loads(res_body) if res_body else {}
                return {
                    "success": True,
                    "status": "sent",
                    "provider": "ultramsg",
                    "response": res_json
                }
        except Exception as e:
            return {
                "success": False,
                "status": "failed",
                "provider": "ultramsg",
                "error": str(e)
            }

    elif provider == "webhook":
        webhook_url = (setting.webhook_url or "").strip()
        if not webhook_url:
            return {
                "success": True,
                "status": "simulated",
                "provider": "simulation_fallback",
                "message": "URL Webhook manquante. Mode simulation actif.",
                "response": {"info": "Simulation fallback"}
            }

        try:
            payload_data = {"to": cleaned_to, "message": message, "timestamp": datetime.datetime.utcnow().isoformat()}
            data_bytes = json.dumps(payload_data).encode("utf-8")
            req = urllib.request.Request(webhook_url, data=data_bytes, method="POST")
            req.add_header("Content-Type", "application/json")
            
            with urllib.request.urlopen(req, timeout=10) as response:
                res_body = response.read().decode("utf-8")
                return {
                    "success": True,
                    "status": "sent",
                    "provider": "webhook",
                    "response": res_body[:200]
                }
        except Exception as e:
            return {
                "success": False,
                "status": "failed",
                "provider": "webhook",
                "error": str(e)
            }

    # Default Simulation
    return {
        "success": True,
        "status": "simulated",
        "provider": "simulation",
        "message": f"Message simulé avec succès pour le numéro {cleaned_to}.",
        "response": {
            "to": cleaned_to,
            "characters": len(message),
            "simulated_id": f"sim_{datetime.datetime.utcnow().timestamp()}"
        }
    }

def dispatch_daily_schedule_whatsapp(db: Session, target_date: Optional[datetime.date] = None, force: bool = False, user_id: Optional[int] = None) -> Dict[str, Any]:
    """Compile schedule, generate PDF, and send/simulate WhatsApp notification with idempotency."""
    import pytz
    from .scheduler import build_schedule_data_for_date, generate_and_save_daily_pdf

    setting = get_or_create_settings(db, user_id=user_id)
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
    else:
        user = db.query(User).first()
    teacher_name = user.name if user else "Prof. Mohamed"

    try:
        tz = pytz.timezone(setting.timezone or "Africa/Tunis")
    except Exception:
        tz = pytz.timezone("Africa/Tunis")

    now_tz = datetime.datetime.now(tz)

    if target_date is None:
        target_date = (now_tz + datetime.timedelta(days=1)).date()

    cleaned_phone = clean_phone_number(setting.whatsapp_phone)
    effective_user_id = user.id if user else (user_id or 1)
    idempotency_key = f"daily_schedule_{target_date.isoformat()}_{cleaned_phone}_{effective_user_id}"

    # Anti-duplicate check unless force=True
    if not force:
        existing = db.query(NotificationLog).filter(NotificationLog.idempotency_key == idempotency_key).first()
        if existing and existing.status in ["sent", "simulated"]:
            return {
                "success": True,
                "status": "already_sent",
                "message": f"Le planning pour le {target_date.isoformat()} a déjà été envoyé aujourd'hui.",
                "log_id": existing.id,
                "schedule_date": target_date.isoformat()
            }

    # 1. Compile schedule data
    schedule_data = build_schedule_data_for_date(db, target_date, user_id=user_id)

    # 2. Generate and save daily PDF
    pdf_path = generate_and_save_daily_pdf(db, target_date, user_id=user_id)

    # 3. Format WhatsApp message
    message_text = format_schedule_whatsapp_message(schedule_data, teacher_name=teacher_name)

    # 4. Dispatch via provider
    dispatch_res = send_whatsapp_payload(setting.whatsapp_phone, message_text, setting)

    # 5. Record or Update Log
    status = dispatch_res.get("status", "simulated")
    error_msg = dispatch_res.get("error")
    provider_res_str = json.dumps(dispatch_res.get("response", {}))

    existing = db.query(NotificationLog).filter(NotificationLog.idempotency_key == idempotency_key).first()
    if existing:
        existing.user_id = effective_user_id
        existing.recipient = setting.whatsapp_phone
        existing.message = message_text
        existing.status = status
        existing.error_message = error_msg
        existing.provider_response = provider_res_str
        existing.sent_at = datetime.datetime.utcnow()
        log_entry = existing
    else:
        log_entry = NotificationLog(
            user_id=effective_user_id,
            type="daily_schedule",
            recipient=setting.whatsapp_phone,
            message=message_text,
            status=status,
            idempotency_key=idempotency_key,
            error_message=error_msg,
            provider_response=provider_res_str,
            sent_at=datetime.datetime.utcnow()
        )
        db.add(log_entry)

    setting.last_daily_sent_date = target_date
    db.commit()
    db.refresh(log_entry)

    # 6. Local Windows toast if available
    try:
        from .local_notifier import show_windows_toast
        status_label = "simulé" if status == "simulated" else "envoyé"
        show_windows_toast(
            "MathsProf — Planning WhatsApp",
            f"Planning du {target_date.isoformat()} {status_label} ({schedule_data['total_sessions']} séances)"
        )
    except Exception:
        pass

    return {
        "success": dispatch_res.get("success", True),
        "status": status,
        "message": dispatch_res.get("message", "Planning envoyé avec succès !"),
        "target_date": target_date.isoformat(),
        "total_sessions": schedule_data["total_sessions"],
        "pdf_url": f"/api/reports/daily/{target_date.isoformat()}/pdf",
        "message_preview": message_text,
        "log_id": log_entry.id
    }
