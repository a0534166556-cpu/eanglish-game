# Script to clean .next directory and run dev server
# This helps with Hebrew path issues on Windows

Write-Host "Cleaning .next directory..." -ForegroundColor Yellow

# Stop any running Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Remove .next directory using multiple methods
if (Test-Path .next) {
    try {
        Remove-Item -Recurse -Force .next -ErrorAction Stop
        Write-Host "✓ .next directory removed successfully" -ForegroundColor Green
    } catch {
        Write-Host "⚠ First attempt failed, trying alternative method..." -ForegroundColor Yellow
        try {
            cmd /c "rmdir /s /q .next" 2>$null
            Write-Host "✓ .next directory removed using alternative method" -ForegroundColor Green
        } catch {
            Write-Host "⚠ Could not remove .next directory completely" -ForegroundColor Red
            Write-Host "Please manually delete the .next folder and try again" -ForegroundColor Red
        }
    }
} else {
    Write-Host "✓ .next directory does not exist" -ForegroundColor Green
}

Write-Host "`nStarting Next.js dev server..." -ForegroundColor Cyan
npm run dev


