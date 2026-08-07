#!/bin/bash

# SI-BUMDes Document Expiration Reminder Script
# This script checks for documents that are expiring soon or have expired
# and sends notifications to users.
# Intended to be run daily via cron.

# Go to project directory
cd "$(dirname "$0")/.."

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | xargs)
fi

# Only run if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL not set, skipping document expiration check"
  exit 0
fi

# Use node with tsx to run TypeScript script
npx tsx scripts/check-expired-documents.ts 2>&1
