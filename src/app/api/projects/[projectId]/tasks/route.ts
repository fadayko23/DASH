import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params
  
  const tasks = await prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params
  const body = await req.json()
  const { title, description, dueDate, status } = body

  const task = await prisma.task.create({
      data: {
          tenantId: session.user.tenantId,
          projectId,
          title,
          description,
          dueDate: dueDate ? new Date(dueDate) : null,
          status: status || 'todo'
      }
  })
  return NextResponse.json(task)
}
