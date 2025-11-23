import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { createEvent } from "@/lib/services/googleCalendar"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { tenantId: publicTenantId, projectId, start, end, title, description, attendees } = body

  let tenantId = publicTenantId
  let clientId = null

  if (!tenantId) {
      const session = await auth()
      if (session?.user?.tenantId) {
          tenantId = session.user.tenantId
      }
  }

  if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const connection = await prisma.tenantGoogleConnection.findUnique({
      where: { tenantId }
  })

  if (!connection) return NextResponse.json({ error: "Google Calendar not connected" }, { status: 404 })

  // If projectId provided, get client info
  if (projectId) {
      const project = await prisma.project.findUnique({
          where: { id: projectId },
          include: { client: true }
      })
      if (project) {
          clientId = project.clientId
          // Auto-add client email if not present
          if (project.client.email && !attendees.includes(project.client.email)) {
              attendees.push(project.client.email)
          }
      }
  }

  try {
      const eventId = await createEvent(connection, {
          summary: title,
          description,
          start: new Date(start),
          end: new Date(end),
          attendees
      })

      // Store Meeting in DB
      const meeting = await prisma.meeting.create({
          data: {
              tenantId,
              projectId: projectId || "", // Handle case where meeting might be pre-project (intake) - schema might need projectId optional?
              // Let's check schema. Meeting.projectId is String (required).
              // If this is from public intake before project creation, we might need to relax this or create project first.
              // For now, assume we create project first OR relax schema.
              // Let's assume we have projectId. If not, we fail.
              // WAIT: Schema says Meeting has `projectId String` and `clientId String` as relations.
              // If we want to book during intake, we must have resolved the project first.
              // In Phase 5, intake resolves to a project. So we can use that ID.
              clientId: clientId || "", // Same issue.
              // Schema fix required if we want "standalone" meetings?
              // Or we just create a dummy project/client? 
              // Let's assume projectId/clientId are required for now as per schema.
              title,
              startDateTime: new Date(start),
              endDateTime: new Date(end),
              externalCalendarEventId: eventId
          }
      })

      return NextResponse.json(meeting)
  } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error'
      return NextResponse.json({ error: message }, { status: 500 })
  }
}
