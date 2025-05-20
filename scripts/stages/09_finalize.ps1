Update-Progress -Step 9 -Message "Starting services"

Write-Log "Finalizing installation..." "INFO"
Write-Log "Starting all services..." "INFO"

# Start Redis service
Write-Log "Starting Redis service..." "INFO"
try {
    Start-Service -Name "Redis" -ErrorAction Stop
    Set-Service -Name "Redis" -StartupType Automatic
    Write-Log "Redis service started successfully" "INFO"
} catch {
    Write-Log "Failed to start Redis service: $_" "ERROR"
    $global:failed_installations += "redis-service"
}

# Start PostgreSQL service
Write-Log "Starting PostgreSQL service..." "INFO"
try {
    Start-Service -Name "postgresql-x64-*" -ErrorAction Stop
    Set-Service -Name "postgresql-x64-*" -StartupType Automatic
    Write-Log "PostgreSQL service started successfully" "INFO"
} catch {
    Write-Log "Failed to start PostgreSQL service: $_" "ERROR"
    $global:failed_installations += "postgresql-service"
}

# Start Caddy service
Write-Log "Starting Caddy service..." "INFO"
try {
    Start-Service -Name "Caddy" -ErrorAction Stop
    Set-Service -Name "Caddy" -StartupType Automatic
    Write-Log "Caddy service started successfully" "INFO"
} catch {
    Write-Log "Failed to start Caddy service: $_" "ERROR"
    $global:failed_installations += "caddy-service"
}

# Create and start API as a Windows service
Write-Log "Setting up API as a Windows service..." "INFO"
try {
    $apiPath = "C:\Program Files\Haddock\api"
    
    # Find node and yarn from PATH
    $nodeExe = (Get-Command node).Source
    $yarnExe = (Get-Command yarn).Source
    
    Write-Log "Using Node.js at: $nodeExe" "INFO"
    Write-Log "Using Yarn at: $yarnExe" "INFO"
    
    # Check if NSSM is installed, if not download and install it
    $nssmPath = "C:\Program Files\nssm\nssm.exe"
    if (-not (Test-Path $nssmPath)) {
        Write-Log "Downloading NSSM..." "INFO"
        $nssmZipUrl = "https://nssm.cc/release/nssm-2.24.zip"
        $nssmZipPath = "$env:TEMP\nssm.zip"
        Invoke-WebRequest -Uri $nssmZipUrl -OutFile $nssmZipPath
        Expand-Archive -Path $nssmZipPath -DestinationPath "$env:TEMP\nssm" -Force
        New-Item -Path "C:\Program Files\nssm" -ItemType Directory -Force
        Copy-Item -Path "$env:TEMP\nssm\nssm-2.24\win64\nssm.exe" -Destination $nssmPath -Force
    }
    
    # Remove existing service if it exists
    & $nssmPath stop haddock-api 2>$null
    & $nssmPath remove haddock-api confirm 2>$null
    
    # Create the service using node directly with main.js
    Write-Log "Creating service with node at: $nodeExe" "INFO"
    
    # Install service with node as the executable
    & $nssmPath install haddock-api $nodeExe
    & $nssmPath set haddock-api AppDirectory $apiPath
    & $nssmPath set haddock-api AppParameters "dist/main.js"
    & $nssmPath set haddock-api DisplayName "Haddock API Service"
    & $nssmPath set haddock-api Description "Haddock API Service"
    & $nssmPath set haddock-api Start SERVICE_AUTO_START
    & $nssmPath set haddock-api ObjectName LocalSystem
    
    # Set proper environment
    & $nssmPath set haddock-api AppEnvironmentExtra "NODE_ENV=production"
    
    # Start the service
    Start-Service -Name "haddock-api"
    Write-Log "API service created and started successfully" "INFO"
} catch {
    Write-Log "Failed to setup API service: $_" "ERROR"
    $global:failed_installations += "api-service"
}

# Validation function
function Test-Component {
    param(
        [string]$Component
    )
    
    Write-Log "Validating component: $Component" "INFO"
    
    switch ($Component) {
        "database" {
            try {
                $result = & 'C:\Program Files\PostgreSQL\*\bin\psql.exe' -U postgres -l | Select-String "haddock"
                if ($result) {
                    Write-Log "Database validation successful" "INFO"
                    return $true
                } else {
                    Write-Log "Database validation failed: Database 'haddock' not found" "ERROR"
                    return $false
                }
            } catch {
                Write-Log "Database validation failed: $_" "ERROR"
                return $false
            }
        }
        "redis" {
            try {
                $result = & 'C:\Program Files\Memurai\memurai-cli.exe' ping
                if ($result -eq "PONG") {
                    Write-Log "Redis validation successful" "INFO"
                    return $true
                } else {
                    Write-Log "Redis validation failed: Redis not responding" "ERROR"
                    return $false
                }
            } catch {
                Write-Log "Redis validation failed: $_" "ERROR"
                return $false
            }
        }
        "api" {
            try {
                # First check if service is running
                $serviceStatus = Get-Service -Name "haddock-api" -ErrorAction SilentlyContinue
                if ($serviceStatus -and $serviceStatus.Status -eq "Running") {
                    # Then check API health
                    $result = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing
                    if ($result.Content -match "ok") {
                        Write-Log "API validation successful" "INFO"
                        return $true
                    } else {
                        Write-Log "API validation failed: Health check failed" "ERROR"
                        return $false
                    }
                } else {
                    Write-Log "API validation failed: Service not running" "ERROR"
                    return $false
                }
            } catch {
                Write-Log "API validation failed: $_" "ERROR"
                return $false
            }
        }
        "frontend" {
            if (Test-Path "C:\Program Files\Haddock\frontend\dist\index.html") {
                Write-Log "Frontend validation successful" "INFO"
                return $true
            } else {
                Write-Log "Frontend validation failed: Frontend not built properly" "ERROR"
                return $false
            }
        }
        "caddy" {
            $caddyProcess = Get-Process -Name "caddy" -ErrorAction SilentlyContinue
            if ($caddyProcess) {
                Write-Log "Caddy validation successful" "INFO"
                return $true
            } else {
                Write-Log "Caddy validation failed: Process not running" "ERROR"
                return $false
            }
        }
    }
}

# Validate components
$components = @("database", "redis", "api", "frontend", "caddy")
$validationFailed = $false
$failedComponents = @()

foreach ($component in $components) {
    Write-Host "Validating $component... " -NoNewline
    if (Test-Component $component) {
        Write-Host "✓" -ForegroundColor Green
    } else {
        Write-Host "✗" -ForegroundColor Red
        $validationFailed = $true
        $failedComponents += $component
    }
}

# Calculate installation duration
$duration = (Get-Date) - $START_TIME
$minutes = [math]::Floor($duration.TotalMinutes)
$seconds = $duration.Seconds

# Print summary
Write-Host "`nInstallation Summary"
Write-Host "══════════════════════"
Write-Host "Duration: $minutes minutes and $seconds seconds"
Write-Host "Log file: $env:INSTALL_LOG`n"

if ($failedComponents.Count -eq 0 -and -not $validationFailed) {
    Write-Host "✓ Installation completed successfully" -ForegroundColor Green
    Write-Host "`nNext steps:"
    Write-Host "1. Access Haddock at http://$IP"
    Write-Host "2. Configure your first project"
    Write-Host "3. Read the docs at https://docs.haddock.ovh"

    # Create backup
    if (Test-Path "C:\Program Files\Haddock") {
        $backupFile = Join-Path $env:BACKUP_DIR "haddock_$(Get-Date -Format 'yyyyMMdd_HHmmss').zip"
        Compress-Archive -Path "C:\Program Files\Haddock" -DestinationPath $backupFile -Force
        Write-Host "`n✓ Backup created in $env:BACKUP_DIR"
    }
} else {
    Write-Host "! Installation completed with warnings" -ForegroundColor Red
    if ($failedComponents.Count -gt 0) {
        Write-Host "`nFailed components:"
        foreach ($failed in $failedComponents) {
            Write-Host "  ✗ $failed" -ForegroundColor Red
        }
    }
    Write-Host "`nTroubleshooting:"
    Write-Host "1. Check the installation log: $env:INSTALL_LOG"
    Write-Host "2. Visit https://docs.haddock.ovh/troubleshooting"
}

# Update final summary logging
Write-Log "Installation completed in $minutes minutes and $seconds seconds" "INFO"
if ($failedComponents.Count -eq 0 -and -not $validationFailed) {
    Write-Log "Installation successful" "INFO"
    Write-Log "Backup created at: $backupFile" "INFO"
} else {
    Write-Log "Installation completed with warnings" "WARNING"
    foreach ($failed in $failedComponents) {
        Write-Log "Component failed: $failed" "ERROR"
    }
}

Write-Log "Installation completed with status: $($failedComponents.Count) failures" "INFO"
exit 0