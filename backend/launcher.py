import os
import sys
import subprocess
import time
import urllib.request
import webbrowser

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)
PYTHON_EXE = os.path.join(PROJECT_DIR, ".venv", "Scripts", "python.exe")
RUN_PY = os.path.join(BASE_DIR, "run.py")

DETACHED_PROCESS = 0x00000008
CREATE_NEW_PROCESS_GROUP = 0x00000200
CREATE_NO_WINDOW = 0x08000000

def is_server_ready():
    try:
        req = urllib.request.urlopen("http://127.0.0.1:8000", timeout=0.8)
        return req.status == 200
    except Exception:
        return False

def main():
    # 1. Check if server already running
    if is_server_ready():
        webbrowser.open("http://127.0.0.1:8000")
        sys.exit(0)

    # 2. Spawn detached server process
    flags = DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP | CREATE_NO_WINDOW
    proc = subprocess.Popen(
        [PYTHON_EXE, RUN_PY],
        cwd=PROJECT_DIR,
        creationflags=flags,
        close_fds=True
    )

    # 3. Wait for server to become accessible
    ready = False
    for _ in range(50):
        time.sleep(0.4)
        if is_server_ready():
            ready = True
            break

    if ready:
        webbrowser.open("http://127.0.0.1:8000")
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
