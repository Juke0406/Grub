#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up Gloria development environment...${NC}"

# Check for required tools
echo -e "\n${BLUE}Checking required tools...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js 20 or higher${NC}"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo -e "${BLUE}Installing pnpm...${NC}"
    npm install -g pnpm
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker Desktop${NC}"
    exit 1
fi

# Create environment files
echo -e "\n${BLUE}Creating environment files...${NC}"

# Auth Service
cat > services/auth-service/.env << EOF
DATABASE_URL=postgres://postgres:postgres@localhost:5432/gloria_auth
JWT_SECRET=local_development_secret
PORT=4001
EOF

# Item Service
cat > services/item-service/.env << EOF
DATABASE_URL=postgres://postgres:postgres@localhost:5432/gloria_items
JWT_SECRET=local_development_secret
PORT=4002
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=gloria-items
EOF

# Make scripts executable
chmod +x scripts/*.sh

# Install dependencies
echo -e "\n${BLUE}Installing dependencies...${NC}"
pnpm install

# Start infrastructure services
echo -e "\n${BLUE}Starting infrastructure services...${NC}"
pnpm start:infra

# Wait for services to be ready
echo -e "\n${BLUE}Waiting for services to be ready...${NC}"
./scripts/healthcheck.sh || true

# Initialize databases
echo -e "\n${BLUE}Initializing databases...${NC}"
pnpm db:init

# Generate and run migrations
echo -e "\n${BLUE}Running database migrations...${NC}"
pnpm generate
pnpm migrate

echo -e "\n${GREEN}Development environment setup complete!${NC}"
echo -e "\nYou can now start the services with: ${BLUE}pnpm dev${NC}"
echo -e "Access the services at:"
echo -e "  - Auth Service: ${BLUE}http://localhost:4001${NC}"
echo -e "  - Item Service: ${BLUE}http://localhost:4002${NC}"
echo -e "  - MinIO Console: ${BLUE}http://localhost:9001${NC}"
