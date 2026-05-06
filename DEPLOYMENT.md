# Production Deployment Guide

## Prerequisites

- Docker and Docker Compose installed on production server
- Domain name pointing to your server's IP address
- Ports 80 and 443 open in firewall

## First-Time Setup

### 1. Configure Environment

Copy and configure the production environment file:

```bash
cp .env.production .env.production.local
nano .env.production.local
```

Update these critical values:
- `DB_PASSWORD` - Strong database password
- `REDIS_PASSWORD` - Strong Redis password
- `SECRET_KEY` - Random 32+ character string
- `SITE_URL` - Your domain (https://yourdomain.com)
- `CORS_ORIGINS` - Your domain(s)
- `NEXT_PUBLIC_API_URL` - Your domain

Rename the file:
```bash
mv .env.production.local .env.production
```

### 2. Initialize SSL Certificates

Run the SSL initialization script (only needed once):

```bash
./scripts/init-ssl.sh yourdomain.com your@email.com
```

This will:
- Set up temporary HTTP-only nginx config
- Request SSL certificates from Let's Encrypt
- Configure nginx with SSL enabled
- Auto-renewal runs every 12 hours via certbot container

### 3. Update Nginx Configuration

Edit `nginx/conf.d/default.conf` and replace `yourdomain.com` with your actual domain:

```bash
sed -i 's/yourdomain.com/your-actual-domain.com/g' nginx/conf.d/default.conf
```

## Deployment

### Deploy to Production

```bash
./scripts/deploy.sh
```

This script will:
1. Pull latest Docker images
2. Build all services
3. Stop old containers
4. Start database and Redis
5. Run database migrations
6. Start all services

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### Check Service Status

```bash
docker-compose -f docker-compose.prod.yml ps
```

## Backup and Restore

### Create Backup

```bash
./scripts/backup.sh
```

Backups are stored in `backups/` directory:
- `db_TIMESTAMP.sql` - PostgreSQL database dump
- `uploads_TIMESTAMP.tar.gz` - Uploaded files

Old backups (>7 days) are automatically deleted.

### Restore from Backup

```bash
# Restore database only
./scripts/restore.sh backups/db_20260506_120000.sql

# Restore database and uploads
./scripts/restore.sh backups/db_20260506_120000.sql backups/uploads_20260506_120000.tar.gz
```

## Maintenance

### Update Application

1. Pull latest code:
```bash
git pull origin main
```

2. Deploy:
```bash
./scripts/deploy.sh
```

### Stop All Services

```bash
docker-compose -f docker-compose.prod.yml down
```

### Restart a Single Service

```bash
docker-compose -f docker-compose.prod.yml restart backend
docker-compose -f docker-compose.prod.yml restart frontend
docker-compose -f docker-compose.prod.yml restart nginx
```

### Access Container Shell

```bash
# Backend
docker-compose -f docker-compose.prod.yml exec backend bash

# Frontend
docker-compose -f docker-compose.prod.yml exec frontend sh

# Database
docker-compose -f docker-compose.prod.yml exec db psql -U portfolio_user -d portfolio_prod
```

### View Resource Usage

```bash
docker stats
```

## Troubleshooting

### Services Won't Start

Check logs for specific service:
```bash
docker-compose -f docker-compose.prod.yml logs backend
```

### Database Connection Issues

1. Check database is running:
```bash
docker-compose -f docker-compose.prod.yml ps db
```

2. Test connection:
```bash
docker-compose -f docker-compose.prod.yml exec db pg_isready -U portfolio_user
```

### SSL Certificate Issues

Certificates are stored in `certbot/conf/live/yourdomain.com/`

Renew manually:
```bash
docker-compose -f docker-compose.prod.yml run --rm certbot renew
docker-compose -f docker-compose.prod.yml restart nginx
```

### Nginx Configuration Test

```bash
docker-compose -f docker-compose.prod.yml exec nginx nginx -t
```

## Security Notes

- Never commit `.env.production` to git (already in .gitignore)
- Keep Docker images updated: `docker-compose pull`
- Monitor logs regularly for suspicious activity
- Set up automated backups (cron job recommended)
- Review rate limiting settings in `nginx/nginx.conf`

## Monitoring

Monitor these endpoints:
- `https://yourdomain.com` - Frontend
- `https://yourdomain.com/api/health` - Backend health
- `https://yourdomain.com/docs` - API documentation

Set up external monitoring for:
- SSL certificate expiration
- Service uptime
- Response times
- Disk space

## Automated Backups (Recommended)

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * cd /path/to/MyPortfolio && ./scripts/backup.sh >> logs/backup.log 2>&1
```
