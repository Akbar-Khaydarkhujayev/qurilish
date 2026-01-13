# Database Setup

This folder contains database initialization and migration scripts.

## Current Status

The database currently has a basic schema with a `users` table for authentication. This will be replaced with your complete schema from dbdiagram.

## Running Database Initialization

### Option 1: Using psql command line

```bash
# Connect to PostgreSQL and create database
psql -U postgres

# Create database
CREATE DATABASE qurilish_db;

# Exit psql
\q

# Run the initialization script
psql -U postgres -d qurilish_db -f database/init.sql
```

### Option 2: Using pgAdmin

1. Open pgAdmin
2. Create a new database called `qurilish_db`
3. Right-click on the database → Query Tool
4. Open and run `database/init.sql`

## After Getting dbdiagram Schema

Once you have your dbdiagram schema:

1. Export the SQL from dbdiagram.io
2. Replace the contents of `database/init.sql` with your schema
3. Run the new schema on a fresh database or create a migration script

## Environment Variables

Make sure to update [server/.env](../server/.env) with your PostgreSQL credentials:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=qurilish_db
DB_USER=postgres
DB_PASSWORD=your_password
```
