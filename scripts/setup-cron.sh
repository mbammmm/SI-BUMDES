#!/bin/bash

# SI-BUMDes Cron Setup Script
# This script sets up daily database backups at 2 AM

# Backup script path
BACKUP_SCRIPT="$(cd "$(dirname "$0")" && pwd)/backup-db.sh"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/si-bumdes}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create cron job for daily backup at 2:00 AM
# m h  dom mon dow   command
# 0 2 * * * /path/to/backup-db.sh
CRON_JOB="0 2 * * * $BACKUP_SCRIPT >> /var/log/si-bumdes-backup.log 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "backup-db.sh"; then
  echo "Cron job for database backup already exists. Updating..."
  # Remove existing backup cron job and add new one
  (crontab -l 2>/dev/null | grep -v "backup-db.sh"; echo "$CRON_JOB") | crontab -
else
  # Add new cron job
  (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
fi

echo "Cron job for daily database backup (2 AM) has been set up."
echo ""
echo "Current crontab:"
crontab -l
