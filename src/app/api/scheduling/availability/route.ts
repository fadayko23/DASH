import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { listAvailability } from "@/lib/services/googleCalendar"

export async function GET(req: NextRequest) {
  // Allow public access if tenantId is provided (for intake flow), otherwise require session
  const { searchParams } = new URL(req.url)
  let tenantId = searchParams.get("tenantId")
  const start = searchParams.get("start")
  const end = searchParams.get("end")

  if (!tenantId) {
      const session = await auth()
      if (session?.user?.tenantId) {
          tenantId = session.user.tenantId
      }
  }

  if (!tenantId) return NextResponse.json({ error: "Tenant ID required" }, { status: 400 })
  if (!start || !end) return NextResponse.json({ error: "Start and End dates required" }, { status: 400 })

  const connection = await prisma.tenantGoogleConnection.findUnique({
      where: { tenantId }
  })

  if (!connection) return NextResponse.json({ error: "Google Calendar not connected" }, { status: 404 })

  try {
      const busySlots = await listAvailability(connection, new Date(start), new Date(end))
      return NextResponse.json({ busy: busySlots })
  } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error'
      return NextResponse.json({ error: message }, { status: 500 })
  }
}
