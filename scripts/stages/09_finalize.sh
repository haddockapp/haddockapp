section_progress "Starting services"
##############################################
#                 Starting                   #
##############################################

output "\n${BLUE}▶ Finalizing installation...${NC}"
output "Starting all services..."

# Start services with proper commands
run_command "Enabling Redis..." "sudo systemctl enable --now redis-server"
run_command "Enabling libvirt..." "sudo systemctl enable --now libvirtd"
run_command "Enabling Caddy..." "sudo systemctl enable --now caddy"

# Setup PM2 for the API
cd /opt/haddock/api
run_command "Cleaning up PM2 processes..." "pm2 delete haddock-api 2>/dev/null || true"
run_command "Starting API with PM2..." "cd /opt/haddock/api && pm2 start yarn --name haddock-api -- start:prod"
run_command "Enabling PM2 startup..." "pm2 startup"
run_command "Saving PM2 configuration..." "pm2 save"
run_command "Enabling PM2 service..." "sudo systemctl enable pm2-$USER"

# Install haddockctl to system PATH
output "Installing haddockctl management CLI..."
run_command "Making haddockctl executable..." "chmod +x /opt/haddock/haddockctl"
run_command "Installing haddockctl to PATH..." "sudo ln -sf /opt/haddock/haddockctl /usr/local/bin/haddockctl"

validate_installation() {
    local component=$1
    log_info "Validating component: $component"

    case $component in
        "database")
            if sudo -u postgres psql -c '\l' | grep -q haddock; then
                log_info "Database validation successful"
                return 0
            else
                log_error "Database validation failed" "Database 'haddock' not found"
                return 1
            fi
            ;;
        "redis")
            if redis-cli ping >/dev/null 2>&1; then
                log_info "Redis validation successful"
                return 0
            else
                log_error "Redis validation failed" "Redis not responding"
                return 1
            fi
            ;;
        "api")
            if curl -s http://localhost:3000/health | grep -q "ok"; then
                log_info "API validation successful"
                return 0
            else
                log_error "API validation failed" "Health check failed"
                return 1
            fi
            ;;
        "frontend")
            if [ -f "/opt/haddock/frontend/dist/index.html" ]; then
                log_info "Frontend validation successful"
                return 0
            else
                log_error "Frontend validation failed" "Frontend not built properly"
                return 1
            fi
            ;;
        "caddy")
            if systemctl is-active --quiet caddy; then
                log_info "Caddy validation successful"
                return 0
            else
                log_error "Caddy validation failed" "Service not running"
                return 1
            fi
            ;;
    esac
}

# Validate critical components
section_progress "Validating installation"
VALIDATION_FAILED=false
failed_installations=()

# List of components to validate
COMPONENTS=("database" "redis" "api" "frontend" "caddy")

for component in "${COMPONENTS[@]}"; do
    output "Validating $component... "
    if validate_installation "$component"; then
        output "${GREEN}✓${NC} $component"
    else
        output "${RED}✗${NC} $component"
        VALIDATION_FAILED=true
        failed_installations+=("$component")
    fi
done

# Final progress update and terminal restoration
update_progress $((TOTAL_STEPS - current_progress))
restore_terminal

# Print summary
printf "\n${BLUE}Installation Summary${NC}\n"
printf "══════════════════════\n"
printf "Duration: %d minutes and %d seconds\n" "$MINUTES" "$SECONDS"
printf "Log file: %s\n\n" "$INSTALL_LOG"

if [ ${#failed_installations[@]} -eq 0 ] && [ "$VALIDATION_FAILED" = false ]; then
    printf "${GREEN}✓ Installation completed successfully${NC}\n\n"
    printf "${BOLD}Next steps:${NC}\n"
    printf "1. Access Haddock at ${BLUE}http://%s${NC}\n" "$IP"
    printf "2. Configure your first project\n"
    printf "3. Manage your installation with ${BLUE}sudo haddockctl${NC}\n"
    printf "4. Read the docs at ${BLUE}https://docs.haddock.ovh${NC}\n"

    # Create backup quietly
    mkdir -p "$BACKUP_DIR" 2>/dev/null
    if [ -d "/opt/haddock" ]; then
        tar czf "$BACKUP_DIR/haddock_$(date +%Y%m%d_%H%M%S).tar.gz" /opt/haddock 2>/dev/null
        printf "\n${GREEN}✓${NC} Backup created in %s\n" "$BACKUP_DIR"
    fi
else
    printf "${RED}! Installation completed with warnings${NC}\n\n"
    if [ ${#failed_installations[@]} -gt 0 ]; then
        printf "${BOLD}Failed components:${NC}\n"
        for failed in "${failed_installations[@]}"; do
            printf "${RED}  ✗ %s${NC}\n" "$failed"
        done
    fi
    printf "\n${BOLD}Troubleshooting:${NC}\n"
    printf "1. Check the installation log: %s\n" "$INSTALL_LOG"
    printf "2. Visit ${BLUE}https://docs.haddock.ovh/troubleshooting${NC}\n"
fi

# Update final summary logging
log_info "Installation completed in $MINUTES minutes and $SECONDS seconds"
if [ ${#failed_installations[@]} -eq 0 ] && [ "$VALIDATION_FAILED" = false ]; then
    log_info "Installation successful"
    log_info "Backup created at: $BACKUP_DIR/haddock_$(date +%Y%m%d_%H%M%S).tar.gz"
else
    log_warn "Installation completed with warnings"
    for failed in "${failed_installations[@]}"; do
        log_error "Component failed: $failed" "Check component-specific logs above"
    done
fi

log_info "Installation completed with status: ${#failed_installations[@]} failures"
exit 0