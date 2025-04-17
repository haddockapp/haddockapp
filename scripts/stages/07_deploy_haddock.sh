section_progress "Deploying Haddock"
##############################################
#                  Haddock                   #
##############################################

# Download Haddock
output "Downloading Haddock..."
curl -L --silent --show-error "https://releases.haddock.ovh/main/release.zip" -o /tmp/haddock.zip &
spinner $! "Downloading Haddock..."

# Create directory with proper permissions
sudo mkdir -p /opt/haddock
sudo chown $USER:$USER /opt/haddock

# Extract files
output "Extracting files..."
sudo unzip -q /tmp/haddock.zip -d /opt/haddock &
spinner $! "Extracting files..."

# Remove the zip file
sudo rm -f /tmp/haddock.zip

# Set proper permissions
sudo chown -R $USER:$USER /opt/haddock

section_progress "Configuring backend"
##############################################
#                  Backend                   #
##############################################

# Setup backend files
run_command "Setting up backend configuration..." bash -c '
    sudo touch /etc/caddy/services.caddy
    sudo touch /etc/caddy/app.caddy
'

# Generate .env file if needed
if [ ! -f /opt/haddock/api/.env ]; then
    output "Generating API configuration..."
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(256).toString('base64'));" 2>/dev/null)

    # Create .env file without showing output
    sudo tee /opt/haddock/api/.env >/dev/null << EOF
DATABASE_URL=postgresql://haddock:haddock@localhost:5432/haddock
REDIS_URL=redis://localhost:6379
CADDY_ROOT_DIR=/etc/caddy/
CADDY_SERVICES_FILE=services.caddy
CADDY_APP_FILE=app.caddy
JWT_SECRET=$JWT_SECRET
SERVER_IP=$IP
GITHUB_CLIENT_ID=***REMOVED***
GITHUB_CLIENT_SECRET=***REMOVED***
FRONTEND_CONFIG=/opt/haddock/frontend/public/config.json
FRONTEND_PORT=80
PORT=3000
EOF
fi

# Install API dependencies
cd /opt/haddock/api
run_command "Installing API dependencies..." "cd /opt/haddock/api && yarn install --silent"
update_progress 5

# Run migrations
run_command "Running database migrations..." "cd /opt/haddock/api && yarn migrate"
update_progress 5

# Build API
run_command "Building API application..." "cd /opt/haddock/api && yarn run build"
update_progress 5

section_progress "Configuring frontend"
##############################################
#                 Frontend                   #
##############################################

# Setup frontend configuration
if [ -f /opt/haddock/frontend/public/config.json ]; then
    output "Overwriting frontend configuration..."
    sudo rm -f /opt/haddock/frontend/public/config.json
fi

output "Generating frontend configuration..."
sudo tee /opt/haddock/frontend/public/config.json << EOF
{
  "backendUrl": "http://$IP:3000",
  "socketUrl": "http://$IP:3001"
}
EOF

# Build frontend
cd /opt/haddock/frontend
run_command "Installing frontend dependencies..." "cd /opt/haddock/frontend && yarn install --silent"
update_progress 5

run_command "Building frontend application..." "cd /opt/haddock/frontend && yarn run build"
update_progress 5