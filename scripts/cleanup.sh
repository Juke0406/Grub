#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Cleaning up Gloria development environment...${NC}"

# Stop all containers
echo -e "\n${BLUE}Stopping all containers...${NC}"
docker compose down

# Remove Docker volumes
echo -e "\n${BLUE}Removing Docker volumes...${NC}"
docker volume rm gloria_postgres_data gloria_redis_data gloria_minio_data 2>/dev/null || true

# Remove node_modules
echo -e "\n${BLUE}Removing node_modules...${NC}"
rm -rf node_modules
rm -rf services/*/node_modules

# Remove build artifacts
echo -e "\n${BLUE}Removing build artifacts...${NC}"
rm -rf services/*/dist
rm -rf services/*/drizzle

# Remove environment files
echo -e "\n${BLUE}Removing environment files...${NC}"
rm -f services/*/.env

# Clean Docker system
echo -e "\n${BLUE}Cleaning Docker system...${NC}"
docker system prune -f

echo -e "\n${GREEN}Cleanup complete!${NC}"
echo -e "To set up the development environment again, run: ${BLUE}pnpm setup${NC}"
