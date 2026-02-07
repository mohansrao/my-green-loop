# Project Structure & Directory Layout

## Directory Structure Overview

```text
.
├── client/                 # React Frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components (Shadcn UI)
│   │   │   ├── ContentCard.tsx # Resource content display card
│   │   │   └── ui/         # Shadcn base components
│   │   ├── hooks/          # Custom React hooks (e.g., use-mobile)
│   │   ├── lib/            # Utility functions (queryClient, utils)
│   │   ├── pages/          # Page-level components
│   │   │   ├── Resources.tsx       # Public Content Hub page
│   │   │   ├── MyBookmarks.tsx     # User's saved resources
│   │   │   ├── AdminContentList.tsx # Admin content management
│   │   │   └── AdminAddContent.tsx  # Admin content creation
│   │   ├── App.tsx         # Main application entry point & routing
│   │   └── main.tsx        # React DOM entry point
├── server/                 # Express Backend application
│   ├── routes/             # Sub-routers (e.g., Twilio webhooks)
│   ├── services/           # External service integrations
│   │   ├── metadata-fetcher.ts # Content metadata scraping service
│   │   ├── email.ts        # Email notification service
│   │   └── twilio.ts       # SMS notification service
│   ├── utils/              # Server-side utilities
│   ├── index.ts            # Server entry point & middleware
│   ├── routes.ts           # Main API route definitions
│   └── github.ts           # GitHub API integration
├── db/                     # Database configuration & schema
│   ├── index.ts            # Drizzle client initialization
│   └── schema.ts           # Database table definitions & relations
├── attached_assets/        # Static assets and media files
├── docs/                   # Project documentation
├── scripts/                # Utility scripts (e.g., database seeding)
├── drizzle.config.ts       # Drizzle ORM configuration
├── package.json            # Dependencies and scripts
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Development Guide for AI Agents

- **Database Changes**: Modify `db/schema.ts` and run `npm run db:push` to sync with the database.
- **New API Routes**: Add new endpoints in `server/routes.ts` or create a new router in `server/routes/`.
- **UI Components**: The project uses **Shadcn UI**. New components should be placed in `client/src/components/ui` and follow the established styling patterns using Tailwind CSS and Lucide icons.
- **Messaging**: All communication logic is centralized in `server/services/`. Use these services rather than calling Twilio directly.
- **Environment Variables**: Always check `server/index.ts` for the list of required environment variables for various features (Twilio, Database, etc.).
