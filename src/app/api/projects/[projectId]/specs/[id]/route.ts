import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { checkTagConflicts } from "@/lib/services/tags"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ projectId: string, id: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId, id } = await params
  const body = await req.json()
  const { projectTag, ...rest } = body

  const spec = await prisma.projectProduct.update({
      where: { id },
      data: { projectTag, ...rest }
  })

  if (projectTag) {
      await checkTagConflicts(projectId, projectTag)
  }

  return NextResponse.json(spec)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ projectId: string, id: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId, id } = await params
  
  const spec = await prisma.projectProduct.findUnique({ where: { id } })
  if (!spec) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.projectProduct.delete({ where: { id } })

  if (spec.projectTag) {
      await checkTagConflicts(projectId, spec.projectTag)
  }

  return NextResponse.json({ success: true })
}
