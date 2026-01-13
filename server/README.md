# Qurilish Backend Server

Node.js + Express + TypeScript + PostgreSQL backend server.

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── database.ts          # PostgreSQL connection pool
│   ├── controllers/
│   │   └── auth.controller.ts   # Authentication logic
│   ├── middleware/
│   │   ├── auth.ts              # JWT authentication middleware
│   │   └── errorHandler.ts     # Error handling middleware
│   ├── models/                  # Database models (add your models here)
│   ├── routes/
│   │   ├── auth.routes.ts       # Auth routes
│   │   └── index.ts             # Main router
│   ├── services/                # Business logic services
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── utils/
│   │   └── jwt.ts               # JWT utilities
│   └── index.ts                 # Application entry point
│
├── database/
│   ├── init.sql                 # Database initialization script
│   ├── migrations/              # Database migrations
│   └── seeds/                   # Seed data (optional)
│
├── .env                         # Environment variables
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── nodemon.json                 # Nodemon configuration
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express 5.2.1** - Web framework
- **TypeScript 5.9.3** - Static typing
- **PostgreSQL** - Relational database
- **pg 8.16.3** - PostgreSQL client for Node.js
- **jsonwebtoken** - JWT authentication
- **bcrypt** - Password hashing
- **helmet** - Security middleware
- **cors** - Cross-origin resource sharing
- **morgan** - HTTP request logger
- **dotenv** - Environment variable management
- **ts-node** - TypeScript execution for Node.js
- **nodemon** - Development auto-reload

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy [.env.example](.env.example) to `.env` and update with your values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=qurilish_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# CORS Configuration
CLIENT_URL=http://localhost:8081
```

### 3. Set Up Database

```bash
# Create database
psql -U postgres -c "CREATE DATABASE qurilish_db;"

# Run initialization script
psql -U postgres -d qurilish_db -f database/init.sql
```

### 4. Start Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm run build
npm start
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with nodemon |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run compiled production server |

## API Endpoints

### Authentication Endpoints

#### Sign Up
```http
POST /api/auth/sign-up
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "accessToken": "jwt_token"
}
```

#### Sign In
```http
POST /api/auth/sign-in
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  },
  "accessToken": "jwt_token"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Health Check

```http
GET /api/health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## Middleware

### Authentication Middleware

Located in [src/middleware/auth.ts](src/middleware/auth.ts)

#### `authenticate`
Verifies JWT token from Authorization header.

```typescript
import { authenticate } from '../middleware/auth';

router.get('/protected-route', authenticate, controller);
```

#### `authorize`
Restricts access based on user roles.

```typescript
import { authenticate, authorize } from '../middleware/auth';

router.post('/admin-only', authenticate, authorize('admin'), controller);
```

### Error Handler Middleware

Located in [src/middleware/errorHandler.ts](src/middleware/errorHandler.ts)

- `errorHandler` - Catches and formats errors
- `notFoundHandler` - Handles 404 errors

## Database

### Current Schema

The basic schema includes a users table:

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Working with Database

#### Direct Query Example

```typescript
import pool from '../config/database';

// Query example
const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
const user = result.rows[0];
```

#### Adding New Tables

1. Add SQL to [database/init.sql](database/init.sql)
2. Create a migration file in `database/migrations/`
3. Run the migration against your database

## Adding New Features

### 1. Create Controller

Create a new controller in `src/controllers/`:

```typescript
// src/controllers/example.controller.ts
import { Request, Response } from 'express';
import pool from '../config/database';

export const getItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM items');
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
```

### 2. Create Routes

Create routes in `src/routes/`:

```typescript
// src/routes/example.routes.ts
import { Router } from 'express';
import { getItems } from '../controllers/example.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/items', authenticate, getItems);

export default router;
```

### 3. Register Routes

Add to [src/routes/index.ts](src/routes/index.ts):

```typescript
import exampleRoutes from './example.routes';

router.use('/example', exampleRoutes);
```

## Security Best Practices

- Always hash passwords with bcrypt
- Use parameterized queries to prevent SQL injection
- Validate and sanitize all user inputs
- Keep JWT_SECRET secure and complex
- Use HTTPS in production
- Implement rate limiting
- Keep dependencies updated
- Use environment variables for sensitive data
- Never commit `.env` files

## Error Handling

The server uses centralized error handling:

```typescript
// In your controller
try {
  // Your logic
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ message: 'Server error' });
}
```

## TypeScript Types

Define types in [src/types/index.ts](src/types/index.ts):

```typescript
export interface YourType {
  id: string;
  name: string;
}
```

## Debugging

### Enable Verbose Logging

Set in `.env`:
```
NODE_ENV=development
```

### Database Connection Issues

1. Check PostgreSQL is running
2. Verify credentials in `.env`
3. Check database exists
4. Review PostgreSQL logs

### View Logs

Morgan logs all HTTP requests in development mode.

## Production Deployment

### 1. Build TypeScript

```bash
npm run build
```

### 2. Set Environment Variables

Update production `.env` with:
- Strong JWT_SECRET
- Production database credentials
- NODE_ENV=production
- Production CLIENT_URL

### 3. Start Server

```bash
npm start
```

### 4. Additional Production Setup

- Use a process manager (PM2, systemd)
- Set up SSL/TLS certificates
- Configure reverse proxy (nginx)
- Implement rate limiting
- Set up monitoring and logging
- Regular database backups

## Testing

Add tests for your controllers and routes:

```bash
npm install --save-dev jest @types/jest supertest @types/supertest

# Add test script to package.json
"test": "jest"
```

## Contributing

When adding new features:

1. Follow the existing project structure
2. Use TypeScript types
3. Add error handling
4. Validate user inputs
5. Document your endpoints
6. Test thoroughly

## License

ISC
# qurilish
