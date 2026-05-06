# Deployment Guide

This project uses Docker, Docker Compose, and GitHub Actions for automated CI/CD.

## Branch Strategy

- **main**: Development branch (local work)
- **staging**: Testing environment (auto-deploys to staging server)
- **production**: Production environment (auto-deploys to production server)

## Quick Start (Local Development)

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your local settings
nano .env

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

## Prerequisites

### For Local Development
- Docker
- Docker Compose
- Git

### For CI/CD Deployment
- A server with Docker and Docker Compose installed
- SSH access to your server
- GitHub repository with Actions enabled

## GitHub Secrets Configuration

### Staging Secrets
```
STAGING_HOST          - Staging server IP/hostname
STAGING_USER          - SSH username
STAGING_SSH_KEY       - SSH private key for authentication
STAGING_API_URL       - API URL (e.g., https://staging-api.yourdomain.com)
STAGING_URL           - Frontend URL (e.g., https://staging.yourdomain.com)
STAGING_ENV           - Complete .env file content for staging
```

### Production Secrets
```
PRODUCTION_HOST       - Production server IP/hostname
PRODUCTION_USER       - SSH username
PRODUCTION_SSH_KEY    - SSH private key
PRODUCTION_API_URL    - API URL (e.g., https://api.yourdomain.com)
PRODUCTION_URL        - Frontend URL (e.g., https://yourdomain.com)
PRODUCTION_ENV        - Complete .env file content for production
```

## Deployment Workflow

### 1. Deploy to Staging

```bash
# Switch to main branch
git checkout main

# Make your changes and commit
git add .
git commit -m "feat: your feature"

# Push to staging
git push origin main:staging
```

This triggers:
1. ✅ Run tests
2. 🐳 Build Docker images
3. 📦 Push to GitHub Container Registry
4. 🚀 Deploy to staging server
5. 🏥 Health check

### 2. Deploy to Production

After testing on staging:

```bash
# Merge staging to production
git checkout staging
git pull origin staging
git checkout production
git merge staging
git push origin production
```

This triggers:
1. ✅ Run tests
2. 🐳 Build Docker images with `latest` tag
3. 📦 Push to registry
4. 🚀 Deploy to production server
5. 🏥 Health check
6. 🏷️ Create release tag

## Server Setup

### 1. Initial Server Configuration

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create project directory
sudo mkdir -p /opt/portfolio-staging
sudo mkdir -p /opt/portfolio-production
sudo chown $USER:$USER /opt/portfolio-*
```

### 2. Clone Repository

```bash
# Staging
cd /opt/portfolio-staging
git clone -b staging https://github.com/yourusername/MyPortfolio.git .

# Production
cd /opt/portfolio-production
git clone -b production https://github.com/yourusername/MyPortfolio.git .
```

### 3. Setup Environment Files

```bash
# Create .env file with your production values
nano .env
```

### 4. SSL Certificate (Optional but Recommended)

For production with SSL:

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Auto-renewal (add to crontab)
0 0 * * * certbot renew --quiet
```

Update `nginx/conf.d/default.conf` for SSL:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Rest of your configuration...
}
```

## Docker Commands

```bash
# View running containers
docker compose ps

# View logs
docker compose logs -f [service_name]

# Restart a service
docker compose restart [service_name]

# Execute command in container
docker compose exec backend bash
docker compose exec frontend sh

# View resource usage
docker stats

# Clean up
docker system prune -a
docker volume prune
```

## Database Management

```bash
# Backup database
docker compose exec postgres pg_dump -U portfolio_user portfolio > backup.sql

# Restore database
docker compose exec -T postgres psql -U portfolio_user portfolio < backup.sql

# Run migrations
docker compose exec backend alembic upgrade head

# Rollback migration
docker compose exec backend alembic downgrade -1
```

## Monitoring

```bash
# Check service health
curl http://localhost/health

# Check API health
curl http://localhost/api/v1/health

# View Nginx access logs
docker compose logs nginx | tail -100

# View backend logs
docker compose logs backend | tail -100
```

## Troubleshooting

### Container won't start
```bash
docker compose logs [service_name]
docker compose exec [service_name] bash
```

### Database connection issues
```bash
# Check if database is ready
docker compose exec postgres pg_isready -U portfolio_user

# Check database logs
docker compose logs postgres
```

### Permission issues with uploads
```bash
# Fix upload directory permissions
sudo chown -R 1000:1000 backend/uploads
chmod -R 755 backend/uploads
```

### Build cache issues
```bash
# Rebuild without cache
docker compose build --no-cache
docker compose up -d --force-recreate
```

## Security Checklist

- [ ] Change default passwords in `.env`
- [ ] Set strong `SECRET_KEY` for JWT
- [ ] Configure firewall (UFW or iptables)
- [ ] Setup SSL certificates
- [ ] Enable automatic security updates
- [ ] Regular backups configured
- [ ] Monitor logs for suspicious activity
- [ ] Keep Docker and system updated

## Maintenance

### Regular Tasks
- Weekly: Check logs for errors
- Monthly: Update Docker images
- Quarterly: Review and rotate secrets
- As needed: Database backups

### Updates
```bash
# Pull latest images
docker compose pull

# Restart with new images
docker compose up -d

# Clean old images
docker image prune -a
```

## Support

For issues or questions, check:
- GitHub Actions logs
- Docker container logs
- Nginx access/error logs
- Application logs
