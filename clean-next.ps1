# סקריפט לניקוי תיקיית .next בצורה אגרסיבית
Write-Host "מנקה תיקיית .next..." -ForegroundColor Yellow

# עצור את כל תהליכי Node.js
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# מחק את תיקיית .next
if (Test-Path ".next") {
    Write-Host "מוחק תיקיית .next..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    
    # אם עדיין קיימת, ננסה דרך cmd
    if (Test-Path ".next") {
        Write-Host "מנסה דרך cmd..." -ForegroundColor Yellow
        cmd /c "rmdir /s /q .next" 2>$null
        Start-Sleep -Seconds 1
    }
}

Write-Host "ניקוי הושלם!" -ForegroundColor Green
