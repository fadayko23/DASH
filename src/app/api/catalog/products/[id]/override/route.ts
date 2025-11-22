import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const tenantId = session.user.tenantId
  const body = await req.json()
  
  const { costPrice, sellPrice, markupPercent, internalNotes, availability } = body

  // Check if override exists
  const existing = await prisma.tenantProductOverride.findFirst({
      where: {
          tenantId,
          productId: id,
          variantId: null
      }
  })

  let override;
  if (existing) {
      override = await prisma.tenantProductOverride.update({
          where: { id: existing.id },
          data: {
             costPrice,
             sellPrice,
             markupPercent,
             internalNotes,
             availability
          }
      })
  } else {
      override = await prisma.tenantProductOverride.create({
          data: {
              tenantId,
              productId: id,
              costPrice,
              sellPrice,
              markupPercent,
              internalNotes,
              availability
          }
      })
  }
  
  return NextResponse.json(override)
}
