@echo off
title MathsProf - Serveur Local
cd /d "%~dp0"
echo ===================================================
echo     Demarrage de MathsProf - Application Enseignant
echo ===================================================
echo.
echo Ouverture du serveur sur http://127.0.0.1:8000 ...
echo.
start http://127.0.0.1:8000
.\.venv\Scripts\python.exe backend\run.py
pause
