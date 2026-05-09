# Production Deployment Guide

## Prerequisites

- Docker 20.10+ and Docker Compose 2.0+
- Domain name configured with DNS pointing to your server
- Ports 80 and 443 open on your firewall
- SSL certificates (Let's Encrypt via Certbot, handled automatically)

## Quick Start - Production Deployment

### Step 1: Clone and Configure

```bash
# Clone the repository
git clone https://github.com/yourusername/MyPortfolio.git
cd MyPortfolio

# Copy environment template
cp .env.production.example .env.production
```

### Step 2: Generate Secure Credentials

```bash
# Generate database password
echo "DB_PASSWORD=$(openssl rand -base64 32)"

# Generate Redis password  
echo "REDIS_PASSWORD=$(openssl rand -base64 32)"

# Generate SECRET_KEY
echo "SECRET_KEY=$(openssl rand -base64 48)"
```

### Step 3: Edit .env.production

Open `.env.production` and set:

```bash
# Database Configuration
DB_USER=portfolio_user
DB_PASSWORD=<paste-generated-password>
DB_NAME=portfolio_prod

# Redis Configuration
REDIS_PASSWORD=<paste-generated-password>

# Backend Security
SECRET_KEY=<paste-generated-key>
ACCESS_TOKEN_EXPIRE_MINUTES=30
RATE_LIMIT_PER_MINUTE=60

# CORS Configuration (replace with your domain)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Site Configuration
SITE_NAME=lengedandungjoshua
SITE_DESCRIPTION=Data Engineer & Chemical/Petroleum Technology Portfolio
SITE_URL=https://yourdomain.com

# API Configuration
NEXT_PUBLIC_API_URL=https://yourdomain.com

# Sentry (Optional - get DSN from sentry.io)
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ENVIRONMENT=production
```

### Step 4: Update nginx Configuration

Edit `nginx/conf.d/default.conf` and replace all instances of `yourdomain.com` with your actual domain:

```bash
sed -i 's/yourdomain.com/your-actual-domain.com/g' nginx/conf.d/default.conf
```

### Step 5: Deploy

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check service status
docker-compose -f docker-compose.prod.yml ps
```

### Step 6: Setup SSL Certificates (First Time Only)

```bash
# Request Let's Encrypt certificates
docker-compose -f docker-compose.prod.yml exec certbot certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d yourdomain.com \
  -d www.yourdomain.com

# Restart nginx to load certificates
docker-compose -f docker-compose.prod.yml restart nginx
```

### Step 7: Create Admin User

```bash
# Access backend container
docker-compose -f docker-compose.prod.yml exec backend bash

# Run seed script
python -m scripts.seed

# Exit container
exit
```

## Architecture

```
                 ┌─────────────┐
                 │   Certbot   │
                 │  (SSL Auto) │
                 └─────────────┘
                         ↓
                 ┌─────────────┐
    Internet →   │    Nginx    │   Port 80/443
                 │  (Reverse   │
                 │   Proxy)    │
                 └─────────────┘
                    ↓        ↓
         ┌──────────┘        └──────────┐
         ↓                                ↓
  ┌────────────┐                  ┌────────────┐
  │  Frontend  │                  │  Backend   │
  │ (Next.js)  │  Port 3000       │ (FastAPI)  │  Port 8000
  └────────────┘                  └────────────┘
                                         ↓
                                  ┌────────────┐
                                  │ PostgreSQL │  Port 5432
                                  └────────────┘
                                         ↓
                                  ┌────────────┐
                                  │   Redis    │  Port 6379
                                  └────────────┘
```

## Services

| Service | Container | Purpose | Port |
|---------|-----------|---------|------|
| **nginx** | portfolio_nginx | Reverse proxy, SSL termination, static files | 80, 443 |
| **frontend** | portfolio_frontend_prod | Next.js React application | 3000 (internal) |
| **backend** | portfolio_backend_prod | FastAPI Python backend | 8000 (internal) |
| **db** | portfolio_db_prod | PostgreSQL database | 5432 (internal) |
| **redis** | portfolio_redis_prod | Redis cache/session store | 6379 (internal) |
| **certbot** | portfolio_certbot | Auto-renew SSL certificates | N/A |

## Verification

### Check All Services Running

```bash
docker-compose -f docker-compose.prod.yml ps
```

Expected output:
```
NAME                         STATUS
portfolio_backend_prod       Up (healthy)
portfolio_certbot            Up
portfolio_db_prod            Up (healthy)
portfolio_frontend_prod      Up
portfolio_nginx              Up (healthy)
portfolio_redis_prod         Up (healthy)
```

### Test Endpoints

```bash
# Health check
curl https://yourdomain.com/api/v1/health

# Frontend
curl https://yourdomain.com

# API docs
curl https://yourdomain.com/docs
```

## Maintenance

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### Update Application

```bash
# Pull latest changes
git pull origin production

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Remove old images
docker image prune -f
```

### Backup Database

```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec db pg_dump -U portfolio_user portfolio_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker-compose -f docker-compose.prod.yml exec -T db psql -U portfolio_user -d portfolio_prod < backup.sql
```

### Restart Services

```bash
# Restart all
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend
docker-compose -f docker-compose.prod.yml restart frontend
```

### Stop Services

```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Stop and remove volumes (⚠️ deletes data!)
docker-compose -f docker-compose.prod.yml down -v
```

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Common issues:
# 1. Database not ready → Wait for db healthcheck
# 2. Missing SECRET_KEY → Check .env.production
# 3. Migration failed → Check alembic logs
```

### Frontend Build Fails

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs frontend

# Common issues:
# 1. Missing NEXT_PUBLIC_API_URL
# 2. Node memory issue → Add NODE_OPTIONS=--max-old-space-size=4096
```

### SSL Certificate Issues

```bash
# Check certbot logs
docker-compose -f docker-compose.prod.yml logs certbot

# Manually request certificate
docker-compose -f docker-compose.prod.yml exec certbot \
  certbot certonly --webroot -w /var/www/certbot \
  -d yourdomain.com --email you@example.com --agree-tos
```

### nginx 502 Bad Gateway

```bash
# Check backend is running
docker-compose -f docker-compose.prod.yml ps backend

# Check backend logs
docker-compose -f docker-compose.prod.yml logs backend

# Test backend directly
docker-compose -f docker-compose.prod.yml exec backend curl http://localhost:8000/api/v1/health
```

## Security Checklist

- [ ] Generated strong credentials (32+ chars)
- [ ] Updated all `CHANGE_ME_*` values in .env.production
- [ ] Replaced all `yourdomain.com` with actual domain
- [ ] Verified `.env.production` is NOT committed to git
- [ ] SSL certificates obtained and auto-renewing
- [ ] Firewall configured (only 80, 443 open)
- [ ] CORS_ORIGINS set to actual domain only
- [ ] Admin password changed from default
- [ ] Database backups scheduled
- [ ] Sentry error tracking configured (optional)
- [ ] Server monitoring in place (optional)

## Performance Optimization

### Enable HTTP/2
Already enabled in nginx config.

### Enable Gzip Compression
Already enabled in nginx config.

### Database Connection Pooling
Configured in backend (SQLAlchemy).

### Redis Caching
Configured for sessions and rate limiting.

### CDN (Optional)
For serving static assets, configure CloudFlare or similar.

## Monitoring (Optional)

### Sentry Error Tracking

1. Create account at sentry.io
2. Create new project
3. Copy DSN to `.env.production`:
   ```bash
   SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   ```
4. Restart services

### Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- StatusCake

Monitor: `https://yourdomain.com/api/v1/health`

## Support

For issues or questions:
- GitHub Issues: https://github.com/yourusername/MyPortfolio/issues
- Security: lengedandungjoshua@gmail.com

---

**Last Updated:** May 9, 2026  
**Tested On:** Docker 29.3.1, Docker Compose 5.1.1  
**Production Status:** ✅ Ready
