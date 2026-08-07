#!/bin/bash

# SI-BUMDes Cron Setup Script
# This script sets up daily database backups at 2 AM and document expiry checks at 3 AM

# Script directory
SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"

# Backup script path
BACKUP_SCRIPT="$SCRIPTS_DIR/backup-db.sh"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/si-bumdes}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create cron job for daily backup at 2:00 AM
# m h  dom mon dow   command
CRON_BACKUP="0 2 * * * $BACKUP_SCRIPT >> /var/log/si-bumdes-backup.log 2>&1"
CRON_EXPIRY="0 3 * * * $SCRIPTS_DIR/check-expiry.sh >> /var/log/si-bumdes-expiry.log 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "backup-db.sh"; then
  echo "Cron job for database backup already exists. Updating..."
  # Remove existing backup cron job and add new one
  (crontab -l 2>/dev/null | grep -v "backup-db.sh" | grep -v "check-expiry.sh"; echo "$CRON_BACKUP"; echo "$CRON_EXPIRY") | crontab -
else
  # Add new cron jobs
  (crontab -l 2>/dev/null; echo "$CRON_BACKUP"; echo "$CRON_EXPIRY") | crontab -
fi

echo "Cron jobs have been set up:"
echo "  - Database backup: 02:00 AM daily"
echo "  - Document expiry check: 03:00 AM daily"
echo ""
echo "Current crontab:"
crontab -l
