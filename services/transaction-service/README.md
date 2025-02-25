# Transaction Service

Transaction management service for Gloria platform.

## Features

- Create and manage transactions
- Track transaction status
- User transaction history
- Transaction metrics
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

### Transactions

- `POST /transactions` - Create a new transaction
- `GET /transactions/:id` - Get transaction by ID
- `PATCH /transactions/:id` - Update transaction status
- `GET /users/:userId/transactions` - Get user's transactions (as buyer or seller)
- `GET /users/:userId/metrics` - Get user's transaction metrics

### Transaction Status Flow

1. `PENDING` - Initial state when transaction is created
2. `COMPLETED` - Transaction successfully completed
3. `CANCELLED` - Transaction cancelled by either party
4. `REFUNDED` - Transaction refunded to buyer

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection URL
- `PORT` - Server port (default: 4005)
- `NODE_ENV` - Environment mode (development/production)

## Database Schema

### transactions

- `id` - Serial primary key
- `buyer_id` - Buyer user ID
- `seller_id` - Seller user ID
- `item_id` - Item being transacted
- `amount` - Transaction amount (decimal)
- `status` - Transaction status enum
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
