import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params
  
  const entries = await prisma.timeEntry.findMany({
      where: { projectId },
      orderBy: { date: 'desc' },
      include: { user: { select: { name: true } } }
  })
  return NextResponse.json(entries)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params
  const body = await req.json()
  const { contractId, amendmentId, roleName, date, hours, description } = body

  const entry = await prisma.timeEntry.create({
      data: {
          tenantId: session.user.tenantId,
          projectId,
          contractId: contractId || null,
          amendmentId: amendmentId || null,
          userId: session.user.id,
          roleName,
          date: new Date(date),
          hours,
          description
      }
  })
  return NextResponse.json(entry)
}
