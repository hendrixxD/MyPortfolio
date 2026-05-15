#!/bin/bash

# Change to project root (parent of scripts directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# =============================================================
# Production Database and Uploads Restore Script
# =============================================================

set -e

DB_BACKUP="$1"
UPLOADS_BACKUP="$2"

if [ -z "$DB_BACKUP" ]; then
    echo "Usage: ./restore.sh <db_backup.sql> [uploads_backup.tar.gz]"
    echo ""
    echo "Available backups:"
    ls -lh backups/
    exit 1
fi

# Load environment variables
if [ -f .env.production ]; then
    export $(grep -v '^#' .env.production | xargs)
else
    echo "ERROR: .env.production file not found!"
    exit 1
fi

echo "================================================"
echo "WARNING: This will OVERWRITE existing data!"
echo "================================================"
read -p "Are you sure you want to continue? (yes/NO) " -r
if [[ ! $REPLY =~ ^yes$ ]]; then
    echo "Restore cancelled."
    exit 0
fi

# Restore database
if [ -f "$DB_BACKUP" ]; then
    echo "Restoring database from: $DB_BACKUP"
    cat "$DB_BACKUP" | docker-compose -f docker-compose.prod.yml exec -T db psql \
        -U "$DB_USER" \
        -d "$DB_NAME"
    echo "Database restored successfully!"
else
    echo "ERROR: Database backup file not found: $DB_BACKUP"
    exit 1
fi

# Restore uploads if provided
if [ -n "$UPLOADS_BACKUP" ]; then
    if [ -f "$UPLOADS_BACKUP" ]; then
        echo "Restoring uploads from: $UPLOADS_BACKUP"
        docker run --rm \
            -v portfolio_backend_uploads:/target \
            -v "$(pwd)/$(dirname $UPLOADS_BACKUP)":/backup \
            alpine \
            sh -c "rm -rf /target/* && tar xzf /backup/$(basename $UPLOADS_BACKUP) -C /target"
        echo "Uploads restored successfully!"
    else
        echo "WARNING: Uploads backup file not found: $UPLOADS_BACKUP"
    fi
fi

echo "================================================"
echo "Restore Complete!"
echo "================================================"
