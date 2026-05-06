# Quick Start Guide - CI/CD Setup

## ✅ What's Been Set Up

Your portfolio now has a complete CI/CD pipeline with:
- ✅ Docker containerization for all services
- ✅ Nginx reverse proxy
- ✅ GitHub Actions for automated deployment
- ✅ Staging and Production branches

## 🚀 Getting Started Locally

```bash
# 1. Copy and configure environment
cp backend/.env.example backend/.env

# 2. Edit with your settings
nano backend/.env

# 3. Start everything
cd backend
./deploy.sh dev up

# Access your app
# Frontend: http://localhost
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## 📋 Next Steps for Server Deployment

### 1. Setup Your Server

You need a VPS/Cloud server with:
- Ubuntu 20.04+ (or similar Linux)
- Docker & Docker Compose installed
- SSH access
- At least 2GB RAM, 2 CPU cores

Popular providers:
- DigitalOcean (Droplet)
- AWS (EC2)
- Linode
- Hetzner

### 2. Configure GitHub Secrets

Go to: `GitHub Repository → Settings → Secrets and variables → Actions`

Add these secrets:

**For Staging:**
```
STAGING_HOST          = your-staging-server-ip
STAGING_USER          = your-ssh-username
STAGING_SSH_KEY       = your-private-ssh-key
STAGING_API_URL       = https://staging-api.yourdomain.com
STAGING_URL           = https://staging.yourdomain.com
STAGING_ENV           = (paste your complete .env file)
```

**For Production:**
```
PRODUCTION_HOST       = your-production-server-ip
PRODUCTION_USER       = your-ssh-username
PRODUCTION_SSH_KEY    = your-private-ssh-key
PRODUCTION_API_URL    = https://api.yourdomain.com
PRODUCTION_URL        = https://yourdomain.com
PRODUCTION_ENV        = (paste your complete .env file)
```

### 3. Prepare Your Server

```bash
# SSH into your server
ssh user@your-server-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create directories
sudo mkdir -p /opt/portfolio-staging
sudo mkdir -p /opt/portfolio-production
sudo chown $USER:$USER /opt/portfolio-*

# Clone your repo
cd /opt/portfolio-staging
git clone -b staging https://github.com/YOUR_USERNAME/MyPortfolio.git .

cd /opt/portfolio-production
git clone -b production https://github.com/YOUR_USERNAME/MyPortfolio.git .
```

### 4. Deploy!

**To Staging:**
```bash
git push origin main:staging
```

**To Production:**
```bash
git checkout staging
git pull origin staging
git checkout production
git merge staging
git push origin production
```

## 🔄 Workflow

```
┌─────────┐
│  main   │  ← Development work
└────┬────┘
     │ push
     ↓
┌─────────┐     GitHub Actions:
│ staging │  ←  • Run tests
└────┬────┘     • Build Docker images
     │          • Deploy to staging server
     │          • Health check
     ↓
┌─────────┐     GitHub Actions:
│production│ ←  • Run tests + build
└─────────┘     • Push latest images
                • Deploy to production
                • Create release tag
```

## 🐳 Local Commands

```bash
cd backend

# Start
./deploy.sh dev up

# Stop
./deploy.sh dev down

# View logs
./deploy.sh dev logs

# Rebuild
./deploy.sh dev build

# Backup database
./deploy.sh dev backup

# Clean everything
./deploy.sh dev clean
```

## 📊 Monitoring

```bash
# View running containers
docker compose ps

# Check service health
curl http://localhost/health

# View logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx

# Resource usage
docker stats
```

## 🔧 Common Issues

### Port already in use
```bash
# Find what's using port 80/3000/8000
sudo lsof -i :80
sudo lsof -i :3000
sudo lsof -i :8000

# Stop the process or change ports in docker-compose.yml
```

### Database connection failed
```bash
# Check if PostgreSQL is running
docker compose ps postgres

# View database logs
docker compose logs postgres

# Restart database
docker compose restart postgres
```

### Images won't build
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker compose build --no-cache
```

## 📖 Full Documentation

See `DEPLOYMENT.md` for complete documentation including:
- SSL certificate setup
- Database backups
- Security checklist
- Troubleshooting guide
- Server maintenance

## 🆘 Need Help?

1. Check GitHub Actions logs in your repository
2. SSH into server and check: `docker compose logs`
3. Review `DEPLOYMENT.md` for detailed troubleshooting
