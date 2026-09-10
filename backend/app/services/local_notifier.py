import os
import subprocess
import threading

def show_windows_toast(title: str, message: str):
    """
    Triggers a non-blocking native Windows toast notification using PowerShell.
    Completely fail-safe and silent if notifications are disabled or unsupported.
    """
    def _run_toast():
        try:
            # Escape single quotes
            clean_title = title.replace("'", "''")
            clean_msg = message.replace("'", "''")

            ps_script = f"""
            [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null
            $template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
            $textNodes = $template.GetElementsByTagName("text")
            $textNodes.Item(0).AppendChild($template.CreateTextNode('{clean_title}')) > $null
            $textNodes.Item(1).AppendChild($template.CreateTextNode('{clean_msg}')) > $null
            $toast = [Windows.UI.Notifications.ToastNotification]::new($template)
            [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("MathsProf").Show($toast)
            """

            # Run in hidden background process
            subprocess.run(
                ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps_script],
                creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0,
                timeout=5,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
        except Exception as e:
            # Silent fallback: local console log
            print(f"[LOCAL NOTIFICATION] {title} - {message}")

    # Run in background daemon thread to avoid blocking server response
    t = threading.Thread(target=_run_toast, daemon=True)
    t.start()
