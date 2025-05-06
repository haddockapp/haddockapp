#!/bin/bash

# Set script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source configuration and libraries
source "$SCRIPT_DIR/config/settings.sh"
for lib in "$SCRIPT_DIR"/lib/*.sh; do
    source "$lib"
done

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root or with sudo"
    exit 1
fi

# Print banner
echo "===================================="
echo "  Haddock Admin Password Reset Tool"
echo "===================================="
echo ""

# Get admin email
read -p "Enter admin email: " ADMIN_EMAIL

if [ -z "$ADMIN_EMAIL" ]; then
    echo "Error: Admin email is required"
    exit 1
fi

# Check if user exists and is admin
USER_CHECK=$(cd /usr/local/haddock/api && NODE_ENV=production npx prisma query "SELECT email, role FROM \"User\" WHERE email = '$ADMIN_EMAIL' AND role = 'ADMIN'" --json)

if [ -z "$USER_CHECK" ] || [[ "$USER_CHECK" == "[]" ]]; then
    echo "Error: No admin user found with email: $ADMIN_EMAIL"
    exit 1
fi

# Get new password
while true; do
    read -s -p "Enter new password: " PASSWORD
    echo ""
    if [ -z "$PASSWORD" ]; then
        echo "Error: Password cannot be empty"
        continue
    fi
    
    if [ ${#PASSWORD} -lt 8 ]; then
        echo "Error: Password must be at least 8 characters"
        continue
    fi
    
    read -s -p "Confirm new password: " PASSWORD_CONFIRM
    echo ""
    
    if [ "$PASSWORD" != "$PASSWORD_CONFIRM" ]; then
        echo "Error: Passwords do not match"
        continue
    fi
    
    break
done

# Hash the password using bcrypt (using Node.js)
HASHED_PASSWORD=$(cd /usr/local/haddock/api && NODE_ENV=production node -e "
const bcrypt = require('bcrypt');
bcrypt.genSalt(10).then(salt => {
    return bcrypt.hash('$PASSWORD', salt);
}).then(hash => {
    console.log(hash);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
")

if [ -z "$HASHED_PASSWORD" ]; then
    echo "Error: Failed to hash password"
    exit 1
fi

# Update the password in the database
echo "Updating admin password..."
cd /usr/local/haddock/api && NODE_ENV=production npx prisma query "UPDATE \"User\" SET password = '$HASHED_PASSWORD' WHERE email = '$ADMIN_EMAIL' AND role = 'ADMIN'"

# Check if update was successful
if [ $? -eq 0 ]; then
    echo "Success: Admin password has been reset"
    echo ""
    echo "You can now log in with the new password at http://localhost"
else
    echo "Error: Failed to update admin password"
    exit 1
fi

exit 0 