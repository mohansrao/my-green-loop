# API & Integrations

## Third-Party Integrations

### Twilio (Messaging)
- **Service**: WhatsApp and SMS.
- **Purpose**: Order notifications, confirmation messages, and admin alerts.
- **Environment Variables**:
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`
  - `TWILIO_WHATSAPP_NUMBER`, `TWILIO_SMS_NUMBER`
  - `TWILIO_TEMPLATE_SID` (for WhatsApp templates)

### Nodemailer (Email)
- **Purpose**: Email notifications as a fallback or secondary channel for order confirmations.
- **Configuration**: Uses environment-based SMTP or service configuration.

### GitHub (Management)
- **Library**: `@octokit/rest`
- **Purpose**: Automated repository management (creation, user authentication). Used for project automation within Replit.

### Replit Connectors
- **Purpose**: Integration with Replit's environment for secrets and identity management.

### Metadata Fetcher
- **Library**: `cheerio`
- **Purpose**: Extracts OpenGraph tags (title, image, description) and YouTube metadata from external URLs to auto-populate content forms.

## Key API Endpoints

### Products
- `GET /api/products`: Retrieve all products in the catalog.

### Inventory
- `GET /api/inventory/available`: Check stock availability for a given date range.
- `GET /api/inventory/daily`: Get detailed daily stock breakdown.
- `GET /api/inventory/:date`: Get stock for a specific date.

### Rentals
- `GET /api/rentals`: List all rental orders (Admin).
- `POST /api/rentals`: Create a new rental order (handles inventory locking and notifications).
- `POST /api/calculate-price`: Dynamic pricing based on item quantities.

### Feedback & Analytics
- `POST /api/feedback`: Submit customer feedback.
- `GET /api/feedback`: Retrieve all feedback (Admin).
- `GET /api/feedback/public`: Retrieve approved feedback for the website.
- `PATCH /api/feedback/:id/visibility`: Toggle feedback visibility (Admin).
- `GET /api/feedback/analytics`: Get impact stats (items saved, average ratings).

### Content Hub
- `GET /api/content`: List resources with filters (category, type, sort, search).
- `GET /api/content/featured`: Get top curated/featured resources.
- `GET /api/categories`: List all content categories with icons.
- `POST /api/admin/content`: Create new resource (Admin).
- `POST /api/admin/content/fetch-metadata`: Scrape URL for auto-filling forms (Admin).
