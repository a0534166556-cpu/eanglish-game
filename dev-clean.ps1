# סקריפט להרצת הפרויקט עם ניקוי אוטומטי של .next
Write-Host "Cleaning .next folder..." -ForegroundColor Yellow

# עצור תהליכי Node.js
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# מחק את תיקיית .next
if (Test-Path .next) {
    try {
        Remove-Item -Recurse -Force .next -ErrorAction Stop
        Write-Host "✓ .next folder deleted successfully" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Warning: Could not fully delete .next folder. Trying alternative method..." -ForegroundColor Yellow
        # נסה למחוק קבצים בודדים
        Get-ChildItem -Path .next -Recurse -Force -ErrorAction SilentlyContinue | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
        Remove-Item -Force .next -ErrorAction SilentlyContinue
    }
} else {
    Write-Host "✓ .next folder does not exist" -ForegroundColor Green
}

Write-Host "`nStarting Next.js dev server..." -ForegroundColor Cyan
npm run dev

