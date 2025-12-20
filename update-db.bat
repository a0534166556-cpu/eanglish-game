@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Updating database schema...
npx prisma db push
if %ERRORLEVEL% EQU 0 (
    echo Database updated successfully!
) else (
    echo Error updating database. Please check the error message above.
)
pause


