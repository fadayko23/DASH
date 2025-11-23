import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import SpaceSpecsClient from "./client"

export default async function SpaceSpecsPage({ params }: { params: Promise<{ id: string, spaceId: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) return <div>Unauthorized</div>
  
  const { id, spaceId } = await params
  
  const space = await prisma.space.findUnique({
      where: { id: spaceId },
      include: { roomType: true }
  })

  if (!space) return <div>Space not found</div>

  // 1. Get Templates for this room type (or generic)
  const templates = await prisma.spaceElementTemplate.findMany({
      where: {
          tenantId: session.user.tenantId,
          OR: [
              { roomTypeId: space.roomTypeId },
              { roomTypeId: null }
          ]
      }
  })

  // 2. Get existing specs (ProjectProduct)
  const specs = await prisma.projectProduct.findMany({
      where: { spaceId },
      include: { product: { include: { vendor: true, media: true } }, variant: true }
  })

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <Link href={`/dashboard/projects/${id}`} className="text-sm text-muted-foreground hover:text-foreground mb-2 block">&larr; Back to Project</Link>
                <h1 className="text-2xl font-bold">{space.name} Selections</h1>
                <p className="text-muted-foreground">{space.roomType?.name || 'General Space'}</p>
            </div>
        </div>

        <SpaceSpecsClient 
            projectId={id} 
            spaceId={spaceId} 
            templates={templates} 
            initialSpecs={specs}
        />
    </div>
  )
}
