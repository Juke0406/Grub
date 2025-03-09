# Grub - Food Waste Reduction Platform

Grub is a modern web application designed to combat food waste by connecting consumers with bakeries and supermarkets to purchase surplus food items at discounted prices. The platform facilitates last-minute food reservations while helping businesses reduce waste and maintain profitability.

## Overview

The application serves three main user types:

- **Consumers**: End users looking to purchase discounted food items
- **Bakeries**: Business users who can list surplus bread and bundle offerings
- **Supermarkets**: Large-scale retailers who can integrate via API to list their items

## Technical Stack

### Frontend

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Shadcn/ui Components
- React Query
- Zustand (State Management)

### Backend Infrastructure

- Envoy (API Gateway/Service Mesh)
- Apache Kafka & Zookeeper (Event Streaming)
- Redis (Caching/Session Management)
- PostgreSQL (Primary Database)
- Docker & Kubernetes (Containerization & Orchestration)

### Microservices Architecture

1. **Authentication Service**

   - User authentication and authorization
   - JWT token management
   - Role-based access control
   - Session management with Redis

2. **Reservation Service**

   - Handles food item reservations
   - Manages pickup windows
   - User rating system
   - Real-time availability updates

3. **Listing Service**

   - Product catalog management
   - Price management
   - Inventory tracking
   - Bundle creation and management

4. **Prediction Service**

   - Demand forecasting
   - Price optimization
   - Trend analysis
   - Integration with ML Algorithm Service

5. **Creation Service**

   - Business onboarding
   - Product creation and updates
   - Bundle generation
   - Category management

6. **ML Algorithm Service**

   - Machine learning model training
   - Predictive analytics
   - Inventory optimization
   - Sales forecasting

7. **API Management Service**
   - API versioning
   - Rate limiting
   - Documentation
   - Third-party integration management

### Message Patterns

- Event-driven architecture using Kafka
- Request-response via REST APIs
- Real-time updates via WebSocket
- Async processing for ML operations

## Features

### For Consumers

- FCFS (First Come, First Served) reservation system
- Browse available items from bakeries and supermarkets
- View discounted prices and pickup windows
- Reputation system tracking pickup reliability
- Active reservation management

### For Bakeries

- Bundle management system
- Product listing with:
  - Regular/discounted pricing
  - Sale periods
  - Pickup windows
- Dashboard with sales analytics
- ML-based inventory suggestions

### For Supermarkets

- RESTful API integration
- Bulk item listing
- Automated price adjustment system
- Real-time inventory sync

## Project Structure

```bash
gloria/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # App router pages
│   ├── components/          # Reusable React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and store
│   └── public/             # Static assets
├── services/
│   ├── auth-service/       # Authentication microservice
│   ├── reservation-service/# Reservation management
│   ├── listing-service/    # Product listing and management
│   ├── prediction-service/ # Demand prediction and analytics
│   ├── creation-service/   # Product/bundle creation
│   ├── ml-service/        # Machine learning algorithms
│   └── api-service/       # API gateway and management
├── infrastructure/
│   ├── envoy/             # Service mesh configuration
│   ├── kafka/             # Event streaming setup
│   ├── redis/             # Caching layer
│   └── kubernetes/        # K8s deployment configs
└── docs/                  # Documentation
```

## Setup Instructions

### Prerequisites

- Docker & Docker Compose
- Kubernetes cluster
- Node.js 18+
- pnpm
- kubectl

### Development Setup

1. Clone the repository

    ```bash
    git clone [repository-url]
    cd gloria
    ```

2. Install frontend dependencies

    ```bash
    cd frontend
    pnpm install
    ```

3. Set up environment variables

    ```bash
    # Frontend
    cp frontend/.env.example frontend/.env.local

    # Services
    cp services/auth-service/.env.example services/auth-service/.env
    cp services/reservation-service/.env.example services/reservation-service/.env
    # ... repeat for other services
    ```

4. Start infrastructure services

    ```bash
    docker compose -f infrastructure/docker-compose.yml up -d
    ```

5. Deploy microservices (development)

    ```bash
    kubectl apply -f infrastructure/kubernetes/dev/
    ```

6. Run the frontend development server

    ```bash
    cd frontend
    pnpm dev
    ```

The application will be available at `http://localhost:3000`

### Production Deployment

1. Build service images

    ```bash
    docker compose -f infrastructure/docker-compose.prod.yml build
    ```

2. Deploy to Kubernetes

    ```bash
    kubectl apply -f infrastructure/kubernetes/prod/
    ```

## API Documentation

### Service APIs

All services expose RESTful APIs documented using OpenAPI (Swagger).

Base URLs:

- Auth Service: `/api/auth/v1`
- Reservation Service: `/api/reservations/v1`
- Listing Service: `/api/listings/v1`
- Prediction Service: `/api/predictions/v1`
- Creation Service: `/api/creation/v1`
- ML Service: `/api/ml/v1`

### Supermarket Integration API

Base URL: `/api/integration/v1`

#### Authentication

All API requests must include an `Authorization` header with a valid API key:

```bash
Authorization: Bearer <api_key>
```

#### Endpoints

##### List Items

```bash
POST /items/bulk
Content-Type: application/json

{
  "items": [
    {
      "sku": string,
      "name": string,
      "originalPrice": number,
      "discountedPrice": number,
      "quantity": number,
      "expiryDate": string,
      "pickupWindow": {
        "start": string,
        "end": string
      }
    }
  ]
}
```

##### Update Item Availability

```bash
PATCH /items/{sku}
Content-Type: application/json

{
  "quantity": number,
  "available": boolean
}
```

## Development Guidelines

### Code Style

- Follow the ESLint configuration
- Use TypeScript strictly with no `any` types
- Follow the [Next.js App Router best practices](https://nextjs.org/docs/app)
- Implement Clean Architecture principles in microservices
- Use Domain-Driven Design where applicable

### Component Structure

- Use Shadcn/ui components for consistent UI
- Implement atomic design principles
- Create reusable components in `components/`
- Place page-specific components within their page directories

### State Management

- Use Zustand for frontend global state
- Implement React Query for server state
- Utilize React Context sparingly
- Implement Event Sourcing with Kafka
- Use Redis for distributed caching

### Git Workflow

- Feature branches should branch from `main`
- Use conventional commits
- Keep PRs focused and reasonably sized
- Ensure CI passes before merging

## Testing

### Frontend Testing

```bash
cd frontend
pnpm test        # Run unit tests
pnpm test:e2e   # Run end-to-end tests
```

### Service Testing

```bash
# Run tests for individual services
cd services/auth-service
pnpm test

cd services/reservation-service
pnpm test
# ... repeat for other services

# Run integration tests
cd infrastructure
./run-integration-tests.sh
```

### Load Testing

```bash
cd infrastructure/k6
k6 run load-tests.js
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request
