#!/bin/bash

# ============================================
# Hostinger VPS Deployment Script (Auto)
# Deploy Weather Sunscreen Landing Page
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Weather Sunscreen Landing Page - Auto Deploy${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""

# ============================================
# Configuration (pre-filled)
# ============================================

VPS_IP="212.85.2.24"
VPS_USER="claude"
WEB_ROOT="/home/claude/public_html"
SUBDIRECTORY="weathersunscreen"
ALIAS_SUBDIRECTORY="weathersuncreen"  # common typo redirect
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCAL_DIR="$SCRIPT_DIR"

echo -e "${GREEN}Configuration:${NC}"
echo "  VPS IP: $VPS_IP"
echo "  Username: $VPS_USER"
echo "  Web Root: $WEB_ROOT"
echo "  Subdirectory: $SUBDIRECTORY"
echo "  Local Path: $LOCAL_DIR"
echo "  Target URL: http://conhecendotudo.online/$SUBDIRECTORY"
echo ""

# ============================================
# Step 1: Create Temporary Archive
# ============================================

echo ""
echo -e "${YELLOW}[1/6] Creating deployment archive...${NC}"

ARCHIVE_NAME="weathersunscreen-deploy-$(date +%Y%m%d_%H%M%S).tar.gz"

tar -czf "/tmp/$ARCHIVE_NAME" \
    --exclude="*.md" \
    --exclude="*.sh" \
    --exclude=".git" \
    --exclude="deploy-*.tar.gz" \
    --exclude="Caddyfile*" \
    --exclude="README*" \
    --exclude="DEPLOY*" \
    -C "$LOCAL_DIR" \
    index.html \
    .htaccess \
    assets/

echo -e "${GREEN}✓ Archive created: $ARCHIVE_NAME${NC}"

# ============================================
# Step 2: Upload Archive to VPS
# ============================================

echo ""
echo -e "${YELLOW}[2/6] Uploading to VPS...${NC}"

scp "/tmp/$ARCHIVE_NAME" "$VPS_USER@$VPS_IP:/tmp/"

echo -e "${GREEN}✓ Files uploaded${NC}"

# ============================================
# Step 3: Extract on VPS
# ============================================

echo ""
echo -e "${YELLOW}[3/6] Extracting files on VPS...${NC}"

ssh "$VPS_USER@$VPS_IP" bash <<EOF
    set -e

    # Create subdirectory if not exists
    mkdir -p "$WEB_ROOT/$SUBDIRECTORY"

    # Remove old files if they exist
    rm -rf "$WEB_ROOT/$SUBDIRECTORY"/*

    # Extract archive
    tar -xzf "/tmp/$ARCHIVE_NAME" -C "$WEB_ROOT/$SUBDIRECTORY/"

    # Remove archive
    rm "/tmp/$ARCHIVE_NAME"

    # Refresh alias directory copy for common typo URL
    rm -rf "$WEB_ROOT/$ALIAS_SUBDIRECTORY"
    mkdir -p "$WEB_ROOT/$ALIAS_SUBDIRECTORY"
    cp -a "$WEB_ROOT/$SUBDIRECTORY"/. "$WEB_ROOT/$ALIAS_SUBDIRECTORY/"

    echo "✓ Files extracted to $WEB_ROOT/$SUBDIRECTORY"
    echo "✓ Alias directory refreshed at $WEB_ROOT/$ALIAS_SUBDIRECTORY"
EOF

echo -e "${GREEN}✓ Files extracted${NC}"

# ============================================
# Step 4: Set Permissions
# ============================================

echo ""
echo -e "${YELLOW}[4/6] Setting file permissions...${NC}"

ssh "$VPS_USER@$VPS_IP" bash <<EOF
    set -e

    cd "$WEB_ROOT/$SUBDIRECTORY"

    # Set file permissions
    find . -type f -exec chmod 644 {} \;
    find . -type d -exec chmod 755 {} \;

    # Specific permissions
    chmod 644 index.html
    chmod 644 .htaccess

    echo "✓ Permissions set"
EOF

echo -e "${GREEN}✓ Permissions configured${NC}"

# Ensure alias directory exists and inherits permissions
ssh "$VPS_USER@$VPS_IP" bash <<EOF
    set -e

    if [ -d "$WEB_ROOT/$ALIAS_SUBDIRECTORY" ]; then
        find "$WEB_ROOT/$ALIAS_SUBDIRECTORY" -type f -exec chmod 644 {} \;
        find "$WEB_ROOT/$ALIAS_SUBDIRECTORY" -type d -exec chmod 755 {} \;
        echo "✓ Alias directory permissions aligned"
    else
        echo "⚠ Alias directory missing"
    fi
EOF

echo -e "${GREEN}✓ Alias directory verified${NC}"

# ============================================
# Step 5: Verify Caddy Configuration
# ============================================

echo ""
echo -e "${YELLOW}[5/6] Verifying Caddy configuration...${NC}"

ssh "$VPS_USER@$VPS_IP" bash <<EOF
    set -e

    SITE_ROOT="$WEB_ROOT/$SUBDIRECTORY"
    ALIAS_ROOT="$WEB_ROOT/$ALIAS_SUBDIRECTORY"

    if [ -d "$SITE_ROOT" ]; then
        echo "✓ Directory exists: $SITE_ROOT"
        if [ -f "$SITE_ROOT/index.html" ]; then
            echo "✓ index.html present"
        else
            echo "⚠ index.html missing"
        fi
    else
        echo "⚠ Directory missing: $SITE_ROOT"
    fi

    if [ -d "$ALIAS_ROOT" ]; then
        echo "✓ Alias directory exists: $ALIAS_ROOT"
    else
        echo "⚠ Alias symlink missing: $ALIAS_ROOT"
    fi

    if command -v caddy >/dev/null 2>&1; then
        CADDY_VERSION=$(caddy version 2>/dev/null || true)
        if [ -z "$CADDY_VERSION" ]; then
            CADDY_VERSION="version unavailable"
        fi
        echo "✓ Caddy detected ($CADDY_VERSION)"
    else
        echo "⚠ caddy binary not found in PATH"
    fi

    if command -v systemctl >/dev/null 2>&1; then
        if systemctl is-active --quiet caddy 2>/dev/null; then
            echo "✓ caddy.service is active"
        else
            STATUS=$(systemctl is-active caddy 2>/dev/null || true)
            if [ -z "$STATUS" ]; then
                STATUS="unknown"
            fi
            echo "⚠ caddy.service status: $STATUS"
        fi
    else
        echo "⚠ systemctl unavailable; unable to verify caddy.service"
    fi
EOF

echo -e "${GREEN}✓ Configuration verified${NC}"

# ============================================
# Step 6: Test Deployment
# ============================================

echo ""
echo -e "${YELLOW}[6/6] Testing deployment...${NC}"

DEPLOY_URL="https://conhecendotudo.online/$SUBDIRECTORY/"
ALIAS_URL="https://conhecendotudo.online/$ALIAS_SUBDIRECTORY/"

echo "Testing URL: $DEPLOY_URL"

sleep 2  # Allow Caddy to serve new files

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL" || echo "000")
ALIAS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$ALIAS_URL" || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Site is live and responding!${NC}"
elif [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
    echo -e "${GREEN}✓ Site is live (redirecting)${NC}"
else
    echo -e "${YELLOW}⚠ Received HTTP $HTTP_STATUS${NC}"
    echo -e "${YELLOW}  Manual verification recommended${NC}"
fi

if [ "$ALIAS_STATUS" = "200" ] || [ "$ALIAS_STATUS" = "301" ] || [ "$ALIAS_STATUS" = "302" ]; then
    echo -e "${GREEN}✓ Alias URL responding (${ALIAS_STATUS})${NC}"
else
    echo -e "${YELLOW}⚠ Alias URL returned HTTP $ALIAS_STATUS${NC}"
fi

# ============================================
# Cleanup
# ============================================

echo ""
echo -e "${YELLOW}Cleaning up...${NC}"
rm "/tmp/$ARCHIVE_NAME"
echo -e "${GREEN}✓ Temporary files removed${NC}"

# ============================================
# Success Summary
# ============================================

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✓ Weather Sunscreen Deployment Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${GREEN}Your landing page is now live at:${NC}"
echo -e "${GREEN}→ $DEPLOY_URL${NC}"
echo -e "${GREEN}→ $ALIAS_URL (alias)${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Visit $DEPLOY_URL in your browser"
echo "  2. Test all links and images"
echo "  3. Update App Store URLs if needed"
echo "  4. Run Lighthouse audit for performance"
echo ""
echo -e "${GREEN}Weather Sunscreen landing page is live! 🌤️☀️${NC}"
