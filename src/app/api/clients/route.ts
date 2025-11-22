import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const clients = await prisma.client.findMany({
      where: { tenantId: session.user.tenantId },
      orderBy: { updatedAt: 'desc' }
  })
  return NextResponse.json(clients)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  
  const body = await req.json()
  const { name, email, phone, primaryAddress, notes } = body

  const client = await prisma.client.create({
      data: {
          tenantId: session.user.tenantId,
          name,
          email,
          phone,
          primaryAddress,
          notes
      }
  })
  return NextResponse.json(client)
}
