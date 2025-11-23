import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { scrapeProductPage, scrapeListPage } from "@/lib/scrape"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tenantId = session.user.tenantId
  const { url, mode = 'single' } = await req.json()

  // Create Job
  const job = await prisma.scrapeJob.create({
      data: {
          tenantId,
          url,
          mode,
          status: 'running'
      }
  })

  // Process asynchronously (simulated async by not awaiting the promise resolution in the response path? 
  // Next.js functions often kill background work if the response returns. 
  // For MVP, we will await it to ensure completion, but in prod use a queue like Bull/Inngest).
  
  try {
      if (mode === 'single') {
          const data = await scrapeProductPage(url)
          
          // Create Product
          // Try to find vendor or create default
          let vendorId = null
          if (data.vendorName) {
              const vendor = await prisma.vendor.findFirst({ where: { name: data.vendorName } })
              if (vendor) vendorId = vendor.id
              else {
                  const v = await prisma.vendor.create({ data: { name: data.vendorName } })
                  vendorId = v.id
              }
          }

          const product = await prisma.product.create({
              data: {
                  name: data.name,
                  description: data.description,
                  baseSku: data.baseSku,
                  vendorId,
                  scope: 'tenant',
                  ownerTenantId: tenantId,
                  urlSource: url,
                  status: 'active',
                  // Basic Product Type fallback - assume first available or create 'Uncategorized'
                  productTypeId: (await getFallbackProductTypeId())
              }
          })

          // Create Specs as Variant (default variant)
          await prisma.productVariant.create({
              data: {
                  productId: product.id,
                  name: 'Default',
                  attributesJson: data.specs ? (data.specs as unknown as Record<string, string>) : undefined
              }
          })
          
          // Create Media
          if (data.imageUrl) {
              await prisma.productMedia.create({
                  data: {
                      productId: product.id,
                      url: data.imageUrl,
                      type: 'image'
                  }
              })
          }
          
          await prisma.scrapeJob.update({
              where: { id: job.id },
              data: { status: 'success', resultSummary: `Created product: ${product.name}` }
          })

      } else if (mode === 'list') {
          const urls = await scrapeListPage(url)
          await prisma.scrapeJob.update({
              where: { id: job.id },
              data: { status: 'success', resultSummary: `Found ${urls.length} links. (Bulk import logic not fully implemented in MVP)` }
          })
      }
  } catch (e) {
      console.error(e)
      const message = e instanceof Error ? e.message : 'Unknown error'
      await prisma.scrapeJob.update({
          where: { id: job.id },
          data: { status: 'failed', resultSummary: message }
      })
      return NextResponse.json({ success: false, error: message }, { status: 500 })
  }

  return NextResponse.json({ success: true, jobId: job.id })
}

async function getFallbackProductTypeId() {
    const type = await prisma.productType.findFirst()
    if (type) return type.id
    
    // Create fallback if DB empty
    const cat = await prisma.productCategory.create({ data: { name: 'General' }})
    const newType = await prisma.productType.create({ data: { name: 'General', categoryId: cat.id }})
    return newType.id
}
