#!/bin/bash

# Database setup script for Qurilish
# This script helps with common database operations

DB_USER="postgres"
DB_NAME="qurilish_db"

echo "🗄️  Qurilish Database Setup"
echo "=========================="
echo ""

# Function to create database
create_db() {
    echo "Creating database: $DB_NAME"
    psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Database created successfully"
    else
        echo "⚠️  Database may already exist or creation failed"
    fi
}

# Function to drop database
drop_db() {
    echo "⚠️  WARNING: This will delete all data!"
    read -p "Are you sure you want to drop $DB_NAME? (yes/no): " confirm
    if [ "$confirm" == "yes" ]; then
        psql -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;"
        echo "✅ Database dropped"
    else
        echo "❌ Operation cancelled"
    fi
}

# Function to initialize schema
init_schema() {
    echo "Initializing database schema..."
    psql -U $DB_USER -d $DB_NAME -f ../database/init.sql
    if [ $? -eq 0 ]; then
        echo "✅ Schema initialized successfully"
    else
        echo "❌ Schema initialization failed"
    fi
}

# Function to reset database
reset_db() {
    echo "Resetting database..."
    psql -U $DB_USER -d $DB_NAME -f ../database/reset-db.sql
    echo "✅ Database reset"
    init_schema
}

# Main menu
echo "Select an option:"
echo "1) Create database"
echo "2) Initialize schema"
echo "3) Reset database (drop tables and recreate)"
echo "4) Drop database"
echo "5) Full setup (create + initialize)"
echo "6) Exit"
echo ""
read -p "Enter choice [1-6]: " choice

case $choice in
    1)
        create_db
        ;;
    2)
        init_schema
        ;;
    3)
        reset_db
        ;;
    4)
        drop_db
        ;;
    5)
        create_db
        init_schema
        ;;
    6)
        echo "Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "✅ Done!"
