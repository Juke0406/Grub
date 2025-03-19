# System Patterns: Grub

## System Architecture

Grub follows a modern web application architecture with distinct frontend and backend components:

```mermaid
graph TD
    subgraph "Frontend (Next.js)"
        UI[UI Components]
        Pages[Next.js Pages/App Router]
        ClientServices[Client Services]
        StoreManagement[Store Management]
    end

    subgraph "Backend (API Routes)"
        API[API Routes]
        Auth[Authentication]
        DB[Database Access]
    end

    subgraph "External Systems"
        MongoDB[(MongoDB Database)]
        ML[ML Prediction Service]
        EmailService[Email Service]
    end

    UI --> Pages
    Pages --> ClientServices
    Pages --> StoreManagement
    StoreManagement --> ClientServices
    ClientServices --> API
    API --> Auth
    API --> DB
    DB --> MongoDB
    API --> ML
    API --> EmailService
```

## Core Architectural Patterns

### 1. Component-Based Architecture

- Reusable UI components for consistent interfaces
- Components organized by domain (business, user, auth)
- Shared components for common functionality

### 2. Store-Based Architecture

- One store per user account
- Store profile in MongoDB collection
- Auto-creation on business portal access
- Store management through simple CRUD operations

### 3. Authentication & Authorization

- User authentication through API routes
- Store owner validation
- Simple store-specific permissions
- Basic owner-only access control

## Key Technical Decisions

### Frontend

- **Next.js Framework**: Server-side rendering and API routes
- **TypeScript**: Type safety and improved development
- **Tailwind CSS**: Utility-first styling
- **Shadcn UI**: Accessible component library
- **Better Auth Client**: Organization management

### Backend

- **Next.js API Routes**: Serverless functions
- **MongoDB**: Store and member data
- **Better Auth**: Organization plugin
- **Email Integration**: Staff invitations

## Core Design Patterns

### 1. Store Pattern

```mermaid
graph TD
    subgraph "Store Management"
        Store[Store]
        Owner[Store Owner]
        Profile[Store Profile]
        Settings[Store Settings]
    end

    subgraph "Data Management"
        Database[MongoDB]
        StoreData[Store Collection]
        Products[Products]
    end

    Owner --> Store
    Store --> Profile
    Store --> Settings
    Profile --> StoreData
    Settings --> StoreData
    StoreData --> Database
    Products --> Database
```

### 2. Repository Pattern

- Abstracts data access logic
- Centralized database operations
- Consistent data manipulation

### 3. Service Layer Pattern

```mermaid
graph TD
    subgraph "UI Layer"
        StoreDashboard[Store Dashboard]
        StoreSettings[Store Settings]
        ProductManagement[Product Management]
    end

    subgraph "Service Layer"
        StoreService[Store Service]
        ProductService[Product Service]
    end

    subgraph "Data Layer"
        Database[MongoDB]
        StoreCollection[Store Collection]
        ProductCollection[Product Collection]
    end

    StoreDashboard --> StoreService
    StoreSettings --> StoreService
    ProductManagement --> ProductService
    StoreService --> Database
    ProductService --> Database
    Database --> StoreCollection
    Database --> ProductCollection
```

### 4. React Hooks Pattern

- Custom hooks for store management
- State management through context
- Reusable organization logic

## Component Relationships

```mermaid
graph TD
    subgraph "Store Interface"
        Creation[Store Creation]
        Dashboard[Store Dashboard]
        StaffUI[Staff Interface]
        Settings[Store Settings]
    end

    subgraph "Business Logic"
        StoreService[Store Service]
        StaffService[Staff Service]
        InvitationService[Invitation Service]
        PermissionService[Permission Service]
    end

    subgraph "Data Access"
        OrgPlugin[Organization Plugin]
        StoreRepo[Store Repository]
        MemberRepo[Member Repository]
    end

    Creation --> StoreService
    Dashboard --> StoreService
    StaffUI --> StaffService
    Settings --> StoreService
    StoreService --> OrgPlugin
    StaffService --> OrgPlugin
    InvitationService --> OrgPlugin
    PermissionService --> OrgPlugin
    OrgPlugin --> StoreRepo
    OrgPlugin --> MemberRepo
```

## Data Flow Patterns

### Store Creation Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as Store Creation UI
    participant Auth as Better Auth
    participant DB as Database
    participant Email as Email Service

    User->>UI: Fill store details
    UI->>Auth: Create organization
    Auth->>DB: Store organization
    DB-->>Auth: Confirm creation
    Auth->>DB: Set user as owner
    Auth-->>UI: Return store data
    UI->>User: Show dashboard
```

### Staff Invitation Flow

```mermaid
sequenceDiagram
    participant Owner
    participant UI as Dashboard
    participant Auth as Better Auth
    participant DB as Database
    participant Email as Email Service
    participant Staff as New Staff

    Owner->>UI: Send invitation
    UI->>Auth: Create invitation
    Auth->>DB: Store invitation
    Auth->>Email: Send invite email
    Email->>Staff: Deliver invitation
    Staff->>UI: Accept invitation
    UI->>Auth: Verify & add member
    Auth->>DB: Update member status
```

## Error Handling Patterns

- Consistent error responses
- Role-based error boundaries
- Permission denial handling
- Invitation error management

## State Management

- Organization state through Better Auth
- Local UI state with React hooks
- Global app state via Context
- Server state with SWR

## Security Patterns

- Role-based access control
- Permission verification
- Secure invitation system
- Protected API routes

## Responsive Design Patterns

- Mobile-first store interfaces
- Adaptive dashboard layouts
- Responsive staff management
- Cross-device compatibility
- Adaptive dashboard layouts
- Responsive staff management
- Cross-device compatibility
