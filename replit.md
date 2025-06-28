# Eco-Friendly Dining Rentals Application

## Overview

This is a full-stack web application for an eco-friendly dining rental service called "My Green Loop". The application allows customers to browse, select, and rent sustainable tableware (plates, glasses, cutlery) for events. It features a modern React frontend with a Node.js/Express backend, PostgreSQL database, and integrates with Twilio for SMS notifications.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with Tailwind CSS styling
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: tsx for TypeScript execution in development

### Database Architecture
- **Database**: PostgreSQL (Neon serverless database)
- **Schema Management**: Drizzle migrations
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Database Schema
- **products**: Stores rental items (plates, glasses, cutlery) with category, description, stock levels
- **rentals**: Customer rental orders with dates, delivery options, and status tracking
- **rental_items**: Line items linking rentals to specific products and quantities
- **inventory_dates**: Daily inventory tracking for availability calculations

### API Endpoints
- **Products**: GET /api/products - Retrieve all available products
- **Inventory**: GET /api/inventory/available - Calculate available stock for date ranges
- **Rentals**: POST /api/rentals - Create new rental orders
- **Price Calculation**: POST /api/calculate-price - Calculate rental pricing
- **Twilio Webhooks**: POST /api/webhook/twilio/message - Handle SMS notifications

### Frontend Pages
- **Home**: Landing page with eco-friendly messaging
- **Catalog**: Product browsing with date selection and inventory checking
- **Checkout**: Customer information and rental confirmation
- **Thank You**: Order confirmation page
- **Admin Dashboard**: Inventory management interface

## Data Flow

1. **Product Discovery**: Users browse products on the catalog page
2. **Date Selection**: Calendar picker allows users to select rental dates (max 5 days)
3. **Inventory Check**: Real-time availability checking against date-specific inventory
4. **Cart Management**: Session-based cart storage with quantity validation
5. **Checkout Process**: Customer form submission with delivery scheduling
6. **Order Processing**: Rental creation with automatic SMS notifications via Twilio
7. **Inventory Updates**: Automatic stock deduction based on rental dates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **twilio**: SMS notification service
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling and validation
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **date-fns**: Date manipulation utilities

### Development Dependencies
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production
- **vite**: Frontend build tool and dev server

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Database**: PostgreSQL 16 module
- **Port Configuration**: Development server on port 5000
- **Hot Reload**: Vite HMR with Express middleware integration

### Production Deployment
- **Target**: Google Cloud Run
- **Build Process**: 
  1. Frontend build with Vite (outputs to dist/public)
  2. Backend build with esbuild (outputs to dist/index.js)
- **Environment**: NODE_ENV=production
- **Database**: Neon serverless PostgreSQL with connection pooling

### Configuration Management
- **Environment Variables**: Comprehensive logging of secret variables on startup
- **Twilio Integration**: Environment-specific phone numbers and API credentials
- **Database**: Automatic connection string validation and pool management

## Recent Changes

### June 28, 2025 - Privacy Policy and Legal Compliance Implementation
- Created comprehensive Privacy Policy page at `/privacy-policy` addressing A2P 10DLC compliance requirements
- Implemented Terms of Service page at `/terms-of-service` with SMS consent language
- Added footer navigation links to legal pages for easy accessibility
- Included TCPA, CAN-SPAM, and GDPR compliance statements
- Added detailed SMS messaging consent and opt-out procedures
- Contact information provided: privacy@mygreenloop.com
- Resolved Twilio A2P 10DLC registration blocker - privacy policy now compliant

### June 19, 2025 - Enhanced Admin Dashboard with Real Data
- Enhanced admin dashboard with comprehensive statistics and real data calculations
- Added search functionality across orders, customers, and inventory
- Implemented filtering systems for order status (pending, confirmed, completed) and date ranges
- Built inventory management with product search, category filters, and stock level monitoring
- Created color-coded statistics cards with hover effects and professional presentation
- Added low-stock alerts and inventory tracking capabilities

### June 19, 2025 - Password-Protected Admin Dashboard
- Created secure admin login system with password "admin123"
- Built comprehensive admin dashboard with three main sections:
  - Orders management with real-time stats and order tracking
  - Notifications page for order alerts
  - Inventory dashboard for stock management
- Added admin navigation bar and 24-hour session management
- Admin access button added to main site navigation
- Implemented protected routes requiring authentication

### June 19, 2025 - SMS Notification System Analysis
- SMS messages queue successfully but fail delivery due to error 30034
- Root cause: Twilio account requires A2P 10DLC registration for US SMS delivery
- Implemented A2P compliant message formatting for better carrier acceptance
- Created comprehensive fix guide in TWILIO_SMS_FIX.md with registration steps
- Admin dashboard provides reliable order tracking alternative until SMS is resolved

### June 19, 2025 - Initial setup
- Core application architecture established

## User Preferences

Preferred communication style: Simple, everyday language.