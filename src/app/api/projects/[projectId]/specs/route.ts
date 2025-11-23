import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { checkTagConflicts } from "@/lib/services/tags"

export async function GET(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params
  const { searchParams } = new URL(req.url)
  const spaceId = searchParams.get("spaceId")

  const where: { projectId: string; spaceId?: string } = { projectId }
  if (spaceId) where.spaceId = spaceId

  const specs = await prisma.projectProduct.findMany({
      where,
      include: { product: { include: { vendor: true } }, variant: true },
      orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(specs)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params
  const body = await req.json()
  
  const { spaceId, productId, variantId, elementKey, elementLabel, quantity, unit, projectTag, notes } = body

  const spec = await prisma.projectProduct.create({
      data: {
          projectId,
          spaceId,
          productId,
          variantId,
          elementKey,
          elementLabel,
          quantity,
          unit,
          projectTag,
          notes,
          clientStatus: 'proposed'
      }
  })

  if (projectTag) {
      await checkTagConflicts(projectId, projectTag)
  }

  return NextResponse.json(spec)
}
