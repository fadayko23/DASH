import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params
  
  const milestones = await prisma.projectMilestone.findMany({
      where: { projectId },
      orderBy: { targetDate: 'asc' }
  })
  return NextResponse.json(milestones)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params
  const body = await req.json()
  const { name, targetDate, amount, autoCharge } = body

  const milestone = await prisma.projectMilestone.create({
      data: {
          tenantId: session.user.tenantId,
          projectId,
          name,
          targetDate: targetDate ? new Date(targetDate) : null,
          amount,
          autoCharge: autoCharge || false
      }
  })
  return NextResponse.json(milestone)
}
