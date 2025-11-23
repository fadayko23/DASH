import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params
  
  // TODO: Verify user has access to this project (Client or Studio)
  
  const messages = await prisma.projectMessage.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' }
  })
  
  // Also fetch voice messages and merge/sort? 
  // For MVP, let's just return text messages or handle voice separately in UI list.
  // Ideally union them.
  
  return NextResponse.json(messages)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params
  const body = await req.json()
  const { message, senderType } = body // senderType: 'client' | 'studio'

  // Simple validation
  if (!message) return NextResponse.json({ error: "Message empty" }, { status: 400 })

  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { client: true } })
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })

  const newMessage = await prisma.projectMessage.create({
      data: {
          tenantId: project.tenantId,
          projectId,
          clientId: project.clientId,
          senderType: senderType === 'client' ? 'client' : 'studio',
          senderUserId: senderType === 'studio' ? session.user.id : null, // Only track user if studio
          body: message
      }
  })

  return NextResponse.json(newMessage)
}
