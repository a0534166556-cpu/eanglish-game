@echo off
echo ========================================
echo    יצירת דומיין בחינם ל-Word Clash
echo ========================================
echo.

echo פתיחת דפדפן ליצירת דומיין...
start https://www.freenom.com

echo.
echo ========================================
echo הוראות:
echo ========================================
echo 1. לחץ "Get Started Now"
echo 2. חפש דומיין (למשל: wordclash)
echo 3. בחר .tk או .ml (חינם)
echo 4. הירשם עם Gmail שלך
echo 5. תאשר את המייל
echo 6. תקבל את הדומיין שלך!
echo.
echo אחרי שתקבל את הדומיין, לחץ Enter...
pause

echo.
echo ========================================
echo    הגדרת SendGrid
echo ========================================
echo.
echo פתיחת SendGrid...
start https://app.sendgrid.com/settings/sender_authentication

echo.
echo הוראות:
echo 1. לחץ "Authenticate Your Domain"
echo 2. הזן את הדומיין שיצרת
echo 3. העתק את ה-DNS records
echo 4. חזור לכאן ולחץ Enter...
pause

echo.
echo ========================================
echo    עדכון הקוד
echo ========================================
echo.
echo עדכון קובץ .env.local...
echo SENDGRID_FROM_EMAIL=noreply@YOUR_DOMAIN_HERE >> .env.local
echo SENDGRID_FROM_NAME=Word Clash >> .env.local
echo.
echo ========================================
echo    סיום!
echo ========================================
echo.
echo עכשיו המיילים יגיעו מהדומיין שלך!
echo לא יהיו בספאם!
echo.
pause

