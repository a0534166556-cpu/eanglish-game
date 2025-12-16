@echo off
echo 🚀 מתחיל בדיקה פשוטה של המערכת...
echo.

cd /d "C:\Users\a0534\OneDrive\שולחן העבודה\giboy"

echo 🔍 בודק אם השרת רץ...
curl -s http://localhost:3000 > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ השרת רץ!
) else (
    echo ❌ השרת לא רץ! הרץ: npm run dev
    pause
    exit /b 1
)

echo.
echo 🔍 בודק דפים שונים...
curl -s http://localhost:3000/games > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ דף משחקים עובד
) else (
    echo ❌ דף משחקים לא עובד
)

curl -s http://localhost:3000/api/health > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Health Check עובד
) else (
    echo ❌ Health Check לא עובד
)

curl -s http://localhost:3000/login > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ דף התחברות עובד
) else (
    echo ❌ דף התחברות לא עובד
)

echo.
echo 🏁 בדיקה הושלמה!
echo.
echo 💡 המלצות:
echo   1. ודא שהשרת רץ: npm run dev
echo   2. בדוק בדפדפן: http://localhost:3000
echo   3. בדוק את כל הדפים
echo   4. בדוק על מובייל
echo.
pause


