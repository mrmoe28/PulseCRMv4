#!/bin/bash

# PulseCRM Database Backup Script
# This script creates timestamped backups of the PostgreSQL database

set -e

# Configuration
DB_HOST="postgres"
DB_NAME="pulsecrm"
DB_USER="postgres"
BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/pulsecrm_backup_${TIMESTAMP}.sql"

echo "Starting backup of ${DB_NAME} database..."

# Wait for PostgreSQL to be ready
until pg_isready -h "$DB_HOST" -U "$DB_USER"; do
  echo "Waiting for PostgreSQL to start..."
  sleep 2
done

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create the backup
pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" \
  --verbose \
  --no-password \
  --format=plain \
  --clean \
  --if-exists \
  --create \
  --encoding=UTF8 \
  > "$BACKUP_FILE"

# Compress the backup
gzip "$BACKUP_FILE"
COMPRESSED_FILE="${BACKUP_FILE}.gz"

echo "Backup completed: $(basename "$COMPRESSED_FILE")"
echo "Backup size: $(du -h "$COMPRESSED_FILE" | cut -f1)"

# Keep only the last 7 daily backups
find "$BACKUP_DIR" -name "pulsecrm_backup_*.sql.gz" -type f -mtime +7 -delete

# List current backups
echo "Current backups:"
ls -lh "$BACKUP_DIR"/pulsecrm_backup_*.sql.gz 2>/dev/null || echo "No previous backups found"

echo "Backup process completed successfully!"
