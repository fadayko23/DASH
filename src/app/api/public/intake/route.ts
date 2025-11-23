import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { geocodeAddress } from "@/lib/services/maps"
import { findNearestLocation } from "@/lib/services/locations"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { formId, name, email, phone, address, responses } = body

  const form = await prisma.intakeForm.findUnique({ where: { id: formId } })
  if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 })

  // 1. Create Submission
  const submission = await prisma.intakeSubmission.create({
      data: {
          tenantId: form.tenantId,
          intakeFormId: form.id,
          name,
          email,
          phone,
          enteredAddress: address,
          rawPayloadJson: responses
      }
  })

  // 2. Auto-resolve Project
  try {
      // Find or create Client
      let client = await prisma.client.findFirst({
          where: { tenantId: form.tenantId, email }
      })
      
      if (!client) {
          client = await prisma.client.create({
              data: {
                  tenantId: form.tenantId,
                  name,
                  email,
                  phone,
                  primaryAddress: address
              }
          })
      }

      // Geocode & Find Location
      let lat, lng
      if (address) {
          const coords = await geocodeAddress(address)
          if (coords) {
              lat = coords.lat
              lng = coords.lng
          }
      }

      // Only if we have coords, check locations
      // For now, we skip forcing a location relation on Project unless we added it to schema (we didn't add tenantLocationId to Project yet, just tenantId).
      // So finding nearest location is mostly for assignment logic (e.g. assign to designer in that region).
      // We'll skip storing 'assignedLocation' on project for this MVP phase, but we'll log it.
      if (lat && lng) {
          const locations = await prisma.tenantLocation.findMany({
              where: { tenantId: form.tenantId },
              select: { id: true, lat: true, lng: true }
          })
          // Filter out nulls
          const validLocs = locations.filter(l => l.lat !== null && l.lng !== null) as { id: string, lat: number, lng: number }[]
          
          const nearestId = await findNearestLocation(validLocs, lat, lng)
          console.log('Nearest Location ID:', nearestId)
      }

      // Create Project
      const project = await prisma.project.create({
          data: {
              tenantId: form.tenantId,
              clientId: client.id,
              name: `${name}'s Project`, // Default name
              status: 'prospect',
              projectAddress: address,
              projectLat: lat,
              projectLng: lng,
              description: `Intake from ${form.name}`
          }
      })

      // Link submission
      await prisma.intakeSubmission.update({
          where: { id: submission.id },
          data: { resolvedProjectId: project.id }
      })

      return NextResponse.json({ success: true, projectId: project.id })

  } catch (e) {
      console.error(e)
      return NextResponse.json({ success: true, submissionId: submission.id, warning: "Project creation failed, submission saved." })
  }
}
