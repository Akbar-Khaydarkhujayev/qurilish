# Qurilish - Full Stack Web Application

A modern full-stack web application built with React, TypeScript, Node.js, Express, and PostgreSQL.

## Project Structure

```
qurilish/
├── client/                 # Frontend application (React + TypeScript)
│   ├── src/
│   │   ├── auth/          # Authentication context and guards
│   │   ├── components/    # Reusable UI components
│   │   ├── layouts/       # Page layouts
│   │   ├── pages/         # Route entry points
│   │   ├── routes/        # Routing configuration
│   │   ├── sections/      # View components
│   │   ├── theme/         # MUI theme configuration
│   │   └── utils/         # Utility functions & axios config
│   └── package.json
│
├── server/                # Backend application (Node.js + Express)
│   ├── src/
│   │   ├── config/       # Configuration files (database, etc.)
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── types/        # TypeScript types
│   │   ├── utils/        # Utility functions
│   │   └── index.ts      # Entry point
│   ├── database/         # Database scripts
│   │   ├── init.sql     # Database initialization
│   │   └── migrations/  # Migration scripts
│   └── package.json
│
└── README.md             # This file
```

## Tech Stack

### Frontend
- **React 18.3.1** - UI library
- **TypeScript 5.4.5** - Type safety
- **Vite 5.3.0** - Build tool
- **Material-UI v5** - Component library
- **React Router v6** - Routing
- **Axios** - HTTP client
- **React Hook Form + Zod** - Form handling & validation
- **Framer Motion** - Animations

### Backend
- **Node.js** - Runtime environment
- **Express 5.2.1** - Web framework
- **TypeScript 5.9.3** - Type safety
- **PostgreSQL** - Database
- **pg 8.16.3** - PostgreSQL client
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Helmet** - Security headers
- **Morgan** - HTTP logging
- **CORS** - Cross-origin resource sharing

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)

## Getting Started

### 1. Clone and Install Dependencies

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 2. Database Setup

#### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE qurilish_db;

# Exit psql
\q
```

#### Initialize Database Schema

```bash
# Run the initialization script
psql -U postgres -d qurilish_db -f server/database/init.sql
```

**Note:** The current schema is basic (users table only). Replace [server/database/init.sql](server/database/init.sql) with your dbdiagram schema when ready.

### 3. Environment Configuration

#### Server Environment Variables

Update [server/.env](server/.env) with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=qurilish_db
DB_USER=postgres
DB_PASSWORD=your_actual_password

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_change_this
JWT_EXPIRES_IN=7d

# CORS Configuration
CLIENT_URL=http://localhost:8081
```

#### Client Environment Variables

The client [.env](client/.env) is already configured to connect to the local backend:

```env
VITE_SERVER_URL=http://localhost:5000
VITE_ASSET_URL=http://localhost:5000
```

### 4. Running the Application

#### Start Backend Server

```bash
cd server
npm run dev
```

The server will start at [http://localhost:5000](http://localhost:5000)

#### Start Frontend Application

```bash
cd client
npm run dev
```

The client will start at [http://localhost:8081](http://localhost:8081)

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/sign-up` | Register new user | No |
| POST | `/api/auth/sign-in` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health status |
| GET | `/` | API information |

### Request/Response Examples

#### Sign Up
```bash
POST /api/auth/sign-up
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}

Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "accessToken": "jwt_token_here"
}
```

#### Sign In
```bash
POST /api/auth/sign-in
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  },
  "accessToken": "jwt_token_here"
}
```

#### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer {accessToken}

Response:
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Development Scripts

### Client

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run fm:check     # Check formatting with Prettier
npm run fm:fix       # Fix formatting with Prettier
```

### Server

```bash
npm run dev          # Start development server with nodemon
npm run build        # Compile TypeScript to JavaScript
npm start            # Run production server
```

## Project Features

### Frontend Features
- JWT-based authentication with session management
- Protected routes with auth guards
- Role-based access control
- Responsive Material-UI design
- Dark/Light theme toggle
- RTL language support
- Form validation with React Hook Form + Zod
- Loading states and error handling
- Axios interceptors for API calls

### Backend Features
- RESTful API architecture
- JWT token authentication
- Password hashing with bcrypt
- PostgreSQL database integration
- Request validation
- Error handling middleware
- Security headers with Helmet
- CORS configuration
- HTTP request logging
- TypeScript for type safety

## Database Schema

### Current Schema (Basic)

The current schema includes a single `users` table:

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

### Replacing with Your Schema

Once you have your dbdiagram schema:

1. Export SQL from dbdiagram.io
2. Replace contents of [server/database/init.sql](server/database/init.sql)
3. Drop and recreate database (or create migration script)
4. Run the new schema

```bash
# Drop existing database
psql -U postgres -c "DROP DATABASE qurilish_db;"

# Create fresh database
psql -U postgres -c "CREATE DATABASE qurilish_db;"

# Run new schema
psql -U postgres -d qurilish_db -f server/database/init.sql
```

## Security Considerations

- JWT secrets should be strong and kept secure
- Never commit `.env` files to version control
- Database passwords should be complex
- Use HTTPS in production
- Implement rate limiting for API endpoints
- Validate and sanitize all user inputs
- Keep dependencies up to date

## Next Steps

1. **Update Database Schema**: Replace the basic schema with your dbdiagram schema
2. **Create Models**: Add database models based on your schema
3. **Build Controllers**: Implement business logic for your entities
4. **Create API Routes**: Define endpoints for your application features
5. **Build UI Components**: Create frontend components for your features
6. **Add Validation**: Implement input validation on both client and server
7. **Error Handling**: Enhance error handling and user feedback
8. **Testing**: Add unit and integration tests
9. **Documentation**: Document your API endpoints and components
10. **Deployment**: Configure for production deployment

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Verify PostgreSQL is running: `pg_ctl status`
2. Check database credentials in [server/.env](server/.env)
3. Ensure database exists: `psql -U postgres -l`
4. Check PostgreSQL logs for errors

### Port Already in Use

If port 5000 or 8081 is already in use:

```bash
# Change server port in server/.env
PORT=5001

# Change client port in client/vite.config.ts
server: { port: 8082 }
```

### CORS Errors

If you encounter CORS errors:

1. Verify CLIENT_URL in [server/.env](server/.env) matches your frontend URL
2. Ensure the backend is running before starting the frontend
3. Check browser console for specific CORS error messages

## Contributing

When adding new features:

1. Create feature branches from `main`
2. Follow TypeScript and ESLint rules
3. Test thoroughly before committing
4. Document new API endpoints
5. Update this README if needed

## License

ISC

## Support

For issues or questions, please create an issue in the project repository.
