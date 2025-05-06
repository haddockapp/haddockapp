# Set script execution policy for this process
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

# Set script directory
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path

# Source configuration
. "$SCRIPT_DIR\config\settings.ps1"

# Source libraries (dot-source all PowerShell modules)
Get-ChildItem -Path "$SCRIPT_DIR\lib\*.ps1" | ForEach-Object {
    . $_.FullName
}

# Initialize
$START_TIME = Get-Date
$current_progress = 0
$current_step = 1
$failed_installations = @()

# Initialize display
Initialize-Display

# Run installation stages in order
Get-ChildItem -Path "$SCRIPT_DIR\stages\[0-9]*_*.ps1" | Sort-Object Name | ForEach-Object {
    . $_.FullName
}

exit 0 