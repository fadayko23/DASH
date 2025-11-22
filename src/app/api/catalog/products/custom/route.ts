import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tenantId = session.user.tenantId
  const body = await req.json()

  // Validation omitted for brevity, assume valid body
  const { name, productTypeId, description } = body

  const product = await prisma.product.create({
      data: {
          name,
          productTypeId,
          description,
          scope: "tenant",
          ownerTenantId: tenantId,
          status: "active"
      }
  })

  return NextResponse.json(product)
}
