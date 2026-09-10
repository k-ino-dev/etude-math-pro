@echo off
chcp 65001 >nul
title MathsProf — Raccourci Bureau

echo ========================================================
echo   Création du raccourci MathsProf sur votre Bureau...
echo ========================================================
echo.

cscript //nologo "%~dp0create_shortcut.vbs"

echo.
pause


