Update-Progress -Step 5 -Message "Setting up Node.js environment"

# Install Node.js if not already installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Log "Installing Node.js..." "INFO"
    choco install nodejs -y
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Node.js installed successfully" "INFO"
        # Refresh environment variables
        Refresh-Environment
    } else {
        Write-Log "Failed to install Node.js" "ERROR"
        $global:failed_installations += "nodejs"
        exit 1
    }
} else {
    Write-Log "Node.js is already installed" "INFO"
}

# Check Node.js version and upgrade if needed
$nodeVersion = (node -v).Substring(1) -as [version]
$requiredVersion = "20.0.0" -as [version]

if ($nodeVersion -lt $requiredVersion) {
    Write-Log "Upgrading Node.js to version 20 or higher..." "INFO"
    choco upgrade nodejs -y
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Node.js upgraded successfully" "INFO"
        # Refresh environment variables
        Refresh-Environment
    } else {
        Write-Log "Failed to upgrade Node.js" "ERROR"
        $global:failed_installations += "nodejs-upgrade"
        exit 1
    }
} else {
    Write-Log "Node.js version is compatible" "INFO"
}

# Install Yarn if not already installed
if (-not (Get-Command yarn -ErrorAction SilentlyContinue)) {
    Write-Log "Installing Yarn..." "INFO"
    npm install -g yarn
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Yarn installed successfully" "INFO"
        # Refresh environment variables
        Refresh-Environment
    } else {
        Write-Log "Failed to install Yarn" "ERROR"
        $global:failed_installations += "yarn"
        exit 1
    }
} else {
    Write-Log "Yarn is already installed" "INFO"
}

# Install PM2 if not already installed
# if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
#     Write-Log "Installing PM2..." "INFO"
#     yarn global add pm2
#     if ($LASTEXITCODE -eq 0) {
#         Write-Log "PM2 installed successfully" "INFO"
#         # Refresh environment variables
#         Refresh-Environment
        
#         # Add Yarn global bin directory to PATH permanently
#         $yarnGlobalDir = yarn global bin
#         if ($yarnGlobalDir) {
#             # Add to PATH for current session
#             $env:PATH = "$yarnGlobalDir;$env:PATH"
            
#             # Add to PATH permanently (user level)
#             $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
#             if (-not $currentPath.Contains($yarnGlobalDir)) {
#                 [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$yarnGlobalDir", "User")
#                 Write-Log "Added Yarn global bin directory to permanent PATH: $yarnGlobalDir" "INFO"
#             }
#         }
#     } else {
#         Write-Log "Failed to install PM2" "ERROR"
#         $global:failed_installations += "pm2"
#         exit 1
#     }
# } else {
#     Write-Log "PM2 is already installed" "INFO"
# }

# # Configure PM2 to start on Windows startup
# if (Get-Command pm2 -ErrorAction SilentlyContinue) {
#     Write-Log "Configuring PM2 startup..." "INFO"
#     pm2 startup
#     if ($LASTEXITCODE -eq 0) {
#         Write-Log "PM2 startup configured successfully" "INFO"
#     } else {
#         # Try with full path if command failed
#         $pmPath = Join-Path (yarn global bin) "pm2.cmd"
#         if (Test-Path $pmPath) {
#             Write-Log "Retrying PM2 startup with full path..." "INFO"
#             & $pmPath startup
#             if ($LASTEXITCODE -eq 0) {
#                 Write-Log "PM2 startup configured successfully with full path" "INFO"
#             } else {
#                 Write-Log "Failed to configure PM2 startup" "ERROR"
#                 $global:failed_installations += "pm2-startup"
#             }
#         } else {
#             Write-Log "Failed to configure PM2 startup" "ERROR"
#             $global:failed_installations += "pm2-startup"
#         }
#     }
# }

Update-Progress -Step 10 -Message "Node.js environment setup completed" 