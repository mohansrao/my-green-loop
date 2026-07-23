# Architecture & Tech Stack

## Architecture Overview
The project follows a modern **Single Page Application (SPA)** architecture with a decoupled **RESTful API** backend.

- **Frontend**: React-based SPA served via Vite.
- **Backend**: Node.js Express server handling API requests, business logic, and integrations.
- **Database**: PostgreSQL for persistent storage, managed via Drizzle ORM.
- **Infrastructure**: Hosted on Replit with built-in PostgreSQL (Neon serverless).

## Tech Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) (18.3.1)
- **Build Tool**: [Vite](https://vitejs.dev/) (v7 — must stay on v7; `@vitejs/plugin-react` does not support v8)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [Radix UI](https://www.radix-ui.com/) primitives for accessible components.
- **State Management & Data Fetching**: [TanStack Query](https://tanstack.com/query/latest) (v5) for efficient API interaction and caching.
- **Routing**: [Wouter](https://github.com/molecula/wouter) (lightweight alternative to React Router).
- **Animations**: [Framer Motion](https://www.framer.com/motion/).
- **Icons**: [Lucide React](https://lucide.dev/).
- **Charts**: [Recharts](https://recharts.org/) for displaying impact analytics.

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (v20)
- **Server Framework**: [Express](https://expressjs.com/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) for type-safe database interactions and migrations.
- **Validation**: [Zod](https://zod.dev/) for schema-based validation on both frontend and backend.
- **Scraping**: [Cheerio](https://cheerio.js.org/) for fetching metadata from external content URLs.
- **Admin Auth**: Lightweight password-based guard using `x-admin-key` request header checked against `ADMIN_PASSWORD` env var (defaults to `"nachbaliye"`). Session persisted in `localStorage` for 30 days.

### Database
- **Engine**: [PostgreSQL](https://www.postgresql.org/) via Neon serverless
- **Drivers**: `@neondatabase/serverless` and `connect-pg-simple` for session management.

## Data Model (Schema)

### Core Rental Tables
- `products`: Catalog items with descriptions, image URLs, stock levels, and per-item CO₂/water savings.
- `inventory_dates`: Tracks available stock for specific products on specific calendar days.
- `rentals`: Customer order headers (name, email, phone, dates, total amount, status, delivery option). Includes `customerPhone` (nullable) for status-change SMS notifications.
- `rental_items`: Junction table connecting rentals to products with quantities.
- `feedback`: Customer reviews, ratings (1–5), photo URLs, and usage stats (plates/glasses/spoons used). Includes admin visibility control.

### Content Hub Tables
- `content_items`: Educational resources (articles, video links) with metadata, view/share/bookmark counts.
- `content_categories`: Taxonomy for organizing content (e.g., "Zero Waste", "Energy"). Includes `is_visible` flag.
- `content_category_mapping`: Many-to-many relationship between items and categories.
- `content_tags`: Flexible tagging system for granular content organization.
- `content_bookmarks`: User-saved content items (client-side localStorage for MVP; table reserved for future auth).

### Configuration Table
- `app_settings`: Key-value store for admin-configurable application settings. Keys: `admin_phone`, `admin_email`, `sms_notifications_enabled`, `email_notifications_enabled`, `max_rental_days`, `max_sets`. Values are editable via the Admin Settings UI without code changes.
