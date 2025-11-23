import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const templates = await prisma.spaceElementTemplate.findMany({
      where: { tenantId: session.user.tenantId },
      include: { roomType: true },
      orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(templates)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  
  const body = await req.json()
  const { roomTypeId, key, label } = body

  const template = await prisma.spaceElementTemplate.create({
      data: {
          tenantId: session.user.tenantId,
          roomTypeId: roomTypeId || null,
          key,
          label
      }
  })
  return NextResponse.json(template)
}
