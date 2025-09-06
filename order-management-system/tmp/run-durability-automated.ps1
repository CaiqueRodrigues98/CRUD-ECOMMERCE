# Automated durability test runner
# Save output to a file and run from repo root in PowerShell
$Out = "durability-output-$(Get-Date -Format yyyyMMdd-HHmmss).log"
Write-Output "Output will be saved to $Out"

Write-Output "Restarting app..." | Tee-Object -FilePath $Out -Append
docker-compose restart app 2>&1 | Tee-Object -FilePath $Out -Append

Write-Output "Stopping kafka..." | Tee-Object -FilePath $Out -Append
docker-compose stop kafka 2>&1 | Tee-Object -FilePath $Out -Append

Write-Output "Sending POST..." | Tee-Object -FilePath $Out -Append
# Use Invoke-RestMethod to avoid PowerShell parsing issues with '@' and to capture output cleanly.
try {
	$resp = Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/orders' -ContentType 'application/json' -InFile '.\..\tmp-durability.json' -ErrorAction Stop
	($resp | Out-String) | Tee-Object -FilePath $Out -Append
} catch {
	($_ | Out-String) | Tee-Object -FilePath $Out -Append
}

Write-Output "Listing queue files..." | Tee-Object -FilePath $Out -Append
docker-compose exec app sh -c "ls -la /app/order-management-system/data || true; echo '---'; cat /app/order-management-system/data/kafka-queue.log 2>/dev/null || true; echo '---'; cat /app/order-management-system/data/kafka-queue.json 2>/dev/null || true" 2>&1 | Tee-Object -FilePath $Out -Append

Write-Output "App logs snapshot..." | Tee-Object -FilePath $Out -Append
docker-compose logs --no-color --tail 200 app 2>&1 | Tee-Object -FilePath $Out -Append

Write-Output "Starting kafka..." | Tee-Object -FilePath $Out -Append
docker-compose start kafka 2>&1 | Tee-Object -FilePath $Out -Append

Write-Output "Waiting 5s..." | Tee-Object -FilePath $Out -Append
Start-Sleep -Seconds 5

Write-Output "App logs after kafka start..." | Tee-Object -FilePath $Out -Append
docker-compose logs --no-color --tail 200 app 2>&1 | Tee-Object -FilePath $Out -Append

Write-Output "Done. Output saved to $Out" | Tee-Object -FilePath $Out -Append

# Print the file path at the end
Write-Output "Saved: $(Resolve-Path $Out)"
