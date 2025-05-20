Update-Progress -Step 6 -Message "Configuring network"

# Function to validate IP address
function Test-ValidIP {
    param(
        [string]$IP
    )
    $pattern = '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
    return $IP -match $pattern
}

# Get network information
Write-Log "Detecting network configuration..." "INFO"

# Get public IP
try {
    $publicIP = (Invoke-WebRequest ifconfig.me/ip).Content.Trim()
    Write-Log "Public IP: $publicIP" "INFO"
} catch {
    Write-Log "Could not determine public IP" "WARNING"
}

# Get local IPs
$localIPs = Get-NetIPAddress | Where-Object { $_.AddressFamily -eq "IPv4" -and $_.PrefixOrigin -ne "WellKnown" } | Select-Object -ExpandProperty IPAddress
Write-Log "Local IPs: $($localIPs -join ', ')" "INFO"

# Display available IPs
Write-Host "`nAvailable IP addresses:"
if ($publicIP) {
    Write-Host "  Public IP: $publicIP"
}
foreach ($ip in $localIPs) {
    Write-Host "  Local IP:  $ip"
}

# Ask user for IP choice
$validIP = $false
while (-not $validIP) {
    $IP = Read-Host "`nEnter IP address to use"
    if (Test-ValidIP $IP) {
        $validIP = $true
        Write-Log "User selected IP: $IP" "INFO"
    } else {
        Write-Host "Invalid IP format. Use format: xxx.xxx.xxx.xxx" -ForegroundColor Red
        Write-Log "Invalid IP entered: $IP" "WARNING"
    }
}

Write-Log "Network configuration complete. Using IP: $IP" "INFO"
Update-Progress -Step 5 -Message "Network configuration completed" 