Update-Progress -Step 1 -Message "Checking permissions"

if (-not (Test-AdminPrivileges)) {
    Write-Log "Administrator privileges required" "WARNING"
    $response = Read-Host "Do you want to run the script as administrator? (Y/N)"
    if ($response -eq "Y" -or $response -eq "y") {
        # Relaunch script with elevated privileges
        Start-Process powershell -Verb RunAs -ArgumentList "-File `"$($MyInvocation.MyCommand.Path)`""
        exit 0
    }
    exit 1
}

Update-Progress -Step 5 -Message "Permissions check completed" 