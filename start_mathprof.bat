@echo off
chcp 65001 >nul
title MathsProf — Serveur Local (Mode Console)
color 0A

echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║       MathsProf — Démarrage en cours...      ║
echo  ╚══════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [✓] Démarrage du serveur FastAPI et du Scheduler...
echo.
echo     Application : http://127.0.0.1:8000
echo     Fermez cette fenêtre ou tapez Ctrl+C pour arrêter.
echo.

REM Ouvrir le navigateur après vérification que le serveur est prêt
start /b powershell -NoProfile -Command "for ($i=0; $i -lt 30; $i++) { Start-Sleep -Milliseconds 500; try { if ((Invoke-WebRequest -Uri 'http://127.0.0.1:8000' -UseBasicParsing -TimeoutSec 1).StatusCode -eq 200) { Start-Process 'http://127.0.0.1:8000'; break } } catch {} }"

REM Démarrer le serveur
.venv\Scripts\python.exe backend\run.py

pause

