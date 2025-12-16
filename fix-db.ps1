# Fix database schema for Word Clash game
Write-Host "🔄 Updating database schema..." -ForegroundColor Yellow
Set-Location $PSScriptRoot
npx prisma db push
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database updated successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Error updating database. Please check the error message above." -ForegroundColor Red
}
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

