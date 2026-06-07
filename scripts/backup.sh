#!/bin/bash

# Automated Postgres Database Backup Script
# Save this script in the project/scripts/ directory and make it executable:
# chmod +x scripts/backup.sh

# Resolve absolute paths relative to script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups"

# Ensure the backups directory exists
mkdir -p "$BACKUP_DIR"

# Load environment variables from the root .env file if it exists
ENV_FILE="$PROJECT_ROOT/.env"
if [ -f "$ENV_FILE" ]; then
  # Read variables line by line omitting comments and empty lines
  while IFS= read -r line || [ -n "$line" ]; do
    # Strip carriage returns and ignore comments/empty lines
    line=$(echo "$line" | tr -d '\r')
    if [[ ! "$line" =~ ^# ]] && [[ ! -z "$line" ]]; then
      export "$line"
    fi
  done < "$ENV_FILE"
fi

# Define default database connection parameters
DB_USER=${POSTGRES_USER:-postgres}
DB_NAME=${POSTGRES_DB:-portfolio_db}
CONTAINER_NAME="portfolio_db"

# Format backup filename with timestamp
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/portfolio_db_backup_$DATE.sql.gz"

echo "=== [$(date)] Starting Database Backup ==="
echo "Targeting Container: $CONTAINER_NAME"
echo "Database: $DB_NAME (User: $DB_USER)"
echo "Output path: $BACKUP_FILE"

# Run pg_dump inside the docker container and stream to gzip on the host
if docker exec "$CONTAINER_NAME" pg_isready -U "$DB_USER" >/dev/null 2>&1; then
  docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_FILE"
  
  if [ ${PIPESTATUS[0]} -eq 0 ] && [ -f "$BACKUP_FILE" ]; then
    echo "✅ Backup successfully created: $(basename "$BACKUP_FILE") ($(du -sh "$BACKUP_FILE" | cut -f1))"
  else
    echo "❌ Error: pg_dump command failed"
    rm -f "$BACKUP_FILE"
    exit 1
  fi
else
  echo "❌ Error: Database container '$CONTAINER_NAME' is not running or not ready"
  exit 1
fi

# Prune backups older than 30 days
echo "Cleaning up backups older than 30 days..."
find "$BACKUP_DIR" -name "portfolio_db_backup_*.sql.gz" -type f -mtime +30 -print -delete

echo "=== Backup Process Finished ==="
