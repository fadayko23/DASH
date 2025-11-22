import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { taskId } = await params
  const body = await req.json()
  const { status, dueDate, title } = body

  const task = await prisma.task.update({
      where: { id: taskId },
      data: {
          status,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          title
      }
  })
  return NextResponse.json(task)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { taskId } = await params
  await prisma.task.delete({ where: { id: taskId } })
  return NextResponse.json({ success: true })
}
