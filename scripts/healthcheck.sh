#!/bin/bash
set -e

# Check PostgreSQL
pg_isready -h localhost -p 5432 -U postgres

# Check MinIO
curl -f http://localhost:9000/minio/health/live

# Check Auth Service
curl -f http://localhost:4001/

# Check Item Service
curl -f http://localhost:4002/

# Check Frontend
curl -f http://localhost:3000/

echo "All services are healthy!"
