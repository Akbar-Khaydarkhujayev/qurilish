# Quick Start Guide

Get your Qurilish application up and running in minutes.

## Prerequisites Checklist

- [ ] Node.js (v18+) installed
- [ ] PostgreSQL (v12+) installed and running
- [ ] npm or yarn package manager

## Setup Steps

### 1. Install Dependencies (2 minutes)

```bash
# Client dependencies
cd client
npm install

# Server dependencies
cd ../server
npm install
```

### 2. Configure Database (3 minutes)

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE qurilish_db;

# Exit
\q

# Initialize schema
cd server
psql -U postgres -d qurilish_db -f database/init.sql
```

### 3. Update Environment Variables (2 minutes)

**Server (.env):** Update [server/.env](server/.env)

```env
DB_PASSWORD=your_actual_postgres_password
JWT_SECRET=create_a_long_random_secret_here
```

You can generate a secure JWT secret with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Client (.env):** Already configured! [client/.env](client/.env) points to `http://localhost:5000`

### 4. Start the Application (1 minute)

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

Wait for: `✅ Database connection successful` and `🚀 Server running on http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

The app will open at [http://localhost:8081](http://localhost:8081)

## Test the Setup

### 1. Check Backend Health

Visit: [http://localhost:5000/api/health](http://localhost:5000/api/health)

You should see:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### 2. Test Frontend

1. Open [http://localhost:8081](http://localhost:8081)
2. Click "Sign Up" (default at `/auth/jwt/sign-up`)
3. Create a test account
4. Sign in with your credentials

## Common Issues

### Issue: Database connection failed

**Solution:**
1. Check PostgreSQL is running: `pg_ctl status`
2. Verify password in [server/.env](server/.env)
3. Ensure database exists: `psql -U postgres -l | grep qurilish`

### Issue: Port already in use

**Solution:**

For server (port 5000):
```env
# In server/.env
PORT=5001
```

For client (port 8081):
```js
// In client/vite.config.ts, add:
server: { port: 8082 }
```

### Issue: CORS errors in browser

**Solution:**
1. Ensure backend is running before frontend
2. Verify `CLIENT_URL` in [server/.env](server/.env) matches frontend URL
3. Clear browser cache and reload

## Next Steps

Now that your app is running:

1. **Add Your Database Schema**: Replace [server/database/init.sql](server/database/init.sql) with your dbdiagram schema
2. **Explore the Code**: Check out the [README.md](README.md) for detailed architecture
3. **Build Features**: Start adding your controllers, routes, and UI components

## Development Workflow

### Daily Development

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

### When Adding Database Changes

```bash
# Update database/init.sql with new schema
# Then reset database:
psql -U postgres -c "DROP DATABASE qurilish_db;"
psql -U postgres -c "CREATE DATABASE qurilish_db;"
psql -U postgres -d qurilish_db -f database/init.sql
```

### When Adding New API Endpoints

1. Create controller in `server/src/controllers/`
2. Create routes in `server/src/routes/`
3. Register routes in `server/src/routes/index.ts`
4. Update `client/src/utils/axios.ts` endpoints if needed

## Useful Commands

```bash
# View PostgreSQL databases
psql -U postgres -l

# Connect to your database
psql -U postgres -d qurilish_db

# View tables
\dt

# View table structure
\d users

# Build for production
cd client && npm run build
cd server && npm run build
```

## Resources

- [Main README](README.md) - Full documentation
- [Server README](server/README.md) - Backend details
- [Database README](server/database/README.md) - Database info
- [Minimals Documentation](https://docs.minimals.cc/) - UI template docs

## Getting Help

If you encounter issues:

1. Check the logs in terminal
2. Review the troubleshooting section in [README.md](README.md)
3. Verify all prerequisites are installed
4. Ensure environment variables are correct

---

**Ready to start building!** 🚀
