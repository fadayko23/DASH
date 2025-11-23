import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { geocodeAddress } from "@/lib/services/maps"
import { getPropertyDetails } from "@/lib/services/zillow"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const projects = await prisma.project.findMany({
      where: { tenantId: session.user.tenantId },
      include: { client: true },
      orderBy: { updatedAt: 'desc' }
  })
  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  
  const body = await req.json()
  const { clientId, name, description, type, projectAddress, billingAddress } = body

  let lat = null
  let lng = null
  let propertyData = null
  let mainImage = null

  if (projectAddress) {
      const coords = await geocodeAddress(projectAddress)
      if (coords) {
          lat = coords.lat
          lng = coords.lng
      }
      
      const details = await getPropertyDetails(projectAddress)
      if (details) {
          propertyData = details
          mainImage = details.imageUrl
      }
  }

  const project = await prisma.project.create({
      data: {
          tenantId: session.user.tenantId,
          clientId,
          name,
          description,
          type,
          projectAddress,
          billingAddress,
          projectLat: lat,
          projectLng: lng,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          propertyMetadataJson: propertyData ? (propertyData as any) : undefined,
          mainImageUrl: mainImage
      }
  })
  return NextResponse.json(project)
}
