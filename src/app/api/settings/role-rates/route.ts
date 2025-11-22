import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const rates = await prisma.roleRate.findMany({
      where: { tenantId: session.user.tenantId },
      orderBy: { roleName: 'asc' }
  })
  return NextResponse.json(rates)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  
  const body = await req.json()
  const { roleName, hourlyRate } = body

  const rate = await prisma.roleRate.create({
      data: {
          tenantId: session.user.tenantId,
          roleName,
          hourlyRate
      }
  })
  return NextResponse.json(rate)
}
