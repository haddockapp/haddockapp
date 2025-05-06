# Set script directory
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path

# Source configuration
. "$SCRIPT_DIR\config\settings.ps1"

# Source libraries
Get-ChildItem -Path "$SCRIPT_DIR\lib\*.ps1" | ForEach-Object {
    . $_.FullName
}

# Check for administrator privileges
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "Please run as Administrator" -ForegroundColor Red
    exit 1
}

# Print banner
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  Haddock Admin Password Reset Tool" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Get admin email
$ADMIN_EMAIL = Read-Host -Prompt "Enter admin email"

if ([string]::IsNullOrEmpty($ADMIN_EMAIL)) {
    Write-Host "Error: Admin email is required" -ForegroundColor Red
    exit 1
}

# Check if user exists and is admin
try {
    $apiPath = "C:\Program Files\Haddock\api"
    Set-Location $apiPath
    $USER_CHECK = & node -e "
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        (async () => {
            try {
                const user = await prisma.user.findFirst({
                    where: {
                        email: '$ADMIN_EMAIL',
                        role: 'ADMIN'
                    }
                });
                console.log(user ? JSON.stringify(user) : '');
                await prisma.$disconnect();
            } catch (e) {
                console.error(e);
                process.exit(1);
            }
        })();
    "
    
    if ([string]::IsNullOrEmpty($USER_CHECK)) {
        Write-Host "Error: No admin user found with email: $ADMIN_EMAIL" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error checking user: $_" -ForegroundColor Red
    exit 1
}

# Get new password
do {
    $PASSWORD = Read-Host -Prompt "Enter new password" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($PASSWORD)
    $PASSWORD_TEXT = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
    
    if ([string]::IsNullOrEmpty($PASSWORD_TEXT)) {
        Write-Host "Error: Password cannot be empty" -ForegroundColor Red
        continue
    }
    
    if ($PASSWORD_TEXT.Length -lt 8) {
        Write-Host "Error: Password must be at least 8 characters" -ForegroundColor Red
        continue
    }
    
    $PASSWORD_CONFIRM = Read-Host -Prompt "Confirm new password" -AsSecureString
    $BSTR_CONFIRM = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($PASSWORD_CONFIRM)
    $PASSWORD_CONFIRM_TEXT = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR_CONFIRM)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR_CONFIRM)
    
    if ($PASSWORD_TEXT -ne $PASSWORD_CONFIRM_TEXT) {
        Write-Host "Error: Passwords do not match" -ForegroundColor Red
        continue
    }
    
    $valid = $true
} while (-not $valid)

# Hash the password using bcrypt
try {
    Set-Location $apiPath
    $HASHED_PASSWORD = & node -e "
        const bcrypt = require('bcrypt');
        (async () => {
            try {
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash('$PASSWORD_TEXT', salt);
                console.log(hash);
            } catch (e) {
                console.error(e);
                process.exit(1);
            }
        })();
    "
    
    if ([string]::IsNullOrEmpty($HASHED_PASSWORD)) {
        Write-Host "Error: Failed to hash password" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error hashing password: $_" -ForegroundColor Red
    exit 1
}

# Update the password in the database
Write-Host "Updating admin password..." -ForegroundColor Cyan
try {
    Set-Location $apiPath
    & node -e "
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        (async () => {
            try {
                const updated = await prisma.user.updateMany({
                    where: {
                        email: '$ADMIN_EMAIL',
                        role: 'ADMIN'
                    },
                    data: {
                        password: '$HASHED_PASSWORD'
                    }
                });
                console.log(JSON.stringify(updated));
                await prisma.$disconnect();
            } catch (e) {
                console.error(e);
                process.exit(1);
            }
        })();
    "
    
    Write-Host "Success: Admin password has been reset" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now log in with the new password at http://localhost" -ForegroundColor Cyan
} catch {
    Write-Host "Error updating password: $_" -ForegroundColor Red
    exit 1
}

exit 0 