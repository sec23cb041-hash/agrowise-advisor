Set-Location "C:\Users\sakth\OneDrive\Documents\agrowise-advisor"
$result = & git push origin main 2>&1
$result | Out-File -FilePath "push_result.txt" -Encoding utf8
Write-Host "Done. Exit: $LASTEXITCODE"
