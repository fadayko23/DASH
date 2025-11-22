# DASH

## Tech Stack

- **Framework**: Next.js 14+ (App Router) + React + TypeScript
- **Backend**: Next.js API Routes (monolith)
- **Database**: PostgreSQL via Prisma
- **Authentication**: NextAuth (Auth.js) with credentials provider
- **Styling**: Tailwind CSS + CSS variables (tenant theming)
- **State Management**: React Query / TanStack Query
- **PWA**: Installable, basic offline support
- **AI**: OpenAI (or compatible) via `OPENAI_API_KEY`

## Integrations (Tenant-level)

All third-party integrations are tenant-level via OAuth (NOT per-user):

- **Google OAuth**: One connection per tenant, used for Calendar (scheduling) and Gmail (sending/reading mail from a shared studio account).
- **Stripe**: One OAuth connection per tenant (Connect Standard or direct).
- **QuickBooks Online**: One OAuth connection per tenant.

## Getting Started

1.  Clone the repository.
2.  Copy `.env.example` to `.env` and configure your environment variables (Database URL, OAuth credentials, OpenAI Key).
3.  Install dependencies: `npm install`
4.  Run the development server: `npm run dev`
