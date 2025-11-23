import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Helper to ensure connection string is optimized for serverless/PgBouncer
const getPrismaClient = () => {
  const url = process.env.DATABASE_URL

  // If we're in a serverless environment (like Vercel) and using Postgres,
  // we typically want to ensure pgbouncer mode is enabled to prevent
  // "prepared statement s0 already exists" errors.
  if (url && url.startsWith('postgres') && !url.includes('pgbouncer=true')) {
      const newUrl = `${url}${url.includes('?') ? '&' : '?'}pgbouncer=true`
      return new PrismaClient({
          datasources: {
              db: {
                  url: newUrl
              }
          }
      })
  }

  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma || getPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
