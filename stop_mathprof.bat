@echo off
chcp 65001 >nul
title MathsProf — Arret du serveur

echo ========================================================
echo   Arret du serveur MathsProf en cours...
echo ========================================================
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0arreter_mathsprof.ps1"

echo.
echo [OK] Serveur MathsProf arrete avec succes.
echo.
timeout /t 2 /nobreak >nul
