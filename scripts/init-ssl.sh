#!/bin/bash
# =============================================================
# Initial SSL Certificate Setup with Let's Encrypt
# Run this ONCE before first production deployment
# =============================================================

set -e

# Change to project root (parent of scripts directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "Working directory: $PROJECT_ROOT"

DOMAIN="$1"
EMAIL="$2"

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "Usage: ./init-ssl.sh yourdomain.com your@email.com"
    exit 1
fi

echo "================================================"
echo "Initializing SSL for $DOMAIN"
echo "================================================"

# Create directories if they don't exist
mkdir -p certbot/conf certbot/www

# Create temporary nginx config without SSL
cat > nginx/conf.d/default.conf.temp << 'EOF'
upstream frontend {
    server frontend:3000;
}

upstream backend {
    server backend:8000;
}

server {
    listen 80;
    server_name _;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Backup original config
if [ -f nginx/conf.d/default.conf ]; then
    cp nginx/conf.d/default.conf nginx/conf.d/default.conf.backup
fi

# Use temporary config
mv nginx/conf.d/default.conf.temp nginx/conf.d/default.conf

echo "Starting services with HTTP-only config..."
docker-compose -f docker-compose.prod.yml up -d nginx frontend backend

echo "Waiting for nginx to be ready..."
sleep 5

echo "Requesting SSL certificate from Let's Encrypt..."
docker-compose -f docker-compose.prod.yml run --rm certbot \
    certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" \
    -d "www.$DOMAIN"

# Restore original SSL-enabled config
if [ -f nginx/conf.d/default.conf.backup ]; then
    mv nginx/conf.d/default.conf.backup nginx/conf.d/default.conf
else
    echo "ERROR: Original nginx config not found!"
    exit 1
fi

# Update domain in nginx config
sed -i "s/yourdomain.com/$DOMAIN/g" nginx/conf.d/default.conf

echo "Restarting nginx with SSL enabled..."
docker-compose -f docker-compose.prod.yml restart nginx

echo "================================================"
echo "SSL certificate successfully obtained!"
echo "Your site is now available at:"
echo "  https://$DOMAIN"
echo "  https://www.$DOMAIN"
echo "================================================"
