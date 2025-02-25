-- Create databases
CREATE DATABASE gloria_users;
CREATE DATABASE gloria_transactions;

-- Connect to gloria_users and create extensions
\c gloria_users;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Connect to gloria_transactions and create extensions
\c gloria_transactions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant privileges
\c gloria_users;
GRANT ALL PRIVILEGES ON DATABASE gloria_users TO postgres;

\c gloria_transactions;
GRANT ALL PRIVILEGES ON DATABASE gloria_transactions TO postgres;

-- Create user and grant privileges (optional, for development)
-- CREATE USER gloria WITH PASSWORD 'gloria_password';
-- GRANT ALL PRIVILEGES ON DATABASE gloria_users TO gloria;
-- GRANT ALL PRIVILEGES ON DATABASE gloria_transactions TO gloria;
