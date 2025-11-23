import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { cache } from 'react'

export const getCurrentTenant = cache(async () => {
  const headersList = await headers()
  const host = headersList.get('host') || ''
  const tenantSlugHeader = headersList.get('x-tenant-slug')

  let slug: string | null = null

  // 1. Try subdomain
  if (host.includes('.')) {
     const parts = host.split('.')
     // Assuming format: slug.domain.com or slug.localhost:3000
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

  if (!slug) return null

  let tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: {
      theme: true
    }
  })

  // Fallback: if resolved slug wasn't found, try the demo slug
  if (!tenant && process.env.DEMO_TENANT_SLUG && slug !== process.env.DEMO_TENANT_SLUG) {
      tenant = await prisma.tenant.findUnique({
          where: { slug: process.env.DEMO_TENANT_SLUG },
          include: { theme: true }
      })
  }

  return tenant
})
