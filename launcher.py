import os
import sys
import time
import io
import threading
import urllib.request
import multiprocessing
import uvicorn

# 1. Freeze support for Windows multiprocessing in PyInstaller
multiprocessing.freeze_support()

# 2. Redirect stdout/stderr if None (critical for --noconsole mode on Windows)
if sys.stdout is None:
    sys.stdout = io.StringIO()
if sys.stderr is None:
    sys.stderr = io.StringIO()

# 3. Resolve and enforce current working directory to the executable folder
if getattr(sys, 'frozen', False):
    APP_ROOT = os.path.dirname(os.path.abspath(sys.executable))
    BUNDLE_DIR = getattr(sys, '_MEIPASS', APP_ROOT)
    os.chdir(APP_ROOT)
    sys.path.insert(0, BUNDLE_DIR)
else:
    APP_ROOT = os.path.dirname(os.path.abspath(__file__))
    BUNDLE_DIR = APP_ROOT
    os.chdir(APP_ROOT)
    sys.path.insert(0, APP_ROOT)

# Ensure data and reports directories exist locally
os.makedirs(os.path.join(APP_ROOT, "data"), exist_ok=True)
os.makedirs(os.path.join(APP_ROOT, "reports"), exist_ok=True)

# 4. Import FastAPI app after path setup
from backend.app.main import app

def is_server_ready(port=8000):
    try:
        req = urllib.request.Request(f"http://127.0.0.1:{port}/api/dashboard/stats", headers={"User-Agent": "Launcher"})
        with urllib.request.urlopen(req, timeout=0.8) as response:
            return response.status == 200
    except Exception:
        return False

def open_browser(port=8000):
    url = f"http://127.0.0.1:{port}"
    # Wait up to 10s until server responds
    for _ in range(60):
        if is_server_ready(port):
            break
        time.sleep(0.15)
    
    # Open URL natively using Windows shell
    try:
        os.startfile(url)
    except Exception:
        try:
            import webbrowser
            webbrowser.open(url)
        except Exception:
            pass

def main():
    port = 8000
    
    # If server is already running, just open browser and exit cleanly
    if is_server_ready(port):
        open_browser(port)
        sys.exit(0)

    # Launch browser opener in background thread
    t = threading.Thread(target=open_browser, args=(port,), daemon=True)
    t.start()

    # Start uvicorn server in main thread
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=port,
        log_level="error",
        access_log=False
    )

if __name__ == "__main__":
    main()
