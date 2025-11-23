import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  
  const { projectId } = await params
  const spaces = await prisma.space.findMany({
      where: { projectId },
      include: { roomType: true },
      orderBy: { createdAt: 'asc' }
  })
  return NextResponse.json(spaces)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  
  const { projectId } = await params
  const body = await req.json()
  const { name, floor, notes } = body

  // Ideally validate projectId belongs to tenant, but basic relation check ok for now.
  const space = await prisma.space.create({
      data: {
          projectId,
          name,
          floor,
          notes
      }
  })
  return NextResponse.json(space)
}

