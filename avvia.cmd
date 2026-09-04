@echo off
cd /d "%~dp0"
echo KHARG command bus  http://127.0.0.1:8765/
start "" "http://127.0.0.1:8765/"
node server.mjs
