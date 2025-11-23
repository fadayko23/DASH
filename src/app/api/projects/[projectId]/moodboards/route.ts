import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params
  const boards = await prisma.moodBoard.findMany({
      where: { projectId, ...(session.user.clientId ? { clientVisible: true } : {}) },
      orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(boards)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params
  const { name, description, imageUrl, clientVisible } = await req.json()

  const board = await prisma.moodBoard.create({
      data: {
          tenantId: session.user.tenantId,
          projectId,
          name,
          description,
          imageUrl,
          clientVisible
      }
  })
  return NextResponse.json(board)
}
