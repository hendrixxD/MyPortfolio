#!/bin/bash

# Start Portfolio with Docker
set -e

echo "🐳 Starting Portfolio with Docker"
echo "================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found"
    read -p "Create from .env.example? (y/n): " CREATE_ENV
    if [ "$CREATE_ENV" = "y" ]; then
        cp .env.example .env
        echo "✅ Created .env file"
        echo "⚠️  Please edit .env with your configuration"
        echo ""
        read -p "Continue with default values? (y/n): " CONTINUE
        if [ "$CONTINUE" != "y" ]; then
            echo "Please edit .env and run this script again"
            exit 0
        fi
    else
        echo "❌ Cannot continue without .env file"
        exit 1
    fi
fi

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker compose &> /dev/null; then
    echo "❌ docker compose is not installed"
    exit 1
fi

echo "📦 Pulling/Building images..."
docker compose build

echo ""
echo "🚀 Starting services..."
docker compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 15

echo ""
echo "🏥 Health checks..."

# Check nginx
if curl -f -s http://localhost/health > /dev/null 2>&1; then
    echo "✅ Nginx is healthy"
else
    echo "⚠️  Nginx health check failed"
fi

# Check backend
if curl -f -s http://localhost:8000/api/v1/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "⚠️  Backend health check failed"
fi

# Check frontend
if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "⚠️  Frontend health check failed"
fi

echo ""
echo "✅ Portfolio is running!"
echo ""
echo "🌐 Access Points:"
echo "  • Frontend: http://localhost"
echo "  • Backend API: http://localhost:8000"
echo "  • API Docs: http://localhost:8000/docs"
echo "  • Database: localhost:5432"
echo ""
echo "📊 Useful Commands:"
echo "  • View logs: docker compose logs -f"
echo "  • Stop: docker compose down"
echo "  • Restart: docker compose restart"
echo "  • Status: docker compose ps"
echo ""
echo "🔐 Setup SSL (production):"
echo "  • sudo ./setup-ssl.sh"
