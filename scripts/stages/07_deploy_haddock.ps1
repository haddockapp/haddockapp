Update-Progress -Step 7 -Message "Deploying Haddock"

# Create installation directory
$installDir = "C:\Program Files\Haddock"
if (-not (Test-Path $installDir)) {
    Write-Log "Creating installation directory..." "INFO"
    New-Item -ItemType Directory -Path $installDir -Force | Out-Null
}

# Download Haddock
Write-Log "Downloading Haddock..." "INFO"
$tempFile = Join-Path $env:TEMP "haddock.zip"
try {
    Invoke-WebRequest -Uri "https://releases.haddock.ovh/main/release.zip" -OutFile $tempFile
    Write-Log "Download completed successfully" "INFO"
} catch {
    Write-Log "Failed to download Haddock: $_" "ERROR"
    exit 1
}

# Extract files
Write-Log "Extracting files..." "INFO"
try {
    Expand-Archive -Path $tempFile -DestinationPath $installDir -Force
    Write-Log "Extraction completed successfully" "INFO"
} catch {
    Write-Log "Failed to extract files: $_" "ERROR"
    exit 1
}

# Remove the zip file
Remove-Item -Path $tempFile -Force

Update-Progress -Step 8 -Message "Configuring backend"

# Setup backend files
Write-Log "Setting up backend configuration..." "INFO"
$apiDir = Join-Path $installDir "api"
New-Item -ItemType File -Path (Join-Path $apiDir "services.caddy") -Force | Out-Null
New-Item -ItemType File -Path (Join-Path $apiDir "app.caddy") -Force | Out-Null

# Generate .env file if needed
$envFile = Join-Path $apiDir ".env"
if (-not (Test-Path $envFile)) {
    Write-Log "Generating API configuration..." "INFO"
    
    # Generate JWT secret
    $jwtSecret = [Convert]::ToBase64String((1..256 | ForEach-Object { Get-Random -Minimum 0 -Maximum 255 }))
    
    # Create .env file
    @"
DATABASE_URL=postgresql://haddock:haddock@localhost:5432/haddock
REDIS_URL=redis://localhost:6379
CADDY_ROOT_DIR=C:\Program Files\Haddock\api\
CADDY_SERVICES_FILE=services.caddy
CADDY_APP_FILE=app.caddy
JWT_SECRET=$jwtSecret
SERVER_IP=$IP
GITHUB_CLIENT_ID=$env:GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET=$env:GITHUB_CLIENT_SECRET
FRONTEND_CONFIG=C:\Program Files\Haddock\frontend\public\config.json
FRONTEND_PORT=80
PORT=3000
"@ | Out-File -FilePath $envFile -Encoding UTF8
}

# Install API dependencies
Write-Log "Installing API dependencies..." "INFO"
Set-Location $apiDir
yarn install --silent
if ($LASTEXITCODE -ne 0) {
    Write-Log "Failed to install API dependencies" "ERROR"
    exit 1
}

# Run migrations
Write-Log "Running database migrations..." "INFO"
yarn migrate
if ($LASTEXITCODE -ne 0) {
    Write-Log "Failed to run database migrations" "ERROR"
    exit 1
}

# Build API
Write-Log "Building API application..." "INFO"
yarn run build
if ($LASTEXITCODE -ne 0) {
    Write-Log "Failed to build API" "ERROR"
    exit 1
}

Update-Progress -Step 9 -Message "Configuring frontend"

# Setup frontend configuration
$frontendDir = Join-Path $installDir "frontend"
$frontendEnvFile = Join-Path $frontendDir ".env"
if (-not (Test-Path $frontendEnvFile)) {
    Write-Log "Generating frontend configuration..." "INFO"
    @"
VITE_API_URL=http://$IP:3000
VITE_SOCKET_URL=http://$IP:3001
VITE_GITHUB_CLIENT_ID=$env:GITHUB_CLIENT_ID
"@ | Out-File -FilePath $frontendEnvFile -Encoding UTF8
}

# Build frontend
Set-Location $frontendDir
Write-Log "Installing frontend dependencies..." "INFO"
yarn install --silent
if ($LASTEXITCODE -ne 0) {
    Write-Log "Failed to install frontend dependencies" "ERROR"
    exit 1
}

Write-Log "Building frontend application..." "INFO"
yarn run build
if ($LASTEXITCODE -ne 0) {
    Write-Log "Failed to build frontend" "ERROR"
    exit 1
}

Update-Progress -Step 10 -Message "Haddock deployment completed" 