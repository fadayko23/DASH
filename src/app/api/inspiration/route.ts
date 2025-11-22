import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const images = await prisma.inspirationImage.findMany({
      where: { tenantId: session.user.tenantId },
      orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(images)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  
  const { url } = await req.json()
  
  const image = await prisma.inspirationImage.create({
      data: {
          tenantId: session.user.tenantId,
          url,
          uploadedByUserId: session.user.id
      }
  })
  return NextResponse.json(image)
}
