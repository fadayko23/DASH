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

  if (!slug) return null

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: {
      theme: true
    }
  })

  return tenant
}
