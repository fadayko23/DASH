import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      tenantId?: string | null
      tenants: { tenantId: string; name: string; slug: string; role: string }[]
      clientId?: string | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    clientId?: string | null
    // Add other properties if needed from your Prisma User model
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    tenantId?: string | null
    tenants: { tenantId: string; name: string; slug: string; role: string }[]
    clientId?: string | null
  }
}
