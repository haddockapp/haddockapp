Update-Progress -Step 3 -Message "Installing system dependencies"

# Check if Chocolatey is installed
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Log "Installing Chocolatey package manager..." "INFO"
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
    # Refresh environment variables after Chocolatey installation
    Refresh-Environment
}

# Update Chocolatey
Write-Log "Updating Chocolatey packages..." "INFO"
choco upgrade chocolatey -y

# Define required packages
$packages = @(
    "git",
    "curl",
    "wget",
    "7zip",
    "redis-64",
    "nodejs",
    "ruby",
    "vagrant",
    "virtualbox"
)

# Install each package
foreach ($package in $packages) {
    if (-not (Get-Command $package -ErrorAction SilentlyContinue)) {
        Write-Log "Installing $package..." "INFO"
        choco install $package -y
        if ($LASTEXITCODE -eq 0) {
            Write-Log "$package installed successfully" "INFO"
            # Refresh environment variables after each package installation
            Refresh-Environment
        } else {
            Write-Log "Failed to install $package" "ERROR"
            $global:failed_installations += $package
        }
    } else {
        Write-Log "$package is already installed" "INFO"
    }
    Update-Progress -Step 2
}

# Install Caddy
if (-not (Get-Command caddy -ErrorAction SilentlyContinue)) {
    Write-Log "Installing Caddy..." "INFO"
    choco install caddy -y
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Caddy installed successfully" "INFO"
        # Refresh environment variables
        Refresh-Environment
    } else {
        Write-Log "Failed to install Caddy" "ERROR"
        $global:failed_installations += "caddy"
    }
}

# Install Vagrant plugins
if (Get-Command vagrant -ErrorAction SilentlyContinue) {
    Write-Log "Installing Vagrant plugins..." "INFO"
    vagrant plugin install vagrant-vbguest
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Vagrant plugins installed successfully" "INFO"
    } else {
        Write-Log "Failed to install Vagrant plugins" "ERROR"
        $global:failed_installations += "vagrant-plugins"
    }
}

# Install Node.js packages
if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Log "Installing Node.js packages..." "INFO"
    npm install -g yarn
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Yarn installed successfully" "INFO"
        # Refresh environment variables
        Refresh-Environment
    } else {
        Write-Log "Failed to install Yarn" "ERROR"
        $global:failed_installations += "yarn"
    }
}

# Install Ruby gems
if (Get-Command gem -ErrorAction SilentlyContinue) {
    Write-Log "Installing Ruby gems..." "INFO"
    gem install bundler
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Bundler installed successfully" "INFO"
        # Refresh environment variables
        Refresh-Environment
    } else {
        Write-Log "Failed to install Bundler" "ERROR"
        $global:failed_installations += "bundler"
    }
}

Update-Progress -Step 5 -Message "Dependencies installation completed" 