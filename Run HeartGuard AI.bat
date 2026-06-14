@echo off
setlocal
title HeartGuard AI Launcher
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "%~dp0start-heartguard.ps1"
pause
endlocal
