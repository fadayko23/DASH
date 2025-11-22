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
    npx prisma migrate dev --name phase1_multitenant
    ```
    
    (Optional) Seed the database with a test user and tenant:
    ```bash
    npx prisma db seed
    ```
    This creates:
    - User: `test@example.com` / `password123`
    - Tenant: `Demo Studio` (slug: `demo`)
    - Links the user as 'owner' of the tenant.

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

## PWA Support

This app is a PWA. In production (`npm run build`), it will generate a service worker.
To test PWA in development, ensure `next.config.ts` has `disable: false` (currently set to disable in dev).

## Multi-Tenancy

The app uses a sub-domain based multi-tenancy strategy, falling back to a header `x-tenant-slug` for development.

- **Development**:
  - You can use `localhost:3000`.
  - To simulate a tenant, you can add `x-tenant-slug: demo` header (e.g., using a browser extension) OR accessing via `demo.localhost:3000` (requires hosts file config).
  - If no tenant is found, some features might be restricted or default to a landing page state.
