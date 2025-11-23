import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product || !product.urlSource) {
      return NextResponse.json({ error: "No source URL" }, { status: 400 })
  }

  try {
      const res = await fetch(product.urlSource, { method: 'HEAD' })
      const isBroken = res.status >= 400
      
      await prisma.productUrlHealth.upsert({
          where: { productId: id },
          create: {
              productId: id,
              lastStatusCode: res.status,
              isBroken
          },
          update: {
              lastCheckedAt: new Date(),
              lastStatusCode: res.status,
              isBroken
          }
      })

      return NextResponse.json({ status: res.status, isBroken })
  } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error'
      await prisma.productUrlHealth.upsert({
          where: { productId: id },
          create: {
              productId: id,
              isBroken: true,
              notes: message
          },
          update: {
              lastCheckedAt: new Date(),
              isBroken: true,
              notes: message
          }
      })
      return NextResponse.json({ error: message }, { status: 500 })
  }
}
