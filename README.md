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

1.  **Clone the repository.**

2.  **Environment Setup:**
    Copy `.env.example` to `.env` and configure your environment variables.
    ```bash
    cp .env.example .env
    ```
    You must create a PostgreSQL database (Supabase, Neon, RDS, etc.) and set the `DATABASE_URL` in `.env`.
    
    Also generate a secret for `AUTH_SECRET`:
    ```bash
    openssl rand -base64 32
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Database Setup:**
    Run the migrations to set up the database schema:
    ```bash
    npx prisma migrate dev --name init
    ```
    
    (Optional) Seed the database with a test user:
    ```bash
    npx prisma db seed
    ```
    This creates a user `test@example.com` with password `password123`.

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

## PWA Support

This app is a PWA. In production (`npm run build`), it will generate a service worker.
To test PWA in development, ensure `next.config.ts` has `disable: false` (currently set to disable in dev).
