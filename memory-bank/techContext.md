# Technical Context: Grub

## Technologies Used

### Frontend

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Component Library**: Shadcn UI
- **State Management**: React Context API, SWR/React Query
- **Form Handling**: React Hook Form
- **Animation**: Framer Motion

### Backend

- **API Routes**: Next.js API Routes
- **Authentication**: Better Auth
- **Database**: MongoDB
- **ORM/ODM**: Mongoose
- **Data Validation**: Zod
- **API Integration**: Axios

### DevOps & Infrastructure

- **Version Control**: Git
- **Package Management**: npm/pnpm
- **Deployment**: Vercel/Netlify (potential)
- **CI/CD**: GitHub Actions (potential)

### ML/Analytics Components

- **Prediction Models**: Simple forecasting (TBD)
- **Data Analysis**: Basic analytics framework

## Development Setup

### Required Tools

- Node.js (v18+ recommended)
- npm/pnpm
- Git
- MongoDB (local instance or Atlas)
- IDE with TypeScript support (VSCode recommended)

### Environment Configuration

```env
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Database
MONGODB_URI=mongodb://localhost:27017/grub
DEFAULT_DATABASE=grub
```

### Local Development Process

1. Clone repository
2. Install dependencies `npm install` / `pnpm install`
3. Configure environment variables
4. Run development server `npm run dev` / `pnpm dev`
5. Access at `http://localhost:3000`

## Technical Constraints

### Store System

1. **Authentication Constraints**

   - User must be authenticated to access business portal
   - One store per user account
   - Store owner has full control

2. **Data Model Constraints**

   - Store profile stored in MongoDB collection
   - Auto-creation of store on first business portal access
   - Simple CRUD operations for store management

3. **Permission Constraints**
   - Single owner access model
   - Owner has full control over store
   - No staff management required

### Performance Constraints

- **Mobile Performance**: Must be optimized for mobile devices with potentially slow connections
- **Real-time Updates**: Reservation statuses need to update in near real-time
- **Geolocation**: Efficient distance calculations for finding nearby food items

### Security Constraints

- **User Data Protection**: Compliant with data privacy regulations
- **Authentication**: Secure login and session management
- **API Security**: Protected endpoints with proper authorization

### Scalability Constraints

- **Single Store Model**: One store per user account
- **Geographic Expansion**: Design should account for expansion to multiple regions
- **Seasonal/Time-Based Load**: System must handle peak usage times

### Integration Constraints

- **Supermarket APIs**: Flexible integration with various inventory systems
- **Notification Systems**: Integration with email/SMS providers
- **Maps/Location Services**: Integration with mapping services
- **Payment Processing**: Support for multiple payment methods

## Dependencies

### Frontend Dependencies

```json
{
  "dependencies": {
    "@headlessui/react": "^1.7.0",
    "@heroicons/react": "^2.0.0",
    "axios": "^1.3.0",
    "next-auth": "^4.0.0",
    "class-variance-authority": "^0.5.0",
    "clsx": "^1.2.0",
    "framer-motion": "^10.0.0",
    "next": "^13.4.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.45.0",
    "swr": "^2.1.0",
    "tailwindcss": "^3.3.0",
    "zod": "^3.21.0"
  },
  "devDependencies": {
    "@types/node": "^18.15.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Backend Dependencies

- MongoDB Atlas or self-hosted MongoDB instance
- Better Auth for authentication
- SMTP email service (e.g., Gmail)
- Storage services for images (if applicable)

## Cross-Cutting Concerns

### Store Management

- **Store Profile**: MongoDB collection based
- **Access Control**: Single owner model
- **Store Settings**: Basic configuration properties
- **Auto Creation**: First portal access triggers creation

### Accessibility

- WCAG 2.1 AA compliance target
- Keyboard navigation support
- Screen reader compatibility
- Focus management for modals and dynamic content

### Internationalization

- Translation infrastructure in place
- Date/time formatting for different locales
- Currency display adaptable to different regions
- Multi-language store support (planned)

### Error Handling

- Generic error boundaries
- Store operation error recovery
- API error handling
- Data validation errors

### Monitoring & Analytics

- Store performance tracking
- Error tracking and logging
- User behavior analytics

## Technical Roadmap

### Phase 1: Store System (Completed)

- ✅ Basic store implementation
- ✅ Store profile management
- ✅ Store dashboard
- ✅ Settings configuration

### Phase 2: Store Operations (In Progress)

- 🟡 Product management system
- 🟡 Inventory tracking
- 🟡 Order processing
- ⬜ Analytics implementation

### Phase 3: Enhanced Features (Planned)

- ⬜ Advanced analytics
- ⬜ Automated inventory management
- ⬜ Integration APIs
