# Quick Start Guide - Docker Deployment

## Step 1: Start Docker

```bash
# Check if Docker is running
sudo systemctl status docker

# If not running, start it
sudo systemctl start docker

# Enable Docker to start on boot
sudo systemctl enable docker

# Verify Docker is working
docker --version
docker compose --version
```

## Step 2: Start the Application

```bash
cd backend
./start-docker.sh
```

This will:
- Check for .env file (create from .env.example if needed)
- Build Docker images
- Start all services (PostgreSQL, Backend, Frontend, Nginx)
- Run health checks
- Display access URLs

## Step 3: Access Your Application

Once started, access:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Step 4: Setup SSL (Production Only)

**Only run this if you have a domain pointed to your server:**

```bash
cd backend
sudo ./setup-ssl.sh
```

Follow the prompts to:
- Enter your domain name
- Enter your email
- Obtain Let's Encrypt certificates
- Configure HTTPS

## Common Commands

```bash
# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx

# Stop all services
docker compose down

# Restart services
docker compose restart

# Rebuild after code changes
docker compose up -d --build

# Check service status
docker compose ps

# Execute commands in containers
docker compose exec backend bash
docker compose exec postgres psql -U portfolio_user -d portfolio
```

## Troubleshooting

### Port already in use
```bash
# Check what's using the ports
sudo lsof -i :80
sudo lsof -i :443
sudo lsof -i :8000
sudo lsof -i :3000

# Stop conflicting services
sudo systemctl stop apache2  # If Apache is running
sudo systemctl stop nginx    # If system Nginx is running
```

### Docker permission denied
```bash
# Add your user to docker group
sudo usermod -aG docker $USER

# Logout and login again, or run:
newgrp docker
```

### Services not starting
```bash
# Check logs
docker compose logs

# Rebuild without cache
docker compose build --no-cache
docker compose up -d
```

### Database issues
```bash
# Check database logs
docker compose logs postgres

# Restart database
docker compose restart postgres

# Reset database (WARNING: deletes all data)
docker compose down -v
docker compose up -d
```

## Environment Variables

Edit `backend/.env` to configure:

```env
# Database
POSTGRES_DB=portfolio
POSTGRES_USER=portfolio_user
POSTGRES_PASSWORD=changeme

# Backend
SECRET_KEY=your-secret-key-change-in-production
CORS_ORIGINS=http://localhost:3000,http://localhost

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Production Checklist

Before deploying to production:

- [ ] Change all default passwords in .env
- [ ] Set strong SECRET_KEY
- [ ] Setup SSL with ./setup-ssl.sh
- [ ] Update CORS_ORIGINS to your domain
- [ ] Update NEXT_PUBLIC_API_URL to your API domain
- [ ] Configure firewall (allow ports 80, 443)
- [ ] Setup automatic backups
- [ ] Monitor logs regularly

## Need Help?

- Check `DEPLOYMENT.md` for detailed documentation
- View container logs: `docker compose logs -f`
- Check service health: `curl http://localhost/health`
