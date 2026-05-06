#!/bin/bash
# =============================================================
# Production Database and Uploads Backup Script
# Run this regularly or set up as a cron job
# =============================================================

set -e

BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Load environment variables
if [ -f .env.production ]; then
    export $(grep -v '^#' .env.production | xargs)
else
    echo "ERROR: .env.production file not found!"
    exit 1
fi

mkdir -p "$BACKUP_DIR"

echo "================================================"
echo "Starting Backup: $TIMESTAMP"
echo "================================================"

# Backup PostgreSQL database
echo "Backing up PostgreSQL database..."
docker-compose -f docker-compose.prod.yml exec -T db pg_dump \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --clean \
    --if-exists > "$BACKUP_DIR/db_$TIMESTAMP.sql"

echo "Database backed up to: $BACKUP_DIR/db_$TIMESTAMP.sql"

# Backup uploaded files
echo "Backing up uploaded files..."
docker run --rm \
    -v portfolio_backend_uploads:/source \
    -v "$(pwd)/$BACKUP_DIR":/backup \
    alpine \
    tar czf "/backup/uploads_$TIMESTAMP.tar.gz" -C /source .

echo "Uploads backed up to: $BACKUP_DIR/uploads_$TIMESTAMP.tar.gz"

# Keep only last 7 days of backups
echo "Cleaning old backups (keeping last 7 days)..."
find "$BACKUP_DIR" -name "db_*.sql" -mtime +7 -delete
find "$BACKUP_DIR" -name "uploads_*.tar.gz" -mtime +7 -delete

echo "================================================"
echo "Backup Complete!"
echo "================================================"
echo "Files:"
echo "  - Database: $BACKUP_DIR/db_$TIMESTAMP.sql"
echo "  - Uploads:  $BACKUP_DIR/uploads_$TIMESTAMP.tar.gz"
