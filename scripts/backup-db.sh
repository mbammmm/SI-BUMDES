#!/bin/bash

# SI-BUMDes Database Backup Script
# Usage: ./scripts/backup-db.sh [--no-cleanup]
#   --no-cleanup: Skip deleting old backups (default: keeps 30 days)

set -e

# Load environment variables from .env file
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/si-bumdes}"
BACKUP_KEEP_DAYS="${BACKUP_KEEP_DAYS:-30}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-si_bumdes}"
DB_USER="${DB_USER:-postgres}"

# Parse DATABASE_URL if available (format: postgresql://user:password@host:port/dbname?schema=public)
if [ -n "$DATABASE_URL" ]; then
  # Extract components from DATABASE_URL
  # Format: postgresql://[user[:password]@][host][:port]/dbname[?schema=public]
  DB_USER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
  DB_PASSWORD=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
  DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\[\?\([^@:]*\)\]\?[:]*\([0-9]*\)\/.*/host=\1/port=\2/p' | head -1 | cut -d= -f2)
  DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*@\[[^@]*\]:\([0-9]*\)\/.*/\1/p')
  DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')

  # Set password env for pg_dump
  export PGPASSWORD="$DB_PASSWORD"
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/si-bumdes_backup_${TIMESTAMP}.sql.gz"
LOG_FILE="${BACKUP_DIR}/backup_log_${TIMESTAMP}.txt"

echo "Starting backup at $(date)" | tee "$LOG_FILE"
echo "Database: ${DB_NAME}" | tee -a "$LOG_FILE"
echo "Host: ${DB_HOST}:${DB_PORT}" | tee -a "$LOG_FILE"
echo "Backup file: ${BACKUP_FILE}" | tee -a "$LOG_FILE"

# Perform backup using pg_dump
if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_FILE"; then
  BACKUP_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
  echo "Backup completed successfully: ${BACKUP_FILE} (${BACKUP_SIZE})" | tee -a "$LOG_FILE"
  echo "Backup completed successfully: ${BACKUP_FILE} (${BACKUP_SIZE})"
else
  echo "ERROR: Backup failed!" | tee -a "$LOG_FILE"
  rm -f "$BACKUP_FILE"
  exit 1
fi

# Cleanup old backups
if [ "$1" != "--no-cleanup" ]; then
  echo "Cleaning up backups older than ${BACKUP_KEEP_DAYS} days..." | tee -a "$LOG_FILE"
  find "$BACKUP_DIR" -name "si-bumdes_backup_*.sql.gz" -type f -mtime +${BACKUP_KEEP_DAYS} -delete
  find "$BACKUP_DIR" -name "backup_log_*.txt" -type f -mtime +${BACKUP_KEEP_DAYS} -delete
  echo "Cleanup completed." | tee -a "$LOG_FILE"
fi

# Remove log files older than retention period
find "$BACKUP_DIR" -name "backup_log_*.txt" -type f -mtime +${BACKUP_KEEP_DAYS} -delete

echo "Backup process finished at $(date)" | tee -a "$LOG_FILE"
