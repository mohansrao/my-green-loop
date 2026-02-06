# Architecture & Tech Stack

## Architecture Overview
The project follows a modern **Single Page Application (SPA)** architecture with a decoupled **RESTful API** backend.

- **Frontend**: React-based SPA served via Vite.
- **Backend**: Node.js Express server handling API requests, business logic, and integrations.
- **Database**: PostgreSQL for persistent storage, managed via Drizzle ORM.
- **Infrastructure**: Designed to run in a containerized or managed environment (e.g., Replit, Node.js servers).

## Tech Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) (18.3.1)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [Radix UI](https://www.radix-ui.com/) primitives for accessible components.
- **State Management & Data Fetching**: [TanStack Query](https://tanstack.com/query/latest) (v5) for efficient API interaction and caching.
- **Routing**: [Wouter](https://github.com/molecula/wouter) (lightweight alternative to React Router).
- **Animations**: [Framer Motion](https://www.framer.com/motion/).
- **Icons**: [Lucide React](https://lucide.dev/).
- **Charts**: [Recharts](https://recharts.org/) for displaying impact analytics.

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Server Framework**: [Express](https://expressjs.com/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) for type-safe database interactions and migrations.
- **Authentication**: [Passport.js](https://www.passportjs.org/) (Local strategy).
- **Validation**: [Zod](https://zod.dev/) for schema-based validation on both frontend and backend.

### Database
- **Engine**: [PostgreSQL](https://www.postgresql.org/)
- **Drivers**: `@neondatabase/serverless` and `connect-pg-simple` for session management.

## Data Model (Schema)
The database consist of several key tables:
- `products`: Catalog items with descriptions, image URLs, and total stock.
- `inventory_dates`: Tracks available stock for specific products on specific calendar days.
- `rentals`: Customer order headers (name, dates, total amount, status).
- `rental_items`: Junction table connecting rentals to products with quantities.
- `feedback`: Customer reviews, ratings, and usage stats (plates/glasses/spoons used).
