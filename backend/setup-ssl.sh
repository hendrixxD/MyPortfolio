#!/bin/bash

# SSL Setup Script with Let's Encrypt
set -e

echo "🔐 SSL Certificate Setup with Let's Encrypt"
echo "==========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  This script must be run as root (use sudo)"
    exit 1
fi

# Get domain information
read -p "Enter your domain name (e.g., yourdomain.com): " DOMAIN
read -p "Enter your email for Let's Encrypt notifications: " EMAIL

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "❌ Domain and email are required"
    exit 1
fi

echo ""
echo "📋 Configuration:"
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo ""
read -p "Continue? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "❌ Cancelled"
    exit 1
fi

# Install certbot
echo ""
echo "📦 Installing certbot..."
apt-get update
apt-get install -y certbot python3-certbot-nginx

# Stop nginx temporarily
echo ""
echo "🛑 Stopping nginx..."
docker compose stop nginx

# Obtain certificate
echo ""
echo "🔐 Obtaining SSL certificate..."
certbot certonly --standalone \
    -d $DOMAIN \
    -d www.$DOMAIN \
    --non-interactive \
    --agree-tos \
    --email $EMAIL \
    --preferred-challenges http

if [ $? -ne 0 ]; then
    echo "❌ Failed to obtain certificate"
    docker compose start nginx
    exit 1
fi

# Update nginx configuration
echo ""
echo "📝 Updating nginx configuration..."

# Create SSL config
cat > nginx/conf.d/ssl.conf << SSLCONF
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # ACME challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/$DOMAIN/chain.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Include location blocks
    include /etc/nginx/snippets/locations.conf;
}
SSLCONF

# Update docker-compose to mount certificates
echo ""
echo "📝 Updating docker-compose.yml..."

# Backup original
cp docker-compose.yml docker-compose.yml.backup

# Add certificate volumes to nginx service
cat > docker-compose.yml.tmp << COMPOSE
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: portfolio_db
    restart: unless-stopped
    environment:
      POSTGRES_DB: \${POSTGRES_DB:-portfolio}
      POSTGRES_USER: \${POSTGRES_USER:-portfolio_user}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-changeme}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER:-portfolio_user}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: portfolio_backend
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://\${POSTGRES_USER:-portfolio_user}:\${POSTGRES_PASSWORD:-changeme}@postgres:5432/\${POSTGRES_DB:-portfolio}
      SECRET_KEY: \${SECRET_KEY:-your-secret-key-change-in-production}
      ALGORITHM: \${ALGORITHM:-HS256}
      ACCESS_TOKEN_EXPIRE_MINUTES: \${ACCESS_TOKEN_EXPIRE_MINUTES:-30}
      CORS_ORIGINS: \${CORS_ORIGINS:-http://localhost:3000,http://localhost}
    volumes:
      - ./backend/uploads:/app/uploads
    ports:
      - "8000:8000"
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8000/api/v1/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: \${NEXT_PUBLIC_API_URL:-http://localhost:8000}
    container_name: portfolio_frontend
    restart: unless-stopped
    depends_on:
      - backend
    environment:
      NEXT_PUBLIC_API_URL: \${NEXT_PUBLIC_API_URL:-http://localhost:8000}
    ports:
      - "3000:3000"
    healthcheck:
      test: ["CMD-SHELL", "wget -q --spider http://localhost:3000 || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    container_name: portfolio_nginx
    restart: unless-stopped
    depends_on:
      - frontend
      - backend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./nginx/snippets:/etc/nginx/snippets:ro
      - ./backend/uploads:/var/www/uploads:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - /var/www/certbot:/var/www/certbot:ro
      - nginx_cache:/var/cache/nginx
    healthcheck:
      test: ["CMD-SHELL", "wget -q --spider http://localhost || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
  nginx_cache:

networks:
  default:
    name: portfolio_network
COMPOSE

mv docker-compose.yml.tmp docker-compose.yml

# Restart services
echo ""
echo "🚀 Starting services with SSL..."
docker compose up -d

# Setup auto-renewal
echo ""
echo "⏰ Setting up certificate auto-renewal..."
(crontab -l 2>/dev/null; echo "0 0 * * * certbot renew --quiet && docker compose restart nginx") | crontab -

echo ""
echo "✅ SSL Setup Complete!"
echo ""
echo "📋 Summary:"
echo "  • SSL certificates installed for $DOMAIN"
echo "  • Auto-renewal configured (daily check)"
echo "  • Services restarted with HTTPS"
echo ""
echo "🌐 Access your site:"
echo "  • https://$DOMAIN"
echo "  • https://www.$DOMAIN"
echo ""
echo "📝 Next steps:"
echo "  1. Update your .env with HTTPS URLs"
echo "  2. Test your site"
echo "  3. Verify SSL: https://www.ssllabs.com/ssltest/"
