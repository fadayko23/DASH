import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params
  
  const inspiration = await prisma.projectInspiration.findMany({
      where: { 
          projectId,
          // If client, verify clientVisible
          ...(session.user.clientId ? { clientVisible: true } : {})
      },
      include: { inspirationImage: true },
      orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(inspiration)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params
  const body = await req.json()
  const { inspirationImageId, notes, clientVisible } = body

  // TODO: Verify user access to project

  const item = await prisma.projectInspiration.create({
      data: {
          projectId,
          inspirationImageId,
          notes,
          clientVisible,
          uploadedByUserId: session.user.clientId ? null : session.user.id,
          uploadedByClientId: session.user.clientId || null
      }
  })
  return NextResponse.json(item)
}
