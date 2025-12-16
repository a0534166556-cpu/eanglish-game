@echo off
cd /d "%~dp0"
echo Updating database schema...
npx prisma db push
if %errorlevel% equ 0 (
    echo Database updated successfully!
) else (
    echo Error updating database. Please check the error message above.
)
pause

