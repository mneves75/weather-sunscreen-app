#!/bin/bash

# ============================================
# Hostinger VPS Deployment Script
# Deploy Cigar Info Landing Page
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Cigar Info Landing Page - Hostinger Deploy${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""

# ============================================
# Configuration
# ============================================

echo -e "${YELLOW}Enter your Hostinger VPS details:${NC}"
echo ""

read -p "VPS IP Address: " VPS_IP
read -p "SSH Username (e.g., root): " VPS_USER
read -p "Web Root Path (default: /home/$VPS_USER/public_html): " WEB_ROOT
WEB_ROOT=${WEB_ROOT:-"/home/$VPS_USER/public_html"}

SUBDIRECTORY="cigarinfoai"
LOCAL_DIR="$(pwd)"

echo ""
echo -e "${GREEN}Configuration:${NC}"
echo "  VPS IP: $VPS_IP"
echo "  Username: $VPS_USER"
echo "  Web Root: $WEB_ROOT"
echo "  Subdirectory: $SUBDIRECTORY"
echo "  Local Path: $LOCAL_DIR"
echo ""

read -p "Is this correct? (y/n): " confirm
if [[ $confirm != "y" ]]; then
    echo -e "${RED}Deployment cancelled.${NC}"
    exit 1
fi

# ============================================
# Step 1: Create Temporary Archive
# ============================================

echo ""
echo -e "${YELLOW}[1/6] Creating deployment archive...${NC}"

ARCHIVE_NAME="cigarinfoai-deploy-$(date +%Y%m%d_%H%M%S).tar.gz"

tar -czf "/tmp/$ARCHIVE_NAME" \
    --exclude="*.md" \
    --exclude="*.sh" \
    --exclude=".git" \
    --exclude="deploy-*.tar.gz" \
    -C "$LOCAL_DIR" \
    index.html \
    privacy.html \
    terms.html \
    lgpd.html \
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

    # Extract archive
    tar -xzf "/tmp/$ARCHIVE_NAME" -C "$WEB_ROOT/$SUBDIRECTORY/"

    # Remove archive
    rm "/tmp/$ARCHIVE_NAME"

    echo "✓ Files extracted to $WEB_ROOT/$SUBDIRECTORY"
EOF

echo -e "${GREEN}✓ Files extracted${NC}"

# ============================================
# Step 4: Set Permissions
# ============================================

echo ""
echo -e "${YELLOW}[4/6] Setting file permissions...${NC}"

ssh "$VPS_USER@$VPS_IP" bash <<'EOF'
    set -e

    cd "$(echo $WEB_ROOT)/$(echo $SUBDIRECTORY)"

    # Set file permissions
    find . -type f -exec chmod 644 {} \;
    find . -type d -exec chmod 755 {} \;

    # Specific permissions
    chmod 644 index.html
    chmod 644 .htaccess

    echo "✓ Permissions set"
EOF

echo -e "${GREEN}✓ Permissions configured${NC}"

# ============================================
# Step 5: Verify Apache Configuration
# ============================================

echo ""
echo -e "${YELLOW}[5/6] Verifying Apache configuration...${NC}"

ssh "$VPS_USER@$VPS_IP" bash <<'EOF'
    set -e

    # Check if mod_rewrite is enabled
    if apache2ctl -M 2>/dev/null | grep -q "rewrite_module"; then
        echo "✓ mod_rewrite is enabled"
    else
        echo "⚠ mod_rewrite not found (trying to enable...)"
        if command -v a2enmod &> /dev/null; then
            sudo a2enmod rewrite
            sudo systemctl restart apache2
            echo "✓ mod_rewrite enabled and Apache restarted"
        else
            echo "⚠ Could not enable mod_rewrite automatically"
            echo "  Please enable manually: sudo a2enmod rewrite"
        fi
    fi

    # Check if .htaccess is allowed
    if grep -q "AllowOverride All" /etc/apache2/sites-enabled/*.conf 2>/dev/null; then
        echo "✓ AllowOverride is enabled"
    else
        echo "⚠ AllowOverride might not be enabled"
        echo "  Check Apache config: /etc/apache2/sites-enabled/"
    fi
EOF

echo -e "${GREEN}✓ Configuration verified${NC}"

# ============================================
# Step 6: Test Deployment
# ============================================

echo ""
echo -e "${YELLOW}[6/6] Testing deployment...${NC}"

DEPLOY_URL="https://conhecendotudo.online/$SUBDIRECTORY/"

echo "Testing URL: $DEPLOY_URL"

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL" || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Site is live and responding!${NC}"
elif [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
    echo -e "${GREEN}✓ Site is live (redirecting)${NC}"
else
    echo -e "${YELLOW}⚠ Received HTTP $HTTP_STATUS${NC}"
    echo -e "${YELLOW}  This might be normal if SSL is not yet configured${NC}"
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
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${GREEN}Your landing page is now live at:${NC}"
echo -e "${GREEN}→ $DEPLOY_URL${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Visit $DEPLOY_URL in your browser"
echo "  2. Test all links and images"
echo "  3. Update App Store URL in index.html (line 675)"
echo "  4. Run Lighthouse audit for performance"
echo "  5. Set up Google Analytics (optional)"
echo ""
echo -e "${YELLOW}Troubleshooting:${NC}"
echo "  - If images don't load: Check file permissions"
echo "  - If .htaccess not working: Enable mod_rewrite"
echo "  - View logs: ssh $VPS_USER@$VPS_IP 'tail -f /var/log/apache2/error.log'"
echo ""
echo -e "${GREEN}Need to update?${NC}"
echo "  Run this script again or use Git deployment (see HOSTINGER_DEPLOY.md)"
echo ""
echo -e "${GREEN}Enjoy your new landing page! 🚀${NC}"
