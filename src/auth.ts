import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials.email as string | undefined
        const password = credentials.password as string | undefined

        if (!email || !password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.hashedPassword) {
          return null
        }

        const passwordsMatch = await bcrypt.compare(password, user.hashedPassword)

        if (!passwordsMatch) {
          return null
        }

        return user
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.clientId = user.clientId
        // Fetch tenants for the user
        const userTenants = await prisma.userTenant.findMany({
            where: { userId: user.id },
            include: { tenant: true }
        })
        
        token.tenants = userTenants.map(ut => ({
            tenantId: ut.tenantId,
            name: ut.tenant.name,
            slug: ut.tenant.slug,
            role: ut.role
        }))

        // Default to first tenant if available
        if (!token.tenantId && token.tenants && Array.isArray(token.tenants) && token.tenants.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            token.tenantId = (token.tenants as any[])[0].tenantId
        }
      }

      // Handle session update (e.g. switching tenant)
      if (trigger === "update" && session?.tenantId) {
          token.tenantId = session.tenantId
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.tenantId = token.tenantId as string | null | undefined
        session.user.tenants = (token.tenants as { tenantId: string; name: string; slug: string; role: string }[]) || []
        session.user.clientId = token.clientId as string | null | undefined
      }
      return session
    },
  },
})
