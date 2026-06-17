#!/bin/bash

# Define variables
BACKUP_DIR="../backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
MONGO_URI="mongodb://localhost:27017/chess_analytics"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Run mongodump
echo "Starting MongoDB backup for $MONGO_URI..."
mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/$TIMESTAMP"

if [ $? -eq 0 ]; then
    echo "Backup completed successfully at $BACKUP_DIR/$TIMESTAMP"
else
    echo "Backup failed!"
    exit 1
fi
