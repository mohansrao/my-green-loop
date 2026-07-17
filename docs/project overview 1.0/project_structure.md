# Project Structure & Directory Layout

## Directory Structure Overview

```text
.
├── client/                 # React Frontend application
│   ├── public/
│   │   ├── images/         # Product images (stainless steel plates, glasses, cutlery)
│   │   └── flyer-draft.html # Marketing flyer draft (HTML, for review/print)
│   └── src/
│       ├── components/
│       │   ├── admin/
│       │   │   └── admin-nav.tsx       # Admin dashboard top navigation bar
│       │   ├── layout/
│       │   │   ├── header.tsx          # Site-wide header
│       │   │   ├── footer.tsx          # Site-wide footer
│       │   │   └── layout.tsx          # Page wrapper
│       │   ├── ContentCard.tsx         # Resource content display card
│       │   ├── delivery-scheduler.tsx  # Delivery date/time picker
│       │   ├── ImpactCounter.tsx       # Animated impact stat counter
│       │   ├── customer-reviews-section.tsx
│       │   └── ui/                     # Shadcn base components
│       ├── hooks/
│       │   ├── use-mobile.tsx
│       │   └── use-toast.ts
│       ├── lib/
│       │   ├── admin-auth.tsx          # useAdminAuth hook + ProtectedAdminRoute
│       │   ├── queryClient.ts          # TanStack Query client + apiRequest helper
│       │   ├── types.ts
│       │   └── utils.ts
│       ├── pages/
│       │   ├── home.tsx                # Landing page (Why It Matters, Community Impact)
│       │   ├── catalog.tsx             # Product browsing + date dropdown selectors
│       │   ├── checkout.tsx            # Order form (dual CTA buttons)
│       │   ├── thank-you.tsx           # Order confirmation page
│       │   ├── feedback.tsx            # Customer feedback submission form
│       │   ├── reviews.tsx             # Public reviews page
│       │   ├── Impact.tsx              # Environmental impact dashboard
│       │   ├── Resources.tsx           # Public Content Hub
│       │   ├── MyBookmarks.tsx         # User's saved resources
│       │   ├── privacy-policy.tsx
│       │   ├── terms-of-service.tsx
│       │   ├── not-found.tsx
│       │   ├── AdminAddContent.tsx     # Admin: add content resource
│       │   ├── AdminContentList.tsx    # Admin: manage content resources
│       │   └── admin/
│       │       ├── login.tsx           # Admin password login
│       │       ├── orders.tsx          # Orders list, detail modal, status management
│       │       ├── inventory-dashboard.tsx
│       │       ├── notifications.tsx
│       │       ├── feedback-management.tsx
│       │       ├── AdminCategories.tsx # Content category management
│       │       └── settings.tsx        # App configuration (phone, email, toggles)
│       ├── App.tsx                     # Route definitions
│       └── main.tsx                    # React DOM entry point
├── server/
│   ├── routes/
│   │   └── twilio.ts                   # Twilio webhook sub-router
│   ├── services/
│   │   ├── twilio.ts                   # SMS notifications (A2P 10DLC compliant)
│   │   ├── email.ts                    # Email notifications (multi-provider)
│   │   ├── impact-analytics.ts         # Aggregate impact stat calculations
│   │   └── metadata-fetcher.ts         # URL metadata scraper (Cheerio)
│   ├── index.ts                        # Server entry point & middleware
│   └── routes.ts                       # All API route definitions
├── db/
│   ├── index.ts                        # Drizzle client initialization
│   ├── schema.ts                       # All table definitions & relations
│   └── seed-categories.ts              # Content category seed script
├── docs/                               # Project documentation (this folder)
├── scripts/
│   └── post-merge.sh                   # Runs npm install + db:push after task merges
├── drizzle.config.ts
├── package.json
├── tailwind.config.ts
├── theme.json                          # Shadcn theme (primary color, radius, appearance)
└── tsconfig.json
```

## Development Guide

### Database Changes
Modify `db/schema.ts` and run `npm run db:push` to sync with the database. Never write raw SQL migrations.

### New API Routes
Add new endpoints in `server/routes.ts` or create a new sub-router in `server/routes/`.

### Admin-Protected Mutations
Use the `requireAdmin` middleware for any mutation endpoint that should be restricted to admins. It checks the `x-admin-key` request header against `process.env.ADMIN_PASSWORD`.

### UI Components
Uses **Shadcn UI**. New components go in `client/src/components/ui/` and follow Tailwind CSS + Lucide icon conventions.

### Notifications
All notification logic lives in `server/services/`. Never call Twilio or Nodemailer directly from routes — always go through the service layer. Both SMS and email recipients are now read from `app_settings` in the DB at send time.

### App Settings
Runtime configuration (admin phone, admin email, feature toggles) is stored in the `app_settings` table and managed via the Admin Settings UI at `/admin/settings`. Defaults are defined in `DEFAULT_SETTINGS` inside `server/routes.ts`.

### Vite Version
**Do not upgrade Vite past v7.** The `@vitejs/plugin-react` package does not support Vite v8+. The `package.json` should keep `"vite": "^7.x.x"`.

### Environment Variables
Required secrets (managed via Replit Secrets, not `.env` files in production):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `TWILIO_ACCOUNT_SID` | Twilio credentials |
| `TWILIO_AUTH_TOKEN` | Twilio credentials |
| `TWILIO_SMS_NUMBER` | Twilio "from" number |
| `TWILIO_MESSAGING_SERVICE_SID` | A2P 10DLC messaging service |
| `EMAIL_SERVICE` | Email provider: `gmail`, `yahoo`, `hotmail`, `outlook` |
| `SMTP_USER` | Sender email address |
| `SMTP_PASS` | Email app password |
| `ADMIN_PASSWORD` | Admin dashboard password (default: `nachbaliye`) |
| `DEBUG_TWILIO` | Set to `true` for verbose SMS logging |
| `DEBUG_EMAIL` | Set to `true` for verbose email logging |
