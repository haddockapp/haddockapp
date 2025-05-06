function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    # Ensure log directory exists
    $logDir = Split-Path -Parent $env:INSTALL_LOG
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    
    Add-Content -Path $env:INSTALL_LOG -Value $logMessage
    Write-Host $logMessage
}

function Initialize-Display {
    Clear-Host
    Write-Host "Haddock Installation Script for Windows"
    Write-Host "======================================="
    Write-Host ""
}

function Update-Progress {
    param(
        [int]$Step,
        [string]$Message = "Processing..."
    )
    
    $global:current_step = $Step
    $progress = [math]::Round(($Step / $env:TOTAL_STEPS) * 100)
    
    # Ensure $Message is never empty
    if ([string]::IsNullOrWhiteSpace($Message)) {
        $Message = "Processing step $Step of $env:TOTAL_STEPS..."
    }
    
    Write-Progress -Activity "Installing Haddock" -Status $Message -PercentComplete $progress
    Write-Log $Message
}

function Test-AdminPrivileges {
    $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Backup-Path {
    param(
        [string]$Path
    )
    
    if (Test-Path $Path) {
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $backupPath = Join-Path $env:BACKUP_DIR "$((Split-Path -Leaf $Path))_$timestamp"
        
        # Ensure backup directory exists
        if (-not (Test-Path $env:BACKUP_DIR)) {
            New-Item -ItemType Directory -Path $env:BACKUP_DIR -Force | Out-Null
        }
        
        Copy-Item -Path $Path -Destination $backupPath -Recurse -Force
        Write-Log "Backed up $Path to $backupPath" "INFO"
    }
}

function Install-RequiredModule {
    param(
        [string]$ModuleName
    )
    
    if (-not (Get-Module -ListAvailable -Name $ModuleName)) {
        Write-Log "Installing PowerShell module: $ModuleName" "INFO"
        Install-Module -Name $ModuleName -Force -AllowClobber -Scope AllUsers
    }
}

function Refresh-Environment {
    Write-Log "Refreshing environment variables..." "INFO"
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    $env:Path = ($env:Path -split ';' | Select-Object -Unique) -join ';'
    
    # Also refresh PowerShell modules
    $env:PSModulePath = [System.Environment]::GetEnvironmentVariable("PSModulePath", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PSModulePath", "User")
    $env:PSModulePath = ($env:PSModulePath -split ';' | Select-Object -Unique) -join ';'
    
    # Import only essential modules and suppress warnings
    # This avoids errors with modules like BitLocker, Storage, and Hyper-V
    $essentialModules = @("Microsoft.PowerShell.Management", "Microsoft.PowerShell.Utility")
    foreach ($module in $essentialModules) {
        if (Get-Module -ListAvailable -Name $module) {
            Import-Module $module -Force -ErrorAction SilentlyContinue -WarningAction SilentlyContinue
        }
    }
    
    # Optional: If specific modules are needed, add them here
    # For example: Import-Module SqlServer -ErrorAction SilentlyContinue -WarningAction SilentlyContinue
} 