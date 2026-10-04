@echo off
title Samaira AI Vocational Career Counselling Platform
echo ==============================================================
echo Starting Samaira AI Vocational Career Counselling Server...
echo ==============================================================

cd /d "%~dp0samaira\backend"
start http://127.0.0.1:8000
"D:\Users\Excel\anaconda3\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
pause
