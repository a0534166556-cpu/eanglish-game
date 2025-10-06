@echo off
echo 🚀 מתחיל בדיקה מהירה של המערכת...
echo.

cd /d "C:\Users\a0534\OneDrive\שולחן העבודה\giboy"

echo 🔍 בודק אם השרת רץ...
curl -s http://localhost:3000 > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ השרת רץ!
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
    echo 🎉 המערכת עובדת!
    echo ✅ אתה יכול להמשיך לפרסום!
    
) else (
    echo ❌ השרת לא רץ!
    echo.
    echo 🔧 מה לעשות:
    echo   1. הרץ: npm run dev
    echo   2. חכה שהשרת יתחיל
    echo   3. הרץ שוב את הבדיקה
    echo.
    echo 💡 או בדוק בדפדפן: http://localhost:3000
)

echo.
echo 💡 המלצות לפרסום:
echo   1. ודא שהשרת רץ: npm run dev
echo   2. בדוק בדפדפן: http://localhost:3000
echo   3. בדוק את כל הדפים
echo   4. בדוק על מובייל
echo   5. בדוק עומס עם 100+ משתמשים
echo   6. הגדר hosting חזק (Vercel/Netlify)
echo   7. הגדר CDN
echo   8. הגדר monitoring
echo.
pause


