@echo off
echo ========================================
echo Adding Subscription Script
echo ========================================
echo.
cd /d "%~dp0"
echo Current directory: %CD%
echo.
echo Running subscription script...
echo.
node scripts\add-subscription.js a0534166566@gmail.com premium 12
echo.
echo ========================================
echo Done!
echo.
echo If you see "Subscription added successfully!" above,
echo then the subscription was added to the database.
echo.
echo Now refresh the website and the user should see
echo they have a subscription.
echo.
pause

