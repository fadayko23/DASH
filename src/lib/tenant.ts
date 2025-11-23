import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function getCurrentTenant() {
  const headersList = await headers()
  const host = headersList.get('host') || ''
  const tenantSlugHeader = headersList.get('x-tenant-slug')

  let slug: string | null = null

  // 1. Try subdomain
  if (host.includes('.')) {
     const parts = host.split('.')
     // Assuming format: slug.domain.com or slug.localhost:3000
     // If localhost, it might be just localhost:3000 (no dot usually) or slug.localhost
     // We need to be careful with www or other prefixes.
     // For simplicity in this phase, let's assume the first part is the slug if it's not 'www' and not the main domain.
     // This logic might need refinement based on actual domain config.
     if (parts.length > 2 || (host.includes('localhost') && parts.length > 1)) {
         slug = parts[0]
     }
  }

  // 2. Fallback to header (useful for dev/testing without subdomains)
  if (!slug && tenantSlugHeader) {
    slug = tenantSlugHeader
  }

  // 3. Fallback to DEMO_TENANT_SLUG env var if set (for single-tenant / demo mode)
  if (!slug && process.env.DEMO_TENANT_SLUG) {
    slug = process.env.DEMO_TENANT_SLUG
  }

  // 4. If we resolved a slug but it didn't match anything in DB, maybe fallback to demo?
  // For now, let's try to find it.

  if (!slug) return null

  let tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: {
      theme: true
    }
  })

  // Fallback: if resolved slug (e.g. 'dash-gules-eight') wasn't found, try the demo slug
  if (!tenant && process.env.DEMO_TENANT_SLUG && slug !== process.env.DEMO_TENANT_SLUG) {
      tenant = await prisma.tenant.findUnique({
          where: { slug: process.env.DEMO_TENANT_SLUG },
          include: { theme: true }
      })
  }

  return tenant
}
