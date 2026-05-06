#!/bin/bash

# Portfolio Deployment Script
set -e

ENVIRONMENT=${1:-"dev"}
ACTION=${2:-"up"}

echo "🚀 Portfolio Deployment Script"
echo "================================"
echo "Environment: $ENVIRONMENT"
echo "Action: $ACTION"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "✅ Please edit .env with your configuration"
    exit 1
fi

case $ACTION in
    "up")
        echo "🐳 Starting containers..."
        docker compose up -d
        echo "⏳ Waiting for services to be ready..."
        sleep 10
        echo "🏥 Running health checks..."
        curl -f http://localhost/health || echo "⚠️  Nginx not ready yet"
        curl -f http://localhost:8000/api/v1/health || echo "⚠️  Backend not ready yet"
        echo ""
        echo "✅ Deployment complete!"
        echo "📝 View logs: docker compose logs -f"
        echo "🌐 Frontend: http://localhost"
        echo "🔌 Backend: http://localhost:8000"
        ;;
    
    "down")
        echo "🛑 Stopping containers..."
        docker compose down
        echo "✅ Containers stopped"
        ;;
    
    "restart")
        echo "🔄 Restarting containers..."
        docker compose restart
        echo "✅ Containers restarted"
        ;;
    
    "logs")
        docker compose logs -f
        ;;
    
    "build")
        echo "🔨 Building images..."
        docker compose build --no-cache
        echo "✅ Build complete"
        ;;
    
    "clean")
        echo "🧹 Cleaning up..."
        docker compose down -v
        docker system prune -af
        echo "✅ Cleanup complete"
        ;;
    
    "backup")
        echo "💾 Creating database backup..."
        BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
        docker compose exec -T postgres pg_dump -U portfolio_user portfolio > $BACKUP_FILE
        echo "✅ Backup saved to $BACKUP_FILE"
        ;;
    
    *)
        echo "Usage: ./deploy.sh [environment] [action]"
        echo ""
        echo "Actions:"
        echo "  up       - Start containers"
        echo "  down     - Stop containers"
        echo "  restart  - Restart containers"
        echo "  logs     - View logs"
        echo "  build    - Rebuild images"
        echo "  clean    - Remove all containers and images"
        echo "  backup   - Backup database"
        ;;
esac
