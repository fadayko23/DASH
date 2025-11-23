import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const templates = await prisma.contractTemplate.findMany({
      where: { tenantId: session.user.tenantId },
      orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(templates)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  
  const body = await req.json()
  const { name, type, body: content } = body

  const template = await prisma.contractTemplate.create({
      data: {
          tenantId: session.user.tenantId,
          name,
          type,
          body: content
      }
  })
  return NextResponse.json(template)
}
