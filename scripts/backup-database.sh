#!/bin/bash
# Database Backup Script
# Run daily to backup PostgreSQL database

set -e

# Configuration
BACKUP_DIR="/Users/chozengone/.openclaw/backups"
DATABASE_URL="postgresql://chozengone@localhost:5432/renovation_advisor"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/renovation_advisor_$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "🚀 Starting database backup: $(date)"

# Perform backup
echo "📦 Backing up database to: $BACKUP_FILE"
pg_dump "$DATABASE_URL" --format=plain --no-owner --no-acl > "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ] && [ -s "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "✅ Backup successful: $BACKUP_FILE ($BACKUP_SIZE)"
    
    # Compress backup
    echo "🗜️ Compressing backup..."
    gzip "$BACKUP_FILE"
    BACKUP_FILE="$BACKUP_FILE.gz"
    COMPRESSED_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "✅ Compressed: $BACKUP_FILE ($COMPRESSED_SIZE)"
    
    # Clean up old backups
    echo "🧹 Cleaning up backups older than $RETENTION_DAYS days..."
    find "$BACKUP_DIR" -name "renovation_advisor_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    
    # List remaining backups
    echo "📋 Current backups:"
    ls -lh "$BACKUP_DIR"/renovation_advisor_*.sql.gz 2>/dev/null || echo "No backups found"
    
    # Create restore instructions
    RESTORE_FILE="$BACKUP_DIR/RESTORE_INSTRUCTIONS.txt"
    cat > "$RESTORE_FILE" << EOF
# Database Restore Instructions
# Backup created: $(date)
# File: $(basename "$BACKUP_FILE")

## To restore:
1. Ensure PostgreSQL is running
2. Create database if needed:
   createdb renovation_advisor

3. Restore from backup:
   gunzip -c "$(basename "$BACKUP_FILE")" | psql renovation_advisor

4. Verify restore:
   psql renovation_advisor -c "SELECT COUNT(*) as users FROM \\"User\\";"

## Quick restore command:
gunzip -c $(basename "$BACKUP_FILE") | psql "postgresql://chozengone@localhost:5432/renovation_advisor"

## For production restore with different user:
gunzip -c $(basename "$BACKUP_FILE") | psql -U postgres -d renovation_advisor
EOF
    
    echo "📝 Restore instructions saved to: $RESTORE_FILE"
    
else
    echo "❌ Backup failed!"
    # Clean up failed backup file
    rm -f "$BACKUP_FILE"
    exit 1
fi

echo "🎉 Backup completed successfully: $(date)"

# Optional: Upload to cloud storage
if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "☁️ Uploading to S3..."
    aws s3 cp "$BACKUP_FILE" "s3://your-backup-bucket/renovation-advisor/$(basename "$BACKUP_FILE")"
    echo "✅ Uploaded to S3"
fi