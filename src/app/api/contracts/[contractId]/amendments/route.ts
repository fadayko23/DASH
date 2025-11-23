import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest, { params }: { params: Promise<{ contractId: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { contractId } = await params
  const body = await req.json()
  const { title, description, extraHoursAllocated, extraFlatAmount } = body

  const amendment = await prisma.amendment.create({
      data: {
          contractId,
          title,
          description,
          extraHoursAllocated,
          extraFlatAmount,
          status: 'draft'
      }
  })
  return NextResponse.json(amendment)
}
