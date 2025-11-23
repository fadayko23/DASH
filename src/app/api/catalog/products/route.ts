import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tenantId = session.user.tenantId
  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search")
  const categoryId = searchParams.get("categoryId")
  const typeId = searchParams.get("typeId")

  const where: { AND: Record<string, unknown>[] } = {
    AND: [
      {
        OR: [
          { scope: "global" },
          { scope: "tenant", ownerTenantId: tenantId },
        ],
      },
      {
        status: "active",
      },
    ],
  }

  if (search) {
    where.AND.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { vendor: { name: { contains: search, mode: "insensitive" } } },
      ],
    })
  }

  if (categoryId) {
      where.AND.push({ productType: { categoryId } })
  }
  
  if (typeId) {
      where.AND.push({ productTypeId: typeId })
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      vendor: true,
      productType: {
          include: { category: true }
      },
      media: true,
      overrides: {
        where: { tenantId },
        take: 1
      }
    },
    orderBy: { createdAt: "desc" }
  })

  // Transform to merge overrides
  const result = products.map(p => {
      const override = p.overrides[0] || {}
      return {
          ...p,
          overrides: undefined,
          userPrice: override.sellPrice,
          userCost: override.costPrice,
          userMarkup: override.markupPercent,
          userNotes: override.internalNotes,
          userAvailability: override.availability || 'default'
      }
  })

  return NextResponse.json(result)
}
