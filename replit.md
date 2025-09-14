# BookingGen - Beautiful Booking Pages Generator

## Overview

BookingGen is a modern SaaS platform that allows freelancers, consultants, and service providers to create stunning, professional booking pages with integrated payment processing and smart scheduling. The application enables users to build custom booking experiences with personalized branding, automated appointment management, and comprehensive analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with Shadcn UI components for consistent design system
- **State Management**: React Query (TanStack Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Authentication**: Custom JWT-based authentication with local storage persistence

### Backend Architecture
- **Server Framework**: Express.js with serverless-compatible API routes
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT tokens with bcrypt password hashing
- **File Structure**: Modular design with separate routes, storage, and schema layers
- **Development Server**: Vite middleware integration for seamless development experience

### Database Design
- **Primary Database**: PostgreSQL with Neon serverless driver
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Core Tables**:
  - `users`: Basic user authentication data
  - `profiles`: Extended user information and membership status
  - `pages`: Booking page configurations with customization options
  - `services`: Service offerings linked to booking pages
  - `appointments`: Booking records with customer information
  - `paymentsDemo`: Payment transaction records

### Authentication & Authorization
- **Strategy**: JWT-based authentication with server-side verification
- **Password Security**: bcrypt hashing with salt rounds
- **Session Management**: Token-based sessions stored in localStorage
- **Route Protection**: AuthGuard component for protected routes
- **User Roles**: Profile-based membership levels (free/pro)

### Payment Processing
- **Provider**: Razorpay integration for secure payment handling
- **Architecture**: Server-side order creation and verification
- **Security**: API keys separated between client-safe and server-only
- **Implementation**: Razorpay SDK integration with custom checkout flow

### File Upload & Storage
- **Provider**: Supabase Storage for logo and asset management
- **Integration**: Direct upload capabilities for booking page customization
- **Asset Management**: URL-based file references in database schema

### UI/UX Design System
- **Component Library**: Radix UI primitives with custom styling
- **Design Tokens**: CSS custom properties for consistent theming
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Accessibility**: ARIA-compliant components and keyboard navigation
- **Dark Mode**: Built-in theme switching capabilities

## External Dependencies

### Database & Backend Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Supabase**: Authentication services and file storage infrastructure

### Payment Processing
- **Razorpay**: Payment gateway for order creation, processing, and verification
- **Integration**: Live API keys for production payment handling

### Development & Build Tools
- **Vite**: Build tool and development server with HMR
- **TypeScript**: Type safety across frontend and backend
- **Drizzle Kit**: Database migration and schema management
- **ESBuild**: Backend bundling for production deployment

### UI & Component Libraries
- **Radix UI**: Headless component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **React Hook Form**: Form state management and validation

### Deployment & Hosting
- **Vercel**: Serverless deployment platform with API routes
- **Environment Variables**: Secure configuration management for API keys
- **Static Assets**: CDN-optimized delivery for frontend resources

### Third-party Integrations
- **Google Fonts**: Typography with Inter font family
- **Calendar Integration**: External calendar linking capabilities
- **Email Services**: Appointment confirmation and notification system (planned)