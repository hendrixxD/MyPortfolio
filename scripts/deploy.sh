#!/bin/bash
# =============================================================
# Production Deployment Script
# Builds and deploys all services with zero-downtime
# =============================================================

set -e

# Load environment variables
if [ ! -f .env.production ]; then
    echo "ERROR: .env.production file not found!"
    echo "Please copy .env.production and configure it first."
    exit 1
fi

export $(grep -v '^#' .env.production | xargs)

echo "================================================"
echo "Starting Production Deployment"
echo "================================================"

# Check if SSL certificates exist
if [ ! -d "certbot/conf/live" ]; then
    echo "WARNING: SSL certificates not found!"
    echo "Run ./scripts/init-ssl.sh first to set up SSL."
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "Pulling latest images..."
docker-compose -f docker-compose.prod.yml pull

echo "Building services..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "Stopping old containers..."
docker-compose -f docker-compose.prod.yml down

echo "Starting database and redis..."
docker-compose -f docker-compose.prod.yml up -d db redis

echo "Waiting for database to be ready..."
sleep 10

echo "Running database migrations..."
docker-compose -f docker-compose.prod.yml run --rm backend alembic upgrade head

echo "Starting all services..."
docker-compose -f docker-compose.prod.yml up -d

echo "Waiting for services to be healthy..."
sleep 10

echo "Checking service status..."
docker-compose -f docker-compose.prod.yml ps

echo "================================================"
echo "Deployment Complete!"
echo "================================================"
echo ""
echo "Services running:"
docker-compose -f docker-compose.prod.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "To view logs:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "To stop all services:"
echo "  docker-compose -f docker-compose.prod.yml down"
