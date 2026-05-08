#!/bin/bash

# Production Setup Helper Script
# This script helps configure production environment variables

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Portfolio Production Setup ===${NC}\n"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}Error: .env.production file not found${NC}"
    exit 1
fi

# Function to check for placeholder values
check_placeholders() {
    echo -e "${BLUE}Checking for placeholder values...${NC}"

    placeholders_found=0

    if grep -q "CHANGE_ME" .env.production; then
        echo -e "${RED}✗ Found CHANGE_ME placeholders in .env.production${NC}"
        grep "CHANGE_ME" .env.production
        placeholders_found=1
    else
        echo -e "${GREEN}✓ No CHANGE_ME placeholders found${NC}"
    fi

    if grep -q "yourdomain.com" .env.production; then
        echo -e "${RED}✗ Found yourdomain.com placeholder in .env.production${NC}"
        grep "yourdomain.com" .env.production
        placeholders_found=1
    else
        echo -e "${GREEN}✓ No yourdomain.com placeholders found${NC}"
    fi

    return $placeholders_found
}

# Function to generate secure password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Function to update .env.production
setup_env() {
    echo -e "\n${YELLOW}=== Environment Configuration ===${NC}"

    read -p "Enter your domain (e.g., example.com): " domain

    if [ -z "$domain" ]; then
        echo -e "${RED}Domain cannot be empty${NC}"
        exit 1
    fi

    echo -e "\n${BLUE}Generating secure passwords...${NC}"

    DB_PASSWORD=$(generate_password)
    REDIS_PASSWORD=$(generate_password)
    SECRET_KEY=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-48)

    echo -e "${GREEN}✓ Generated DB_PASSWORD${NC}"
    echo -e "${GREEN}✓ Generated REDIS_PASSWORD${NC}"
    echo -e "${GREEN}✓ Generated SECRET_KEY${NC}"

    # Create backup
    cp .env.production .env.production.backup
    echo -e "\n${GREEN}✓ Created backup: .env.production.backup${NC}"

    # Update .env.production
    sed -i "s|DB_PASSWORD=CHANGE_ME_STRONG_PASSWORD|DB_PASSWORD=$DB_PASSWORD|g" .env.production
    sed -i "s|REDIS_PASSWORD=CHANGE_ME_REDIS_PASSWORD|REDIS_PASSWORD=$REDIS_PASSWORD|g" .env.production
    sed -i "s|SECRET_KEY=CHANGE_ME_SUPER_SECRET_KEY_MIN_32_CHARS|SECRET_KEY=$SECRET_KEY|g" .env.production
    sed -i "s|yourdomain.com|$domain|g" .env.production

    echo -e "${GREEN}✓ Updated .env.production with secure values${NC}"

    # Update nginx config
    if [ -f "nginx/conf.d/default.conf" ]; then
        sed -i "s|yourdomain.com|$domain|g" nginx/conf.d/default.conf
        echo -e "${GREEN}✓ Updated nginx configuration with domain${NC}"
    fi

    echo -e "\n${GREEN}=== Setup Complete ===${NC}"
    echo -e "Your production environment is configured for: ${BLUE}$domain${NC}"
    echo -e "\n${YELLOW}Next steps:${NC}"
    echo -e "1. Review .env.production to ensure all values are correct"
    echo -e "2. Run SSL initialization: ./scripts/init-ssl.sh $domain your@email.com"
    echo -e "3. Deploy: docker-compose -f docker-compose.prod.yml up -d"
}

# Main menu
echo "What would you like to do?"
echo "1. Check for placeholders"
echo "2. Setup production configuration"
echo "3. Generate password only"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        check_placeholders
        if [ $? -eq 0 ]; then
            echo -e "\n${GREEN}Configuration looks good!${NC}"
        else
            echo -e "\n${YELLOW}Please update placeholder values before deploying${NC}"
        fi
        ;;
    2)
        setup_env
        ;;
    3)
        echo -e "\n${BLUE}Generated password:${NC}"
        generate_password
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac
