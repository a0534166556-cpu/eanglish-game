@echo off
cd /d "%~dp0"
echo ========================================
echo Git Commit and Push Script
echo ========================================
echo.
echo Current directory: %CD%
echo.
echo Checking git status...
git status --short
echo.
echo ========================================
echo Adding all changes...
git add .
echo.
echo ========================================
echo Committing changes...
git commit -m "Fix Word Clash timer: start at 20 seconds, stop immediately on answer, reset for each new question"
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Commit failed. Maybe no changes to commit?
    echo Continuing anyway...
)
echo.
echo ========================================
echo Pushing to GitHub...
git push origin master
if %errorlevel% neq 0 (
    echo.
    echo Trying to push to main branch instead...
    git push origin main
)
echo.
echo ========================================
echo Done! Netlify will automatically rebuild.
echo.
pause

