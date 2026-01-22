
Write-Host "==============================================" -ForegroundColor Data
Write-Host "   BSU Engineering Portal - Database Rebuild" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Data

# Check if we are in the correct directory (backend)
if (!(Test-Path "manage.py")) {
    Write-Host "Error: manage.py not found. Please run this script from the 'backend' directory." -ForegroundColor Red
    exit 1
}

# Run the Python reset script
python reset_db.py

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSuccessfully rebuilt the database!" -ForegroundColor Green
    Write-Host "You can now start the server with: python manage.py runserver" -ForegroundColor Yellow
} else {
    Write-Host "`nFailed to rebuild database." -ForegroundColor Red
}

Read-Host -Prompt "Press Enter to exit"
