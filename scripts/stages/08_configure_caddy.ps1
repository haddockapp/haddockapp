Update-Progress -Step 8 -Message "Configuring Caddy"

Write-Log "Configuring Caddy server..." "INFO"

# Stop Caddy service if running
Write-Log "Stopping Caddy service..." "INFO"
try {
    Stop-Service -Name "Caddy" -ErrorAction SilentlyContinue
    Write-Log "Caddy service stopped successfully" "INFO"
} catch {
    Write-Log "Failed to stop Caddy service: $_" "WARNING"
    $global:failed_installations += "caddy-service"
}

# Configure Caddy
$caddyConfigDir = "C:\ProgramData\chocolatey\bin"
$caddyConfigFile = Join-Path $caddyConfigDir "Caddyfile"
$caddyExePath = Join-Path $caddyConfigDir "caddy.exe"

# Backup existing config if it exists
if (Test-Path $caddyConfigFile) {
    Write-Log "Backing up existing Caddy configuration..." "INFO"
    $backupFile = "$caddyConfigFile.bak"
    Copy-Item -Path $caddyConfigFile -Destination $backupFile -Force
}

# Create Caddy configuration directory if it doesn't exist
if (-not (Test-Path $caddyConfigDir)) {
    New-Item -ItemType Directory -Path $caddyConfigDir -Force | Out-Null
}

# Create new Caddyfile
$caddyConfig = @"
:80 {
    root * "C:\Program Files\Haddock\frontend\dist"
    file_server
    try_files {path} /index.html
}

import "C:\Program Files\Haddock\api\services.caddy"
import "C:\Program Files\Haddock\api\app.caddy"
"@

# Write configuration to file
try {
    Set-Content -Path $caddyConfigFile -Value $caddyConfig -Force
    Write-Log "Created new Caddyfile" "INFO"
    
    # Set file permissions using SIDs
    $acl = Get-Acl $caddyConfigFile
    $acl.SetAccessRuleProtection($true, $false)
    
    # Get well-known SIDs
    $adminSID = New-Object System.Security.Principal.SecurityIdentifier([System.Security.Principal.WellKnownSidType]::BuiltinAdministratorsSid, $null)
    $systemSID = New-Object System.Security.Principal.SecurityIdentifier([System.Security.Principal.WellKnownSidType]::LocalSystemSid, $null)
    
    # Add Administrators group with full control
    $adminRule = New-Object System.Security.AccessControl.FileSystemAccessRule(
        $adminSID,
        "FullControl",
        "None",
        "None",
        "Allow"
    )
    $acl.AddAccessRule($adminRule)
    
    # Add SYSTEM with full control
    $systemRule = New-Object System.Security.AccessControl.FileSystemAccessRule(
        $systemSID,
        "FullControl",
        "None",
        "None",
        "Allow"
    )
    $acl.AddAccessRule($systemRule)
    
    # Apply the ACL
    Set-Acl -Path $caddyConfigFile -AclObject $acl
    Write-Log "Set file permissions for Caddyfile" "INFO"
} catch {
    Write-Log "Failed to create Caddy configuration: $($_.Exception.Message)" "ERROR"
    $global:failed_installations += "caddy-config"
    exit 1
}

# Validate configuration
Write-Log "Validating Caddy configuration..." "INFO"
try {
    & $caddyExePath validate --config $caddyConfigFile
    Write-Log "Caddy configuration validated successfully" "INFO"
} catch {
    Write-Log "Failed to validate Caddy configuration: $_" "ERROR"
    $global:failed_installations += "caddy-validation"
    exit 1
}

# Configure Caddy service
Write-Log "Configuring Caddy service..." "INFO"
try {
    # Create service if it doesn't exist
    if (-not (Get-Service -Name "Caddy" -ErrorAction SilentlyContinue)) {
        New-Service -Name "Caddy" -BinaryPathName "`"$caddyExePath`" run --config `"$caddyConfigFile`"" -DisplayName "Caddy Web Server" -StartupType Automatic
    }
    
    # Start the service
    Start-Service -Name "Caddy"
    Write-Log "Caddy service configured and started successfully" "INFO"
} catch {
    Write-Log "Failed to configure Caddy service: $_" "ERROR"
    $global:failed_installations += "caddy-service-config"
    exit 1
}

Update-Progress -Step 5 -Message "Caddy configuration completed" 