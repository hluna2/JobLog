@echo off
echo ========================================================
echo   Pushing JobLog to GitHub (https://github.com/hluna2/JobLogApp)
echo ========================================================
cd /d "%~dp0"
git push -u origin main
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   SUCCESS! Pushed to https://github.com/hluna2/JobLogApp
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo   Note: If the repository doesn't exist yet, create an
    echo   empty repository named 'JobLogApp' at:
    echo   https://github.com/new
    echo   and then run this script again!
    echo ========================================================
)
pause
