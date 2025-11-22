import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params
  
  const contracts = await prisma.contract.findMany({
      where: { projectId },
      include: { amendments: true },
      orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(contracts)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params
  const body = await req.json()
  const { title, templateId, billingModel, baseHoursAllocated, baseFlatAmount } = body

  const contract = await prisma.contract.create({
      data: {
          tenantId: session.user.tenantId,
          projectId,
          title,
          templateId,
          billingModel,
          baseHoursAllocated,
          baseFlatAmount,
          status: 'draft'
      }
  })
  return NextResponse.json(contract)
}
