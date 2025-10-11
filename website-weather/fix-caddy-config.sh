#!/bin/bash

# ============================================
# Fix Caddy Configuration for Weather Sunscreen
# Uploads updated Caddyfile and reloads Caddy
# ============================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Weather Sunscreen - Caddy Fix${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""

SSH_HOST="megasena-vps"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CADDYFILE_LOCAL="$SCRIPT_DIR/Caddyfile.new"
CADDYFILE_REMOTE="/etc/caddy/Caddyfile"

# Verify local Caddyfile exists
if [ ! -f "$CADDYFILE_LOCAL" ]; then
    echo -e "${RED}Error: Caddyfile.new not found at $CADDYFILE_LOCAL${NC}"
    exit 1
fi

echo -e "${YELLOW}[1/4] Backing up current Caddyfile on VPS...${NC}"
ssh "$SSH_HOST" "sudo cp $CADDYFILE_REMOTE ${CADDYFILE_REMOTE}.backup-$(date +%Y%m%d_%H%M%S)" || {
    echo -e "${YELLOW}Warning: Could not create backup (file may not exist yet)${NC}"
}

echo -e "${YELLOW}[2/4] Uploading updated Caddyfile...${NC}"
scp "$CADDYFILE_LOCAL" "$SSH_HOST:/tmp/Caddyfile.new"

echo -e "${YELLOW}[3/4] Installing Caddyfile...${NC}"
ssh "$SSH_HOST" "sudo mv /tmp/Caddyfile.new $CADDYFILE_REMOTE && sudo chown root:root $CADDYFILE_REMOTE && sudo chmod 644 $CADDYFILE_REMOTE"

echo -e "${YELLOW}[4/4] Validating and reloading Caddy...${NC}"

# Validate configuration
ssh "$SSH_HOST" "sudo caddy validate --config $CADDYFILE_REMOTE" && {
    echo -e "${GREEN}✓ Caddyfile syntax valid${NC}"
} || {
    echo -e "${RED}✗ Caddyfile validation failed!${NC}"
    echo -e "${YELLOW}Restoring backup...${NC}"
    ssh "$SSH_HOST" "sudo cp ${CADDYFILE_REMOTE}.backup-* $CADDYFILE_REMOTE 2>/dev/null || true"
    exit 1
}

# Reload Caddy
ssh "$SSH_HOST" "sudo caddy reload --config $CADDYFILE_REMOTE" && {
    echo -e "${GREEN}✓ Caddy reloaded successfully${NC}"
} || {
    echo -e "${YELLOW}Reload via caddy command failed, trying systemctl...${NC}"
    ssh "$SSH_HOST" "sudo systemctl reload caddy" && {
        echo -e "${GREEN}✓ Caddy reloaded via systemctl${NC}"
    } || {
        echo -e "${RED}✗ Failed to reload Caddy${NC}"
        exit 1
    }
}

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✓ Caddy Configuration Updated!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""

# Test deployment
echo -e "${YELLOW}Testing deployment...${NC}"
sleep 2

DEPLOY_URL="https://conhecendotudo.online/weathersunscreen/"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL" || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Site is live! $DEPLOY_URL${NC}"
elif [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
    echo -e "${GREEN}✓ Site is live (redirecting)${NC}"
else
    echo -e "${YELLOW}⚠ Received HTTP $HTTP_STATUS${NC}"
    echo -e "${YELLOW}  Check: $DEPLOY_URL${NC}"
fi

echo ""
echo -e "${GREEN}Weather Sunscreen Caddy configuration fixed!${NC}"
