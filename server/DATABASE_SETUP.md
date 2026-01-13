# Database Setup Guide

## Option 1: Using Docker (Recommended)

### Prerequisites
- Install Docker Desktop: https://www.docker.com/products/docker-desktop/

### Steps

1. **Start PostgreSQL with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Verify the database is running**
   ```bash
   docker ps
   ```
   You should see `qurilish_postgres` container running.

3. **Check database logs**
   ```bash
   docker-compose logs postgres
   ```

4. **Connect to database (optional)**
   ```bash
   docker exec -it qurilish_postgres psql -U postgres -d qurilish_db
   ```

5. **Stop the database**
   ```bash
   docker-compose down
   ```

6. **Stop and remove all data**
   ```bash
   docker-compose down -v
   ```

### Database Credentials (from .env)
- Host: `localhost`
- Port: `5432`
- Database: `qurilish_db`
- Username: `postgres`
- Password: `postgres123`

## Option 2: Install PostgreSQL Locally

### Prerequisites
1. Download PostgreSQL: https://www.postgresql.org/download/windows/
2. Install with default settings (Port: 5432)
3. Remember the password you set for `postgres` user

### Steps

1. **Update .env file**
   Replace `DB_PASSWORD` with your PostgreSQL password

2. **Create Database**
   Open pgAdmin or psql and run:
   ```sql
   CREATE DATABASE qurilish_db;
   ```

3. **Run Database Schema**
   ```bash
   psql -U postgres -d qurilish_db -f database/init.sql
   ```

4. **Run Seed Data (Optional)**
   ```bash
   psql -U postgres -d qurilish_db -f database/seeds/001_seed_data.sql
   ```

## Troubleshooting

### Error: ECONNREFUSED
- Make sure PostgreSQL is running
- Check if port 5432 is not used by another application
- Verify credentials in `.env` file

### Docker Issues
- Make sure Docker Desktop is running
- Check Docker logs: `docker-compose logs`
- Try rebuilding: `docker-compose up -d --force-recreate`

### Connection Issues
- Test connection: `psql -U postgres -h localhost -p 5432`
- Check firewall settings
- Verify PostgreSQL service is running

## Database Commands

### View all tables
```sql
\dt
```

### View table structure
```sql
\d table_name
```

### Drop and recreate database
```sql
DROP DATABASE IF EXISTS qurilish_db;
CREATE DATABASE qurilish_db;
```

### Reset all data
```bash
# Stop containers
docker-compose down -v

# Start fresh
docker-compose up -d
```
