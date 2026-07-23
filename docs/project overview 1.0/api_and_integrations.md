# API & Integrations

## Third-Party Integrations

### Twilio (SMS)
- **Service**: SMS via A2P 10DLC-compliant messaging.
- **Purpose**:
  1. Order placement — notifications sent to both admin and customer when a new rental is created.
  2. Status changes — customer is notified when their order status changes to `confirmed` or `completed` (fire-and-forget, non-blocking). Requires `customerPhone` to be set on the rental record; orders placed before this feature was added have a `NULL` phone and will not receive status SMS.
- **Admin number**: Stored in `app_settings` table (key: `admin_phone`), editable via Admin Settings UI. Falls back to hardcoded default if not set in DB.
- **Environment Variables**:
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`
  - `TWILIO_SMS_NUMBER` — the "from" number
  - `TWILIO_MESSAGING_SERVICE_SID` — for A2P 10DLC delivery
  - `DEBUG_TWILIO=true` — enables verbose logging + 30s delivery status check
- **SMS can be toggled off** via Admin Settings (`sms_notifications_enabled`) without touching code.

### Nodemailer (Email)
- **Purpose**: Order confirmation emails sent to both admin and customer on every new rental.
- **Admin email**: Stored in `app_settings` table (key: `admin_email`), editable via Admin Settings UI. Falls back to `ADMIN_EMAIL` env var.
- **Provider**: Configurable via `EMAIL_SERVICE` env var. Supported values: `gmail`, `yahoo`, `hotmail`, `outlook`. Defaults to `gmail`.
- **Environment Variables**:
  - `EMAIL_SERVICE` — email provider (`gmail`, `yahoo`, etc.)
  - `SMTP_USER` — sender email address
  - `SMTP_PASS` — app password (NOT your regular account password — generate one in account security settings)
  - `ADMIN_EMAIL` — fallback admin email if not set in DB
  - `FROM_EMAIL` — optional custom "from" address (defaults to `SMTP_USER`)
  - `DEBUG_EMAIL=true` — enables verbose logging
- **Note**: Email silently skips if `SMTP_USER`/`SMTP_PASS` are not set.

### GitHub (Management)
- **Library**: `@octokit/rest`
- **Purpose**: Automated repository management. Used for project automation within Replit.

### Metadata Fetcher
- **Library**: `cheerio`
- **Purpose**: Extracts OpenGraph tags (title, image, description) and YouTube metadata from external URLs to auto-populate Content Hub forms.

---

## Key API Endpoints

### Products
- `GET /api/products` — Retrieve all products in the catalog.

### Inventory
- `GET /api/inventory/available` — Check stock availability for a given date range.
- `GET /api/inventory/daily` — Get detailed daily stock breakdown.
- `GET /api/inventory/:date` — Get stock for a specific date.

### Rentals
- `GET /api/rentals` — List all rental orders (Admin).
- `GET /api/orders/recent` — All orders, most-recent first, with full detail (Admin). No row limit.
- `POST /api/rentals` — Create a new rental order (handles inventory locking, SMS, and email notifications).
- `PATCH /api/orders/:id/status` — Update order status. Requires `x-admin-key` header matching `ADMIN_PASSWORD`. Allowed values: `pending`, `confirmed`, `completed`, `cancelled`. Automatically sends a status-change SMS to the customer when status changes to `confirmed` or `completed` (if `customerPhone` is set and SMS is enabled).
- `POST /api/calculate-price` — Dynamic pricing based on item quantities.
- `GET /api/rentals/recent-impact` — Returns 6 most-recent confirmed/completed rentals for the Community Impact section on the home page (anonymised names).

### Feedback & Analytics
- `POST /api/feedback` — Submit customer feedback.
- `GET /api/feedback` — Retrieve all feedback (Admin).
- `GET /api/feedback/public` — Retrieve approved feedback for the website.
- `PATCH /api/feedback/:id/visibility` — Toggle feedback visibility (Admin).
- `GET /api/feedback/analytics` — Get impact stats (items saved, average ratings).
- `GET /api/analytics/impact` — Get aggregate environmental impact stats (waste diverted, CO₂ saved, water saved).

### Content Hub
- `GET /api/content` — List resources with filters (category, type, sort, search).
- `GET /api/content/featured` — Get top curated/featured resources.
- `GET /api/categories` — List all content categories with icons.
- `POST /api/admin/content` — Create new resource (Admin).
- `POST /api/admin/content/fetch-metadata` — Scrape URL for auto-filling forms (Admin).

### Admin Settings
- `GET /api/admin/settings` — Retrieve all app settings (merges DB values with defaults).
- `PUT /api/admin/settings` — Save one or more settings. Body: `[{ key, value }]`.

### Twilio Webhooks
- `POST /api/webhook/twilio/message` — Handles inbound Twilio SMS callbacks.

---

## Admin Authentication

The admin dashboard uses a two-layer auth approach:
1. **Frontend**: Password entered on `/admin/login` is checked client-side; `adminAuthenticated` and `adminLoginTime` are stored in `localStorage` with a 30-day TTL. `ProtectedAdminRoute` wraps all admin pages.
2. **Backend**: Mutation endpoints (e.g., status updates) additionally require an `x-admin-key` header. The login page stores the password as `adminKey` in `localStorage`; the frontend reads it and sends it with each mutation request.
