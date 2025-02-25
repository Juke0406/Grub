# User Service

User management service for Gloria platform.

## Features

- User registration and authentication
- Profile management
- User search
- Redis caching for improved performance
- PostgreSQL database for data persistence

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

3. Update the environment variables in `.env` with your configuration.

4. Generate database migrations:

```bash
pnpm generate
```

5. Run database migrations:

```bash
pnpm migrate
```

## Development

Start the service in development mode:

```bash
pnpm dev
```

## API Endpoints

### Users

- `POST /users` - Create a new user
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `GET /users/username/:username` - Get user by username
- `GET /users/email/:email` - Get user by email

### Authentication

- `POST /users/:id/change-password` - Change user password
- `POST /users/:id/verify-password` - Verify user password

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection URL
- `REDIS_URL` - Redis connection URL
- `PORT` - Server port (default: 4004)
- `NODE_ENV` - Environment mode (development/production)
