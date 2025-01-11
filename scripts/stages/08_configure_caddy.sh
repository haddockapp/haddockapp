section_progress "Configuring Caddy"

output "\n${BLUE}▶ Configuring Caddy server...${NC}"

# Stop Caddy service
output "Stopping Caddy service... "
if sudo systemctl stop caddy >/dev/null 2>&1; then
    output "${GREEN}✓${NC}"
else
    output "${RED}failed${NC}"
    failed_installations+=("caddy-service")
fi

# Configure Caddy capabilities
output "Setting up Caddy permissions... "
if sudo setcap cap_net_bind_service=+ep $(which caddy) >/dev/null 2>&1; then
    output "${GREEN}✓${NC}"
else
    output "${RED}failed${NC}"
    failed_installations+=("caddy-permissions")
fi

# Create new Caddyfile
output "Creating Caddy configuration... "
{
    # Backup existing config if it exists
    [ -f /etc/caddy/Caddyfile ] && sudo mv /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak
    
    # Create new Caddyfile
    sudo tee /etc/caddy/Caddyfile >/dev/null << EOF
:80 {
    root * /opt/haddock/frontend/dist
    try_files {path} /index.html
    file_server
}

import /opt/haddock/api/services.caddy
import /opt/haddock/api/app.caddy
EOF

    # Set proper permissions
    sudo chown root:root /etc/caddy/Caddyfile
    sudo chmod 644 /etc/caddy/Caddyfile
} >/dev/null 2>&1

if [ $? -eq 0 ]; then
    output "${GREEN}✓${NC}"
else
    output "${RED}failed${NC}"
    failed_installations+=("caddy-config")
fi

# Validate configuration
output "Validating Caddy configuration... "
if sudo caddy validate --config /etc/caddy/Caddyfile >/dev/null 2>&1; then
    output "${GREEN}✓${NC}"
else
    output "${RED}failed${NC}"
    failed_installations+=("caddy-validation")
fi

update_progress 5