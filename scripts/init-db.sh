#!/bin/bash

# Create databases
psql -U postgres -c "CREATE DATABASE gloria_auth;"
psql -U postgres -c "CREATE DATABASE gloria_items;"

# Generate and run migrations for auth service
cd services/auth-service
pnpm generate
pnpm migrate

# Generate and run migrations for item service
cd ../item-service
pnpm generate
pnpm migrate
