#!/bin/bash

# SI-BUMDes Database Backup Script (macOS/Linux)
# Usage: ./scripts/backup-db.sh [--no-cleanup]
#   --no-cleanup: Skip deleting old backups (default: keeps 30 days)

set -e

# Go to project directory
cd "$(dirname "$0")/.."

# Load environment variables from .env file
if [ -f .env ]; then
  export $(cat .env | xargs)
fi

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/si-bumdes}"
BACKUP_KEEP_DAYS="${BACKUP_KEEP_DAYS:-30}"

# Parse DATABASE_URL
# Format: postgresql://user:password@host:port/dbname
if [ -n "$DATABASE_URL" ]; then
  # Use node to parse the URL reliably
  PARSED=$(node -e "
    const u = new URL(process.env.DATABASE_URL.replace('postgresql://', 'https://'));
    console.log(u.hostname + '|' + (u.port || '5432') + '|' + u.pathname.slice(1).split('?')[0] + '|' + u.username + '|' + u.password);
  ")

  IFS='|' read -r DB_HOST DB_PORT DB_NAME DB_USER DB_PASSWORD <<< "$PARSED"
  export PGPASSWORD="$DB_PASSWORD"
else
  echo "DATABASE_URL not set!" | tee -a "$BACKUP_DIR/backup_error.log"
  exit 1
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

echo "Backup process finished at $(date)" | tee -a "$LOG_FILE"
