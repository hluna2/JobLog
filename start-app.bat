@echo off
echo ========================================================
echo   ClaimTrack GA - Georgia Work Search Tracker
echo ========================================================
echo   Starting local server...
echo   Open your browser at: http://localhost:5175
echo ========================================================
cd /d "%~dp0"
start "" http://localhost:5175
npm run preview -- --port 5175
pause
