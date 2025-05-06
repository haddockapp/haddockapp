Update-Progress -Step 4 -Message "Configuring database"

# Set PostgreSQL password
$env:PGPASSWORD = "postgres"

# Install PostgreSQL if not already installed
if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    Write-Log "Installing PostgreSQL..." "INFO"
    choco install postgresql --params '/Password:postgres' --params-global -y
    if ($LASTEXITCODE -eq 0) {
        Write-Log "PostgreSQL installed successfully" "INFO"
    } else {
        Write-Log "Failed to install PostgreSQL" "ERROR"
        $global:failed_installations += "postgresql"
        exit 1
    }
} else {
    Write-Log "PostgreSQL is already installed" "INFO"
}

# Configure PostgreSQL
$dbExists = & 'C:\Program Files\PostgreSQL\*\bin\psql.exe' -U postgres -lqt | Select-String "haddock"
if (-not $dbExists) {
    Write-Log "Configuring database..." "INFO"
    
    # Create user and database
    & 'C:\Program Files\PostgreSQL\*\bin\psql.exe' -U postgres -c "CREATE USER haddock WITH PASSWORD 'haddock';"
    & 'C:\Program Files\PostgreSQL\*\bin\psql.exe' -U postgres -c "CREATE DATABASE haddock WITH OWNER haddock;"
    & 'C:\Program Files\PostgreSQL\*\bin\psql.exe' -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE haddock TO haddock;"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Database configured successfully" "INFO"
    } else {
        Write-Log "Failed to configure database" "ERROR"
        $global:failed_installations += "database-configuration"
        exit 1
    }
} else {
    Write-Log "Database already configured" "INFO"
}

Update-Progress -Step 5 -Message "Database configuration completed" 